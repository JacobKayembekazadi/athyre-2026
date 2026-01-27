# Product Compare Functionality

Complete guide for implementing product comparison features in Shopify themes.

## Overview

Product comparison allows customers to select multiple products and view them side-by-side to compare features, prices, and specifications.

## Add to Compare Button

### Snippet for Product Cards

```liquid
{% comment %} snippets/compare-button.liquid {% endcomment %}

{%- comment -%}
  Renders an "Add to Compare" button
  Accepts:
  - product: Product object (required)
  - class: Additional CSS classes (optional)
{%- endcomment -%}

<button
  type="button"
  class="compare-button {{ class }}"
  data-compare-toggle
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
  data-product-title="{{ product.title | escape }}"
  data-product-image="{{ product.featured_image | image_url: width: 200 }}"
  data-product-price="{{ product.price | money }}"
  data-product-url="{{ product.url }}"
  aria-pressed="false"
  aria-label="{{ 'products.compare.add_to_compare' | t: title: product.title }}"
>
  <span class="compare-button__icon compare-button__icon--add">
    {% render 'icon-plus' %}
  </span>
  <span class="compare-button__icon compare-button__icon--remove" hidden>
    {% render 'icon-check' %}
  </span>
  <span class="compare-button__text">
    <span class="compare-button__text--add">{{ 'products.compare.add' | t }}</span>
    <span class="compare-button__text--remove" hidden>{{ 'products.compare.added' | t }}</span>
  </span>
</button>
```

### Usage in Product Card

```liquid
{% comment %} In product-card.liquid {% endcomment %}

<div class="product-card">
  <div class="product-card__image-wrapper">
    {{ product.featured_image | image_url: width: 400 | image_tag }}

    {%- comment -%} Compare button in corner {%- endcomment -%}
    <div class="product-card__actions">
      {% render 'compare-button', product: product, class: 'product-card__compare' %}
    </div>
  </div>

  <div class="product-card__info">
    <h3>{{ product.title }}</h3>
    {% render 'price', product: product %}
  </div>
</div>
```

---

## Compare Drawer

### Drawer Snippet

```liquid
{% comment %} snippets/compare-drawer.liquid {% endcomment %}

<div class="compare-drawer" id="compare-drawer" hidden data-compare-drawer>
  <div class="compare-drawer__header">
    <h3 class="compare-drawer__title">
      {{ 'products.compare.drawer_title' | t }}
      (<span data-compare-count>0</span>/{{ settings.compare_max_items | default: 4 }})
    </h3>
    <button
      type="button"
      class="compare-drawer__close"
      data-compare-drawer-close
      aria-label="{{ 'products.compare.close' | t }}"
    >
      {% render 'icon-close' %}
    </button>
  </div>

  <div class="compare-drawer__items" data-compare-items>
    {%- comment -%} Items populated by JavaScript {%- endcomment -%}
  </div>

  <div class="compare-drawer__actions">
    <button
      type="button"
      class="button button--secondary"
      data-compare-clear
    >
      {{ 'products.compare.clear_all' | t }}
    </button>
    <a
      href="{{ routes.root_url }}pages/compare"
      class="button button--primary"
      data-compare-view-link
    >
      {{ 'products.compare.compare_now' | t }}
    </a>
  </div>
</div>

<div class="compare-drawer-overlay" data-compare-drawer-overlay hidden></div>
```

### Include in theme.liquid

```liquid
{% comment %} Before closing </body> in theme.liquid {% endcomment %}

{% render 'compare-drawer' %}
```

---

## Compare JavaScript

