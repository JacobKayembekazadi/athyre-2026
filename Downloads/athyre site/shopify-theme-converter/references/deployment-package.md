# Deployment Package Reference

Complete structure for a launch-ready Shopify store package.

## Package Structure

```
[project-name]-shopify-package/
│
├── theme/                              # ← The actual Shopify theme
│   ├── assets/
│   │   ├── base.css
│   │   ├── theme.js
│   │   └── [component].css             # Optional component-specific CSS
│   ├── config/
│   │   └── settings_schema.json
│   ├── layout/
│   │   └── theme.liquid
│   ├── locales/
│   │   └── en.default.json
│   ├── sections/
│   │   ├── header.liquid
│   │   ├── footer.liquid
│   │   ├── announcement-bar.liquid
│   │   └── [converted-sections].liquid
│   ├── snippets/
│   │   ├── icons.liquid
│   │   └── [reusable-partials].liquid
│   └── templates/
│       ├── index.json
│       ├── page.json
│       ├── page.about.json             # Custom page templates
│       ├── page.contact.json
│       ├── page.services.json
│       ├── product.json
│       ├── collection.json
│       ├── cart.json
│       ├── blog.json
│       ├── article.json
│       └── 404.json
│
├── SETUP-CHECKLIST.md                  # Step-by-step client instructions
├── pages-to-create.md                  # Pages needed in Shopify admin
├── menus.json                          # Navigation structure to recreate
├── assets-manifest.md                  # All images/files to upload
├── content-reference.json              # Extracted text content
├── section-inventory.md                # Documentation of all sections
├── dependencies.md                     # Required apps/integrations
└── README.md                           # Package overview
```

---

## File Templates

### SETUP-CHECKLIST.md

```markdown
# [Project Name] - Shopify Store Setup

Complete these steps in order to launch your store.

## Prerequisites
- Shopify store created
- Admin access to store
- All source assets (images, logos)

---

## Step 1: Upload Theme (5 minutes)

1. Download `theme.zip` from this package
2. Go to **Online Store → Themes**
3. Click **Add theme → Upload zip file**
4. Select `theme.zip`
5. Click **Preview** to verify before publishing

---

## Step 2: Upload Media Assets (10-15 minutes)

1. Go to **Content → Files**
2. Click **Upload files**
3. Upload all images listed in `assets-manifest.md`

### Required Images

| Image | Purpose | Required? |
|-------|---------|-----------|
| logo.svg | Header logo | ✅ Yes |
| hero-background.jpg | Homepage hero | ✅ Yes |
| about-hero.jpg | About page | ✅ Yes |
| [list all images] | | |

---

## Step 3: Create Navigation Menus (5 minutes)

1. Go to **Online Store → Navigation**
2. Click on **Main menu** (or create if missing)
3. Add menu items as listed below:

### Main Menu
| Title | Link |
|-------|------|
| Home | / |
| Shop | /collections/all |
| About | /pages/about |
| Contact | /pages/contact |

### Footer Menu
| Title | Link |
|-------|------|
| Privacy Policy | /policies/privacy-policy |
| Terms of Service | /policies/terms-of-service |
| Contact | /pages/contact |

---

## Step 4: Create Pages (10 minutes)

These pages must be created manually in Shopify admin:

| Page Title | Handle | Template | Content |
|------------|--------|----------|---------|
| About | about | page.about | Use section content |
| Contact | contact | page.contact | Use section content |
| Services | services | page.services | Use section content |

**For each page:**
1. Go to **Online Store → Pages**
2. Click **Add page**
3. Enter the **Title**
4. Leave content blank (content is in sections)
5. In **Theme template**, select the matching template
6. Click **Save**

---

## Step 5: Configure Theme Settings (10 minutes)

1. Go to **Online Store → Themes → Customize**
2. Click the **gear icon** (Theme settings)
3. Configure:

### Colors
- Primary: [#hexcode]
- Secondary: [#hexcode]
- Background: [#hexcode]
- Text: [#hexcode]

### Typography
- Headings: [Font name]
- Body: [Font name]

### Logo
- Upload logo from assets

### Social Media
- Instagram: [url]
- Facebook: [url]
- Twitter: [url]

---

## Step 6: Review & Customize Pages (15 minutes)

Navigate to each page in the customizer and verify:

### Homepage
- [ ] Hero image displays correctly
- [ ] Featured collection selected
- [ ] All sections visible and ordered correctly

### About Page
- [ ] Template set to "page.about"
- [ ] Hero section configured
- [ ] Team members populated

### Contact Page
- [ ] Template set to "page.contact"
- [ ] Form submission works

### Product Page
- [ ] Add a test product first
- [ ] Review layout

---

## Step 7: Products & Collections (varies)

1. **Add Products**
   - Go to **Products → Add product**
   - Or import via CSV

2. **Create Collections**
   - Go to **Products → Collections**
   - Create: Best Sellers, New Arrivals, etc.

3. **Update Featured Collections**
   - In Customizer, go to Homepage
   - Select actual collections for featured sections

---

## Step 8: Final Pre-Launch Checks

- [ ] All navigation links work
- [ ] Contact form submits successfully
- [ ] Mobile layout looks correct
- [ ] All images load properly
- [ ] No broken links or 404s
- [ ] Page load time acceptable

---

## Step 9: Go Live

1. **Publish Theme**
   - Go to **Online Store → Themes**
   - Click **Publish** on your theme

2. **Remove Password** (if applicable)
   - Go to **Online Store → Preferences**
   - Uncheck "Password protect"

3. **Configure Payments**
   - Go to **Settings → Payments**
   - Set up Shopify Payments or other provider

4. **Configure Shipping**
   - Go to **Settings → Shipping**
   - Set shipping rates

5. **Test Order**
   - Place a test order
   - Verify email notifications
   - Process refund

---

## Support

For questions about this theme:
- Email: [developer email]
- Documentation: [link if available]

For Shopify platform issues:
- Shopify Help Center: help.shopify.com
```

