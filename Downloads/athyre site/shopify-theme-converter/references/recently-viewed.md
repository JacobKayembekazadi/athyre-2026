# Recently Viewed Products

Implementation guide for tracking and displaying recently viewed products using localStorage and Shopify's Section Rendering API.

## Overview

Recently viewed products enhance UX by:
- **Personalization** - Tailored product suggestions
- **Navigation** - Easy return to browsed items
- **Conversion** - Reminder of considered products

---

## Architecture

### Storage Strategy
```
localStorage: 'recently-viewed' → [handle1, handle2, handle3, ...]
↓
Shopify Section Rendering API → HTML
↓
Inject into page
```

### Key Decisions
| Approach | Pros | Cons |
|----------|------|------|
| localStorage | Fast, works offline, private | Per-device only |
| Customer metafields | Cross-device | Requires login, API calls |
| Cookies | Simple | Size limits, privacy concerns |

**Recommended**: localStorage for most stores.

---

## JavaScript Implementation

### Recently Viewed Manager
```javascript
// assets/recently-viewed.js

class RecentlyViewed {
  constructor(options = {}) {
    this.storageKey = 'recently-viewed';
    this.maxItems = options.maxItems || 10;
    this.excludeCurrent = options.excludeCurrent !== false;

    this.init();
  }

  init() {
    // Track current product if on product page
    if (window.ShopifyAnalytics?.meta?.product) {
      this.add(window.ShopifyAnalytics.meta.product.handle);
    }
  }

  /**
   * Get list of recently viewed product handles
   */
  get() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('RecentlyViewed: Error reading localStorage', e);
      return [];
    }
  }

  /**
   * Add a product to recently viewed
   */
  add(handle) {
    if (!handle) return;

    let items = this.get();

    // Remove if already exists (will re-add at start)
    items = items.filter(h => h !== handle);

    // Add to beginning
    items.unshift(handle);

    // Limit to max items
    items = items.slice(0, this.maxItems);

    // Save
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('RecentlyViewed: Error saving to localStorage', e);
    }

    return items;
  }

  /**
   * Remove a product from recently viewed
   */
  remove(handle) {
    let items = this.get();
    items = items.filter(h => h !== handle);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('RecentlyViewed: Error saving to localStorage', e);
    }

    return items;
  }

  /**
   * Clear all recently viewed
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('RecentlyViewed: Error clearing localStorage', e);
    }
  }

  /**
   * Fetch and render recently viewed section
   */
  async render(containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let handles = this.get();

    // Optionally exclude current product
    if (this.excludeCurrent && window.ShopifyAnalytics?.meta?.product) {
      handles = handles.filter(h => h !== window.ShopifyAnalytics.meta.product.handle);
    }

    // Limit displayed items
    const limit = options.limit || 4;
    handles = handles.slice(0, limit);

    if (handles.length === 0) {
      container.hidden = true;
      return;
    }

    // Show loading state
    container.classList.add('is-loading');

    try {
      // Build URL for section rendering
      const sectionId = options.sectionId || 'recently-viewed-products';
      const url = `/search?section_id=${sectionId}&type=product&q=${handles.map(h => `handle:${h}`).join(' OR ')}`;

      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch');

      const html = await response.text();

      // Parse and extract products
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const products = doc.querySelector('.recently-viewed-products');

      if (products && products.innerHTML.trim()) {
        container.innerHTML = products.innerHTML;
        container.hidden = false;
      } else {
        container.hidden = true;
      }

    } catch (error) {
      console.error('RecentlyViewed: Error fetching products', error);
      container.hidden = true;
    } finally {
      container.classList.remove('is-loading');
    }
  }
}

// Initialize globally
window.recentlyViewed = new RecentlyViewed();

// Render on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-recently-viewed]')) {
    window.recentlyViewed.render('[data-recently-viewed]');
  }
});
```

---

## Shopify Section

### Section for Rendering
```liquid
{% comment %} sections/recently-viewed-products.liquid {% endcomment %}

{%- comment -%}
  Recently viewed products section
  Rendered via AJAX with product handles from localStorage
{%- endcomment -%}

<div class="recently-viewed-section section-{{ section.id }}">
  <div class="recently-viewed-container" data-recently-viewed>
    {%- if section.settings.heading != blank -%}
      <h2 class="recently-viewed-heading">{{ section.settings.heading }}</h2>
    {%- endif -%}

    <div class="recently-viewed-products product-grid product-grid--{{ section.settings.columns }}">
      {%- comment -%}
        Products are injected here via JavaScript
        For search-based rendering, products come from search results
      {%- endcomment -%}

      {%- if search and search.performed -%}
        {%- for product in search.results -%}
          {%- if product.object_type == 'product' -%}
            {% render 'product-card', product: product %}
          {%- endif -%}
        {%- endfor -%}
      {%- endif -%}
    </div>

    {%- comment -%} Loading skeleton {%- endcomment -%}
    <div class="recently-viewed-loading" hidden>
      <div class="product-grid product-grid--{{ section.settings.columns }}">
        {%- for i in (1..4) -%}
          {% render 'skeleton-product-card' %}
        {%- endfor -%}
      </div>
    </div>

    {%- comment -%} Empty state {%- endcomment -%}
    <div class="recently-viewed-empty" hidden>
      <p>{{ 'products.recently_viewed.empty' | t | default: 'No recently viewed products' }}</p>
    </div>
  </div>
</div>

<style>
  .recently-viewed-section {
    padding: {{ section.settings.padding_top }}px 0 {{ section.settings.padding_bottom }}px;
  }

  .recently-viewed-container {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 0 1rem;
  }

  .recently-viewed-heading {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: {{ section.settings.heading_alignment }};
  }

  .recently-viewed-container.is-loading .recently-viewed-products {
    display: none;
  }

  .recently-viewed-container.is-loading .recently-viewed-loading {
    display: block;
  }

  .recently-viewed-loading[hidden] {
    display: none;
  }

  .product-grid {
    display: grid;
    gap: 1.5rem;
  }

  .product-grid--2 { grid-template-columns: repeat(2, 1fr); }
  .product-grid--3 { grid-template-columns: repeat(3, 1fr); }
  .product-grid--4 { grid-template-columns: repeat(4, 1fr); }

  @media (max-width: 768px) {
    .product-grid--3,
    .product-grid--4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>

{% schema %}
{
  "name": "Recently viewed",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Recently viewed"
    },
    {
      "type": "select",
      "id": "heading_alignment",
      "label": "Heading alignment",
      "default": "left",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" }
      ]
    },
    {
      "type": "range",
      "id": "products_to_show",
      "label": "Products to show",
      "min": 2,
      "max": 8,
      "default": 4
    },
    {
      "type": "range",
      "id": "columns",
      "label": "Columns",
      "min": 2,
      "max": 4,
      "default": 4
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Padding top",
      "min": 0,
      "max": 100,
      "default": 40,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Padding bottom",
      "min": 0,
      "max": 100,
      "default": 40,
      "unit": "px"
    }
  ],
  "presets": [
    {
      "name": "Recently viewed products"
    }
  ]
}
{% endschema %}
```

