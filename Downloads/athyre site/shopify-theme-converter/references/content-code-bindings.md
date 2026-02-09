# Content-Code Bindings

## The Core Problem

Every `blogs['journal']`, `pages['vision']`, `collections['all']`, and `linklists['main-menu']` in your theme code is a **runtime binding** — a contract between the code and Shopify admin content. If the handle doesn't match exactly, the reference silently outputs nothing.

This is the #1 source of "it works in development but breaks in production" issues.

---

## Types of Content-Code Bindings

### 1. Blog Handles

```liquid
{%- comment -%} This references a blog with handle "journal" {%- endcomment -%}
{% for article in blogs['journal'].articles limit: 3 %}
  {{ article.title }}
{% endfor %}
```

**What breaks:** If the blog was created with title "This is Athyre", its handle is `this-is-athyre`, not `journal`. The loop produces nothing — no error, no warning, just empty space.

**Fix:** Always verify blog handles in Shopify admin → Blog posts → check the URL slug.

### 2. Page Handles

```liquid
{%- comment -%} This references a page with handle "vision" {%- endcomment -%}
<a href="{{ pages['vision'].url }}">Our Vision</a>
```

**What breaks:** If the page handle in admin is `our-vision` instead of `vision`, the link href is empty.

### 3. Collection Handles

```liquid
{% for product in collections['new-arrivals'].products limit: 4 %}
  {{ product.title }}
{% endfor %}
```

**What breaks:** Collection named "New Collection" gets handle `new-collection`, not `new-arrivals`.

### 4. Menu Handles (Linklists)

```liquid
{% for link in linklists['main-menu'].links %}
  <a href="{{ link.url }}">{{ link.title }}</a>
{% endfor %}
```

**What breaks:** If the menu was created as "Main Navigation", its handle is `main-navigation`, not `main-menu`.

### 5. Hardcoded URL Paths

```liquid
{%- comment -%} AVOID: This hardcodes the blog handle in the URL {%- endcomment -%}
<a href="/blogs/journal">Blog</a>

{%- comment -%} BETTER: Use Liquid objects {%- endcomment -%}
<a href="{{ blogs['journal'].url }}">Blog</a>

{%- comment -%} BEST: Use menu links (managed in admin) {%- endcomment -%}
{% for link in linklists['main-menu'].links %}
  <a href="{{ link.url }}">{{ link.title }}</a>
{% endfor %}
```

---

## How to Prevent Binding Mismatches

### Step 1: Extract all bindings from your theme

```bash
node scripts/extract_handle_references.js ./deployment-package/theme --json
```

This generates a `content-bindings.json` manifest listing every handle your theme references.

### Step 2: Verify each handle exists in Shopify admin

| Binding Type | Where to Check in Shopify Admin |
|-------------|-------------------------------|
| Blog handles | Settings → Blog posts → check URL/handle |
| Page handles | Online Store → Pages → check URL/handle |
| Collection handles | Products → Collections → check URL/handle |
| Menu handles | Online Store → Navigation → check menu handle |
| Product handles | Products → check URL/handle |

### Step 3: Create missing content or update the code

If the handle doesn't exist:
- **Option A:** Create the content with the exact handle your code expects
- **Option B:** Update your theme code to use the handle that exists

### Step 4: Use dynamic references where possible

Instead of hardcoding blog/page handles, use:

```liquid
{%- comment -%} Let the merchant choose which blog to display via section settings {%- endcomment -%}
{% schema %}
{
  "settings": [
    {
      "type": "blog",
      "id": "blog",
      "label": "Blog"
    }
  ]
}
{% endschema %}

{% for article in section.settings.blog.articles limit: 3 %}
  {{ article.title }}
{% endfor %}
```

This is **always preferred** because the merchant controls which content appears, and there's no handle mismatch risk.

---

## Content Binding Manifest Format

The `extract_handle_references.js` script generates:

```json
{
  "_generated": "2025-01-15T12:00:00.000Z",
  "_description": "Content-code bindings manifest",
  "blogs": ["this-is-athyre"],
  "pages": ["vision", "stewardship", "contact", "accessibility"],
  "collections": ["all", "new-arrivals"],
  "products": [],
  "menus": ["main-menu", "footer"],
  "hardcoded_links": ["/blogs/journal", "/pages/vision"],
  "routes_used": ["cart_url", "root_url", "search_url"]
}
```

Include this manifest in your deployment package so the person setting up the store knows exactly what content must exist.

---

## Common Binding Mistakes from Conversions

| Source Code Pattern | What Gets Converted | What Breaks |
|--------------------|--------------------|-----------|
| React `<Link to="/blog">` | `<a href="/blogs/news">` | Blog handle might not be "news" |
| `fetch('/api/pages/about')` | `pages['about']` | Page might be created with different handle |
| Navigation component with hardcoded links | `linklists['main-menu']` or hardcoded `/pages/x` | Menu might have different handle |
| Blog component with `slug` prop | `blogs['slug'].articles` | Blog created with different title/handle |

---

## The Golden Rule

**Never assume a handle — always verify it, or better yet, make it configurable via section settings.**
