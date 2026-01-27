# Content Extraction Reference

How to extract content from source projects for Shopify section defaults.

## Why Extract Content

When a section has default content matching the demo, the client sees exactly what they expected when they first access their store. No placeholder text, no missing content.

**Before (bad experience):**
```
Hero Section:
  Heading: "Heading"
  Subheading: "Add a subheading"
  Button: "Button text"
```

**After (good experience):**
```
Hero Section:
  Heading: "Welcome to Brand Name"
  Subheading: "Discover handcrafted products for modern living"
  Button: "Shop Now"
```

---

## Extraction by Framework

### React/Next.js

**Location 1: JSX literals**
```jsx
// Direct extraction
<h1>Welcome to Brand Name</h1>
<p>Discover handcrafted products for modern living</p>
<Button>Shop Now</Button>
```

**Location 2: Component props with defaults**
```jsx
function Hero({ 
  heading = "Welcome to Brand Name",  // ← Extract
  subheading = "Discover...",         // ← Extract
  buttonText = "Shop Now"             // ← Extract
}) {
  return (...)
}
```

**Location 3: Data files**
```jsx
// data/content.js
export const homeContent = {
  hero: {
    heading: "Welcome to Brand Name",
    subheading: "Discover handcrafted products"
  }
}
```

**Location 4: CMS/API responses (mock data)**
```jsx
// Often in __mocks__ or fixtures
const mockHomeData = {
  hero: { heading: "...", subheading: "..." }
}
```

### Vue/Nuxt

**Location 1: Template literals**
```vue
<template>
  <h1>Welcome to Brand Name</h1>
</template>
```

**Location 2: Props with defaults**
```vue
<script>
export default {
  props: {
    heading: {
      type: String,
      default: "Welcome to Brand Name"  // ← Extract
    }
  }
}
</script>
```

**Location 3: Data function**
```vue
<script>
export default {
  data() {
    return {
      heading: "Welcome to Brand Name"  // ← Extract
    }
  }
}
</script>
```

### Plain HTML

**Location: Direct in markup**
```html
<h1>Welcome to Brand Name</h1>
<p>Discover handcrafted products for modern living</p>
```

---

## Content Categories

### Text Content

| Type | React Pattern | Extract To |
|------|---------------|------------|
| Headings | `<h1>Text</h1>` or `{heading}` | `"default": "Text"` in text setting |
| Paragraphs | `<p>Text</p>` or `{text}` | `"default": "Text"` in textarea setting |
| Button text | `<Button>Text</Button>` | `"default": "Text"` in text setting |
| Links | `href="/path"` | `"default": "shopify://..."` in url setting |
| Alt text | `alt="Description"` | Document in manifest |

### Structured Content (Arrays → Blocks)

```jsx
// Source: React
const features = [
  { title: "Quality", description: "..." },
  { title: "Service", description: "..." },
  { title: "Value", description: "..." }
]
```

```json
// Extracted: Template JSON
{
  "sections": {
    "features": {
      "type": "multicolumn",
      "blocks": {
        "block-1": {
          "type": "column",
          "settings": {
            "title": "Quality",
            "text": "..."
          }
        },
        "block-2": {
          "type": "column",
          "settings": {
            "title": "Service",
            "text": "..."
          }
        }
      },
      "block_order": ["block-1", "block-2", "block-3"]
    }
  }
}
```

### Navigation Content

```jsx
// Source: React header
const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About", href: "/about" }
]
```

```json
// Extracted: menus.json
{
  "main-menu": {
    "items": [
      { "title": "Home", "link": "/" },
      { "title": "Shop", "link": "/collections/all" },
      { "title": "About", "link": "/pages/about" }
    ]
  }
}
```

### Images

Images can't be embedded as defaults (they need to be uploaded), but we track them:

```jsx
// Source
<img src="/images/hero-bg.jpg" alt="Hero background" />
```

```markdown
// Extracted: assets-manifest.md
| hero-background.jpg | /images/hero-bg.jpg | Hero section | 1920x1080 |
```

---

## Link Conversion

React/static links need to become Shopify links:

| Source Link | Shopify Link |
|-------------|--------------|
| `/` | `/` (or `shopify://homepage`) |
| `/products` | `/collections/all` |
| `/products/[slug]` | `/products/[handle]` |
| `/about` | `/pages/about` |
| `/contact` | `/pages/contact` |
| `/blog` | `/blogs/news` |
| `/blog/[slug]` | `/blogs/news/[handle]` |
| `mailto:email` | `mailto:email` (unchanged) |
| `tel:phone` | `tel:phone` (unchanged) |
| External URLs | External URLs (unchanged) |

For section settings, use Shopify internal links:
```json
{
  "type": "url",
  "id": "button_link",
  "default": "shopify://collections/all"
}
```

---

## Extraction Script Pattern

When analyzing a React project, follow this pattern:

```javascript
// Pseudocode for extraction logic

function extractContent(component) {
  const content = {
    text: [],
    links: [],
    images: [],
    arrays: []
  };
  
  // 1. Find JSX text nodes
  // <h1>Text Here</h1> → content.text.push({ type: 'heading', value: 'Text Here' })
  
  // 2. Find props with defaults
  // heading = "Default" → content.text.push({ type: 'prop', name: 'heading', value: 'Default' })
  
  // 3. Find arrays being mapped
  // items.map(item => ...) → content.arrays.push({ name: 'items', structure: [...] })
  
  // 4. Find image sources
  // src="/images/x.jpg" → content.images.push({ src: '/images/x.jpg', component: name })
  
  // 5. Find links
  // href="/about" → content.links.push({ href: '/about', text: 'About' })
  
  return content;
}
```

