---
name: shopify-theme-converter
description: Convert any web project (React, Next.js, Vue, HTML/CSS, any framework) into a COMPLETE, launch-ready Shopify store package. Goes beyond theme conversion to include page templates with pre-configured sections, navigation menus, asset manifests, content extraction, and client handoff documentation. Use when converting websites to Shopify - outputs everything needed for client to see exactly what was demoed.
---

# Shopify Theme Converter v2

Convert any web project into a **complete, launch-ready Shopify store package** — not just a theme folder.

## The Problem This Solves

Converting components to sections is only 30% of the work. A client expecting their demo to "just work" also needs:
- Pages that actually exist in Shopify
- Sections pre-configured on those pages
- Navigation menus created
- Images uploaded
- Content already populated
- Clear setup instructions

This skill produces a **deployment package** that delivers exactly what was demoed.

## Quick Reference

Load relevant references before starting:

### Core Conversion References

| Reference | Use When |
|-----------|----------|
| `references/liquid-patterns.md` | Writing any Liquid code |
| `references/section-schemas.md` | Creating section settings |
| `references/theme-structure.md` | Understanding file organization |
| `references/conversion-examples.md` | Translating React/Vue patterns |
| `references/deployment-package.md` | Structuring final deliverable |
| `references/content-extraction.md` | Pulling content from source |
| `references/metafields-guide.md` | Working with metafields/metaobjects |
| `references/app-integration.md` | App blocks, subscriptions, checkout |
| `references/jsx-to-liquid-checklist.md` | Converting JSX patterns to Liquid |
| `references/icon-mapping.md` | React icon imports → Liquid snippets |

### Automation Scripts

| Script | Use When |
|--------|----------|
| `scripts/sanitize_liquid.js` | Scan/fix JSX patterns in Liquid files |
| `scripts/validate_schema.js` | Check sections have presets |
| `scripts/generate_template.js` | Generate JSON templates with UUIDs |

### Scaffold Resources

| Resource | Contents |
|----------|----------|
| `scaffold/icons/` | 48+ Lucide-based icon snippets |
| `scaffold/sections/` | Pre-built sections with presets (main-product, main-collection, etc.) |
| `scaffold/snippets/` | Reusable components (variant-picker, breadcrumbs, price) |
| `scaffold/assets/` | JavaScript (product-form.js with AJAX cart) |
| `scaffold/layout/` | theme.liquid with cart drawer, cookie banner enabled |
| `scaffold/config/` | Base settings schema |

### Component References

| Reference | Use When |
|-----------|----------|
| `references/announcement-bar.md` | Promotional banners, dismissible notices |
| `references/mega-menu.md` | Complex navigation with dropdowns |
| `references/preorder-backorder.md` | Inventory states, pre-order buttons |
| `references/countdown-timer.md` | Sale/launch countdowns |
| `references/trust-badges.md` | Payment icons, guarantee badges |
| `references/product-compare.md` | Compare products functionality |
| `references/product-bundles.md` | Bundle displays, frequently bought together |
| `references/shipping-calculator.md` | Cart shipping rate estimator |

### UX Pattern References

| Reference | Use When |
|-----------|----------|
| `references/mobile-patterns.md` | Touch targets, swipe, bottom nav, sticky bars |
| `references/loading-states.md` | Spinners, skeleton screens, lazy loading |
| `references/error-states.md` | Form validation, 404 pages, empty states |

### Advanced Commerce References

| Reference | Use When |
|-----------|----------|
| `references/b2b-wholesale.md` | Wholesale pricing, quick order, tiered pricing |
| `references/cart-api-complete.md` | Cart API, line item properties, cart attributes |
| `references/checkout-extensibility.md` | Checkout UI extensions, Shopify Functions |
| `references/subscriptions-selling-plans.md` | Recurring products, subscribe & save |

### Data & Integration References

| Reference | Use When |
|-----------|----------|
| `references/metafields-complete.md` | Full metafield/metaobject guide, custom data |
| `references/backend-connectivity.md` | App proxy, webhooks, Storefront API |
| `references/customer-accounts.md` | Login, registration, account dashboard |
| `references/markets-multi-currency.md` | International selling, currency, languages |
| `references/search-discovery.md` | Predictive search, collection filtering |
| `references/shopify-flow-automation.md` | Workflow automation, triggers, actions |