---

### pages-to-create.md

```markdown
# Pages to Create in Shopify Admin

These pages must exist for the theme to work correctly.

## Required Pages

| Page Title | URL Handle | Theme Template | Notes |
|------------|------------|----------------|-------|
| About | about | page.about | Content in sections |
| Contact | contact | page.contact | Form built into section |
| Services | services | page.services | Content in sections |

## How to Create Each Page

### About Page
1. **Online Store → Pages → Add page**
2. Title: `About`
3. Content: Leave blank or add SEO text
4. Under "Search engine listing", set handle to `about`
5. Under "Theme template", select `page.about`
6. Save

### Contact Page
1. **Online Store → Pages → Add page**
2. Title: `Contact`
3. Content: Leave blank
4. Handle: `contact`
5. Template: `page.contact`
6. Save

### Services Page
1. **Online Store → Pages → Add page**
2. Title: `Services`
3. Content: Leave blank
4. Handle: `services`
5. Template: `page.services`
6. Save

## Why Content is Blank

The page content comes from theme sections, not the page editor. This allows:
- Drag-and-drop customization in Theme Customizer
- Rich layouts with images, columns, etc.
- Consistent styling with the rest of the theme

To edit page content:
1. Go to **Online Store → Themes → Customize**
2. Navigate to the page
3. Edit sections directly
```

---

### menus.json