```javascript
// assets/product-compare.js

class ProductCompare {
  constructor() {
    this.storageKey = 'shopify-compare-products';
    this.maxItems = window.theme?.compare?.maxItems || 4;
    this.products = this.getFromStorage();

    this.drawer = document.querySelector('[data-compare-drawer]');
    this.drawerItems = document.querySelector('[data-compare-items]');
    this.countElements = document.querySelectorAll('[data-compare-count]');
    this.overlay = document.querySelector('[data-compare-drawer-overlay]');

    this.init();
  }

  init() {
    // Bind toggle buttons
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-compare-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        this.toggleProduct(toggleBtn);
      }

      const clearBtn = e.target.closest('[data-compare-clear]');
      if (clearBtn) {
        this.clearAll();
      }

      const closeBtn = e.target.closest('[data-compare-drawer-close]');
      const overlay = e.target.closest('[data-compare-drawer-overlay]');
      if (closeBtn || overlay) {
        this.closeDrawer();
      }

      const removeBtn = e.target.closest('[data-compare-remove]');
      if (removeBtn) {
        this.removeProduct(removeBtn.dataset.productId);
      }
    });

    // Initial UI update
    this.updateUI();
  }

  getFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
  }

  toggleProduct(button) {
    const productId = button.dataset.productId;
    const isInCompare = this.products.some(p => p.id === productId);

    if (isInCompare) {
      this.removeProduct(productId);
    } else {
      this.addProduct({
        id: productId,
        handle: button.dataset.productHandle,
        title: button.dataset.productTitle,
        image: button.dataset.productImage,
        price: button.dataset.productPrice,
        url: button.dataset.productUrl
      });
    }
  }

  addProduct(product) {
    if (this.products.length >= this.maxItems) {
      this.showLimitMessage();
      return;
    }

    if (this.products.some(p => p.id === product.id)) {
      return;
    }

    this.products.push(product);
    this.saveToStorage();
    this.updateUI();
    this.openDrawer();
  }

  removeProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveToStorage();
    this.updateUI();

    if (this.products.length === 0) {
      this.closeDrawer();
    }
  }

  clearAll() {
    this.products = [];
    this.saveToStorage();
    this.updateUI();
    this.closeDrawer();
  }

  updateUI() {
    // Update count badges
    this.countElements.forEach(el => {
      el.textContent = this.products.length;
    });

    // Update toggle buttons
    document.querySelectorAll('[data-compare-toggle]').forEach(btn => {
      const isInCompare = this.products.some(p => p.id === btn.dataset.productId);
      btn.setAttribute('aria-pressed', isInCompare);
      btn.classList.toggle('is-active', isInCompare);

      // Toggle text/icon visibility
      const addIcon = btn.querySelector('.compare-button__icon--add');
      const removeIcon = btn.querySelector('.compare-button__icon--remove');
      const addText = btn.querySelector('.compare-button__text--add');
      const removeText = btn.querySelector('.compare-button__text--remove');

      if (addIcon) addIcon.hidden = isInCompare;
      if (removeIcon) removeIcon.hidden = !isInCompare;
      if (addText) addText.hidden = isInCompare;
      if (removeText) removeText.hidden = !isInCompare;
    });

    // Update drawer items
    this.renderDrawerItems();

    // Show/hide view link based on item count
    const viewLink = document.querySelector('[data-compare-view-link]');
    if (viewLink) {
      viewLink.classList.toggle('disabled', this.products.length < 2);
    }
  }

  renderDrawerItems() {
    if (!this.drawerItems) return;

    if (this.products.length === 0) {
      this.drawerItems.innerHTML = `
        <p class="compare-drawer__empty">${window.theme?.strings?.compareEmpty || 'No products to compare'}</p>
      `;
      return;
    }

    this.drawerItems.innerHTML = this.products.map(product => `
      <div class="compare-drawer__item" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.title}" class="compare-drawer__image" loading="lazy">
        <div class="compare-drawer__item-info">
          <a href="${product.url}" class="compare-drawer__item-title">${product.title}</a>
          <span class="compare-drawer__item-price">${product.price}</span>
        </div>
        <button
          type="button"
          class="compare-drawer__remove"
          data-compare-remove
          data-product-id="${product.id}"
          aria-label="Remove ${product.title}"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');
  }

  openDrawer() {
    if (this.drawer) {
      this.drawer.hidden = false;
      this.overlay.hidden = false;
      document.body.classList.add('compare-drawer-open');
    }
  }

  closeDrawer() {
    if (this.drawer) {
      this.drawer.hidden = true;
      this.overlay.hidden = true;
      document.body.classList.remove('compare-drawer-open');
    }
  }

  showLimitMessage() {
    // Show toast or alert
    const message = window.theme?.strings?.compareLimit ||
      `You can compare up to ${this.maxItems} products`;
    alert(message); // Replace with your toast system
  }

  // Public method to get products for compare page
  getProducts() {
    return this.products;
  }

  // Public method to get product handles for API calls
  getHandles() {
    return this.products.map(p => p.handle);
  }
}