### Quality & Standards References

| Reference | Use When |
|-----------|----------|
| `references/performance-accessibility-checklist.md` | Lighthouse scores, WCAG compliance |

### Content & Marketing References

| Reference | Use When |
|-----------|----------|
| `references/popup-modal.md` | Newsletter popups, exit intent, promotional modals |
| `references/faq-accordion.md` | Collapsible FAQs, accordion components |
| `references/gift-cards.md` | Gift card templates, balance checker |
| `references/size-guide.md` | Size charts, measurement guides, fit finder |
| `references/blog-patterns.md` | Article templates, blog grids, author bios |
| `references/video-sections.md` | Video backgrounds, YouTube/Vimeo embeds |
| `references/image-lightbox.md` | Image zoom, lightbox galleries, 360° views |
| `references/cart-upsells.md` | In-cart upsells, order bumps, FBT |
| `references/contact-forms.md` | Contact pages, multi-field forms, validation |
| `references/social-proof.md` | Instagram feeds, UGC, press logos, sales pop |

---

## Blind Spot Prevention

These issues cause 40%+ of post-conversion debugging time. Prevent them proactively.

### Issue 1: JSX Comments Render as Literal Text

**Problem:** `{/* comment */}` renders visibly in Liquid output.

**Solution:** Run sanitizer before deployment:
```bash
node scripts/sanitize_liquid.js ./theme/ --fix
```

Auto-fixes:
- `{/* comment */}` → `{% comment %}...{% endcomment %}`
- `className=` → `class=`
- `htmlFor=` → `for=`

### Issue 2: Missing Icon Assets Crash Theme

**Problem:** `{% render 'icon-arrow-right' %}` fails if snippet doesn't exist.

**Solution:** Copy scaffold icons during initialization:
```bash
cp -r scaffold/icons/* theme/snippets/
```

The `scaffold/icons/` folder contains 48+ Lucide-based icons covering:
- Navigation (arrows, chevrons)
- E-commerce (cart, heart, star)
- Social (Instagram, Facebook, etc.)
- UI (search, menu, user)

See `references/icon-mapping.md` for React import → snippet mapping.

### Issue 3: Sections Invisible in Theme Editor

**Problem:** Sections without `presets` don't appear in "Add section" menu.

**Solution:** Run validator on all sections:
```bash
node scripts/validate_schema.js ./theme/sections/
```

Checks for:
- Missing `presets` (except main-*, header, footer)
- Missing `name` property
- Invalid block types
- Duplicate setting IDs

### Issue 4: JSON Template UUID Tedium

**Problem:** Manual section ID creation is error-prone and tedious.

**Solution:** Use template generator:
```bash
# Generate about page template
node scripts/generate_template.js page.about --sections hero,rich-text,team

# Write directly to theme
node scripts/generate_template.js page.about --sections hero,rich-text --write
```

### Issue 5: Sections Not Rendered in Layout

**Problem:** Some critical sections exist but don't appear because they must be manually added to `theme.liquid`.

**Solution:** Understand which sections auto-render vs. need manual rendering:

| Section | Auto-Rendered? | Must Add to theme.liquid |
|---------|----------------|--------------------------|
| header | ✓ (layout) | No |
| footer | ✓ (layout) | No |
| main-* | ✓ (templates) | No |
| cart-drawer | ❌ | Yes - `{% section 'cart-drawer' %}` |
| cookie-banner | ❌ | Yes - `{% section 'cookie-banner' %}` |
| announcement-bar | ❌ | Yes - `{% section 'announcement-bar' %}` |
| breadcrumbs | ❌ (snippet) | Yes - `{% render 'breadcrumbs' %}` |

**The scaffold's `theme.liquid` has these ENABLED by default.** If you create theme.liquid from scratch, ensure these are included:

