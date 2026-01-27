# Shopify Theme Structure

Complete directory structure for a Shopify theme deployable via GitHub.

## Required Directory Structure

```
theme-name/
├── assets/                 # CSS, JS, images, fonts
│   ├── base.css
│   └── theme.js
├── config/
│   └── settings_schema.json   # Theme-wide settings (colors, typography, social)
├── layout/
│   └── theme.liquid           # Main wrapper (required)
├── locales/
│   └── en.default.json        # Translation strings
├── sections/                  # Customizable content blocks
│   ├── header.liquid
│   ├── footer.liquid
│   ├── announcement-bar.liquid
│   └── [your-sections].liquid
├── snippets/                  # Reusable partial templates
│   └── icon.liquid
└── templates/
    ├── index.json             # Homepage
    ├── page.json              # Generic pages
    ├── product.json           # Product pages
    ├── collection.json        # Collection pages
    ├── cart.json              # Cart page
    ├── blog.json              # Blog listing
    ├── article.json           # Individual blog posts
    ├── 404.json               # Not found page
    └── search.json            # Search results
```

## File Purposes

### layout/theme.liquid
The master template wrapping all pages. Must include:
- `{{ content_for_header }}` in `<head>` (Shopify scripts)
- `{{ content_for_layout }}` in `<body>` (page content)

```liquid
<!DOCTYPE html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title }} | {{ shop.name }}</title>
  {{ content_for_header }}
  {{ 'base.css' | asset_url | stylesheet_tag }}
</head>
<body>
  {% sections 'header-group' %}
  
  <main id="main-content">
    {{ content_for_layout }}
  </main>
  
  {% sections 'footer-group' %}
  
  {{ 'theme.js' | asset_url | script_tag }}
</body>
</html>
```

### config/settings_schema.json
Theme-wide settings accessible via `settings.setting_name`. Array of setting groups:

```json
[
  {
    "name": "theme_info",
    "theme_name": "Theme Name",
    "theme_version": "1.0.0",
    "theme_author": "Author",
    "theme_documentation_url": "https://docs.example.com",
    "theme_support_url": "https://support.example.com"
  },
  {
    "name": "Colors",
    "settings": [
      {
        "type": "color",
        "id": "color_primary",
        "label": "Primary color",
        "default": "#000000"
      },
      {
        "type": "color",
        "id": "color_background",
        "label": "Background color",
        "default": "#ffffff"
      }
    ]
  },
  {
    "name": "Typography",
    "settings": [
      {
        "type": "font_picker",
        "id": "font_heading",
        "label": "Heading font",
        "default": "helvetica_n4"
      },
      {
        "type": "font_picker",
        "id": "font_body",
        "label": "Body font",
        "default": "helvetica_n4"
      }
    ]
  },
  {
    "name": "Social media",
    "settings": [
      {
        "type": "text",
        "id": "social_twitter",
        "label": "Twitter URL"
      },
      {
        "type": "text",
        "id": "social_instagram",
        "label": "Instagram URL"
      },
      {
        "type": "text",
        "id": "social_facebook",
        "label": "Facebook URL"
      }
    ]
  }
]
```

### templates/*.json
JSON templates reference sections. Structure:

```json
{
  "sections": {
    "main": {
      "type": "section-filename-without-liquid",
      "settings": {}
    },
    "unique-key": {
      "type": "another-section",
      "settings": {
        "setting_id": "value"
      }
    }
  },
  "order": ["main", "unique-key"]
}
```

### locales/en.default.json
Translation strings accessible via `{{ 'key.path' | t }}`:

```json
{
  "general": {
    "skip_to_content": "Skip to content",
    "continue_shopping": "Continue shopping"
  },
  "products": {
    "add_to_cart": "Add to cart",
    "sold_out": "Sold out"
  },
  "cart": {
    "title": "Your cart",
    "empty": "Your cart is empty"
  }
}
```

## Section Groups (Header/Footer)

For persistent header/footer across all pages, create section groups:

### sections/header-group.json
```json
{
  "type": "header-group",
  "name": "Header group",
  "sections": {
    "announcement": {
      "type": "announcement-bar"
    },
    "header": {
      "type": "header"
    }
  },
  "order": ["announcement", "header"]
}
```

### sections/footer-group.json
```json
{
  "type": "footer-group",
  "name": "Footer group",
  "sections": {
    "footer": {
      "type": "footer"
    }
  },
  "order": ["footer"]
}
```

Reference in theme.liquid with `{% sections 'header-group' %}` and `{% sections 'footer-group' %}`.

## GitHub Deployment Requirements

1. Repository must contain theme files at root (not nested in subfolder)
2. Connect repository to Shopify via: Online Store → Themes → Add theme → Connect from GitHub
3. Branch selection available during connection
4. Changes pushed to connected branch auto-sync to Shopify

## Must-Have Sections Checklist

Essential sections for a functional theme:

- [ ] `header.liquid` - Logo, navigation, cart icon
- [ ] `footer.liquid` - Links, social, copyright
- [ ] `announcement-bar.liquid` - Dismissible promo banner
- [ ] `hero-banner.liquid` - Full-width hero with CTA
- [ ] `featured-collection.liquid` - Product grid
- [ ] `rich-text.liquid` - Flexible text content
- [ ] `image-with-text.liquid` - Side-by-side layout
- [ ] `newsletter.liquid` - Email signup form
- [ ] `contact-form.liquid` - Contact page form
- [ ] `collapsible-content.liquid` - FAQ/accordion
- [ ] `multicolumn.liquid` - Feature columns/cards
