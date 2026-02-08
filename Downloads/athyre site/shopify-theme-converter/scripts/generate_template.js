#!/usr/bin/env node
/**
 * generate_template.js
 *
 * Generates Shopify JSON template files with proper structure and UUIDs.
 *
 * Usage:
 *   node scripts/generate_template.js page.about --sections hero,rich-text,image-with-text
 *   node scripts/generate_template.js index --sections video-hero,featured-collection,rich-text
 *   node scripts/generate_template.js index --sections hero,rich-text --write --output ./theme/templates
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateId() {
  // Shopify uses lowercase alphanumeric IDs (16 chars)
  return crypto.randomBytes(8).toString('hex');
}

function createSectionKey(type) {
  // Create readable key: section_type_randomid
  const cleanType = type.replace(/-/g, '_');
  const shortId = generateId().substring(0, 6);
  return `${cleanType}_${shortId}`;
}

function createTemplate(templateName, sectionTypes) {
  const sections = {};
  const order = [];

  sectionTypes.forEach((type) => {
    const key = createSectionKey(type);
    sections[key] = {
      type: type,
      settings: {}
    };
    order.push(key);
  });

  return {
    sections,
    order
  };
}

function printHelp() {
  console.log(`
========================================
  Shopify Template Generator
========================================

Usage:
  node generate_template.js <template-name> --sections <section-types>

Arguments:
  template-name     Name of the template (e.g., index, page.about, collection)
  --sections        Comma-separated list of section types

Options:
  --write           Write to file instead of just printing
  --output <dir>    Output directory (default: ./theme/templates)
  --help            Show this help message

Examples:
  # Generate homepage template (print to console)
  node generate_template.js index --sections hero,featured-collection,rich-text

  # Generate about page template and write to file
  node generate_template.js page.about --sections hero,rich-text,image-with-text --write

  # Generate with custom output directory
  node generate_template.js page.contact --sections contact-form --write --output ./my-theme/templates

Common Template Names:
  index             Homepage
  page              Default page template
  page.about        About page (alternate template)
  page.contact      Contact page (alternate template)
  product           Product page
  collection        Collection page
  cart              Cart page
  blog              Blog listing page
  article           Blog article page
  search            Search results page
  404               404 error page

Common Section Types:
  hero, image-hero, video-hero
  rich-text, image-with-text
  featured-collection, collection-list
  featured-product, product-recommendations
  testimonials, faq, contact-form
  newsletter, announcement-bar
`);
}

function main() {
  const args = process.argv.slice(2);

  // Check for help
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  const templateName = args[0];
  const sectionsIndex = args.indexOf('--sections');
  const writeMode = args.includes('--write');
  const outputIndex = args.indexOf('--output');

  if (!templateName || templateName.startsWith('--')) {
    console.error('Error: Template name required as first argument');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  if (sectionsIndex === -1 || !args[sectionsIndex + 1]) {
    console.error('Error: --sections flag required with comma-separated section types');
    console.log('Example: --sections hero,rich-text,featured-collection');
    process.exit(1);
  }

  const sectionTypes = args[sectionsIndex + 1]
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sectionTypes.length === 0) {
    console.error('Error: At least one section type required');
    process.exit(1);
  }

  // Generate template
  const template = createTemplate(templateName, sectionTypes);
  const filename = `${templateName}.json`;
  const jsonOutput = JSON.stringify(template, null, 2);

  console.log(`\n========================================`);
  console.log(`  Template Generator`);
  console.log(`========================================`);
  console.log(`\nTemplate: ${filename}`);
  console.log(`Sections: ${sectionTypes.join(', ')}\n`);

  if (writeMode) {
    // Write to file
    const outputDir = outputIndex !== -1 && args[outputIndex + 1]
      ? args[outputIndex + 1]
      : './theme/templates';

    const outputPath = path.join(outputDir, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[!] Warning: File already exists at ${outputPath}`);
      console.log(`    Overwriting...`);
    }

    fs.writeFileSync(outputPath, jsonOutput);
    console.log(`[OK] Written to: ${outputPath}\n`);

    // Also print the content
    console.log(`Contents:`);
    console.log(`----------------------------------------`);
    console.log(jsonOutput);
    console.log(`----------------------------------------\n`);
  } else {
    // Just print
    console.log(`Generated JSON:`);
    console.log(`----------------------------------------`);
    console.log(jsonOutput);
    console.log(`----------------------------------------`);
    console.log(`\nUse --write to save to file`);
    console.log(`Use --output <dir> to specify output directory\n`);
  }

  // Print section reference
  console.log(`Section keys for reference:`);
  template.order.forEach((key, i) => {
    console.log(`  ${i + 1}. ${key} -> ${template.sections[key].type}`);
  });
  console.log('');
}

main();