```liquid
{%- comment -%} In <body>, after header {%- endcomment -%}
{% section 'cart-drawer' %}

{%- comment -%} Before main content (except homepage) {%- endcomment -%}
{%- unless template == 'index' -%}
  {% render 'breadcrumbs' %}
{%- endunless -%}

{%- comment -%} Before </body>, after footer {%- endcomment -%}
{% section 'cookie-banner' %}
```

---

## Complete Conversion Workflow

### Phase 0: Initialize Theme Structure

**Before converting anything**, set up the foundation:

```bash
# 1. Create theme directory structure
mkdir -p theme/{assets,config,layout,locales,sections,snippets,templates}

# 2. Copy scaffold icons (prevents missing icon errors)
cp -r scaffold/icons/* theme/snippets/

# 3. Copy base sections with presets
cp -r scaffold/sections/* theme/sections/

# 4. Copy base config
cp scaffold/config/settings_schema.json theme/config/
```

This ensures:
- All common icons are available from the start
- Base sections have proper `presets` for Theme Editor visibility
- Settings schema has required theme structure

---

### Phase 1: Analyze Source Project

**Step 1.1: Map the entire project structure**

```
Source Project Analysis
├── Pages (routes)
│   ├── / (home) → templates/index.json
│   ├── /about → templates/page.about.json + Shopify page
│   ├── /services → templates/page.services.json + Shopify page
│   ├── /contact → templates/page.contact.json + Shopify page
│   └── /blog → templates/blog.json
│
├── Components → sections/
│   ├── Hero.jsx → sections/hero.liquid
│   ├── Features.jsx → sections/features.liquid
│   └── ...
│
├── Navigation
│   ├── Header nav links → Main menu
│   ├── Footer nav links → Footer menu
│   └── Mobile nav → Mobile menu (if different)
│
├── Assets
│   ├── Images → Files (need upload manifest)
│   ├── Fonts → Theme settings or assets/
│   └── Icons → snippets/icon.liquid or inline SVG
│
└── Content
    ├── Headlines → Section setting defaults
    ├── Body text → Section setting defaults
    ├── CTAs → Section setting defaults
    └── Alt text → Image settings
```

**Step 1.2: Create conversion inventory**

For each page, document:
```markdown
## Page: About (/about)

**Shopify requirements:**
- Template: templates/page.about.json
- Page: Must create "About" page in Shopify admin

**Sections used (in order):**
1. about-hero (converted from AboutHero.jsx)
2. team-grid (converted from TeamSection.jsx)
3. values (converted from OurValues.jsx)

**Content to extract:**
- Headline: "About Our Company"
- Subheadline: "Building the future since 2015"
- Team members: [array of 4 members]
- Values: [array of 3 values]

**Images needed:**
- /images/about-hero.jpg → about-hero.jpg
- /images/team/person1.jpg → team-person1.jpg
```

---

### Phase 2: Convert Components to Sections

Follow existing section conversion process (see `references/conversion-examples.md`).

**Critical additions:**

1. **Extract default content from source:**
```liquid
{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome to Our Store"  // ← Actual content from React
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading", 
      "default": "Quality products for modern living"  // ← Actual content from React
    }
  ]
}
{% endschema %}
```

2. **Use placeholder image references that match manifest:**
```liquid
{% comment %} 
  Image: hero-background.jpg
  Source: /public/images/hero-bg.jpg
  See assets-manifest.md for upload instructions
{% endcomment %}
{% if section.settings.image != blank %}
  {{ section.settings.image | image_url: width: 1920 | image_tag }}
{% else %}
  {{ 'hero-background.jpg' | asset_url | image_tag }}
{% endif %}
```

---

### Phase 3: Create Page Templates with Pre-configured Sections

**This is the critical missing step.**

For EVERY page in the source project, create a corresponding template JSON with sections already placed and configured.

**Step 3.1: Homepage (templates/index.json)**

