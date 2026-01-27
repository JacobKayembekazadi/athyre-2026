# Loading & Skeleton States

Implementation patterns for loading indicators and skeleton screens in Shopify themes.

---

## Overview

Loading states provide visual feedback during asynchronous operations. Skeleton screens show placeholder content that mimics the final layout, reducing perceived load time.

---

## Loading Spinner

### snippets/loading-spinner.liquid

```liquid
{%- comment -%}
  Loading Spinner

  Accepts:
  - size: {String} 'small', 'medium', 'large' (default: 'medium')
  - color: {String} 'primary', 'secondary', 'white' (default: 'primary')
{%- endcomment -%}

{%- liquid
  assign size = size | default: 'medium'
  assign color = color | default: 'primary'
-%}

<span
  class="loading-spinner loading-spinner--{{ size }} loading-spinner--{{ color }}"
  role="status"
  aria-label="{{ 'accessibility.loading' | t }}"
>
  <svg class="loading-spinner__svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle
      class="loading-spinner__circle"
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
</span>
```

### Loading Spinner CSS

```css
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner__svg {
  animation: spin 1s linear infinite;
}

.loading-spinner__circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
  stroke-linecap: round;
}

/* Sizes */
.loading-spinner--small .loading-spinner__svg {
  width: 16px;
  height: 16px;
}

.loading-spinner--medium .loading-spinner__svg {
  width: 24px;
  height: 24px;
}

.loading-spinner--large .loading-spinner__svg {
  width: 40px;
  height: 40px;
}

/* Colors */
.loading-spinner--primary {
  color: var(--color-primary);
}

.loading-spinner--secondary {
  color: var(--color-foreground);
}

.loading-spinner--white {
  color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## Button Loading States

### Button with Loading State

```liquid
{%- comment -%}
  snippets/button-with-loading.liquid

  Accepts:
  - text: {String} Button text
  - loading_text: {String} Text shown while loading (optional)
  - type: {String} 'submit', 'button' (default: 'submit')
  - class: {String} Additional classes
{%- endcomment -%}

<button
  type="{{ type | default: 'submit' }}"
  class="button {{ class }}"
  data-loading-button
>
  <span class="button__text">{{ text }}</span>
  <span class="button__loading hidden" aria-hidden="true">
    {% render 'loading-spinner', size: 'small', color: 'white' %}
    {%- if loading_text -%}
      <span class="button__loading-text">{{ loading_text }}</span>
    {%- endif -%}
  </span>
</button>
```

### Button Loading CSS

```css
.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button__loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.button__loading.hidden {
  display: none;
}

.button[aria-busy="true"] .button__text {
  visibility: hidden;
}

.button[aria-busy="true"] .button__loading {
  position: absolute;
  display: inline-flex;
}

/* Disabled state during loading */
.button[aria-busy="true"] {
  pointer-events: none;
  opacity: 0.7;
}
```

### JavaScript for Button Loading

```javascript
// Set button to loading state
function setButtonLoading(button, loading = true) {
  button.setAttribute('aria-busy', loading);
  button.disabled = loading;

  const textEl = button.querySelector('.button__text');
  const loadingEl = button.querySelector('.button__loading');

  if (textEl) textEl.classList.toggle('hidden', loading);
  if (loadingEl) loadingEl.classList.toggle('hidden', !loading);
}

// Usage
const button = document.querySelector('[data-loading-button]');
setButtonLoading(button, true);

// After operation completes
setButtonLoading(button, false);
```

---

## Skeleton Screens

### Product Card Skeleton

```liquid
{%- comment -%}
  snippets/skeleton-product-card.liquid
  Placeholder for product cards during loading
{%- endcomment -%}

<div class="skeleton-product-card" aria-hidden="true">
  <div class="skeleton-product-card__image skeleton-shimmer"></div>
  <div class="skeleton-product-card__content">
    <div class="skeleton-product-card__title skeleton-shimmer"></div>
    <div class="skeleton-product-card__price skeleton-shimmer"></div>
  </div>
</div>
```

### Product Card Skeleton CSS

```css
.skeleton-product-card {
  display: flex;
  flex-direction: column;
}

