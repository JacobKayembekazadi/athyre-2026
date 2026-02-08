#!/usr/bin/env node
/**
 * validate_schema.js
 *
 * Validates Shopify section schemas:
 * - Checks for required 'presets' block (unless main-* or group section)
 * - Validates JSON syntax in schema blocks
 * - Checks for common schema issues (missing name, block types, etc.)
 *
 * Usage:
 *   node scripts/validate_schema.js ./theme/sections/
 */

const fs = require('fs');
const path = require('path');

// Sections that should NOT have presets (they're rendered by templates or groups)
const EXEMPT_PREFIXES = [
  'main-',           // main-product, main-collection, etc.
  'header',          // Part of header group
  'footer',          // Part of footer group
  'announcement'     // Typically part of header group
];

// Sections that are group sections (header-group, footer-group)
const GROUP_SECTIONS = [
  'header-group',
  'footer-group'
];

function isExempt(filename) {
  const basename = path.basename(filename, '.liquid');

  // Check if it's a group section
  if (GROUP_SECTIONS.includes(basename)) {
    return true;
  }

  // Check if it starts with an exempt prefix
  return EXEMPT_PREFIXES.some(prefix => basename.startsWith(prefix));
}

function extractSchema(content) {
  const match = content.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return { _parseError: e.message };
  }
}

function validateSection(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const basename = path.basename(filePath, '.liquid');
  const issues = [];

  const schema = extractSchema(content);

  if (!schema) {
    issues.push({
      severity: 'error',
      message: 'No schema block found',
      suggestion: 'Add {% schema %}...{% endschema %} block'
    });
    return { filename, basename, issues, isExempt: isExempt(filePath) };
  }

  if (schema._parseError) {
    issues.push({
      severity: 'error',
      message: `Invalid JSON in schema: ${schema._parseError}`,
      suggestion: 'Fix JSON syntax errors in schema block'
    });
    return { filename, basename, issues, isExempt: isExempt(filePath) };
  }

  // Check for name
  if (!schema.name) {
    issues.push({
      severity: 'error',
      message: 'Schema missing "name" property',
      suggestion: 'Add "name": "Section Name" to schema'
    });
  }

  // Check for presets (unless exempt)
  const exempt = isExempt(filePath);
  if (!exempt) {
    if (!schema.presets || schema.presets.length === 0) {
      issues.push({
        severity: 'warning',
        message: 'Missing "presets" - section will NOT appear in "Add section" menu',
        suggestion: `Add: "presets": [{ "name": "${schema.name || 'Section'}" }]`
      });
    }
  }

  // Check for blocks without proper settings
  if (schema.blocks && Array.isArray(schema.blocks)) {
    schema.blocks.forEach((block, i) => {
      if (!block.type) {
        issues.push({
          severity: 'error',
          message: `Block ${i} missing "type" property`,
          suggestion: 'Add "type": "block_type" to block definition'
        });
      }
      if (!block.name) {
        issues.push({
          severity: 'info',
          message: `Block ${i} (${block.type || 'unknown'}) missing "name" property`,
          suggestion: 'Add "name": "Block Name" for better editor UX'
        });
      }
    });
  }

  // Check for settings without IDs
  if (schema.settings && Array.isArray(schema.settings)) {
    schema.settings.forEach((setting, i) => {
      if (setting.type !== 'header' && setting.type !== 'paragraph') {
        if (!setting.id) {
          issues.push({
            severity: 'error',
            message: `Setting ${i} missing "id" property`,
            suggestion: 'Add "id": "setting_id" to setting'
          });
        }
      }
    });
  }

  // Check max_blocks without blocks
  if (schema.max_blocks && (!schema.blocks || schema.blocks.length === 0)) {
    issues.push({
      severity: 'warning',
      message: 'max_blocks specified but no blocks defined',
      suggestion: 'Add blocks array or remove max_blocks'
    });
  }

  return { filename, basename, issues, isExempt: exempt, schema };
}

function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || './theme/sections';

  console.log(`\n========================================`);
  console.log(`  Schema Validator`);
  console.log(`========================================`);
  console.log(`\nScanning: ${path.resolve(targetDir)}\n`);

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory not found: ${targetDir}`);
    process.exit(1);
  }

  // Get all .liquid files in the directory
  const files = fs.readdirSync(targetDir)
    .filter(f => f.endsWith('.liquid'))
    .map(f => path.join(targetDir, f));

  if (files.length === 0) {
    console.log('No .liquid files found in the specified directory.');
    process.exit(0);
  }

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const results = [];

  files.forEach(file => {
    const result = validateSection(file);
    results.push(result);

    result.issues.forEach(issue => {
      if (issue.severity === 'error') errorCount++;
      if (issue.severity === 'warning') warningCount++;
      if (issue.severity === 'info') infoCount++;
    });
  });

  // Print results grouped by status
  const withIssues = results.filter(r => r.issues.length > 0);
  const withoutIssues = results.filter(r => r.issues.length === 0);

  if (withIssues.length > 0) {
    console.log(`----------------------------------------`);
    console.log(`  ISSUES FOUND`);
    console.log(`----------------------------------------\n`);

    withIssues.forEach(result => {
      const exemptTag = result.isExempt ? ' [EXEMPT]' : '';
      console.log(`${result.filename}${exemptTag}:`);

      result.issues.forEach(issue => {
        const icons = {
          error: 'X',
          warning: '!',
          info: 'i'
        };
        const icon = icons[issue.severity] || '?';

        console.log(`  [${icon}] ${issue.message}`);
        console.log(`      -> ${issue.suggestion}`);
      });
      console.log('');
    });
  }

  // Summary of exempt sections
  const exemptSections = results.filter(r => r.isExempt);
  if (exemptSections.length > 0) {
    console.log(`----------------------------------------`);
    console.log(`  EXEMPT SECTIONS (presets not required)`);
    console.log(`----------------------------------------`);
    exemptSections.forEach(r => {
      console.log(`  - ${r.basename}`);
    });
    console.log('');
  }

  // Summary
  console.log(`========================================`);
  console.log(`  SUMMARY`);
  console.log(`========================================`);
  console.log(`Sections scanned: ${results.length}`);
  console.log(`  - With issues:  ${withIssues.length}`);
  console.log(`  - Valid:        ${withoutIssues.length}`);
  console.log(`  - Exempt:       ${exemptSections.length}`);
  console.log(`\nIssue breakdown:`);
  console.log(`  - Errors:   ${errorCount}`);
  console.log(`  - Warnings: ${warningCount}`);
  console.log(`  - Info:     ${infoCount}`);

  if (errorCount > 0) {
    console.log(`\n[!] Fix ${errorCount} error(s) before deploying!`);
  }

  if (warningCount > 0) {
    console.log(`\n[!] Review ${warningCount} warning(s) - sections may not appear in Theme Editor`);
  }

  console.log('');

  // Exit codes
  if (errorCount > 0) {
    process.exit(2); // Errors found
  } else if (warningCount > 0) {
    process.exit(1); // Warnings found
  } else {
    console.log('[OK] All sections valid!\n');
    process.exit(0);
  }
}

main();