```json
{
  "sections": {
    "hero": {
      "type": "hero-banner",
      "settings": {
        "heading": "Welcome to Our Store",
        "subheading": "Quality products for modern living",
        "button_text": "Shop Now",
        "button_link": "shopify://collections/all",
        "overlay_opacity": 40
      }
    },
    "featured-collection": {
      "type": "featured-collection",
      "settings": {
        "title": "Best Sellers",
        "collection": "",
        "products_to_show": 4
      }
    },
    "image-with-text": {
      "type": "image-with-text",
      "settings": {
        "heading": "Our Story",
        "text": "Founded in 2015, we've been committed to quality...",
        "button_text": "Learn More",
        "button_link": "shopify://pages/about",
        "image_position": "left"
      }
    },
    "testimonials": {
      "type": "testimonials",
      "blocks": {
        "testimonial-1": {
          "type": "testimonial",
          "settings": {
            "quote": "Best purchase I've ever made!",
            "author": "Sarah M.",
            "rating": 5
          }
        },
        "testimonial-2": {
          "type": "testimonial",
          "settings": {
            "quote": "Incredible quality and fast shipping.",
            "author": "John D.",
            "rating": 5
          }
        }
      },
      "block_order": ["testimonial-1", "testimonial-2"]
    },
    "newsletter": {
      "type": "newsletter",
      "settings": {
        "heading": "Join Our Newsletter",
        "subheading": "Get 10% off your first order"
      }
    }
  },
  "order": ["hero", "featured-collection", "image-with-text", "testimonials", "newsletter"]
}
```

**Step 3.2: Custom page templates**

For pages like About, Contact, Services, create **alternate page templates**:

```json
// templates/page.about.json
{
  "sections": {
    "about-hero": {
      "type": "page-hero",
      "settings": {
        "heading": "About Us",
        "subheading": "Our story, our mission, our team"
      }
    },
    "story": {
      "type": "image-with-text",
      "settings": {
        "heading": "Our Story",
        "text": "Founded in a small garage in 2015, we started with a simple mission: create products that make a difference...",
        "image_position": "right"
      }
    },
    "team": {
      "type": "team-grid",
      "blocks": {
        "member-1": {
          "type": "team_member",
          "settings": {
            "name": "Jane Smith",
            "role": "Founder & CEO",
            "bio": "Jane started the company with a vision..."
          }
        }
      },
      "block_order": ["member-1"]
    },
    "values": {
      "type": "multicolumn",
      "settings": {
        "title": "Our Values"
      },
      "blocks": {
        "value-1": {
          "type": "column",
          "settings": {
            "title": "Quality",
            "text": "We never compromise on materials or craftsmanship."
          }
        },
        "value-2": {
          "type": "column",
          "settings": {
            "title": "Sustainability",
            "text": "Every decision considers our environmental impact."
          }
        }
      },
      "block_order": ["value-1", "value-2"]
    }
  },
  "order": ["about-hero", "story", "team", "values"]
}
```

**Template naming convention:**
- `page.json` - Default page template
- `page.about.json` - "About" alternate template
- `page.contact.json` - "Contact" alternate template
- `page.services.json` - "Services" alternate template

---

### Phase 4: Extract Navigation Structure

**Step 4.1: Parse navigation from source**

From React/Vue nav component, extract:

```javascript
// Source: Header.jsx
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/collections/all' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
```

**Step 4.2: Create menu structure document**

```json
// deployment-package/menus.json
{
  "main-menu": {
    "title": "Main menu",
    "handle": "main-menu",
    "items": [
      {
        "title": "Home",
        "link": "/"
      },
      {
        "title": "Shop",
        "link": "/collections/all",
        "children": [
          { "title": "New Arrivals", "link": "/collections/new-arrivals" },
          { "title": "Best Sellers", "link": "/collections/best-sellers" },
          { "title": "Sale", "link": "/collections/sale" }
        ]
      },
      {
        "title": "About",
        "link": "/pages/about"
      },
      {
        "title": "Contact",
        "link": "/pages/contact"
      }
    ]
  },
  "footer-menu": {
    "title": "Footer menu",
    "handle": "footer",
    "items": [
      { "title": "Privacy Policy", "link": "/policies/privacy-policy" },
      { "title": "Refund Policy", "link": "/policies/refund-policy" },
      { "title": "Terms of Service", "link": "/policies/terms-of-service" }
    ]
  }
}
```

**Step 4.3: Update header/footer sections to use menus**