---

## Output Format: content-reference.json

Structure extracted content in this format:

```json
{
  "meta": {
    "project_name": "Brand Name",
    "extracted_date": "2024-01-15",
    "source_framework": "react"
  },
  
  "global": {
    "brand_name": "Brand Name",
    "tagline": "Quality products for modern living",
    "contact": {
      "email": "hello@brand.com",
      "phone": "(555) 123-4567",
      "address": "123 Main St, City, ST 12345"
    },
    "social": {
      "instagram": "https://instagram.com/brand",
      "facebook": "https://facebook.com/brand",
      "twitter": "https://twitter.com/brand"
    }
  },
  
  "pages": {
    "home": {
      "meta": {
        "title": "Brand Name - Quality Products",
        "description": "Discover handcrafted products..."
      },
      "sections": [
        {
          "id": "hero",
          "component": "Hero.jsx",
          "content": {
            "heading": "Welcome to Brand Name",
            "subheading": "Discover handcrafted products for modern living",
            "button_text": "Shop Now",
            "button_link": "/products"
          },
          "images": [
            {
              "setting": "background_image",
              "source": "/images/hero-bg.jpg",
              "alt": "Hero background"
            }
          ]
        },
        {
          "id": "featured-products",
          "component": "FeaturedProducts.jsx",
          "content": {
            "heading": "Best Sellers",
            "subheading": "Our most popular products"
          }
        }
      ]
    },
    
    "about": {
      "meta": {
        "title": "About Us - Brand Name",
        "description": "Learn about our story..."
      },
      "sections": [
        {
          "id": "about-hero",
          "component": "PageHero.jsx",
          "content": {
            "heading": "About Us",
            "subheading": "Our story, mission, and team"
          }
        },
        {
          "id": "team",
          "component": "TeamGrid.jsx",
          "content": {
            "heading": "Meet the Team"
          },
          "blocks": [
            {
              "name": "Jane Smith",
              "role": "Founder & CEO",
              "bio": "Jane started the company...",
              "image": "/images/team/jane.jpg"
            },
            {
              "name": "John Doe",
              "role": "Head of Design",
              "bio": "John brings 15 years...",
              "image": "/images/team/john.jpg"
            }
          ]
        }
      ]
    }
  },
  
  "navigation": {
    "main": [
      { "title": "Home", "link": "/" },
      { "title": "Shop", "link": "/products" },
      { "title": "About", "link": "/about" },
      { "title": "Contact", "link": "/contact" }
    ],
    "footer": [
      { "title": "Privacy Policy", "link": "/privacy" },
      { "title": "Terms of Service", "link": "/terms" }
    ]
  },
  
  "assets": {
    "images": [
      {
        "filename": "hero-bg.jpg",
        "source": "/images/hero-bg.jpg",
        "used_in": ["home.hero"],
        "dimensions": "1920x1080"
      },
      {
        "filename": "team-jane.jpg",
        "source": "/images/team/jane.jpg",
        "used_in": ["about.team"],
        "dimensions": "400x400"
      }
    ],
    "icons": [
      { "name": "cart", "source": "lucide-react" },
      { "name": "menu", "source": "lucide-react" },
      { "name": "search", "source": "lucide-react" }
    ]
  }
}
```

---

## Using Extracted Content

### In Section Schema Defaults

```liquid
{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome to Brand Name"  // ← From content-reference.json
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading",
      "default": "Discover handcrafted products for modern living"  // ← From extraction
    }
  ]
}
{% endschema %}
```

### In Template JSON

```json
// templates/index.json
{
  "sections": {
    "hero": {
      "type": "hero-banner",
      "settings": {
        "heading": "Welcome to Brand Name",  // ← From extraction
        "subheading": "Discover handcrafted products for modern living",
        "button_text": "Shop Now",
        "button_link": "shopify://collections/all"
      }
    }
  }
}
```

### In Menus Documentation

```json
// menus.json - from extracted navigation
{
  "main-menu": {
    "items": [
      { "title": "Home", "link": "/" },
      { "title": "Shop", "link": "/collections/all" },
      { "title": "About", "link": "/pages/about" }
    ]
  }
}
```

---

## Handling Edge Cases

### Dynamic Content (API/CMS)

If source uses CMS or API:
1. Look for mock data in development files
2. Check for sample/seed data
3. Ask client for content spreadsheet
4. Use placeholder structure with clear labels

### Localized Content

If source has i18n:
1. Extract default language content
2. Note other languages for locales/*.json
3. Structure can inform translation needs

### Conditional Content

If content varies by state:
```jsx
{isLoggedIn ? "Welcome back!" : "Sign in to continue"}
```

Use the public/anonymous version:
```json
"default": "Sign in to continue"
```

### Missing Content

If component has no text (just props):
```jsx
<Hero heading={data.heading} />
```

1. Check for data source (API response structure)
2. Check for TypeScript types (often have defaults in interfaces)
3. Use semantic defaults: "Hero Heading", "Hero Subheading"
4. Flag in content-reference.json as "needs_content": true
