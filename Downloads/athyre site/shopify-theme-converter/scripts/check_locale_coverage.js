#!/usr/bin/env node
/**
 * check_locale_coverage.js
 *
 * Scans all .liquid files for translation key references (| t filters)
 * and verifies every key exists in the locale JSON file.
 *
 * The locale system is a hidden dependency graph — every {{ 'key' | t }}
 * creates an implicit binding to en.default.json. Missing keys cause
 * theme check failures and display raw key paths to customers.
 *
 * Usage:
 *   node scripts/check_locale_coverage.js [theme-directory]
 *
 * Example:
 *   node scripts/check_locale_coverage.js ./deployment-package/theme
 *
 * Exit codes:
 *   0 = All translation keys have locale entries
 *   1 = Missing locale keys found
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
 * Recursively find all .liquid files in a directory
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
 * Extract all translation key references from a .liquid file.
 *
 * Matches patterns like:
 *   {{ 'general.search.placeholder' | t }}
 *   {{ 'products.product.add_to_cart' | t: count: 5 }}
 *   {{ "customer.login.title" | t }}
 *   {%- assign label = 'accessibility.close' | t -%}
 */
function extractTranslationKeys(content) {
  const keys = [];

  // Pattern 1: {{ 'key.path' | t }} or {{ "key.path" | t }}
  // Also handles: | t: variable parameters
  const regex = /['"]([a-zA-Z_][a-zA-Z0-9_.]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)['"][\s]*\|[\s]*t(?:\b|[\s}:,|])/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    // Filter out keys that are clearly not translation keys
    // (e.g., file paths, CSS classes, Liquid object paths)
    if (key.includes('.') && !key.includes('/') && !key.includes('-')) {
      keys.push(key);
    }
  }

  return [...new Set(keys)]; // Deduplicate
}

/**
 * Resolve a dot-notation key path against a nested object.
 * Returns true if the key exists, false if not.
 */
function keyExists(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false;
    }
    if (!(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
}

function main() {
  const themePath = process.argv[2] || '.';

  console.log(`\n${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Locale Coverage Check${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`\n${c.dim}Theme path: ${path.resolve(themePath)}${c.reset}\n`);

  if (!fs.existsSync(themePath)) {
    console.error(`${c.red}Error: Directory not found: ${themePath}${c.reset}`);
    process.exit(1);
  }

  // Load the locale file
  const localePath = path.join(themePath, 'locales', 'en.default.json');
  if (!fs.existsSync(localePath)) {
    console.error(`${c.red}Error: Locale file not found: ${localePath}${c.reset}`);
    console.error(`${c.red}A Shopify theme MUST have locales/en.default.json${c.reset}`);
    process.exit(1);
  }

  let localeData;
  try {
    localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  } catch (err) {
    console.error(`${c.red}Error: Invalid JSON in locale file: ${err.message}${c.reset}`);
    process.exit(1);
  }

  // Find all .liquid files
  const liquidFiles = findLiquidFiles(themePath);
  console.log(`Found ${liquidFiles.length} .liquid files\n`);

  // Extract all translation keys from all files
  const allKeys = new Map(); // key -> [file:line references]

  for (const filePath of liquidFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relPath = path.relative(themePath, filePath);

    // Extract keys with line numbers
    for (let i = 0; i < lines.length; i++) {
      const lineKeys = extractTranslationKeys(lines[i]);
      for (const key of lineKeys) {
        if (!allKeys.has(key)) {
          allKeys.set(key, []);
        }
        allKeys.get(key).push(`${relPath}:${i + 1}`);
      }
    }
  }

  console.log(`Found ${allKeys.size} unique translation keys\n`);

  // Check each key against the locale file
  const missingKeys = [];
  const presentKeys = [];

  for (const [key, refs] of allKeys) {
    if (keyExists(localeData, key)) {
      presentKeys.push(key);
    } else {
      missingKeys.push({ key, refs });
    }
  }

  // Report results
  if (missingKeys.length > 0) {
    console.log(`${c.red}${c.bold}MISSING LOCALE KEYS:${c.reset}\n`);

    // Group by top-level namespace for readability
    const grouped = {};
    for (const { key, refs } of missingKeys) {
      const namespace = key.split('.')[0];
      if (!grouped[namespace]) grouped[namespace] = [];
      grouped[namespace].push({ key, refs });
    }

    for (const [namespace, entries] of Object.entries(grouped).sort()) {
      console.log(`  ${c.yellow}[${namespace}]${c.reset}`);
      for (const { key, refs } of entries) {
        console.log(`    ${c.red}MISSING${c.reset} "${key}"`);
        for (const ref of refs.slice(0, 3)) {
          console.log(`      ${c.dim}${ref}${c.reset}`);
        }
        if (refs.length > 3) {
          console.log(`      ${c.dim}...and ${refs.length - 3} more reference(s)${c.reset}`);
        }
      }
      console.log('');
    }

    // Generate suggested additions
    console.log(`${c.bold}SUGGESTED ADDITIONS for en.default.json:${c.reset}\n`);
    console.log(`${c.dim}Add these keys to your locale file:${c.reset}\n`);

    for (const { key } of missingKeys) {
      // Generate a reasonable default value from the key
      const lastPart = key.split('.').pop();
      const defaultValue = lastPart
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      console.log(`  "${key}": "${defaultValue}"`);
    }
    console.log('');
  }

  // Summary
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`${c.bold}  SUMMARY${c.reset}`);
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`  Translation keys found: ${allKeys.size}`);
  console.log(`  ${c.green}Present in locale:    ${presentKeys.length}${c.reset}`);
  console.log(`  ${c.red}Missing from locale:  ${missingKeys.length}${c.reset}`);

  if (missingKeys.length > 0) {
    console.log(`\n${c.red}${c.bold}FAIL: ${missingKeys.length} translation key(s) missing from en.default.json${c.reset}`);
    console.log(`${c.red}Theme check will flag these. Customers may see raw key paths.${c.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${c.green}${c.bold}PASS: All translation keys have locale entries.${c.reset}\n`);
    process.exit(0);
  }
}

main();
