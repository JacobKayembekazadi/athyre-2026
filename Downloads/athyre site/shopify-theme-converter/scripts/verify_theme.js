#!/usr/bin/env node

/**
 * SCAFFOLD: Theme Verification Script
 *
 * Automated commerce checks to verify a converted theme has all
 * critical e-commerce functionality properly implemented.
 *
 * Usage:
 *   node scripts/verify_theme.js [theme-directory]
 *
 * Example:
 *   node scripts/verify_theme.js ./deployment-package/theme
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

class ThemeVerifier {
  constructor(themePath) {
    this.themePath = themePath || process.argv[2] || '.';
    this.results = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? `${colors.red}✗` :
                   type === 'success' ? `${colors.green}✓` :
                   type === 'warning' ? `${colors.yellow}⚠` :
                   `${colors.cyan}ℹ`;
    console.log(`${prefix} ${message}${colors.reset}`);
  }

  fileExists(relativePath) {
    const fullPath = path.join(this.themePath, relativePath);
    return fs.existsSync(fullPath);
  }

  fileContains(relativePath, searchString) {
    const fullPath = path.join(this.themePath, relativePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');
    return content.includes(searchString);
  }

  fileContainsRegex(relativePath, regex) {
    const fullPath = path.join(this.themePath, relativePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');
    return regex.test(content);
  }

  findFilesWithPattern(directory, pattern) {
    const results = [];
    const dirPath = path.join(this.themePath, directory);

    if (!fs.existsSync(dirPath)) return results;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      if (pattern.test(content)) {
        results.push(file);
      }
    }

    return results;
  }

  // ==============================================
  // VERIFICATION CHECKS
  // ==============================================

  checkCartDrawerEnabled() {
    const check = {
      name: 'Cart Drawer Enabled',
      critical: true,
      passed: false,
      message: '',
    };

    // Check if theme.liquid exists
    if (!this.fileExists('layout/theme.liquid')) {
      check.message = 'layout/theme.liquid not found';
      return check;
    }

    // Check if cart drawer section is rendered (not commented out)
    const themeContent = fs.readFileSync(path.join(this.themePath, 'layout/theme.liquid'), 'utf-8');

    // Check for active cart-drawer section tag (outside of Liquid comments)
    // Split content by lines and check each line
    const lines = themeContent.split('\n');
    let inComment = false;
    let hasActiveCartDrawer = false;
    let hasCommentedCartDrawer = false;

    for (const line of lines) {
      // Track comment blocks
      if (line.includes('{%') && line.includes('comment') && !line.includes('endcomment')) {
        inComment = true;
      }
      if (line.includes('endcomment')) {
        inComment = false;
        continue;
      }

      // Check for cart-drawer section
      if (line.includes("section 'cart-drawer'") || line.includes('section "cart-drawer"')) {
        if (inComment) {
          hasCommentedCartDrawer = true;
        } else {
          hasActiveCartDrawer = true;
        }
      }
    }

    if (hasActiveCartDrawer) {
      check.passed = true;
      check.message = 'Cart drawer section is enabled in theme.liquid';
    } else if (hasCommentedCartDrawer) {
      check.message = 'Cart drawer section is COMMENTED OUT in theme.liquid - AJAX cart will not work!';
    } else {
      check.message = 'Cart drawer section not found in theme.liquid';
    }

    return check;
  }

  checkCookieBannerExists() {
    const check = {
      name: 'Cookie Banner Rendered',
      critical: false,
      passed: false,
      message: '',
    };

    // Check if cookie banner section exists
    const cookieBannerExists = this.fileExists('sections/cookie-banner.liquid');

    // Check if it's rendered in theme.liquid
    const renderedInLayout = this.fileContains('layout/theme.liquid', "section 'cookie-banner'") ||
                            this.fileContains('layout/theme.liquid', 'section "cookie-banner"');

    if (cookieBannerExists && renderedInLayout) {
      check.passed = true;
      check.message = 'Cookie banner section exists and is rendered in theme.liquid';
    } else if (cookieBannerExists && !renderedInLayout) {
      check.message = 'Cookie banner section exists but is NOT rendered in theme.liquid';
    } else {
      check.message = 'Cookie banner section does not exist';
    }

    return check;
  }

  checkProductFormJS() {
    const check = {
      name: 'Product Form JavaScript',
      critical: true,
      passed: false,
      message: '',
    };

    // Check for product-form.js or similar
    const hasProductFormJS = this.fileExists('assets/product-form.js') ||
                             this.fileExists('assets/product.js') ||
                             this.fileExists('assets/theme.js');

    // Check for variant selection handling
    const hasVariantClass = this.fileContainsRegex('assets/product-form.js', /class\s+(VariantSelects|VariantRadios)/i) ||
                           this.fileContainsRegex('assets/product.js', /variant/i) ||
                           this.fileContainsRegex('assets/theme.js', /variant/i);

    if (hasProductFormJS && hasVariantClass) {
      check.passed = true;
      check.message = 'Product form JS exists with variant handling';
    } else if (hasProductFormJS) {
      check.passed = true;
      check.message = 'Product form JS exists (verify variant handling manually)';
    } else {
      check.message = 'No product form JavaScript found - variant selection may not work';
    }

    return check;
  }

  checkCollectionFiltering() {
    const check = {
      name: 'Collection Filtering (Real Filter API)',
      critical: true,
      passed: false,
      message: '',
    };

    // Look for collection.filters usage in section files
    const filesWithFilters = this.findFilesWithPattern('sections', /collection\.filters/);

    // Check if main-collection.liquid exists
    const mainCollectionPath = path.join(this.themePath, 'sections/main-collection.liquid');
    if (!fs.existsSync(mainCollectionPath)) {
      check.message = 'sections/main-collection.liquid not found';
      return check;
    }

    const content = fs.readFileSync(mainCollectionPath, 'utf-8');

    // Check for mock/placeholder comments that indicate incomplete implementation
    // Only match explicit markers of incomplete code, not valid HTML attributes like placeholder=""
    const hasMockFilter = /mock\s+(sort|filter|dropdown)/i.test(content) ||
                         /TODO[:\s]+.*filter/i.test(content) ||
                         /FIXME[:\s]+.*filter/i.test(content);

    // Check for Storefront Filtering API usage (the real API)
    const hasFilterType = /filter\.type/i.test(content);
    const hasFilterValues = /filter\.values/i.test(content);
    const hasFilterActiveValues = /filter\.active_values/i.test(content);
    const hasUrlToRemove = /value\.url_to_remove/i.test(content);

    const hasRealFilterAPI = hasFilterType || hasFilterValues || hasFilterActiveValues || hasUrlToRemove;

    if (filesWithFilters.length > 0 && hasRealFilterAPI && !hasMockFilter) {
      check.passed = true;
      check.message = `Collection filtering uses real Shopify Filter API (found in: ${filesWithFilters.join(', ')})`;
    } else if (hasMockFilter) {
      check.message = 'Collection filtering appears to be MOCK/PLACEHOLDER code - needs real Filter API implementation';
    } else if (filesWithFilters.length > 0) {
      check.message = `Found collection.filters reference but may be incomplete (in: ${filesWithFilters.join(', ')})`;
      check.passed = true; // Partial pass
    } else {
      check.message = 'No collection.filters usage found - filtering will not work';
    }

    return check;
  }

  checkBreadcrumbsSnippet() {
    const check = {
      name: 'Breadcrumbs Snippet',
      critical: false,
      passed: false,
      message: '',
    };

    const hasBreadcrumbs = this.fileExists('snippets/breadcrumbs.liquid');
    const hasJsonLd = hasBreadcrumbs && this.fileContains('snippets/breadcrumbs.liquid', 'BreadcrumbList');

    if (hasBreadcrumbs && hasJsonLd) {
      check.passed = true;
      check.message = 'Breadcrumbs snippet exists with JSON-LD schema';
    } else if (hasBreadcrumbs) {
      check.passed = true;
      check.message = 'Breadcrumbs snippet exists (consider adding JSON-LD for SEO)';
    } else {
      check.message = 'No breadcrumbs snippet found';
    }

    return check;
  }

  checkLocalizationForm() {
    const check = {
      name: 'Localization Form (Multi-Currency/Language)',
      critical: false,
      passed: false,
      message: '',
    };

    // Check for localization form in footer
    const hasLocalizationSnippet = this.fileExists('snippets/localization-form.liquid') ||
                                  this.fileExists('snippets/localization-selector.liquid');

    const footerHasLocalization = this.fileContainsRegex('sections/footer.liquid', /localization/) ||
                                  this.fileContainsRegex('sections/footer.liquid', /currency/) ||
                                  this.fileContainsRegex('sections/footer.liquid', /language/);

    if (hasLocalizationSnippet && footerHasLocalization) {
      check.passed = true;
      check.message = 'Localization form exists and is integrated in footer';
    } else if (hasLocalizationSnippet) {
      check.message = 'Localization form exists but may not be rendered (check footer integration)';
      check.passed = true; // Partial
    } else {
      check.message = 'No localization form found (OK if single-market store)';
      check.passed = true; // Not critical for single-market
    }

    return check;
  }

  checkVariantPicker() {
    const check = {
      name: 'Variant Picker (Option-Based)',
      critical: true,
      passed: false,
      message: '',
    };

    // Check for variant picker snippet or inline implementation
    const hasVariantSnippet = this.fileExists('snippets/variant-picker.liquid') ||
                             this.fileExists('snippets/product-variant-picker.liquid');

    // Check for option-based variant selection (not flat list)
    const hasOptionBased = this.fileContainsRegex('sections/main-product.liquid', /product\.options_with_values/) ||
                          this.fileContainsRegex('snippets/variant-picker.liquid', /product\.options_with_values/) ||
                          this.fileContainsRegex('snippets/product-variant-picker.liquid', /product\.options_with_values/);

    // Check for flat variant list (bad pattern)
    const hasFlatList = this.fileContainsRegex('sections/main-product.liquid', /for\s+variant\s+in\s+product\.variants.*option.*value/s);

    if (hasVariantSnippet && hasOptionBased && !hasFlatList) {
      check.passed = true;
      check.message = 'Variant picker uses option-based selection (correct implementation)';
    } else if (hasFlatList) {
      check.message = 'Variant picker uses FLAT VARIANT LIST - should use option-based picker for better UX';
    } else if (hasOptionBased) {
      check.passed = true;
      check.message = 'Option-based variant selection found';
    } else {
      check.message = 'No proper variant picker implementation found';
    }

    return check;
  }

  checkPriceSnippet() {
    const check = {
      name: 'Price Snippet',
      critical: false,
      passed: false,
      message: '',
    };

    const hasPriceSnippet = this.fileExists('snippets/price.liquid');
    const hasCompareAt = hasPriceSnippet && this.fileContains('snippets/price.liquid', 'compare_at_price');

    if (hasPriceSnippet && hasCompareAt) {
      check.passed = true;
      check.message = 'Price snippet exists with compare-at price support';
    } else if (hasPriceSnippet) {
      check.passed = true;
      check.message = 'Price snippet exists';
    } else {
      check.message = 'No price snippet found (prices may be hardcoded)';
    }

    return check;
  }

  checkSkipLink() {
    const check = {
      name: 'Skip to Content Link (Accessibility)',
      critical: false,
      passed: false,
      message: '',
    };

    const hasSkipLink = this.fileContains('layout/theme.liquid', 'skip-to-content') ||
                       this.fileContains('layout/theme.liquid', 'skip_to_content');

    if (hasSkipLink) {
      check.passed = true;
      check.message = 'Skip to content link found in theme.liquid';
    } else {
      check.message = 'No skip to content link found - required for accessibility';
    }

    return check;
  }

  // ==============================================
  // MAIN VERIFICATION
  // ==============================================

  run() {
    console.log(`\n${colors.bold}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║       SHOPIFY THEME COMMERCE VERIFICATION          ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.cyan}Theme path: ${this.themePath}${colors.reset}\n`);

    // Verify theme directory exists
    if (!fs.existsSync(this.themePath)) {
      this.log(`Theme directory not found: ${this.themePath}`, 'error');
      process.exit(1);
    }

    // Run all checks
    const checks = [
      this.checkCartDrawerEnabled(),
      this.checkProductFormJS(),
      this.checkVariantPicker(),
      this.checkCollectionFiltering(),
      this.checkPriceSnippet(),
      this.checkBreadcrumbsSnippet(),
      this.checkCookieBannerExists(),
      this.checkLocalizationForm(),
      this.checkSkipLink(),
    ];

    // Output results
    console.log(`${colors.bold}Results:${colors.reset}\n`);

    let passed = 0;
    let failed = 0;
    let warnings = 0;

    for (const check of checks) {
      if (check.passed) {
        this.log(`${check.name}: ${check.message}`, 'success');
        passed++;
      } else if (check.critical) {
        this.log(`${check.name}: ${check.message}`, 'error');
        failed++;
      } else {
        this.log(`${check.name}: ${check.message}`, 'warning');
        warnings++;
      }
    }

    // Summary
    console.log(`\n${colors.bold}Summary:${colors.reset}`);
    console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`  ${colors.yellow}Warnings: ${warnings}${colors.reset}`);

    if (failed > 0) {
      console.log(`\n${colors.red}${colors.bold}⚠ Theme has critical issues that need to be fixed before deployment!${colors.reset}`);
      process.exit(1);
    } else if (warnings > 0) {
      console.log(`\n${colors.yellow}Theme passed with warnings. Review the warnings above.${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.green}${colors.bold}✓ Theme passed all commerce verification checks!${colors.reset}`);
      process.exit(0);
    }
  }
}

// Run if executed directly
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('verify_theme.js')
);

if (isMain) {
  const verifier = new ThemeVerifier();
  verifier.run();
}

export default ThemeVerifier;
