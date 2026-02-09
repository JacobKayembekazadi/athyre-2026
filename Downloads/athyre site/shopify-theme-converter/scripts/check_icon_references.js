#!/usr/bin/env node
/**
 * check_icon_references.js
 *
 * Scans all .liquid files for icon snippet references and verifies
 * the corresponding snippet file exists. Missing icons cause silent
 * rendering failures — the icon area is just blank.
 *
 * One missing icon-menu.liquid means the entire mobile header looks broken.
 * 50 missing icons means cascade failure and lost client trust.
 *
 * Usage:
 *   node scripts/check_icon_references.js [theme-directory]
 *
 * Example:
 *   node scripts/check_icon_references.js ./deployment-package/theme
 *
 * Exit codes:
 *   0 = All referenced icon snippets exist
 *   1 = Missing icon snippets found
 */

import fs from 'fs';
import path from 'path';

// ANSI colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

/**
 * Recursively find all .liquid files
 */
function findLiquidFiles(dir) {
  const results = [];

  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.liquid')) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      // Skip unreadable directories
    }
  }

  walk(dir);
  return results;
}

/**
 * Extract all snippet render calls from content.
 * Matches:
 *   {% render 'icon-heart' %}
 *   {% render "icon-heart" %}
 *   {% render 'icon-heart', class: 'w-4 h-4' %}
 *   {%- render 'icon-close' -%}
 */
function extractSnippetReferences(content) {
  const refs = [];
  const regex = /\{%-?\s*render\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    refs.push(match[1]);
  }

  return refs;
}

function main() {
  const themePath = process.argv[2] || '.';

  console.log(`\n${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Icon & Snippet Reference Check${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`\n${c.dim}Theme path: ${path.resolve(themePath)}${c.reset}\n`);

  if (!fs.existsSync(themePath)) {
    console.error(`${c.red}Error: Directory not found: ${themePath}${c.reset}`);
    process.exit(1);
  }

  const snippetsDir = path.join(themePath, 'snippets');
  if (!fs.existsSync(snippetsDir)) {
    console.error(`${c.red}Error: snippets/ directory not found${c.reset}`);
    process.exit(1);
  }

  // Get all existing snippet files
  const existingSnippets = new Set();
  try {
    const files = fs.readdirSync(snippetsDir);
    for (const file of files) {
      if (file.endsWith('.liquid')) {
        existingSnippets.add(file.replace('.liquid', ''));
      }
    }
  } catch (err) {
    console.error(`${c.red}Error reading snippets directory: ${err.message}${c.reset}`);
    process.exit(1);
  }

  console.log(`Found ${existingSnippets.size} snippet files in snippets/\n`);

  // Find all .liquid files (excluding snippets themselves to avoid self-references)
  const liquidFiles = findLiquidFiles(themePath);

  // Extract all render references
  const allRefs = new Map(); // snippet name -> [file:line references]

  for (const filePath of liquidFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(themePath, filePath);
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const snippets = extractSnippetReferences(lines[i]);
      for (const snippet of snippets) {
        if (!allRefs.has(snippet)) {
          allRefs.set(snippet, []);
        }
        allRefs.get(snippet).push(`${relPath}:${i + 1}`);
      }
    }
  }

  console.log(`Found ${allRefs.size} unique snippet references\n`);

  // Separate icon snippets from other snippets
  const iconRefs = new Map();
  const otherRefs = new Map();

  for (const [name, refs] of allRefs) {
    if (name.startsWith('icon-')) {
      iconRefs.set(name, refs);
    } else {
      otherRefs.set(name, refs);
    }
  }

  // Check icon snippets
  let missingIcons = 0;
  let presentIcons = 0;

  if (iconRefs.size > 0) {
    console.log(`${c.bold}ICON SNIPPETS:${c.reset}\n`);

    const sortedIcons = [...iconRefs.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [name, refs] of sortedIcons) {
      if (existingSnippets.has(name)) {
        console.log(`  ${c.green}[EXISTS]${c.reset} ${name}.liquid (${refs.length} ref${refs.length > 1 ? 's' : ''})`);
        presentIcons++;
      } else {
        console.log(`  ${c.red}[MISSING]${c.reset} ${name}.liquid (${refs.length} ref${refs.length > 1 ? 's' : ''})`);
        for (const ref of refs.slice(0, 3)) {
          console.log(`    ${c.dim}${ref}${c.reset}`);
        }
        if (refs.length > 3) {
          console.log(`    ${c.dim}...and ${refs.length - 3} more${c.reset}`);
        }
        missingIcons++;
      }
    }
    console.log('');
  }

  // Check other snippets
  let missingSnippets = 0;
  let presentSnippets = 0;

  if (otherRefs.size > 0) {
    console.log(`${c.bold}OTHER SNIPPETS:${c.reset}\n`);

    const sortedOther = [...otherRefs.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [name, refs] of sortedOther) {
      if (existingSnippets.has(name)) {
        console.log(`  ${c.green}[EXISTS]${c.reset} ${name}.liquid (${refs.length} ref${refs.length > 1 ? 's' : ''})`);
        presentSnippets++;
      } else {
        console.log(`  ${c.red}[MISSING]${c.reset} ${name}.liquid (${refs.length} ref${refs.length > 1 ? 's' : ''})`);
        for (const ref of refs.slice(0, 3)) {
          console.log(`    ${c.dim}${ref}${c.reset}`);
        }
        if (refs.length > 3) {
          console.log(`    ${c.dim}...and ${refs.length - 3} more${c.reset}`);
        }
        missingSnippets++;
      }
    }
    console.log('');
  }

  // Check for unused snippets (snippets that exist but are never referenced)
  const referencedSnippets = new Set([...allRefs.keys()]);
  const unusedSnippets = [...existingSnippets].filter(s => !referencedSnippets.has(s));

  if (unusedSnippets.length > 0) {
    console.log(`${c.yellow}${c.bold}UNUSED SNIPPETS (exist but never referenced):${c.reset}\n`);
    for (const name of unusedSnippets.sort()) {
      console.log(`  ${c.yellow}${name}.liquid${c.reset}`);
    }
    console.log('');
  }

  // Summary
  const totalMissing = missingIcons + missingSnippets;

  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`${c.bold}  SUMMARY${c.reset}`);
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`  Icon snippets:    ${presentIcons} present, ${c.red}${missingIcons} missing${c.reset}`);
  console.log(`  Other snippets:   ${presentSnippets} present, ${c.red}${missingSnippets} missing${c.reset}`);
  console.log(`  Unused snippets:  ${unusedSnippets.length}`);

  if (totalMissing > 0) {
    console.log(`\n${c.red}${c.bold}FAIL: ${totalMissing} referenced snippet(s) are missing.${c.reset}`);
    console.log(`${c.red}These will render as empty space — icons won't show, components won't appear.${c.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${c.green}${c.bold}PASS: All referenced snippets exist.${c.reset}\n`);
    process.exit(0);
  }
}

main();