.skeleton-product-card__image {
  aspect-ratio: 1;
  background: var(--color-skeleton);
  border-radius: var(--border-radius);
}

.skeleton-product-card__content {
  padding: 1rem 0;
}

.skeleton-product-card__title {
  height: 1rem;
  width: 80%;
  background: var(--color-skeleton);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-product-card__price {
  height: 1rem;
  width: 40%;
  background: var(--color-skeleton);
  border-radius: 4px;
}
```

### Collection Grid Skeleton

```liquid
{%- comment -%}
  snippets/skeleton-collection-grid.liquid

  Accepts:
  - columns: {Number} Number of columns (default: 4)
  - rows: {Number} Number of rows (default: 2)
{%- endcomment -%}

{%- liquid
  assign columns = columns | default: 4
  assign rows = rows | default: 2
  assign total = columns | times: rows
-%}

<div
  class="skeleton-collection-grid"
  style="--grid-columns: {{ columns }}"
  role="status"
  aria-label="{{ 'accessibility.loading_products' | t }}"
>
  {%- for i in (1..total) -%}
    {% render 'skeleton-product-card' %}
  {%- endfor -%}
</div>
```

### Collection Grid Skeleton CSS

```css
.skeleton-collection-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 4), 1fr);
  gap: 1.5rem;
}

@media screen and (max-width: 989px) {
  .skeleton-collection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 749px) {
  .skeleton-collection-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
```

### Cart Item Skeleton

```liquid
{%- comment -%}
  snippets/skeleton-cart-item.liquid
{%- endcomment -%}

<div class="skeleton-cart-item" aria-hidden="true">
  <div class="skeleton-cart-item__image skeleton-shimmer"></div>
  <div class="skeleton-cart-item__content">
    <div class="skeleton-cart-item__title skeleton-shimmer"></div>
    <div class="skeleton-cart-item__variant skeleton-shimmer"></div>
    <div class="skeleton-cart-item__price skeleton-shimmer"></div>
  </div>
  <div class="skeleton-cart-item__quantity skeleton-shimmer"></div>
</div>
```

### Cart Item Skeleton CSS

```css
.skeleton-cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-cart-item__image {
  width: 80px;
  height: 80px;
  background: var(--color-skeleton);
  border-radius: var(--border-radius);
}

.skeleton-cart-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-cart-item__title {
  height: 1rem;
  width: 70%;
  background: var(--color-skeleton);
  border-radius: 4px;
}

.skeleton-cart-item__variant {
  height: 0.875rem;
  width: 40%;
  background: var(--color-skeleton);
  border-radius: 4px;
}

.skeleton-cart-item__price {
  height: 1rem;
  width: 30%;
  background: var(--color-skeleton);
  border-radius: 4px;
}

.skeleton-cart-item__quantity {
  width: 100px;
  height: 40px;
  background: var(--color-skeleton);
  border-radius: var(--border-radius);
}
```

---

## Shimmer Animation

### Base Shimmer Effect

```css
:root {
  --color-skeleton: #e0e0e0;
  --color-skeleton-highlight: #f5f5f5;
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-skeleton-highlight),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer::after {
    animation: none;
  }

  .skeleton-shimmer {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-skeleton: #333;
    --color-skeleton-highlight: #444;
  }
}
```

---

## Lazy Loading Images

### Image with Skeleton Placeholder

```liquid
{%- comment -%}
  snippets/image-lazy.liquid

  Accepts:
  - image: {Image} Image object
  - sizes: {String} Sizes attribute
  - class: {String} Additional classes
{%- endcomment -%}

<div class="image-lazy-wrapper {{ class }}" data-image-lazy>
  <div class="image-lazy__placeholder skeleton-shimmer"></div>

  {{ image | image_url: width: image.width | image_tag:
    loading: 'lazy',
    sizes: sizes,
    class: 'image-lazy__img',
    data-loaded: 'false'
  }}
</div>

