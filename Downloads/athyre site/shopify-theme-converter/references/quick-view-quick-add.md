# Quick View & Quick Add Patterns

Implementation guide for quick add buttons and modal product views in Shopify themes.

## Overview

Quick commerce patterns reduce friction in the buying journey:
- **Quick Add** - Add to cart without visiting product page
- **Quick View** - Modal preview with variant selection
- **Sticky Add to Cart** - Persistent buy button on scroll

---

## Quick Add Button

### React Input
```jsx
function QuickAddButton({ productId, variantId, available }) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await addToCart(variantId, 1);
    setLoading(false);
    openCartDrawer();
  };

  return (
    <button onClick={handleAdd} disabled={!available || loading}>
      {loading ? <Spinner /> : 'Add to Cart'}
    </button>
  );
}
```

### Shopify Snippet
```liquid
{% comment %} snippets/quick-add-button.liquid {% endcomment %}
{%- comment -%}
  Quick add button for single-variant products or variant selector trigger

  Parameters:
  - product: Product object (required)
  - section_id: Parent section ID for form targeting
  - class: Additional CSS classes
{%- endcomment -%}

{%- if product.has_only_default_variant -%}
  {%- comment -%} Single variant - direct add {%- endcomment -%}
  <button
    type="button"
    class="quick-add-btn {{ class }}"
    data-quick-add
    data-variant-id="{{ product.first_available_variant.id }}"
    data-product-title="{{ product.title | escape }}"
    {% unless product.available %}disabled{% endunless %}
  >
    <span class="quick-add-text">
      {%- if product.available -%}
        {{ 'products.product.add_to_cart' | t }}
      {%- else -%}
        {{ 'products.product.sold_out' | t }}
      {%- endif -%}
    </span>
    <span class="quick-add-loading" hidden>
      {% render 'loading-spinner', size: 'small' %}
    </span>
  </button>

{%- else -%}
  {%- comment -%} Multiple variants - open quick view {%- endcomment -%}
  <button
    type="button"
    class="quick-add-btn quick-add-btn--options {{ class }}"
    data-quick-view-trigger
    data-product-url="{{ product.url }}"
    data-product-handle="{{ product.handle }}"
  >
    <span>{{ 'products.product.choose_options' | t }}</span>
  </button>
{%- endif -%}
```

### Quick Add JavaScript
```javascript
// assets/quick-add.js

class QuickAdd {
  constructor() {
    this.buttons = document.querySelectorAll('[data-quick-add]');
    this.bindEvents();
  }

  bindEvents() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAdd(e));
    });

    // Also bind on dynamic content
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-quick-add]');
      if (button && !this.buttons.includes(button)) {
        this.handleAdd(e);
      }
    });
  }

  async handleAdd(event) {
    const button = event.currentTarget;
    const variantId = button.dataset.variantId;
    const productTitle = button.dataset.productTitle;

    // Prevent double clicks
    if (button.classList.contains('is-loading')) return;

    this.setLoading(button, true);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: parseInt(variantId),
            quantity: 1
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Add to cart failed');
      }

      // Success - refresh cart and open drawer
      this.showSuccess(button);

      // Dispatch event for cart drawer to listen
      document.dispatchEvent(new CustomEvent('cart:updated'));

      // Open cart drawer
      if (window.drawerManager) {
        window.drawerManager.open('cart-drawer');
      }

    } catch (error) {
      console.error('Quick add error:', error);
      this.showError(button, error.message);
    } finally {
      this.setLoading(button, false);
    }
  }

  setLoading(button, loading) {
    button.classList.toggle('is-loading', loading);
    button.disabled = loading;

    const text = button.querySelector('.quick-add-text');
    const spinner = button.querySelector('.quick-add-loading');

    if (text) text.hidden = loading;
    if (spinner) spinner.hidden = !loading;
  }

  showSuccess(button) {
    const originalText = button.querySelector('.quick-add-text')?.textContent;
    const textEl = button.querySelector('.quick-add-text');

    if (textEl) {
      textEl.textContent = '✓ Added';
      button.classList.add('is-success');

      setTimeout(() => {
        textEl.textContent = originalText;
        button.classList.remove('is-success');
      }, 2000);
    }
  }

  showError(button, message) {
    // Show error notification
    const notification = document.createElement('div');
    notification.className = 'quick-add-error';
    notification.textContent = message;
    notification.setAttribute('role', 'alert');

    button.parentElement.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new QuickAdd();
});
```