---

## Alternative: Direct Product Fetching

If search-based rendering is problematic, fetch products directly:

```javascript
async render(containerSelector, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let handles = this.get();

  if (this.excludeCurrent && window.ShopifyAnalytics?.meta?.product) {
    handles = handles.filter(h => h !== window.ShopifyAnalytics.meta.product.handle);
  }

  handles = handles.slice(0, options.limit || 4);

  if (handles.length === 0) {
    container.hidden = true;
    return;
  }

  container.classList.add('is-loading');

  try {
    // Fetch each product via Section Rendering
    const promises = handles.map(async (handle) => {
      const response = await fetch(`/products/${handle}?sections=product-card`);
      if (!response.ok) return null;
      const data = await response.json();
      return data['product-card'];
    });

    const results = await Promise.all(promises);
    const validProducts = results.filter(Boolean);

    if (validProducts.length > 0) {
      const productsHtml = validProducts.join('');
      container.querySelector('.recently-viewed-products').innerHTML = productsHtml;
      container.hidden = false;
    } else {
      container.hidden = true;
    }

  } catch (error) {
    console.error('RecentlyViewed: Error fetching products', error);
    container.hidden = true;
  } finally {
    container.classList.remove('is-loading');
  }
}
```

---

## Product Page Integration

### Track on Product View
```liquid
{% comment %} In product template or section {% endcomment %}

<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.recentlyViewed) {
      window.recentlyViewed.add('{{ product.handle }}');
    }
  });
</script>
```

### Alternative: Use ShopifyAnalytics
```javascript
// The class already checks for this:
if (window.ShopifyAnalytics?.meta?.product) {
  this.add(window.ShopifyAnalytics.meta.product.handle);
}
```

---

## Privacy Considerations

### Clear on Logout
```javascript
// In customer logout handler
document.querySelector('[data-logout]')?.addEventListener('click', function() {
  if (confirm('Clear your browsing history?')) {
    window.recentlyViewed?.clear();
  }
});
```

### Respect Privacy Settings
```javascript
// Check for cookie consent before storing
if (window.Shopify?.customerPrivacy?.currentVisitorConsent()?.preferences === 'yes') {
  this.add(handle);
}
```

### Add Privacy Notice
```liquid
<p class="recently-viewed-privacy">
  {{ 'products.recently_viewed.privacy_notice' | t | default: 'Based on your browsing history on this device' }}
</p>
```

---

## Advanced: Cross-Device Sync

For logged-in customers, sync to metafields:

```javascript
async syncToAccount() {
  if (!window.Shopify?.customerPrivacy?.userCanBeTracked()) return;

  const handles = this.get();

  try {
    await fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attributes: {
          'recently-viewed': handles.join(',')
        }
      })
    });
  } catch (error) {
    console.error('Failed to sync recently viewed', error);
  }
}

loadFromAccount() {
  const cartAttributes = window.Shopify?.cart?.attributes;
  const serverHandles = cartAttributes?.['recently-viewed']?.split(',') || [];

  // Merge with local
  const localHandles = this.get();
  const merged = [...new Set([...localHandles, ...serverHandles])];

  localStorage.setItem(this.storageKey, JSON.stringify(merged.slice(0, this.maxItems)));
}
```

---

## Performance Tips

| Optimization | Implementation |
|--------------|----------------|
| Lazy load | Only fetch when section is in viewport |
| Cache responses | Store in sessionStorage |
| Limit items | Cap at 4-6 displayed items |
| Debounce tracking | Don't track rapid page visits |
| Placeholder | Show skeleton while loading |

### Lazy Loading with Intersection Observer
```javascript
// Only fetch when section scrolls into view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      window.recentlyViewed.render('[data-recently-viewed]');
      observer.disconnect();
    }
  });
}, { rootMargin: '200px' });

const section = document.querySelector('[data-recently-viewed]');
if (section) {
  observer.observe(section);
}
```

---

## Testing Checklist

- [ ] Products tracked on view
- [ ] Recently viewed displays correctly
- [ ] Current product excluded
- [ ] Max items limit works
- [ ] Clear functionality works
- [ ] Works in incognito mode
- [ ] Graceful fallback if localStorage disabled
- [ ] Loading state shows
- [ ] Empty state shows when appropriate