```liquid
<!-- sections/header.liquid -->
{% for link in linklists['main-menu'].links %}
  <a href="{{ link.url }}">{{ link.title }}</a>
  {% if link.links.size > 0 %}
    <ul class="dropdown">
      {% for child_link in link.links %}
        <a href="{{ child_link.url }}">{{ child_link.title }}</a>
      {% endfor %}
    </ul>
  {% endif %}
{% endfor %}
```

---

### Phase 5: Create Asset Manifest

**Step 5.1: Scan source for all images**

```markdown
# Asset Upload Manifest

## Images to Upload

Upload these to: Shopify Admin → Content → Files

| Filename | Source Location | Used In | Dimensions |
|----------|-----------------|---------|------------|
| hero-background.jpg | /public/images/hero-bg.jpg | Homepage hero | 1920x1080 |
| about-hero.jpg | /public/images/about/hero.jpg | About page hero | 1920x800 |
| team-jane.jpg | /public/images/team/jane.jpg | Team section | 400x400 |
| team-john.jpg | /public/images/team/john.jpg | Team section | 400x400 |
| logo.svg | /public/images/logo.svg | Header | - |
| favicon.png | /public/favicon.png | Browser tab | 32x32 |

## After Upload

1. Go to each section in Theme Customizer
2. Select the uploaded images for corresponding image pickers
3. Or update settings_data.json with CDN URLs

## Fonts

| Font | Source | Implementation |
|------|--------|----------------|
| Inter | Google Fonts | Added to theme.liquid |
| Playfair Display | Google Fonts | Added to theme.liquid |

## Icons

All icons converted to inline SVG in snippets/icons.liquid
```

---

### Phase 6: Sanitize & Validate

**Critical step before packaging.** Run automated checks to catch common issues:

```bash
# 1. Scan and fix JSX patterns in Liquid files
node scripts/sanitize_liquid.js ./theme/ --fix

# 2. Validate all section schemas
node scripts/validate_schema.js ./theme/sections/

# 3. Verify commerce functionality
node scripts/verify_theme.js ./theme/

# 4. Check for missing icons (manual)
grep -roh "render 'icon-[^']*'" ./theme/ | \
  sed "s/render 'icon-\([^']*\)'/\1/" | \
  sort -u | \
  while read icon; do
    if [ ! -f "./theme/snippets/icon-${icon}.liquid" ]; then
      echo "MISSING: icon-${icon}.liquid"
    fi
  done

# 5. Check for hardcoded links
grep -rn 'href="/pages/' ./theme/sections/ ./theme/snippets/
grep -rn 'href="/collections/' ./theme/sections/ ./theme/snippets/
grep -rn 'href="/products/' ./theme/sections/ ./theme/snippets/
```

**Common fixes:**
| Issue | Fix |
|-------|-----|
| JSX comment `{/* */}` | Auto-fixed by sanitizer |
| `className=` | Auto-fixed by sanitizer |
| Missing preset | Add `"presets": [{"name": "Section Name"}]` to schema |
| Missing icon | Copy from `scaffold/icons/` or create new |
| Hardcoded URL | Use `{{ pages.handle.url }}` or `{{ routes.* }}` |

#### Commerce Readiness Checklist

Before deployment, verify these critical e-commerce features work:

**Product Page:**
- [ ] Variant selection changes price, image, and availability
- [ ] Quantity selector +/- buttons work
- [ ] Add to Cart button triggers cart drawer OR navigates to cart
- [ ] Sold out variants show "Sold Out" state
- [ ] Price displays correctly (regular, compare-at, sale)

**Collection Page:**
- [ ] Collection filtering works (uses real Shopify Filter API)
- [ ] Collection sorting works (price, date, alphabetical)
- [ ] Pagination works
- [ ] Product cards show correct prices

**Cart:**
- [ ] Cart drawer opens on add-to-cart
- [ ] Quantity updates work in cart
- [ ] Remove item works
- [ ] Cart total updates correctly

**Search:**
- [ ] Search returns results
- [ ] Predictive search suggestions appear

**Customer:**
- [ ] Login page works
- [ ] Account pages load (if enabled)

