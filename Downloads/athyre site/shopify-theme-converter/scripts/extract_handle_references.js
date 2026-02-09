#!/usr/bin/env node
/**
 * extract_handle_references.js
 *
 * Scans all .liquid files for runtime content-code bindings — references
 * to blogs, pages, collections, products, and menus by handle. These are
 * the CONTRACTS between your theme code and Shopify admin content.
 *
 * If your theme references blogs['journal'] but the blog handle in admin
 * is "news", the link silently outputs nothing. This script makes those
 * bindings visible and verifiable.
 *
 * Usage:
 *   node scripts/extract_handle_references.js [theme-directory]
 *   node scripts/extract_handle_references.js ./deployment-package/theme --json
 *
 * Flags:
 *   --json    Output as content-bindings.json file
 *
 * Example output:
 *   {
 *     "blogs": ["this-is-athyre", "news"],
 *     "pages": ["vision", "stewardship", "contact"],
 *     "collections": ["all", "new-arrivals"],
 *     "products": [],
 *     "menus": ["main-menu", "footer"],
 *     "links": ["/pages/vision", "/blogs/journal", "/collections/all"]
 *   }
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
 * Recursively find all .liquid and .json files in a directory
 */
function findThemeFiles(dir) {
  const results = [];

  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.liquid') || entry.name.endsWith('.json'))) {
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
 * Extract handle references from file content.
 * Returns categorized references with file:line info.
 */
function extractReferences(content, relPath) {
  const refs = {
    blogs: [],
    pages: [],
    collections: [],
    products: [],
    menus: [],
    links: [],
    routes: [],
  };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const loc = `${relPath}:${lineNum}`;

    // blogs['handle'] or blogs["handle"]
    const blogMatches = line.matchAll(/blogs\[['"]([^'"]+)['"]\]/g);
    for (const m of blogMatches) {
      refs.blogs.push({ handle: m[1], location: loc, context: line.trim() });
    }

    // pages['handle'] or pages["handle"]
    const pageMatches = line.matchAll(/pages\[['"]([^'"]+)['"]\]/g);
    for (const m of pageMatches) {
      refs.pages.push({ handle: m[1], location: loc, context: line.trim() });
    }

    // collections['handle'] or collections["handle"]
    const collMatches = line.matchAll(/collections\[['"]([^'"]+)['"]\]/g);
    for (const m of collMatches) {
      refs.collections.push({ handle: m[1], location: loc, context: line.trim() });
    }

    // all_products['handle'] or products['handle']
    const prodMatches = line.matchAll(/(?:all_)?products\[['"]([^'"]+)['"]\]/g);
    for (const m of prodMatches) {
      refs.products.push({ handle: m[1], location: loc, context: line.trim() });
    }

    // linklists['handle'] (menus)
    const menuMatches = line.matchAll(/linklists\[['"]([^'"]+)['"]\]/g);
    for (const m of menuMatches) {
      refs.menus.push({ handle: m[1], location: loc, context: line.trim() });
    }

    // Hardcoded URL paths: href="/pages/..." , href="/blogs/..." , href="/collections/..."
    const linkMatches = line.matchAll(/href=["'](\/(?:pages|blogs|collections|products)\/[^"'#?]+)["']/g);
    for (const m of linkMatches) {
      refs.links.push({ url: m[1], location: loc, context: line.trim() });
    }

    // routes.* references (Shopify dynamic routes)
    const routeMatches = line.matchAll(/routes\.(cart_url|root_url|account_url|account_login_url|account_register_url|account_logout_url|search_url|collections_url|all_products_collection_url)/g);
    for (const m of routeMatches) {
      refs.routes.push({ route: m[1], location: loc });
    }
  }

  return refs;
}

