#!/usr/bin/env node
/**
 * check_mandatory_files.js
 *
 * Verifies ALL Shopify-required files exist in a theme directory.
 * A theme is a CONTRACT with Shopify's runtime — without these exact
 * files, the theme will fail in production (broken pages, 404s, theme
 * check failures).
 *
 * Usage:
 *   node scripts/check_mandatory_files.js [theme-directory]
 *
 * Example:
 *   node scripts/check_mandatory_files.js ./deployment-package/theme
 *
 * Exit codes:
 *   0 = All mandatory files present
 *   1 = Missing mandatory files (BLOCKING — do not deploy)
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

// ============================================================
// MANDATORY FILE MANIFEST
// These files MUST exist for a functioning Shopify theme.
// Organized by category with severity levels.
// ============================================================

const MANDATORY_FILES = [
  // --- LAYOUT (the shell that wraps every page) ---
  {
    path: 'layout/theme.liquid',
    reason: 'Master layout — every page renders through this file',
    severity: 'critical',
    mustContain: ['content_for_header', 'content_for_layout'],
  },

  // --- CORE TEMPLATES (Shopify requires these to exist) ---
  {
    path: 'templates/index.json',
    reason: 'Homepage template — store front page',
    severity: 'critical',
  },
  {
    path: 'templates/product.json',
    reason: 'Product detail page — required for any product to display',
    severity: 'critical',
  },
  {
    path: 'templates/collection.json',
    reason: 'Collection listing page — required for browsing products',
    severity: 'critical',
  },
  {
    path: 'templates/cart.json',
    reason: 'Cart page — required for checkout flow',
    severity: 'critical',
  },
  {
    path: 'templates/blog.json',
    reason: 'Blog listing page — required if store has a blog',
    severity: 'high',
  },
  {
    path: 'templates/article.json',
    reason: 'Blog article page — required for individual blog posts',
    severity: 'high',
  },
  {
    path: 'templates/page.json',
    reason: 'Generic page template — used for About, Contact, etc.',
    severity: 'critical',
  },
  {
    path: 'templates/list-collections.json',
    reason: 'Collections directory page',
    severity: 'high',
  },
  {
    path: 'templates/search.json',
    reason: 'Search results page',
    severity: 'high',
  },
  {
    path: 'templates/404.json',
    reason: '404 error page — displays when URL not found',
    severity: 'critical',
  },
  {
    path: 'templates/password.json',
    reason: 'Password protection page — shown when store is locked',
    severity: 'high',
  },

  // --- GIFT CARD (Shopify requires .liquid, NOT .json) ---
  {
    path: 'templates/gift_card.liquid',
    reason: 'Gift card display — Shopify REQUIRES this as .liquid (not .json). Without it, customers cannot view received gift cards.',
    severity: 'critical',
  },

  // --- CUSTOMER TEMPLATES (required for customer accounts) ---
  {
    path: 'templates/customers/account.json',
    reason: 'Customer account dashboard',
    severity: 'critical',
  },
  {
    path: 'templates/customers/login.json',
    reason: 'Customer login page',
    severity: 'critical',
  },
  {
    path: 'templates/customers/register.json',
    reason: 'Customer registration page',
    severity: 'critical',
  },
  {
    path: 'templates/customers/order.json',
    reason: 'Customer order detail page',
    severity: 'critical',
  },
  {
    path: 'templates/customers/addresses.json',
    reason: 'Customer address management',
    severity: 'high',
  },
  {
    path: 'templates/customers/activate_account.json',
    reason: 'Account activation page — sent via email when merchant creates customer. Without this, invited customers cannot activate.',
    severity: 'critical',
  },
  {
    path: 'templates/customers/reset_password.json',
    reason: 'Password reset page — required for "Forgot password" flow. Without this, customers cannot reset passwords.',
    severity: 'critical',
  },

  // --- CONFIG ---
  {
    path: 'config/settings_schema.json',
    reason: 'Theme settings schema — defines customization options in Shopify admin',
    severity: 'critical',
  },
  {
    path: 'config/settings_data.json',
    reason: 'Default theme settings values',
    severity: 'high',
  },

  // --- LOCALES ---
  {
    path: 'locales/en.default.json',
    reason: 'Default English locale — all | t translation keys resolve from this file',
    severity: 'critical',
  },

  // --- ESSENTIAL SECTIONS (theme won't function without these) ---
  {
    path: 'sections/header.liquid',
    reason: 'Site header/navigation — rendered on every page',
    severity: 'critical',
  },
  {
    path: 'sections/footer.liquid',
    reason: 'Site footer — rendered on every page',
    severity: 'critical',
  },
  {
    path: 'sections/main-product.liquid',
    reason: 'Product page main content section',
    severity: 'critical',
  },
  {
    path: 'sections/main-collection.liquid',
    reason: 'Collection page main content section',
    severity: 'critical',
  },
  {
    path: 'sections/main-cart.liquid',
    reason: 'Cart page main content section',
    severity: 'critical',
  },

  // --- ESSENTIAL SNIPPETS ---
  {
    path: 'snippets/breadcrumbs.liquid',
    reason: 'Navigation breadcrumbs — referenced in theme.liquid',
    severity: 'high',
  },
];

// Files that should exist but are recommended, not mandatory
const RECOMMENDED_FILES = [
  { path: 'sections/cart-drawer.liquid', reason: 'AJAX cart drawer — strongly recommended for modern UX' },
  { path: 'sections/cookie-banner.liquid', reason: 'GDPR cookie consent banner' },
  { path: 'snippets/variant-picker.liquid', reason: 'Product variant selection UI' },
  { path: 'snippets/price.liquid', reason: 'Price display with compare-at support' },
  { path: 'assets/product-form.js', reason: 'Product form AJAX add-to-cart' },
  { path: 'assets/cart-drawer.js', reason: 'Cart drawer interactivity' },
  { path: 'assets/predictive-search.js', reason: 'Search-as-you-type functionality' },
];

function checkFile(themePath, fileSpec) {
  const fullPath = path.join(themePath, fileSpec.path);
  const exists = fs.existsSync(fullPath);

  const result = {
    path: fileSpec.path,
    exists,
    reason: fileSpec.reason,
    severity: fileSpec.severity || 'recommended',
    contentIssues: [],
  };

  // Check mustContain patterns
  if (exists && fileSpec.mustContain) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const pattern of fileSpec.mustContain) {
      if (!content.includes(pattern)) {
        result.contentIssues.push(`Missing required pattern: ${pattern}`);
      }
    }
  }

  return result;
}

function main() {
  const themePath = process.argv[2] || '.';

  console.log(`\n${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Shopify Mandatory Files Check${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`\n${c.dim}Theme path: ${path.resolve(themePath)}${c.reset}\n`);

  if (!fs.existsSync(themePath)) {
    console.error(`${c.red}Error: Directory not found: ${themePath}${c.reset}`);
    process.exit(1);
  }

  // Check mandatory files
  let criticalMissing = 0;
  let highMissing = 0;
  let contentIssues = 0;
  let passed = 0;

  console.log(`${c.bold}MANDATORY FILES:${c.reset}\n`);

  for (const fileSpec of MANDATORY_FILES) {
    const result = checkFile(themePath, fileSpec);

    if (result.exists && result.contentIssues.length === 0) {
      console.log(`  ${c.green}[PASS]${c.reset} ${result.path}`);
      passed++;
    } else if (!result.exists) {
      const sevColor = result.severity === 'critical' ? c.red : c.yellow;
      const sevLabel = result.severity.toUpperCase();
      console.log(`  ${sevColor}[MISSING - ${sevLabel}]${c.reset} ${result.path}`);
      console.log(`    ${c.dim}${result.reason}${c.reset}`);

      if (result.severity === 'critical') criticalMissing++;
      else highMissing++;
    } else if (result.contentIssues.length > 0) {
      console.log(`  ${c.yellow}[CONTENT ISSUE]${c.reset} ${result.path}`);
      for (const issue of result.contentIssues) {
        console.log(`    ${c.dim}${issue}${c.reset}`);
      }
      contentIssues++;
    }
  }

  // Check recommended files
  let recommendedMissing = 0;

  console.log(`\n${c.bold}RECOMMENDED FILES:${c.reset}\n`);

  for (const fileSpec of RECOMMENDED_FILES) {
    const fullPath = path.join(themePath, fileSpec.path);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      console.log(`  ${c.green}[PASS]${c.reset} ${fileSpec.path}`);
    } else {
      console.log(`  ${c.yellow}[MISSING]${c.reset} ${fileSpec.path}`);
      console.log(`    ${c.dim}${fileSpec.reason}${c.reset}`);
      recommendedMissing++;
    }
  }

  // Summary
  console.log(`\n${c.bold}================================================${c.reset}`);
  console.log(`${c.bold}  SUMMARY${c.reset}`);
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`  Mandatory files checked:  ${MANDATORY_FILES.length}`);
  console.log(`  ${c.green}Passed:                 ${passed}${c.reset}`);
  console.log(`  ${c.red}Critical missing:       ${criticalMissing}${c.reset}`);
  console.log(`  ${c.yellow}High missing:           ${highMissing}${c.reset}`);
  console.log(`  ${c.yellow}Content issues:         ${contentIssues}${c.reset}`);
  console.log(`  ${c.dim}Recommended missing:    ${recommendedMissing}${c.reset}`);

  if (criticalMissing > 0) {
    console.log(`\n${c.red}${c.bold}BLOCKING: ${criticalMissing} critical file(s) missing.${c.reset}`);
    console.log(`${c.red}DO NOT DEPLOY — the theme will break in production.${c.reset}\n`);
    process.exit(1);
  } else if (highMissing > 0 || contentIssues > 0) {
    console.log(`\n${c.yellow}WARNING: ${highMissing + contentIssues} issue(s) found. Theme may have limited functionality.${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${c.green}${c.bold}All mandatory files present.${c.reset}\n`);
    process.exit(0);
  }
}

main();
