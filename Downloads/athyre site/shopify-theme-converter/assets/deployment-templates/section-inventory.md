# Section Inventory

Complete documentation of all sections in this theme.

---

## How to Use This Document

Each section is documented with:
- **Purpose**: What the section is for
- **Settings**: What can be customized
- **Blocks**: Repeatable items (if applicable)
- **Used On**: Which pages use this section

---

## Global Sections

These sections appear on every page.

### header.liquid

**Purpose:** Site header with logo, navigation, and cart icon

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| logo | image_picker | Site logo | - |
| logo_width | range | Logo width in pixels | 100 |
| menu | link_list | Main navigation | main-menu |
| show_cart | checkbox | Display cart icon | true |
| show_search | checkbox | Display search icon | true |
| sticky | checkbox | Stick to top on scroll | true |

**Menus Required:** main-menu

---

### footer.liquid

**Purpose:** Site footer with navigation, social links, newsletter

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| show_social | checkbox | Display social icons | true |
| show_newsletter | checkbox | Show email signup | true |
| newsletter_heading | text | Newsletter title | "Join our newsletter" |
| copyright | text | Copyright text | "© 2024 Brand Name" |

**Menus Required:** footer

---

### announcement-bar.liquid

**Purpose:** Dismissible banner for promotions/announcements

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| text | text | Announcement message | "Free shipping on orders $50+" |
| link | url | Optional link | - |
| background_color | color | Bar background | #000000 |
| text_color | color | Text color | #ffffff |
| show | checkbox | Enable/disable | true |

---

## Homepage Sections

### hero-banner.liquid

**Purpose:** Full-width hero with image, heading, and CTA

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| image | image_picker | Background image | - |
| heading | text | Main headline | "[EXTRACTED]" |
| subheading | textarea | Supporting text | "[EXTRACTED]" |
| button_text | text | CTA text | "[EXTRACTED]" |
| button_link | url | CTA destination | / |
| overlay_opacity | range | Dark overlay % | 40 |
| min_height | range | Section height | 600 |
| text_alignment | select | left/center/right | center |
| text_color | color | Text color | #ffffff |

**Used On:** Homepage

---

### featured-collection.liquid

**Purpose:** Grid of products from a collection

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| title | text | Section heading | "Featured Products" |
| collection | collection | Products to show | - |
| products_to_show | range | Number of products | 4 |
| columns_desktop | range | Grid columns | 4 |
| show_vendor | checkbox | Display vendor | false |
| show_price | checkbox | Display price | true |

**Used On:** Homepage

**Note:** Requires products and collections to be created first.

---

### image-with-text.liquid

**Purpose:** Two-column layout with image and text

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| image | image_picker | Section image | - |
| heading | text | Heading | "[EXTRACTED]" |
| text | richtext | Body content | "[EXTRACTED]" |
| button_text | text | CTA text | "[EXTRACTED]" |
| button_link | url | CTA destination | - |
| image_position | select | left/right | left |
| background_color | color | Background | #ffffff |

**Used On:** Homepage, About page

---

### multicolumn.liquid

**Purpose:** Feature columns or cards

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| title | text | Section heading | "Our Values" |
| columns_desktop | range | Number of columns | 3 |

**Blocks:** column
| Block Setting | Type | Description |
|---------------|------|-------------|
| image | image_picker | Column image |
| title | text | Column heading |
| text | richtext | Column content |
| link_text | text | Optional link text |
| link | url | Optional link |

**Used On:** Homepage, About page

---

### testimonials.liquid

**Purpose:** Customer testimonials/reviews

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| title | text | Section heading | "What Customers Say" |

**Blocks:** testimonial
| Block Setting | Type | Description |
|---------------|------|-------------|
| quote | textarea | Testimonial text |
| author | text | Customer name |
| rating | range | Star rating (1-5) |

**Used On:** Homepage

---

### newsletter.liquid

**Purpose:** Email signup form

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| heading | text | Form heading | "Join Our Newsletter" |
| subheading | text | Form subheading | "Get 10% off your first order" |
| button_text | text | Submit button | "Subscribe" |
| background_color | color | Background | #f5f5f5 |

**Used On:** Homepage, Footer

---

## Page Sections

### page-hero.liquid

**Purpose:** Hero banner for interior pages (smaller than homepage hero)

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| heading | text | Page title | "[PAGE TITLE]" |
| subheading | text | Page subtitle | - |
| image | image_picker | Background | - |
| show_breadcrumb | checkbox | Show breadcrumb | true |

**Used On:** About, Contact, Services pages

---

### contact-form.liquid

**Purpose:** Contact form with info sidebar

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| heading | text | Form heading | "Send us a message" |
| show_phone | checkbox | Display phone | true |
| show_email | checkbox | Display email | true |
| show_address | checkbox | Display address | true |

**Used On:** Contact page

**Note:** Form submissions go to Settings → Notifications → Contact form

---

### team-grid.liquid

**Purpose:** Team member cards

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| title | text | Section heading | "Meet the Team" |
| columns | range | Grid columns | 3 |

**Blocks:** team_member
| Block Setting | Type | Description |
|---------------|------|-------------|
| image | image_picker | Team member photo |
| name | text | Name |
| role | text | Job title |
| bio | textarea | Short bio |

**Used On:** About page

---

### collapsible-content.liquid

**Purpose:** FAQ accordion

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| title | text | Section heading | "FAQ" |

**Blocks:** collapsible_row
| Block Setting | Type | Description |
|---------------|------|-------------|
| heading | text | Question |
| content | richtext | Answer |

**Used On:** FAQ page, Product pages

---

## Product Sections

### main-product.liquid

**Purpose:** Product page layout with gallery, details, add to cart

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| show_vendor | checkbox | Show vendor | true |
| show_sku | checkbox | Show SKU | false |
| enable_quantity | checkbox | Quantity selector | true |

**Used On:** Product template

---

### product-recommendations.liquid

**Purpose:** Related/recommended products

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| heading | text | Section heading | "You may also like" |
| products_to_show | range | Number of products | 4 |

**Used On:** Product template

---

## Collection Sections

### main-collection.liquid

**Purpose:** Collection page with filters and product grid

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| products_per_page | range | Products per page | 16 |
| columns_desktop | range | Grid columns | 4 |
| enable_filtering | checkbox | Show filters | true |
| enable_sorting | checkbox | Show sort | true |

**Used On:** Collection template

---

<!-- ADD MORE SECTIONS AS CONVERTED -->

---

## Section Quick Reference

| Section | Purpose | Customization Level |
|---------|---------|---------------------|
| header | Site navigation | Medium |
| footer | Site footer | Medium |
| hero-banner | Homepage hero | High |
| featured-collection | Product grid | Medium |
| image-with-text | Content block | High |
| multicolumn | Feature cards | High |
| testimonials | Reviews | Medium |
| newsletter | Email signup | Low |
| contact-form | Contact page | Low |
| team-grid | Team members | High |

**Customization Levels:**
- **High:** Many settings, blocks, flexible
- **Medium:** Key settings, some flexibility
- **Low:** Basic settings, specific purpose