---

## Quick View Modal

### Section Implementation
```liquid
{% comment %} sections/quick-view-modal.liquid {% endcomment %}

<div
  id="quick-view-modal"
  class="modal quick-view-modal"
  data-quick-view-modal
  hidden
>
  <div class="modal-backdrop" data-modal-close></div>

  <div
    class="modal-content"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quick-view-title"
  >
    <button type="button" class="modal-close" data-modal-close aria-label="Close">
      {% render 'icon', icon: 'close' %}
    </button>

    <div class="quick-view-loading" data-quick-view-loading>
      {% render 'loading-spinner', size: 'large' %}
    </div>

    <div class="quick-view-content" data-quick-view-content hidden>
      {%- comment -%} Content injected via JavaScript {%- endcomment -%}
    </div>
  </div>
</div>

<style>
  .modal {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal[hidden] {
    display: none;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    position: relative;
    background: var(--color-background);
    border-radius: 8px;
    max-width: 900px;
    max-height: 90vh;
    width: 100%;
    overflow: hidden;
    animation: scaleIn 0.2s ease-out;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .quick-view-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .quick-view-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-height: 90vh;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    .quick-view-content {
      grid-template-columns: 1fr;
    }
  }
</style>

{% schema %}
{
  "name": "Quick view modal",
  "settings": []
}
{% endschema %}
```

### Quick View Product Template
```liquid
{% comment %} snippets/quick-view-product.liquid {% endcomment %}
{%- comment -%}
  Rendered content for quick view modal
  Fetched via Section Rendering API

  Parameters:
  - product: Product object
{%- endcomment -%}

<div class="quick-view-media">
  {%- if product.featured_media -%}
    <div class="quick-view-image">
      {{ product.featured_media | image_url: width: 800 | image_tag: loading: 'eager' }}
    </div>
  {%- endif -%}

  {%- if product.media.size > 1 -%}
    <div class="quick-view-thumbnails">
      {%- for media in product.media limit: 5 -%}
        <button
          type="button"
          class="quick-view-thumbnail{% if forloop.first %} is-active{% endif %}"
          data-media-index="{{ forloop.index0 }}"
        >
          {{ media | image_url: width: 100 | image_tag }}
        </button>
      {%- endfor -%}
    </div>
  {%- endif -%}
</div>

<div class="quick-view-info">
  <h2 id="quick-view-title" class="quick-view-title">
    <a href="{{ product.url }}">{{ product.title }}</a>
  </h2>

  {%- if product.vendor -%}
    <p class="quick-view-vendor">{{ product.vendor }}</p>
  {%- endif -%}

  <div class="quick-view-price">
    {%- render 'price', product: product -%}
  </div>

  {%- if product.description != blank -%}
    <div class="quick-view-description">
      {{ product.description | strip_html | truncate: 200 }}
    </div>
  {%- endif -%}

  {%- form 'product', product, id: 'quick-view-form', data-quick-view-form: '' -%}
    <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}" data-variant-id>

    {%- unless product.has_only_default_variant -%}
      <div class="quick-view-variants">
        {%- for option in product.options_with_values -%}
          <div class="variant-selector">
            <label class="variant-label" for="quick-view-option-{{ option.name | handle }}">
              {{ option.name }}
            </label>

            {%- if option.name == 'Color' -%}
              <div class="variant-swatches" role="radiogroup">
                {%- for value in option.values -%}
                  <label class="variant-swatch">
                    <input
                      type="radio"
                      name="option-{{ option.name | handle }}"
                      value="{{ value }}"
                      {% if option.selected_value == value %}checked{% endif %}
                      data-option-name="{{ option.name }}"
                    >
                    <span
                      class="variant-swatch-color"
                      style="background-color: {{ value | handle | replace: '-', '' }}"
                      title="{{ value }}"
                    ></span>
                  </label>
                {%- endfor -%}
              </div>
            {%- else -%}
              <select
                id="quick-view-option-{{ option.name | handle }}"
                class="variant-select"
                data-option-name="{{ option.name }}"
              >
                {%- for value in option.values -%}
                  <option
                    value="{{ value }}"
                    {% if option.selected_value == value %}selected{% endif %}
                  >
                    {{ value }}
                  </option>
                {%- endfor -%}
              </select>
            {%- endif -%}
          </div>
        {%- endfor -%}
      </div>
    {%- endunless -%}

    <div class="quick-view-quantity">
      <label for="quick-view-quantity">{{ 'products.product.quantity.label' | t }}</label>
      <div class="quantity-selector">
        <button type="button" class="quantity-btn" data-quantity-minus aria-label="Decrease">
          {% render 'icon', icon: 'minus' %}
        </button>
        <input
          type="number"
          id="quick-view-quantity"
          name="quantity"
          value="1"
          min="1"
          class="quantity-input"
        >
        <button type="button" class="quantity-btn" data-quantity-plus aria-label="Increase">
          {% render 'icon', icon: 'plus' %}
        </button>
      </div>
    </div>

    <button
      type="submit"
      class="btn btn--primary btn--full quick-view-submit"
      {% unless product.available %}disabled{% endunless %}
    >
      <span class="btn-text">
        {%- if product.available -%}
          {{ 'products.product.add_to_cart' | t }}
        {%- else -%}
          {{ 'products.product.sold_out' | t }}
        {%- endif -%}
      </span>
      <span class="btn-loading" hidden>
        {% render 'loading-spinner', size: 'small' %}
      </span>
    </button>
  {%- endform -%}

  <a href="{{ product.url }}" class="quick-view-full-link">
    {{ 'products.product.view_full_details' | t }}
    {% render 'icon', icon: 'arrow-right' %}
  </a>
</div>

<script type="application/json" data-product-json>
  {{ product | json }}
</script>
```