```json
{
  "_instructions": "Create these menus in Online Store → Navigation",
  
  "main-menu": {
    "name": "Main menu",
    "handle": "main-menu",
    "items": [
      {
        "title": "Home",
        "link": "/",
        "type": "frontpage"
      },
      {
        "title": "Shop",
        "link": "/collections/all",
        "type": "collection",
        "children": [
          {
            "title": "New Arrivals",
            "link": "/collections/new-arrivals"
          },
          {
            "title": "Best Sellers",
            "link": "/collections/best-sellers"
          },
          {
            "title": "Sale",
            "link": "/collections/sale"
          }
        ]
      },
      {
        "title": "About",
        "link": "/pages/about",
        "type": "page"
      },
      {
        "title": "Contact",
        "link": "/pages/contact",
        "type": "page"
      }
    ]
  },
  
  "footer": {
    "name": "Footer menu",
    "handle": "footer",
    "items": [
      {
        "title": "About Us",
        "link": "/pages/about",
        "type": "page"
      },
      {
        "title": "Contact",
        "link": "/pages/contact",
        "type": "page"
      },
      {
        "title": "Privacy Policy",
        "link": "/policies/privacy-policy",
        "type": "policy"
      },
      {
        "title": "Terms of Service",
        "link": "/policies/terms-of-service",
        "type": "policy"
      },
      {
        "title": "Refund Policy",
        "link": "/policies/refund-policy",
        "type": "policy"
      }
    ]
  }
}
```

---

### assets-manifest.md

```markdown
# Asset Upload Manifest

Upload all assets to: **Content → Files**

## Images

| Filename | Source Path | Used In | Dimensions | Required |
|----------|-------------|---------|------------|----------|
| logo.svg | /public/logo.svg | Header | - | ✅ |
| logo-white.svg | /public/logo-white.svg | Footer | - | ✅ |
| hero-home.jpg | /public/images/hero.jpg | Homepage hero | 1920×1080 | ✅ |
| hero-about.jpg | /public/images/about/hero.jpg | About hero | 1920×600 | ✅ |
| team-member-1.jpg | /public/images/team/jane.jpg | Team section | 400×400 | ✅ |
| team-member-2.jpg | /public/images/team/john.jpg | Team section | 400×400 | ✅ |
| feature-1.jpg | /public/images/features/quality.jpg | Features section | 600×400 | Optional |
| feature-2.jpg | /public/images/features/service.jpg | Features section | 600×400 | Optional |
| og-image.jpg | /public/og-image.jpg | Social sharing | 1200×630 | Recommended |
| favicon.png | /public/favicon.png | Browser tab | 32×32 | ✅ |

## After Upload

Images uploaded to Files get Shopify CDN URLs like:
```
https://cdn.shopify.com/s/files/1/xxxx/xxxx/files/hero-home.jpg
```

### Option A: Select in Customizer (Recommended)
1. Go to Theme Customizer
2. Navigate to each section
3. Click image picker
4. Select uploaded image from Files

### Option B: Hardcode in Theme (Not Recommended)
Only if images should never change:
```liquid
{{ 'hero-home.jpg' | file_url | image_tag }}
```

## Fonts

| Font | Weight | Source | Implementation |
|------|--------|--------|----------------|
| Inter | 400, 500, 600, 700 | Google Fonts | In theme.liquid |
| Playfair Display | 400, 700 | Google Fonts | In theme.liquid |

Fonts are loaded via Google Fonts link in theme.liquid head.

## Icons

All icons are embedded as inline SVG in `snippets/icons.liquid`.
No external icon files needed.
```

---

### content-reference.json