**Run automated verification:**
```bash
node scripts/verify_theme.js ./theme/
```

This script checks:
- Cart drawer is enabled (not commented out)
- Cookie banner renders
- Product form JavaScript exists
- Collection filtering uses real Filter API
- Breadcrumbs snippet exists
- Variant picker uses option-based selection
- Price snippet has compare-at support
- Skip-to-content link exists (accessibility)

---

### Phase 7: Generate Deployment Package

**Final output structure:**

```
deployment-package/
│
├── theme/                              ← Upload to Shopify
│   ├── assets/
│   ├── config/
│   ├── layout/
│   ├── locales/
│   ├── sections/
│   ├── snippets/
│   └── templates/
│
├── SETUP-CHECKLIST.md                  ← Step-by-step for client
│
├── pages-to-create.md                  ← Pages needed in Shopify admin
│
├── menus.json                          ← Navigation structure
│
├── assets-manifest.md                  ← Images to upload
│
├── content-reference.json              ← All extracted content
│
├── section-inventory.md                ← What each section does
│
└── dependencies.md                     ← Apps/integrations needed
```

---

### Phase 8: Generate Setup Checklist

Create `SETUP-CHECKLIST.md` for client handoff:

```markdown
# Store Setup Checklist

Complete these steps in order after uploading the theme.

## 1. Upload Theme
- [ ] Go to Online Store → Themes
- [ ] Add theme → Upload zip file
- [ ] Preview theme before publishing

## 2. Upload Images
- [ ] Go to Content → Files
- [ ] Upload all images from `assets-manifest.md`
- [ ] Note: Some images may need to be selected in Theme Customizer

## 3. Create Navigation Menus
- [ ] Go to Online Store → Navigation
- [ ] Create "Main menu" with items from `menus.json`
- [ ] Create "Footer menu" with items from `menus.json`

## 4. Create Pages

| Page Title | URL Handle | Template |
|------------|------------|----------|
| About | about | page.about |
| Contact | contact | page.contact |
| Services | services | page.services |

For each page:
- [ ] Go to Online Store → Pages → Add page
- [ ] Enter title (content is in theme sections)
- [ ] Set URL handle
- [ ] Under "Theme template" select the corresponding template

## 5. Configure Theme Settings
- [ ] Go to Online Store → Themes → Customize
- [ ] Theme settings (gear icon):
  - [ ] Set brand colors
  - [ ] Upload logo
  - [ ] Set social media links
  - [ ] Configure typography if needed

## 6. Review Each Page
- [ ] Homepage - sections should be pre-configured
- [ ] About page - select "page.about" template
- [ ] Contact page - select "page.contact" template
- [ ] Product pages - add products first
- [ ] Collection pages - create collections first

## 7. Products & Collections
- [ ] Add products (or import via CSV)
- [ ] Create collections
- [ ] Assign products to collections
- [ ] Update "Featured Collection" sections to use actual collections

## 8. Final Checks
- [ ] Test all navigation links
- [ ] Test contact form submission
- [ ] Test on mobile device
- [ ] Review checkout flow
- [ ] Set up payment providers
- [ ] Configure shipping

## 9. Go Live
- [ ] Publish theme
- [ ] Remove password page (if applicable)
- [ ] Test purchase flow
```

---

## Section Inventory Template

Generate for each project:

```markdown
# Section Inventory

## Hero Sections

### hero-banner
**Purpose:** Full-width hero with image background, heading, and CTA
**Customizable:**
- Background image
- Heading text
- Subheading text
- Button text and link
- Overlay opacity (0-100%)
- Text alignment
- Minimum height

**Used on:** Homepage

---

### page-hero
**Purpose:** Smaller hero for interior pages
**Customizable:**
- Background image or color
- Heading
- Subheading
- Breadcrumb toggle

**Used on:** About, Contact, Services pages

---

## Content Sections

### image-with-text
**Purpose:** Two-column layout with image and text
**Customizable:**
- Image
- Heading
- Body text (rich text)
- Button text and link
- Image position (left/right)
- Background color

**Used on:** Homepage, About page

[Continue for all sections...]
```

---

## Dependencies Documentation