### Quick View JavaScript
```javascript
// assets/quick-view.js

class QuickView {
  constructor() {
    this.modal = document.querySelector('[data-quick-view-modal]');
    this.loading = this.modal?.querySelector('[data-quick-view-loading]');
    this.content = this.modal?.querySelector('[data-quick-view-content]');
    this.currentProduct = null;

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view-trigger]');
      if (trigger) {
        e.preventDefault();
        this.open(trigger.dataset.productUrl || trigger.dataset.productHandle);
      }
    });

    // Close triggers
    this.modal?.querySelectorAll('[data-modal-close]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.hidden) {
        this.close();
      }
    });
  }

  async open(productHandle) {
    if (!this.modal) return;

    // Show modal with loading state
    this.modal.hidden = false;
    this.loading.hidden = false;
    this.content.hidden = true;
    document.body.style.overflow = 'hidden';

    try {
      // Fetch product section
      const url = productHandle.startsWith('/')
        ? `${productHandle}?sections=quick-view-product`
        : `/products/${productHandle}?sections=quick-view-product`;

      const response = await fetch(url);

      if (!response.ok) throw new Error('Product not found');

      const data = await response.json();

      // Inject content
      this.content.innerHTML = data['quick-view-product'];

      // Parse product data
      const productJson = this.content.querySelector('[data-product-json]');
      if (productJson) {
        this.currentProduct = JSON.parse(productJson.textContent);
      }

      // Initialize variant selector
      this.initVariantSelector();

      // Initialize form
      this.initForm();

      // Show content
      this.loading.hidden = true;
      this.content.hidden = false;

      // Focus first interactive element
      const firstFocusable = this.content.querySelector('button, [href], input, select');
      firstFocusable?.focus();

    } catch (error) {
      console.error('Quick view error:', error);
      this.close();
    }
  }

  close() {
    this.modal.hidden = true;
    document.body.style.overflow = '';
    this.currentProduct = null;
  }

  initVariantSelector() {
    if (!this.currentProduct) return;

    const selectors = this.content.querySelectorAll('[data-option-name]');

    selectors.forEach(selector => {
      selector.addEventListener('change', () => {
        this.updateVariant();
      });
    });
  }

  updateVariant() {
    if (!this.currentProduct) return;

    // Get selected options
    const selectedOptions = [];
    this.content.querySelectorAll('[data-option-name]').forEach(selector => {
      if (selector.type === 'radio') {
        if (selector.checked) {
          selectedOptions.push(selector.value);
        }
      } else {
        selectedOptions.push(selector.value);
      }
    });

    // Find matching variant
    const variant = this.currentProduct.variants.find(v => {
      return v.options.every((opt, i) => opt === selectedOptions[i]);
    });

    if (variant) {
      // Update hidden input
      const variantInput = this.content.querySelector('[data-variant-id]');
      if (variantInput) {
        variantInput.value = variant.id;
      }

      // Update button state
      const submitBtn = this.content.querySelector('.quick-view-submit');
      const btnText = submitBtn?.querySelector('.btn-text');

      if (variant.available) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Add to cart';
      } else {
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sold out';
      }

      // Update price if displayed
      // ... price update logic
    }
  }

  initForm() {
    const form = this.content.querySelector('[data-quick-view-form]');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');

      submitBtn.disabled = true;
      if (btnText) btnText.hidden = true;
      if (btnLoading) btnLoading.hidden = false;

      try {
        const formData = new FormData(form);

        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Add to cart failed');

        // Success
        this.close();
        document.dispatchEvent(new CustomEvent('cart:updated'));

        if (window.drawerManager) {
          window.drawerManager.open('cart-drawer');
        }

      } catch (error) {
        console.error('Quick view form error:', error);
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnLoading) btnLoading.hidden = true;
      }
    });

    // Quantity buttons
    const quantityInput = form.querySelector('.quantity-input');

    form.querySelector('[data-quantity-minus]')?.addEventListener('click', () => {
      quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
    });

    form.querySelector('[data-quantity-plus]')?.addEventListener('click', () => {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new QuickView();
});
```