```json
{
  "_description": "All text content extracted from source project. Used for section defaults and reference.",
  
  "global": {
    "company_name": "Brand Name",
    "tagline": "Quality products for modern living",
    "phone": "(555) 123-4567",
    "email": "hello@brandname.com",
    "address": "123 Main St, City, State 12345"
  },
  
  "pages": {
    "home": {
      "hero": {
        "heading": "Welcome to Brand Name",
        "subheading": "Discover our collection of handcrafted products",
        "button_text": "Shop Now"
      },
      "featured_collection": {
        "title": "Best Sellers",
        "subtitle": "Our most popular products"
      },
      "about_preview": {
        "heading": "Our Story",
        "text": "Founded in 2015, we've been committed to creating quality products that stand the test of time.",
        "button_text": "Learn More"
      },
      "newsletter": {
        "heading": "Join Our Newsletter",
        "subheading": "Get 10% off your first order",
        "button_text": "Subscribe"
      }
    },
    
    "about": {
      "hero": {
        "heading": "About Us",
        "subheading": "Our story, mission, and the people behind the brand"
      },
      "story": {
        "heading": "How We Started",
        "paragraphs": [
          "It all began in a small garage in 2015...",
          "Today, we serve customers worldwide..."
        ]
      },
      "team": {
        "heading": "Meet the Team",
        "members": [
          {
            "name": "Jane Smith",
            "role": "Founder & CEO",
            "bio": "Jane started the company with a vision..."
          },
          {
            "name": "John Doe",
            "role": "Head of Design",
            "bio": "John brings 15 years of experience..."
          }
        ]
      },
      "values": {
        "heading": "Our Values",
        "items": [
          {
            "title": "Quality",
            "description": "We never compromise on materials"
          },
          {
            "title": "Sustainability",
            "description": "Every decision considers environmental impact"
          },
          {
            "title": "Community",
            "description": "We give back to the communities we serve"
          }
        ]
      }
    },
    
    "contact": {
      "hero": {
        "heading": "Get in Touch",
        "subheading": "We'd love to hear from you"
      },
      "form": {
        "heading": "Send us a message",
        "fields": ["name", "email", "phone", "message"]
      },
      "info": {
        "heading": "Contact Information",
        "items": [
          { "label": "Email", "value": "hello@brandname.com" },
          { "label": "Phone", "value": "(555) 123-4567" },
          { "label": "Address", "value": "123 Main St, City, State 12345" }
        ]
      }
    }
  },
  
  "navigation": {
    "main": ["Home", "Shop", "About", "Contact"],
    "footer": ["About Us", "Contact", "Privacy Policy", "Terms of Service"]
  }
}
```

---

### section-inventory.md

```markdown
# Section Inventory

Complete list of all sections in this theme with customization options.

---

## Global Sections

### header.liquid
**Purpose:** Site header with logo, navigation, and cart

**Settings:**
| Setting | Type | Description |
|---------|------|-------------|
| logo | image_picker | Header logo |
| logo_width | range | Logo width (50-200px) |
| menu | link_list | Main navigation menu |
| show_cart | checkbox | Show cart icon |
| sticky_header | checkbox | Stick to top on scroll |

**Menus Used:** main-menu

---

### footer.liquid
**Purpose:** Site footer with navigation and social links

**Settings:**
| Setting | Type | Description |
|---------|------|-------------|
| logo | image_picker | Footer logo (optional) |
| menu | link_list | Footer navigation |
| show_social | checkbox | Show social icons |
| newsletter_enable | checkbox | Show newsletter signup |
| copyright_text | text | Copyright line |

**Menus Used:** footer

---

## Homepage Sections

### hero-banner.liquid
**Purpose:** Full-width hero with background image and CTA

**Settings:**
| Setting | Type | Description |
|---------|------|-------------|
| image | image_picker | Background image |
| heading | text | Main headline |
| subheading | textarea | Supporting text |
| button_text | text | CTA button text |
| button_link | url | CTA button destination |
| overlay_opacity | range | Dark overlay (0-100%) |
| min_height | range | Section height (400-800px) |
| text_alignment | select | left/center/right |

**Used On:** Homepage

---

### featured-collection.liquid
**Purpose:** Display products from a collection

**Settings:**
| Setting | Type | Description |
|---------|------|-------------|
| title | text | Section heading |
| collection | collection | Collection to display |
| products_to_show | range | Number of products (4-12) |
| columns_desktop | select | Grid columns (2-4) |
| show_vendor | checkbox | Show product vendor |
| show_price | checkbox | Show product price |

**Used On:** Homepage

---

[Continue for all sections...]
```

---

