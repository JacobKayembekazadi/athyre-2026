#!/usr/bin/env node
/**
 * sanitize_liquid.js
 *
 * Scans .liquid files for JSX syntax that renders as literal text:
 * - {/* comment */}  -> {% comment %}...{% endcomment %}
 * - className=       -> class= (auto-fix)
 * - htmlFor=         -> for= (auto-fix)
 * - Event handlers   -> warning only (needs manual conversion)
 *
 * Usage:
 *   node scripts/sanitize_liquid.js ./theme/
 *   node scripts/sanitize_liquid.js ./theme/ --fix
 */

const fs = require('fs');
const path = require('path');

const PATTERNS = {
  // JSX comments that render as literal text
  jsxComment: {
    regex: /\{\/\*[\s\S]*?\*\/\}/g,
    message: 'JSX comment found - renders as literal text',
    fix: (match) => {
      const content = match.slice(3, -3).trim();
      return `{% comment %}${content}{% endcomment %}`;
    }
  },
  // JSX className (React pattern)
  className: {
    regex: /className=/g,
    message: 'React className attribute found',
    fix: () => 'class='
  },
  // JSX htmlFor (React pattern)
  htmlFor: {
    regex: /htmlFor=/g,
    message: 'React htmlFor attribute found',
    fix: () => 'for='
  },
  // JSX curly braces for variables (warning only - may be intentional)
  jsxVariable: {
    regex: /\{(?!%|{|\/)([a-zA-Z_][a-zA-Z0-9_.]*)\}/g,
    message: 'Possible JSX variable syntax (not auto-fixed)',
    fix: null // Don't auto-fix - could be intentional
  },
  // React event handlers
  eventHandlers: {
    regex: /\bon[A-Z][a-zA-Z]*=/g,
    message: 'React event handler found (onClick, onChange, etc.) - needs manual conversion',
    fix: null // Needs manual conversion to JS
  },
  // JSX spread attributes
  spreadProps: {
    regex: /\{\.\.\.[a-zA-Z_][a-zA-Z0-9_]*\}/g,
    message: 'JSX spread props found - not supported in Liquid',
    fix: null
  }
};

function globSync(pattern, dir) {
  const results = [];

  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            walk(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.liquid')) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  walk(dir);
  return results;
}

function scanFile(filePath, shouldFix = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  let modified = false;

  for (const [name, pattern] of Object.entries(PATTERNS)) {
    const matches = content.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        // Find line number
        const beforeMatch = content.substring(0, content.indexOf(match));
        const line = beforeMatch.split('\n').length;

        issues.push({
          file: filePath,
          line,
          pattern: name,
          match: match.length > 50 ? match.substring(0, 50) + '...' : match,
          message: pattern.message,
          canFix: !!pattern.fix
        });
      });

      if (shouldFix && pattern.fix) {
        content = content.replace(pattern.regex, pattern.fix);
        modified = true;
      }
    }
  }

  if (modified && shouldFix) {
    fs.writeFileSync(filePath, content);
    console.log(`  [FIXED] ${filePath}`);
  }

  return issues;
}

function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || './theme';
  const shouldFix = args.includes('--fix');

  console.log(`\n========================================`);
  console.log(`  Liquid Sanitizer - JSX Pattern Scan`);
  console.log(`========================================`);
  console.log(`\nScanning: ${path.resolve(targetDir)}`);
  if (shouldFix) console.log(`Mode: AUTO-FIX enabled\n`);
  else console.log(`Mode: SCAN ONLY (use --fix to auto-fix)\n`);

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const files = globSync('**/*.liquid', targetDir);

  if (files.length === 0) {
    console.log('No .liquid files found in the specified directory.');
    process.exit(0);
  }

  console.log(`Found ${files.length} .liquid files\n`);

  let totalIssues = 0;
  let fixableIssues = 0;
  let manualIssues = 0;
  const fileIssues = [];

  files.forEach(file => {
    const issues = scanFile(file, shouldFix);
    if (issues.length > 0) {
      fileIssues.push({ file, issues });
      totalIssues += issues.length;
      issues.forEach(issue => {
        if (issue.canFix) fixableIssues++;
        else manualIssues++;
      });
    }
  });

  // Print results
  if (fileIssues.length > 0) {
    console.log(`\n----------------------------------------`);
    console.log(`  ISSUES FOUND`);
    console.log(`----------------------------------------\n`);

    fileIssues.forEach(({ file, issues }) => {
      const relPath = path.relative(process.cwd(), file);
      console.log(`${relPath}:`);
      issues.forEach(issue => {
        const tag = issue.canFix ? '[FIXABLE]' : '[MANUAL]';
        console.log(`  Line ${issue.line}: ${tag} ${issue.message}`);
        console.log(`    -> ${issue.match}`);
      });
      console.log('');
    });
  }

  // Summary
  console.log(`========================================`);
  console.log(`  SUMMARY`);
  console.log(`========================================`);
  console.log(`Files scanned:    ${files.length}`);
  console.log(`Files with issues: ${fileIssues.length}`);
  console.log(`Total issues:     ${totalIssues}`);
  console.log(`  - Auto-fixable: ${fixableIssues}`);
  console.log(`  - Manual fix:   ${manualIssues}`);

  if (totalIssues > 0 && !shouldFix && fixableIssues > 0) {
    console.log(`\nRun with --fix to auto-fix ${fixableIssues} issue(s)`);
  }

  if (shouldFix && fixableIssues > 0) {
    console.log(`\n${fixableIssues} issue(s) were auto-fixed`);
  }

  if (manualIssues > 0) {
    console.log(`\n${manualIssues} issue(s) require manual attention`);
  }

  console.log('');

  // Exit with error code if issues found (for CI/CD)
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