---

## Sticky Add to Cart

### Implementation
```liquid
{% comment %} snippets/sticky-add-to-cart.liquid {% endcomment %}
{%- comment -%}
  Sticky bar that appears when main add-to-cart scrolls out of view
{%- endcomment -%}

<div
  class="sticky-atc"
  data-sticky-atc
  hidden
>
  <div class="sticky-atc-container">
    <div class="sticky-atc-product">
      {%- if product.featured_image -%}
        <div class="sticky-atc-image">
          {{ product.featured_image | image_url: width: 80 | image_tag }}
        </div>
      {%- endif -%}
      <div class="sticky-atc-info">
        <h3 class="sticky-atc-title">{{ product.title }}</h3>
        <div class="sticky-atc-price">
          {%- render 'price', product: product -%}
        </div>
      </div>
    </div>

    <div class="sticky-atc-actions">
      {%- if product.has_only_default_variant -%}
        <button
          type="button"
          class="btn btn--primary sticky-atc-button"
          data-quick-add
          data-variant-id="{{ product.selected_or_first_available_variant.id }}"
          {% unless product.available %}disabled{% endunless %}
        >
          {%- if product.available -%}
            {{ 'products.product.add_to_cart' | t }} - {{ product.price | money }}
          {%- else -%}
            {{ 'products.product.sold_out' | t }}
          {%- endif -%}
        </button>
      {%- else -%}
        <a href="#product-form" class="btn btn--primary sticky-atc-button">
          {{ 'products.product.select_options' | t }}
        </a>
      {%- endif -%}
    </div>
  </div>
</div>

<style>
  .sticky-atc {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(100%);
    transition: transform 0.3s ease-out;
  }

  .sticky-atc.is-visible {
    transform: translateY(0);
  }

  .sticky-atc[hidden] {
    display: block; /* Override hidden for animation */
  }

  .sticky-atc-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.75rem 1rem;
  }

  .sticky-atc-product {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .sticky-atc-image {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .sticky-atc-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .sticky-atc-title {
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  .sticky-atc-price {
    font-size: 0.875rem;
  }

  .sticky-atc-button {
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .sticky-atc-info {
      display: none;
    }

    .sticky-atc-button {
      flex: 1;
    }
  }
</style>

<script>
  (function() {
    const stickyBar = document.querySelector('[data-sticky-atc]');
    const productForm = document.querySelector('[data-product-form]');

    if (!stickyBar || !productForm) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stickyBar.classList.remove('is-visible');
        } else {
          stickyBar.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-100px 0px 0px 0px'
    });

    observer.observe(productForm);
  })();
</script>
```

