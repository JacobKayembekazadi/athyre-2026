# Wishlist Patterns

Implementation guide for wishlist functionality using localStorage and optional customer metafields in Shopify themes.

## Overview

Wishlist features improve customer experience:
- **Save for later** - Products customers are interested in
- **Share lists** - Social shopping
- **Purchase reminders** - Email marketing opportunities
- **Conversion tracking** - Understand intent

---

## Architecture Options

| Approach | Storage | Cross-Device | Login Required |
|----------|---------|--------------|----------------|
| localStorage | Client | No | No |
| Customer metafields | Server | Yes | Yes |
| Third-party app | External | Yes | Optional |

**Recommended**: localStorage for guests, metafields for logged-in customers.

---

## localStorage Implementation

### Wishlist Manager Class
```javascript
// assets/wishlist.js

class Wishlist {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'wishlist';
    this.maxItems = options.maxItems || 100;
    this.onUpdate = options.onUpdate || function() {};

    // Sync with customer metafields if logged in
    this.customerId = window.Shopify?.customer?.id || null;

    this.init();
  }

  init() {
    // Update UI on page load
    this.updateUI();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.updateUI();
      }
    });
  }

  /**
   * Get all wishlist items
   */
  getItems() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Wishlist: Error reading localStorage', e);
      return [];
    }
  }

  /**
   * Check if product is in wishlist
   */
  contains(productId) {
    const items = this.getItems();
    return items.some(item => item.id === productId);
  }

  /**
   * Add product to wishlist
   */
  add(product) {
    if (!product || !product.id) return false;

    let items = this.getItems();

    // Check if already exists
    if (items.some(item => item.id === product.id)) {
      return false;
    }

    // Add to beginning
    items.unshift({
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image,
      url: product.url,
      addedAt: new Date().toISOString()
    });

    // Limit items
    items = items.slice(0, this.maxItems);

    // Save
    this.save(items);

    // Dispatch event
    this.dispatchEvent('wishlist:added', product);

    return true;
  }

  /**
   * Remove product from wishlist
   */
  remove(productId) {
    let items = this.getItems();
    const originalLength = items.length;

    items = items.filter(item => item.id !== productId);

    if (items.length !== originalLength) {
      this.save(items);
      this.dispatchEvent('wishlist:removed', { id: productId });
      return true;
    }

    return false;
  }

  /**
   * Toggle product in wishlist
   */
  toggle(product) {
    if (this.contains(product.id)) {
      this.remove(product.id);
      return false;
    } else {
      this.add(product);
      return true;
    }
  }

  /**
   * Clear all wishlist items
   */
  clear() {
    this.save([]);
    this.dispatchEvent('wishlist:cleared');
  }

  /**
   * Get wishlist count
   */
  count() {
    return this.getItems().length;
  }

  /**
   * Save items to localStorage
   */
  save(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.updateUI();
      this.onUpdate(items);
    } catch (e) {
      console.error('Wishlist: Error saving to localStorage', e);
    }
  }

  /**
   * Update all wishlist UI elements
   */
  updateUI() {
    const count = this.count();

    // Update count badges
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
      el.textContent = count;
      el.hidden = count === 0;
    });

    // Update toggle buttons
    document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      const isInWishlist = this.contains(productId);

      btn.classList.toggle('is-active', isInWishlist);
      btn.setAttribute('aria-pressed', isInWishlist);

      const label = isInWishlist
        ? btn.dataset.removeLabel || 'Remove from wishlist'
        : btn.dataset.addLabel || 'Add to wishlist';
      btn.setAttribute('aria-label', label);
    });
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail: { ...detail, count: this.count() }
    }));
  }
}

// Initialize globally
window.wishlist = new Wishlist({
  onUpdate: (items) => {
    // Optional: sync to server for logged-in customers
    if (window.Shopify?.customer?.id) {
      // Implement server sync
    }
  }
});

// Bind toggle buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wishlist-toggle]');
  if (!btn) return;

  e.preventDefault();

  const product = {
    id: parseInt(btn.dataset.productId),
    handle: btn.dataset.productHandle,
    title: btn.dataset.productTitle,
    price: btn.dataset.productPrice,
    compareAtPrice: btn.dataset.productCompareAtPrice,
    image: btn.dataset.productImage,
    url: btn.dataset.productUrl
  };

  const added = window.wishlist.toggle(product);

  // Optional: show notification
  if (added) {
    showNotification('Added to wishlist');
  } else {
    showNotification('Removed from wishlist');
  }
});
```

---

## Wishlist Button Component