function main() {
  const args = process.argv.slice(2);
  const themePath = args.find(a => !a.startsWith('--')) || '.';
  const outputJson = args.includes('--json');

  console.log(`\n${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Content-Code Binding Extractor${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================${c.reset}`);
  console.log(`\n${c.dim}Theme path: ${path.resolve(themePath)}${c.reset}\n`);

  if (!fs.existsSync(themePath)) {
    console.error(`${c.red}Error: Directory not found: ${themePath}${c.reset}`);
    process.exit(1);
  }

  const files = findThemeFiles(themePath);
  console.log(`Scanning ${files.length} theme files...\n`);

  // Aggregate all references
  const allRefs = {
    blogs: [],
    pages: [],
    collections: [],
    products: [],
    menus: [],
    links: [],
    routes: [],
  };

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(themePath, filePath);
    const refs = extractReferences(content, relPath);

    for (const category of Object.keys(allRefs)) {
      allRefs[category].push(...refs[category]);
    }
  }

  // Deduplicate handles
  const uniqueHandles = {
    blogs: [...new Set(allRefs.blogs.map(r => r.handle))],
    pages: [...new Set(allRefs.pages.map(r => r.handle))],
    collections: [...new Set(allRefs.collections.map(r => r.handle))],
    products: [...new Set(allRefs.products.map(r => r.handle))],
    menus: [...new Set(allRefs.menus.map(r => r.handle))],
    hardcoded_links: [...new Set(allRefs.links.map(r => r.url))],
    routes_used: [...new Set(allRefs.routes.map(r => r.route))],
  };

  // Display results
  const categories = [
    { key: 'blogs', label: 'Blog Handles', refs: allRefs.blogs, handles: uniqueHandles.blogs },
    { key: 'pages', label: 'Page Handles', refs: allRefs.pages, handles: uniqueHandles.pages },
    { key: 'collections', label: 'Collection Handles', refs: allRefs.collections, handles: uniqueHandles.collections },
    { key: 'products', label: 'Product Handles', refs: allRefs.products, handles: uniqueHandles.products },
    { key: 'menus', label: 'Menu Handles', refs: allRefs.menus, handles: uniqueHandles.menus },
  ];

  let totalBindings = 0;

  for (const cat of categories) {
    if (cat.handles.length === 0) continue;

    console.log(`${c.bold}${cat.label}:${c.reset}`);
    for (const handle of cat.handles) {
      const locations = cat.refs.filter(r => r.handle === handle);
      console.log(`  ${c.cyan}${handle}${c.reset} (${locations.length} reference${locations.length > 1 ? 's' : ''})`);
      for (const loc of locations.slice(0, 3)) {
        console.log(`    ${c.dim}${loc.location}${c.reset}`);
      }
      if (locations.length > 3) {
        console.log(`    ${c.dim}...and ${locations.length - 3} more${c.reset}`);
      }
      totalBindings++;
    }
    console.log('');
  }

  // Hardcoded links
  if (uniqueHandles.hardcoded_links.length > 0) {
    console.log(`${c.yellow}${c.bold}HARDCODED URL PATHS (should use Liquid objects instead):${c.reset}`);
    for (const url of uniqueHandles.hardcoded_links) {
      const locations = allRefs.links.filter(r => r.url === url);
      console.log(`  ${c.yellow}${url}${c.reset}`);
      for (const loc of locations.slice(0, 2)) {
        console.log(`    ${c.dim}${loc.location}${c.reset}`);
      }
    }
    console.log('');
  }

  // Summary
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`${c.bold}  CONTENT BINDING SUMMARY${c.reset}`);
  console.log(`${c.bold}================================================${c.reset}`);
  console.log(`  Blog handles:       ${uniqueHandles.blogs.length}`);
  console.log(`  Page handles:       ${uniqueHandles.pages.length}`);
  console.log(`  Collection handles: ${uniqueHandles.collections.length}`);
  console.log(`  Product handles:    ${uniqueHandles.products.length}`);
  console.log(`  Menu handles:       ${uniqueHandles.menus.length}`);
  console.log(`  Hardcoded URLs:     ${uniqueHandles.hardcoded_links.length}`);
  console.log(`  Routes used:        ${uniqueHandles.routes_used.length}`);

  if (uniqueHandles.hardcoded_links.length > 0) {
    console.log(`\n${c.yellow}WARNING: ${uniqueHandles.hardcoded_links.length} hardcoded URL path(s) found.${c.reset}`);
    console.log(`${c.yellow}These will break if the content handle changes in Shopify admin.${c.reset}`);
  }

  // Output JSON manifest
  if (outputJson) {
    const manifest = {
      _generated: new Date().toISOString(),
      _description: 'Content-code bindings manifest. These handles MUST exist in Shopify admin for the theme to work correctly.',
      blogs: uniqueHandles.blogs,
      pages: uniqueHandles.pages,
      collections: uniqueHandles.collections,
      products: uniqueHandles.products,
      menus: uniqueHandles.menus,
      hardcoded_links: uniqueHandles.hardcoded_links,
      routes_used: uniqueHandles.routes_used,
    };

    const outputPath = path.join(themePath, 'content-bindings.json');
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    console.log(`\n${c.green}Manifest written to: ${outputPath}${c.reset}`);
  }

  console.log(`\n${c.bold}ACTION REQUIRED:${c.reset}`);
  console.log(`${c.dim}Verify each handle above exists in your Shopify admin:${c.reset}`);
  console.log(`  - Blogs:       Settings > Blog posts`);
  console.log(`  - Pages:       Online Store > Pages`);
  console.log(`  - Collections: Products > Collections`);
  console.log(`  - Menus:       Online Store > Navigation`);
  console.log('');
}

main();