<script>
  // Inline script for immediate execution
  (function() {
    document.querySelectorAll('[data-image-lazy]').forEach(wrapper => {
      const img = wrapper.querySelector('img');
      const placeholder = wrapper.querySelector('.image-lazy__placeholder');

      if (img.complete) {
        img.dataset.loaded = 'true';
        placeholder?.remove();
      } else {
        img.addEventListener('load', function() {
          this.dataset.loaded = 'true';
          placeholder?.remove();
        });
      }
    });
  })();
</script>
```

### Lazy Image CSS

```css
.image-lazy-wrapper {
  position: relative;
  overflow: hidden;
}

.image-lazy__placeholder {
  position: absolute;
  inset: 0;
  background: var(--color-skeleton);
  z-index: 1;
}

.image-lazy__img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-lazy__img[data-loaded="true"] {
  opacity: 1;
}

/* Aspect ratio containers */
.image-lazy-wrapper--square {
  aspect-ratio: 1;
}

.image-lazy-wrapper--portrait {
  aspect-ratio: 3/4;
}

.image-lazy-wrapper--landscape {
  aspect-ratio: 16/9;
}

.image-lazy-wrapper--portrait .image-lazy__img,
.image-lazy-wrapper--landscape .image-lazy__img,
.image-lazy-wrapper--square .image-lazy__img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}
```

---

## AJAX Loading Patterns

### Collection Loading with Skeleton

```javascript
class CollectionLoader {
  constructor(container) {
    this.container = container;
    this.productsGrid = container.querySelector('[data-products-grid]');
    this.loadMoreBtn = container.querySelector('[data-load-more]');

    this.init();
  }

  init() {
    this.loadMoreBtn?.addEventListener('click', () => this.loadMore());
  }

  async loadMore() {
    const nextUrl = this.loadMoreBtn.dataset.nextUrl;
    if (!nextUrl) return;

    // Show skeleton placeholders
    this.showSkeletons(4);
    this.loadMoreBtn.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(nextUrl);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const newProducts = doc.querySelectorAll('[data-product-card]');
      const newNextUrl = doc.querySelector('[data-load-more]')?.dataset.nextUrl;

      // Remove skeletons
      this.removeSkeletons();

      // Add new products
      newProducts.forEach(product => {
        this.productsGrid.appendChild(product);
      });

      // Update load more button
      if (newNextUrl) {
        this.loadMoreBtn.dataset.nextUrl = newNextUrl;
      } else {
        this.loadMoreBtn.remove();
      }

    } catch (error) {
      console.error('Failed to load products:', error);
      this.removeSkeletons();
    } finally {
      this.loadMoreBtn?.setAttribute('aria-busy', 'false');
    }
  }

  showSkeletons(count) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-product-card';
    skeleton.setAttribute('data-skeleton', '');
    skeleton.innerHTML = `
      <div class="skeleton-product-card__image skeleton-shimmer"></div>
      <div class="skeleton-product-card__content">
        <div class="skeleton-product-card__title skeleton-shimmer"></div>
        <div class="skeleton-product-card__price skeleton-shimmer"></div>
      </div>
    `;

    for (let i = 0; i < count; i++) {
      this.productsGrid.appendChild(skeleton.cloneNode(true));
    }
  }

  removeSkeletons() {
    this.container.querySelectorAll('[data-skeleton]').forEach(el => el.remove());
  }
}
```

### Cart Drawer Loading

```liquid
{%- comment -%}
  snippets/cart-drawer-loading.liquid
{%- endcomment -%}

<div class="cart-drawer__loading" data-cart-loading aria-hidden="true">
  <div class="cart-drawer__loading-overlay">
    {% render 'loading-spinner', size: 'large' %}
  </div>
</div>

<style>
  .cart-drawer__loading {
    position: absolute;
    inset: 0;
    display: none;
    z-index: 10;
  }

  .cart-drawer__loading[aria-hidden="false"] {
    display: block;
  }

  .cart-drawer__loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
  }
</style>
```

---

## Page Transition Loading

### Full Page Loading Indicator

```liquid
{%- comment -%}
  snippets/page-loading.liquid
  Shows during page navigation
{%- endcomment -%}

<div class="page-loading" id="page-loading" aria-hidden="true">
  <div class="page-loading__bar"></div>
</div>