### Snippet
```liquid
{% comment %} snippets/wishlist-button.liquid {% endcomment %}
{%- comment -%}
  Wishlist toggle button

  Parameters:
  - product: Product object (required)
  - class: Additional CSS classes
  - show_text: Show "Add to wishlist" text (default: false)
{%- endcomment -%}

<button
  type="button"
  class="wishlist-btn {{ class }}"
  data-wishlist-toggle
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
  data-product-title="{{ product.title | escape }}"
  data-product-price="{{ product.price }}"
  data-product-compare-at-price="{{ product.compare_at_price }}"
  data-product-image="{{ product.featured_image | image_url: width: 400 }}"
  data-product-url="{{ product.url }}"
  data-add-label="{{ 'products.wishlist.add' | t }}"
  data-remove-label="{{ 'products.wishlist.remove' | t }}"
  aria-label="{{ 'products.wishlist.add' | t }}"
  aria-pressed="false"
>
  <span class="wishlist-icon wishlist-icon--outline">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </span>
  <span class="wishlist-icon wishlist-icon--filled">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </span>
  {%- if show_text -%}
    <span class="wishlist-text wishlist-text--add">{{ 'products.wishlist.add' | t }}</span>
    <span class="wishlist-text wishlist-text--remove">{{ 'products.wishlist.remove' | t }}</span>
  {%- endif -%}
</button>

<style>
  .wishlist-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--color-text);
    transition: transform 0.2s;
  }

  .wishlist-btn:hover {
    transform: scale(1.1);
  }

  .wishlist-btn:active {
    transform: scale(0.95);
  }

  .wishlist-icon--filled {
    display: none;
    color: #e53e3e;
  }

  .wishlist-btn.is-active .wishlist-icon--outline {
    display: none;
  }

  .wishlist-btn.is-active .wishlist-icon--filled {
    display: block;
    animation: heartPop 0.3s ease;
  }

  @keyframes heartPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .wishlist-text--remove {
    display: none;
  }

  .wishlist-btn.is-active .wishlist-text--add {
    display: none;
  }

  .wishlist-btn.is-active .wishlist-text--remove {
    display: inline;
  }
</style>
```

---

## Wishlist Page

### Template
```liquid
{% comment %} templates/page.wishlist.json {% endcomment %}
{
  "sections": {
    "main": {
      "type": "wishlist-page",
      "settings": {}
    }
  },
  "order": ["main"]
}
```

### Section
```liquid
{% comment %} sections/wishlist-page.liquid {% endcomment %}

<div class="wishlist-page section-{{ section.id }}">
  <div class="wishlist-container">
    <h1 class="wishlist-title">{{ 'pages.wishlist.title' | t | default: 'My Wishlist' }}</h1>

    <div class="wishlist-content" data-wishlist-content>
      {%- comment -%} Products loaded via JavaScript {%- endcomment -%}
    </div>

    <div class="wishlist-empty" data-wishlist-empty hidden>
      <div class="wishlist-empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <h2>{{ 'pages.wishlist.empty_title' | t | default: 'Your wishlist is empty' }}</h2>
      <p>{{ 'pages.wishlist.empty_text' | t | default: 'Save items you love by clicking the heart icon.' }}</p>
      <a href="{{ routes.all_products_collection_url }}" class="btn btn--primary">
        {{ 'pages.wishlist.continue_shopping' | t | default: 'Start shopping' }}
      </a>
    </div>

    <div class="wishlist-loading" data-wishlist-loading>
      <div class="wishlist-grid">
        {%- for i in (1..4) -%}
          {% render 'skeleton-product-card' %}
        {%- endfor -%}
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('[data-wishlist-content]');
    const empty = document.querySelector('[data-wishlist-empty]');
    const loading = document.querySelector('[data-wishlist-loading]');

    async function renderWishlist() {
      const items = window.wishlist.getItems();

      if (items.length === 0) {
        loading.hidden = true;
        empty.hidden = false;
        return;
      }

      try {
        // Fetch product cards
        const handles = items.map(item => item.handle);
        const url = `/search?section_id=wishlist-products&type=product&q=${handles.map(h => `handle:${h}`).join(' OR ')}`;

        const response = await fetch(url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const products = doc.querySelector('.wishlist-products');

        if (products && products.innerHTML.trim()) {
          content.innerHTML = products.innerHTML;
          loading.hidden = true;
        } else {
          // Fallback: render from stored data
          renderFromStoredData(items);
        }

      } catch (error) {
        console.error('Wishlist: Error loading products', error);
        renderFromStoredData(items);
      }
    }

    function renderFromStoredData(items) {
      const grid = document.createElement('div');
      grid.className = 'wishlist-grid';

      items.forEach(item => {
        grid.innerHTML += `
          <div class="wishlist-item" data-wishlist-item="${item.id}">
            <a href="${item.url}" class="wishlist-item-image">
              <img src="${item.image}" alt="${item.title}" loading="lazy">
            </a>
            <div class="wishlist-item-info">
              <h3 class="wishlist-item-title">
                <a href="${item.url}">${item.title}</a>
              </h3>
              <p class="wishlist-item-price">
                ${Shopify.formatMoney ? Shopify.formatMoney(item.price) : item.price}
              </p>
            </div>
            <button type="button" class="wishlist-item-remove" data-remove-id="${item.id}">
              Remove
            </button>
          </div>
        `;
      });

      content.innerHTML = '';
      content.appendChild(grid);
      loading.hidden = true;
    }

    // Initial render
    renderWishlist();

    // Re-render on wishlist changes
    document.addEventListener('wishlist:removed', renderWishlist);
    document.addEventListener('wishlist:cleared', renderWishlist);

    // Remove button handler
    content.addEventListener('click', function(e) {
      const removeBtn = e.target.closest('[data-remove-id]');
      if (removeBtn) {
        const id = parseInt(removeBtn.dataset.removeId);
        window.wishlist.remove(id);
      }
    });
  });
</script>

<style>
  .wishlist-page {
    padding: 3rem 1rem;
  }

  .wishlist-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .wishlist-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .wishlist-item {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .wishlist-item-image {
    display: block;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .wishlist-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wishlist-item-info {
    padding: 1rem;
  }

  .wishlist-item-title {
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }

  .wishlist-item-title a {
    color: inherit;
    text-decoration: none;
  }

  .wishlist-item-price {
    font-weight: 600;
    margin: 0;
  }

  .wishlist-item-remove {
    width: 100%;
    padding: 0.75rem;
    background: none;
    border: none;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background 0.2s;
  }

  .wishlist-item-remove:hover {
    background: var(--color-background-secondary);
  }

  .wishlist-empty {
    text-align: center;
    padding: 4rem 1rem;
  }

  .wishlist-empty-icon {
    color: var(--color-border);
    margin-bottom: 1rem;
  }

  .wishlist-empty h2 {
    margin-bottom: 0.5rem;
  }

  .wishlist-empty p {
    color: var(--color-text-muted);
    margin-bottom: 1.5rem;
  }
</style>

{% schema %}
{
  "name": "Wishlist page",
  "settings": []
}
{% endschema %}
```