// Initialize
window.productCompare = new ProductCompare();
```

---

## Compare Page

### Page Template

```liquid
{% comment %} templates/page.compare.liquid {% endcomment %}

{%- comment -%}
  Create a page in Shopify admin with handle "compare"
  Assign this template to that page
{%- endcomment -%}

<div class="compare-page" data-compare-page>
  <div class="container">
    <h1 class="compare-page__title">{{ page.title }}</h1>

    <div class="compare-page__content" data-compare-content>
      {%- comment -%} Content loaded via JavaScript {%- endcomment -%}
      <div class="compare-page__loading">
        {{ 'products.compare.loading' | t }}
      </div>
    </div>

    <div class="compare-page__empty" data-compare-empty hidden>
      <p>{{ 'products.compare.empty_page' | t }}</p>
      <a href="{{ routes.collections_url }}/all" class="button">
        {{ 'products.compare.browse_products' | t }}
      </a>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', async function() {
    const comparePage = document.querySelector('[data-compare-page]');
    const content = document.querySelector('[data-compare-content]');
    const empty = document.querySelector('[data-compare-empty]');

    if (!window.productCompare) return;

    const handles = window.productCompare.getHandles();

    if (handles.length < 2) {
      content.hidden = true;
      empty.hidden = false;
      return;
    }

    // Fetch full product data via Shopify AJAX API
    try {
      const products = await Promise.all(
        handles.map(handle =>
          fetch(`/products/${handle}.json`)
            .then(res => res.json())
            .then(data => data.product)
        )
      );

      content.innerHTML = renderCompareTable(products);
    } catch (error) {
      console.error('Error loading compare products:', error);
      content.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
  });

  function renderCompareTable(products) {
    // Define which attributes to compare
    const attributes = [
      { key: 'image', label: '' },
      { key: 'title', label: 'Product' },
      { key: 'price', label: 'Price' },
      { key: 'vendor', label: 'Brand' },
      { key: 'type', label: 'Type' },
      // Add metafields or custom attributes as needed
    ];

    let html = '<div class="compare-table-wrapper"><table class="compare-table">';

    // Render header row with product images and titles
    html += '<thead><tr><th></th>';
    products.forEach(product => {
      html += `<th class="compare-table__product-header">
        <a href="/products/${product.handle}">
          <img src="${product.images[0]?.src || ''}" alt="${product.title}" class="compare-table__image">
        </a>
        <a href="/products/${product.handle}" class="compare-table__title">${product.title}</a>
        <button type="button" class="compare-table__remove" data-compare-remove data-product-id="${product.id}">
          Remove
        </button>
      </th>`;
    });
    html += '</tr></thead>';

    // Render body rows
    html += '<tbody>';

    // Price row
    html += '<tr><td class="compare-table__label">Price</td>';
    products.forEach(product => {
      const price = (product.variants[0].price / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      html += `<td class="compare-table__value">${price}</td>`;
    });
    html += '</tr>';

    // Vendor row
    html += '<tr><td class="compare-table__label">Brand</td>';
    products.forEach(product => {
      html += `<td class="compare-table__value">${product.vendor || '-'}</td>`;
    });
    html += '</tr>';

    // Type row
    html += '<tr><td class="compare-table__label">Type</td>';
    products.forEach(product => {
      html += `<td class="compare-table__value">${product.product_type || '-'}</td>`;
    });
    html += '</tr>';

    // Options (e.g., sizes, colors)
    if (products.some(p => p.options && p.options.length > 0)) {
      const allOptions = [...new Set(products.flatMap(p => p.options.map(o => o.name)))];
      allOptions.forEach(optionName => {
        html += `<tr><td class="compare-table__label">${optionName}</td>`;
        products.forEach(product => {
          const option = product.options.find(o => o.name === optionName);
          const values = option ? option.values.join(', ') : '-';
          html += `<td class="compare-table__value">${values}</td>`;
        });
        html += '</tr>';
      });
    }

    // Add to cart row
    html += '<tr><td class="compare-table__label"></td>';
    products.forEach(product => {
      html += `<td class="compare-table__value">
        <a href="/products/${product.handle}" class="button button--primary button--small">
          View Product
        </a>
      </td>`;
    });
    html += '</tr>';

    html += '</tbody></table></div>';

    return html;
  }
</script>
```

---

## CSS Styles

```css
/* assets/product-compare.css */

/* Compare Button */
.compare-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.compare-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.compare-button.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.compare-button__icon {
  width: 16px;
  height: 16px;
}

/* Product card integration */
.product-card__compare {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}

/* Compare Drawer */
.compare-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 60vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.compare-drawer:not([hidden]) {
  transform: translateY(0);
}

.compare-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-background);
}