### dependencies.md

```markdown
# Dependencies & Integrations

Required apps, services, and configurations for full functionality.

## Shopify Apps

| Feature | Required? | Recommended App | Free Alternative | Notes |
|---------|-----------|-----------------|------------------|-------|
| Product Reviews | Recommended | Judge.me | Judge.me Free | Display reviews on product pages |
| Email Marketing | Recommended | Klaviyo | Mailchimp | Newsletter signup integration |
| Live Chat | Optional | Tidio | Tawk.to | Customer support widget |
| Wishlist | Optional | Wishlist Plus | Wishlist Hero | Save products feature |

### App Installation Notes

**Judge.me:**
1. Install from Shopify App Store
2. Go to Judge.me settings
3. Enable "Show review widget"
4. Theme includes `{% render 'judgeme_widgets' %}` in product section

**Klaviyo:**
1. Install from Shopify App Store
2. Get form embed code
3. Add to newsletter section or use built-in Shopify form

---

## External Services

| Service | Purpose | Setup Location |
|---------|---------|----------------|
| Google Analytics | Site analytics | Settings → Preferences |
| Facebook Pixel | Ad tracking | Settings → Preferences |
| Google Fonts | Typography | Pre-configured in theme |

### Google Analytics
1. Get tracking ID from Google Analytics
2. Go to Online Store → Preferences
3. Paste in "Google Analytics" field

### Facebook Pixel
1. Get pixel ID from Facebook Business Manager
2. Go to Online Store → Preferences
3. Paste in "Facebook Pixel" field

---

## Form Handling

### Contact Form
- Built into `contact-form.liquid` section
- Submissions go to store owner email
- Configure recipient: Settings → Notifications → Contact form

### Newsletter Form
- **Option A:** Shopify native (submissions in Customers)
- **Option B:** Klaviyo embed (submissions in Klaviyo)
- **Option C:** Custom endpoint (configure in section)

---

## Features NOT Included

These demo features require additional implementation:

| Feature | Demo Status | Production Solution |
|---------|-------------|---------------------|
| Product reviews display | Placeholder | Install Judge.me |
| Dynamic filtering | Basic | Install Search & Filter app |
| Currency conversion | Single currency | Install Geolocation app |
| Store locator | Static map | Install Store Locator app |

---

## Browser Support

Theme tested and working on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## Performance Notes

- All images should be compressed before upload
- Lazy loading enabled for below-fold images
- Critical CSS inlined for faster first paint
```

---

### README.md

```markdown
# [Project Name] Shopify Store Package

Complete deployment package for your Shopify store.

## What's Included

| Item | Description |
|------|-------------|
| `/theme` | Complete Shopify theme ready to upload |
| `SETUP-CHECKLIST.md` | Step-by-step setup instructions |
| `pages-to-create.md` | Pages to create in Shopify admin |
| `menus.json` | Navigation structure |
| `assets-manifest.md` | Images to upload |
| `content-reference.json` | All text content |
| `section-inventory.md` | Section documentation |
| `dependencies.md` | Required apps/services |

## Quick Start

1. **Upload Theme:** Online Store → Themes → Upload zip
2. **Follow Checklist:** Complete `SETUP-CHECKLIST.md` steps
3. **Customize:** Edit in Theme Customizer

## Estimated Setup Time

- Theme upload & preview: 5 minutes
- Image uploads: 10-15 minutes
- Page & menu creation: 15 minutes
- Theme configuration: 10 minutes
- **Total: ~45 minutes**

## Support

- Developer: [name/email]
- Shopify Support: help.shopify.com
```

---

## Automated Generation

When converting a project, generate all these files by:

1. **Scanning source project** for pages, components, content
2. **Populating templates** with extracted data
3. **Creating inventory** of sections and settings
4. **Listing all assets** with source paths
5. **Identifying dependencies** from source imports/features

The goal: Client receives package, follows checklist, store matches demo.