---

## Header Wishlist Link

```liquid
{% comment %} In header section {% endcomment %}

<a href="/pages/wishlist" class="header-icon-link wishlist-link" aria-label="Wishlist">
  <span class="wishlist-icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </span>
  <span class="wishlist-count-badge" data-wishlist-count hidden>0</span>
</a>

<style>
  .wishlist-link {
    position: relative;
  }

  .wishlist-count-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: var(--color-accent);
    color: #fff;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
```

---

## Customer Metafields Integration

For logged-in customers, sync wishlist to metafields:

```javascript
class WishlistSync {
  constructor(wishlist) {
    this.wishlist = wishlist;
    this.customerId = window.Shopify?.customer?.id;

    if (this.customerId) {
      this.loadFromServer();
    }
  }

  async loadFromServer() {
    try {
      const response = await fetch('/account?view=wishlist-data');
      const data = await response.json();

      if (data.wishlist) {
        // Merge server data with local
        const localItems = this.wishlist.getItems();
        const serverItems = data.wishlist;

        const merged = this.mergeItems(localItems, serverItems);
        this.wishlist.save(merged);
      }
    } catch (error) {
      console.error('WishlistSync: Error loading from server', error);
    }
  }

  async saveToServer(items) {
    if (!this.customerId) return;

    try {
      // Use customer metafields via Storefront API
      // or custom app endpoint
      await fetch('/apps/wishlist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: this.customerId,
          items: items.map(i => i.id)
        })
      });
    } catch (error) {
      console.error('WishlistSync: Error saving to server', error);
    }
  }

  mergeItems(local, server) {
    const seen = new Set();
    const merged = [];

    [...local, ...server].forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    });

    return merged;
  }
}
```

---

## Share Wishlist

```liquid
{% comment %} Share buttons on wishlist page {% endcomment %}

<div class="wishlist-share">
  <button type="button" class="share-btn" data-share-wishlist>
    {% render 'icon', icon: 'share' %}
    {{ 'pages.wishlist.share' | t | default: 'Share wishlist' }}
  </button>
</div>

<script>
  document.querySelector('[data-share-wishlist]')?.addEventListener('click', async function() {
    const items = window.wishlist.getItems();
    const handles = items.map(i => i.handle).join(',');
    const shareUrl = `${window.location.origin}/pages/wishlist?items=${handles}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url: shareUrl
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  });

  // Load shared wishlist from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sharedItems = urlParams.get('items');
  if (sharedItems) {
    // Show shared items (read-only view)
  }
</script>
```

---

## Testing Checklist

- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Toggle state correct on page load
- [ ] Count badge updates
- [ ] Wishlist page displays items
- [ ] Works in incognito
- [ ] Syncs across tabs
- [ ] Mobile touch targets adequate
- [ ] Animation plays on add
- [ ] Empty state shows correctly