<style>
  .page-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .page-loading[aria-hidden="false"] {
    opacity: 1;
  }

  .page-loading__bar {
    height: 100%;
    background: var(--color-primary);
    width: 0;
    transition: width 0.3s ease;
  }

  .page-loading.is-loading .page-loading__bar {
    width: 90%;
    transition: width 10s ease-out;
  }

  .page-loading.is-complete .page-loading__bar {
    width: 100%;
    transition: width 0.1s ease;
  }
</style>

<script>
  class PageLoading {
    constructor() {
      this.element = document.getElementById('page-loading');
      this.init();
    }

    init() {
      // Show on navigation start
      document.addEventListener('turbo:visit', () => this.start());
      document.addEventListener('turbo:before-fetch-request', () => this.start());

      // Complete on page load
      document.addEventListener('turbo:load', () => this.complete());
      document.addEventListener('turbo:frame-load', () => this.complete());

      // Also handle regular navigation
      window.addEventListener('beforeunload', () => this.start());
    }

    start() {
      this.element.setAttribute('aria-hidden', 'false');
      this.element.classList.remove('is-complete');
      this.element.classList.add('is-loading');
    }

    complete() {
      this.element.classList.remove('is-loading');
      this.element.classList.add('is-complete');

      setTimeout(() => {
        this.element.setAttribute('aria-hidden', 'true');
        this.element.classList.remove('is-complete');
      }, 300);
    }
  }

  new PageLoading();
</script>
```

---

## Content Loading Patterns

### Section Loading State

```liquid
{%- comment -%}
  Use when fetching section content via AJAX
{%- endcomment -%}

<div class="section-loading" data-section-loading>
  <div class="section-loading__content">
    {%- comment -%} Actual content {%- endcomment -%}
  </div>

  <div class="section-loading__skeleton" aria-hidden="true">
    {%- comment -%} Skeleton placeholder {%- endcomment -%}
  </div>

  <div class="section-loading__spinner" aria-hidden="true">
    {% render 'loading-spinner' %}
  </div>
</div>

<style>
  .section-loading {
    position: relative;
    min-height: 200px;
  }

  .section-loading__skeleton,
  .section-loading__spinner {
    display: none;
  }

  .section-loading[data-state="loading"] .section-loading__content {
    opacity: 0.5;
    pointer-events: none;
  }

  .section-loading[data-state="loading"] .section-loading__spinner {
    display: flex;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
  }

  .section-loading[data-state="skeleton"] .section-loading__content {
    display: none;
  }

  .section-loading[data-state="skeleton"] .section-loading__skeleton {
    display: block;
  }
</style>
```

---

## Locales

```json
{
  "accessibility": {
    "loading": "Loading",
    "loading_products": "Loading products",
    "loading_cart": "Updating cart"
  }
}
```

---

## Best Practices

### 1. Skeleton Screen Design

- Match the skeleton layout exactly to final content
- Use neutral colors that work in light/dark modes
- Animate subtly to indicate loading without distraction

### 2. Loading State Timing

```javascript
// Show loading immediately for long operations
// Delay for very quick operations to avoid flash

let loadingTimeout;

function showLoading() {
  // Delay 100ms to avoid flash for quick loads
  loadingTimeout = setTimeout(() => {
    element.classList.add('is-loading');
  }, 100);
}

function hideLoading() {
  clearTimeout(loadingTimeout);
  element.classList.remove('is-loading');
}
```

### 3. Progressive Loading

```liquid
{%- comment -%}
  Load critical content immediately, lazy load below-fold
{%- endcomment -%}

{%- for product in collection.products limit: 8 -%}
  {% render 'product-card', product: product, loading: 'eager' %}
{%- endfor -%}

{%- for product in collection.products offset: 8 -%}
  {% render 'product-card', product: product, loading: 'lazy' %}
{%- endfor -%}
```

### 4. Accessibility

- Use `aria-busy="true"` on loading containers
- Announce loading states to screen readers with `role="status"`
- Provide text alternatives for visual loading indicators
- Respect `prefers-reduced-motion`

```liquid
<div
  aria-busy="true"
  aria-label="{{ 'accessibility.loading' | t }}"
  role="status"
>
  {% render 'loading-spinner' %}
</div>
```