.compare-drawer__title {
  font-size: 1rem;
  margin: 0;
}

.compare-drawer__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.compare-drawer__items {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
}

.compare-drawer__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  position: relative;
}

.compare-drawer__image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.compare-drawer__item-title {
  font-size: 0.75rem;
  text-align: center;
  color: var(--color-foreground);
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.compare-drawer__item-price {
  font-size: 0.75rem;
  font-weight: 600;
}

.compare-drawer__remove {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
}

.compare-drawer__actions {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.compare-drawer__actions .button {
  flex: 1;
}

.compare-drawer__empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-foreground-muted);
}

.compare-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

body.compare-drawer-open {
  overflow: hidden;
}

/* Compare Page */
.compare-page {
  padding: 2rem 0;
}

.compare-page__title {
  margin-bottom: 2rem;
}

.compare-page__loading {
  text-align: center;
  padding: 3rem;
}

.compare-page__empty {
  text-align: center;
  padding: 3rem;
}

.compare-table-wrapper {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.compare-table th,
.compare-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.compare-table th {
  text-align: left;
  font-weight: 400;
}

.compare-table__product-header {
  text-align: center;
  min-width: 150px;
}

.compare-table__image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
}

.compare-table__title {
  display: block;
  font-weight: 600;
  color: var(--color-foreground);
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.compare-table__title:hover {
  text-decoration: underline;
}

.compare-table__remove {
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.compare-table__label {
  font-weight: 600;
  background: var(--color-background-alt);
  width: 150px;
}

.compare-table__value {
  text-align: center;
}

/* Mobile */
@media screen and (max-width: 749px) {
  .compare-drawer__items {
    flex-wrap: wrap;
    justify-content: center;
  }

  .compare-table__label {
    width: 100px;
    font-size: 0.875rem;
  }

  .compare-table th,
  .compare-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .compare-table__image {
    width: 80px;
    height: 80px;
  }
}
```

---

## Floating Compare Badge

### Optional: Show compare count in header

```liquid
{% comment %} In header section {% endcomment %}

<button
  type="button"
  class="header__compare-toggle"
  data-compare-drawer-toggle
  aria-label="{{ 'products.compare.compare' | t }}"
>
  {% render 'icon-compare' %}
  <span class="header__compare-count" data-compare-count hidden>0</span>
</button>
```

```javascript
// Add to product-compare.js
updateUI() {
  // ... existing code ...

  // Update header badge
  const headerCount = document.querySelector('.header__compare-count');
  if (headerCount) {
    headerCount.textContent = this.products.length;
    headerCount.hidden = this.products.length === 0;
  }
}
```

---

## Locales

```json
{
  "products": {
    "compare": {
      "add": "Compare",
      "added": "Added",
      "add_to_compare": "Add {{ title }} to compare",
      "drawer_title": "Compare Products",
      "close": "Close compare drawer",
      "clear_all": "Clear All",
      "compare_now": "Compare Now",
      "loading": "Loading products...",
      "empty_page": "Select at least 2 products to compare.",
      "browse_products": "Browse Products",
      "remove": "Remove from compare"
    }
  }
}
```

---

## Theme Settings

```json
{
  "name": "Product compare",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable_compare",
      "label": "Enable product compare",
      "default": true
    },
    {
      "type": "range",
      "id": "compare_max_items",
      "label": "Maximum products to compare",
      "min": 2,
      "max": 6,
      "step": 1,
      "default": 4
    }
  ]
}
```

### Conditional Rendering

```liquid
{%- if settings.enable_compare -%}
  {% render 'compare-button', product: product %}
{%- endif -%}
```

---

## Best Practices

1. **Limit Products:** 4 products maximum for readable comparison
2. **localStorage:** Persist selections across sessions
3. **Mobile UX:** Use drawer instead of modal on mobile
4. **Loading States:** Show skeleton while fetching product data
5. **Empty State:** Guide users to browse products when empty
6. **Accessibility:** Proper ARIA labels and keyboard navigation
7. **Performance:** Lazy load compare page data only when needed