---

## CSS Styles

```css
/* assets/quick-add.css */

/* Quick Add Button */
.quick-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.quick-add-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.quick-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-add-btn.is-loading {
  pointer-events: none;
}

.quick-add-btn.is-success {
  background: var(--color-success, #16a34a);
}

.quick-add-btn--options {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Quick View Modal Content */
.quick-view-media {
  position: relative;
  background: var(--color-background-secondary);
}

.quick-view-image img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.quick-view-thumbnails {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.quick-view-thumbnail {
  width: 60px;
  height: 60px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.quick-view-thumbnail.is-active,
.quick-view-thumbnail:hover {
  border-color: var(--color-primary);
}

.quick-view-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-view-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-view-title {
  font-size: 1.5rem;
  margin: 0;
}

.quick-view-title a {
  color: inherit;
  text-decoration: none;
}

.quick-view-title a:hover {
  text-decoration: underline;
}

.quick-view-vendor {
  color: var(--color-text-muted);
  margin: 0;
}

.quick-view-price {
  font-size: 1.25rem;
  font-weight: 600;
}

.quick-view-description {
  color: var(--color-text-muted);
  line-height: 1.6;
}

.quick-view-variants {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variant-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variant-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.variant-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-swatch {
  position: relative;
  cursor: pointer;
}

.variant-swatch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.variant-swatch-color {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  transition: border-color 0.2s;
}

.variant-swatch input:checked + .variant-swatch-color {
  border-color: var(--color-primary);
}

.variant-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
}

.quick-view-quantity {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-selector {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  width: fit-content;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}

.quantity-btn:hover {
  background: var(--color-background-secondary);
}

.quantity-input {
  width: 60px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  font-size: 1rem;
}

.quick-view-submit {
  margin-top: 1rem;
}

.quick-view-full-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  margin-top: auto;
}

.quick-view-full-link:hover {
  text-decoration: underline;
}
```

---

## Integration with Product Cards

```liquid
{% comment %} Example product card with quick add {% endcomment %}

<div class="product-card">
  <a href="{{ product.url }}" class="product-card-media">
    {{ product.featured_image | image_url: width: 600 | image_tag }}
  </a>

  <div class="product-card-info">
    <h3 class="product-card-title">
      <a href="{{ product.url }}">{{ product.title }}</a>
    </h3>
    {% render 'price', product: product %}
  </div>

  <div class="product-card-actions">
    {% render 'quick-add-button', product: product %}
  </div>
</div>
```

---

## Accessibility Considerations

| Pattern | Requirement | Implementation |
|---------|-------------|----------------|
| Quick Add Button | Loading state announced | `aria-live="polite"` on status |
| Quick View Modal | Focus trap | Tab cycling within modal |
| Variant Selection | Group labeling | `role="radiogroup"` with labels |
| Form Submission | Error handling | `role="alert"` on errors |
| Keyboard | Full navigation | Enter/Space to activate |

---

## Performance Tips

1. **Lazy load Quick View content** - Don't prefetch until user hovers
2. **Cache product JSON** - Store in sessionStorage for repeat views
3. **Optimize images** - Use appropriate sizes for modal vs thumbnail
4. **Debounce variant changes** - Prevent rapid API calls
5. **Use Section Rendering API** - Fetch only needed HTML, not full page