Generate `dependencies.md`:

```markdown
# Theme Dependencies & Integrations

## Required Apps

| Feature | Recommended App | Alternative | Notes |
|---------|-----------------|-------------|-------|
| Reviews | Judge.me | Loox, Stamped | Free tier available |
| Email signup | Klaviyo | Mailchimp | Connect in newsletter section |
| Contact form | Shopify native | - | Built into theme |

## External Services

| Service | Purpose | Setup |
|---------|---------|-------|
| Google Fonts | Typography | Already configured in theme |
| Google Analytics | Tracking | Add via Online Store → Preferences |
| Facebook Pixel | Ads | Add via Online Store → Preferences |

## Form Handling

Contact form uses Shopify's native form handling:
- Submissions go to: Settings → Notifications → Contact form
- Configure email recipient in Shopify admin

## Features Not Included

These features from the demo require additional setup:

| Feature | Reason | Solution |
|---------|--------|----------|
| Live chat | Requires app | Install Tidio, Gorgias, or similar |
| Wishlist | Requires app | Install Wishlist Plus or similar |
| Product reviews | Requires app | Install Judge.me or similar |
```

---

## Conversion Command Summary

When asked to convert a project, follow this sequence:

0. **Initialize** → Copy scaffold icons, sections, config to theme/
1. **Analyze** → Map all pages, components, navigation, assets
2. **Data Architecture** → Identify custom data → metafields/metaobjects mapping
3. **Convert** → Transform components to sections with extracted content
4. **Commerce Logic** → Document discounts, shipping, cart customizations
5. **Template** → Create JSON templates with pre-placed sections
6. **Navigate** → Document menu structure
7. **Manifest** → List all assets to upload
8. **Integrations** → Document webhooks, app proxy needs, automations
9. **Sanitize** → Run sanitizer + validator scripts
10. **Package** → Assemble deployment package
11. **Document** → Generate setup checklist

**Output:** Complete deployment package, not just a theme folder.

---

## Pre-Conversion Questionnaire

Before starting ANY conversion, clarify these areas:

### Data Questions
- [ ] What custom product data exists? (specs, ingredients, care, etc.)
- [ ] Is there a CMS? What content types?
- [ ] Are there customer accounts with custom data?
- [ ] Are there order customization options (gift wrap, notes)?

### Commerce Questions
- [ ] What discount types exist? (automatic, codes, tiered)
- [ ] Is there free shipping logic?
- [ ] Are there subscription/recurring products?
- [ ] What payment methods are used?
- [ ] Is there B2B/wholesale functionality?

### Integration Questions
- [ ] What external services are integrated? (CRM, ERP, etc.)
- [ ] What automations exist (email sequences, notifications)?
- [ ] Is there a custom backend/API?
- [ ] What analytics are used?

### International Questions
- [ ] Does the site sell internationally?
- [ ] What currencies are supported?
- [ ] What languages are supported?
- [ ] Are there market-specific prices?

### Customer Questions
- [ ] What does the account dashboard show?
- [ ] Is there wishlist functionality?
- [ ] Are there loyalty/rewards features?
- [ ] What is the customer support flow?

See `SKILL-BLINDSPOTS-ANALYSIS.md` for comprehensive gap analysis.

---

## Pre-Deployment Checklist

Run before every deployment:

```bash
# Automated checks
node scripts/sanitize_liquid.js ./theme/           # Scan for issues
node scripts/validate_schema.js ./theme/sections/   # Validate schemas

# Manual verification
- [ ] All sections appear in Theme Editor "Add section" menu
- [ ] No visible `{/* */}` comments in rendered pages
- [ ] All icons render (no broken images)
- [ ] Mobile menu works
- [ ] All links navigate correctly
- [ ] Forms submit successfully
```

---

## Quick Commands

| User Says | Action |
|-----------|--------|
| "Convert this React site to Shopify" | Full workflow, all phases |
| "Convert this component" | Section only, note dependencies |
| "Update my existing theme" | Identify new sections needed, merge |
| "Create setup instructions" | Generate SETUP-CHECKLIST.md |
| "What pages need to be created?" | Generate pages-to-create.md |
