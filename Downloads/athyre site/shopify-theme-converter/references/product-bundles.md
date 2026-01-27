# Product Bundles

Complete implementation patterns for displaying and selling product bundles in Shopify themes.

---

## Overview

Product bundles allow merchants to sell multiple products together at a discounted price. This guide covers bundle display, pricing calculations, and add-all-to-cart functionality.

---

## Metafield Structure

### Bundle Configuration Metafield

Store bundle data in a product metafield:

```
Namespace: custom
Key: bundle_items
Type: list.product_reference
```

Additional metafields for bundle settings:

```
Namespace: custom
Key: bundle_discount_type
Type: single_line_text_field
Value: "percentage" | "fixed" | "fixed_price"

Namespace: custom
Key: bundle_discount_value
Type: number_decimal
Value: 15.00 (15% off or $15 off or $99.99 total)
```

---

## Bundle Section

### sections/product-bundle.liquid

```liquid
{{ 'section-bundle.css' | asset_url | stylesheet_tag }}

{%- assign bundle_items = product.metafields.custom.bundle_items.value -%}
{%- assign discount_type = product.metafields.custom.bundle_discount_type.value | default: 'percentage' -%}
{%- assign discount_value = product.metafields.custom.bundle_discount_value.value | default: 0 -%}

<div class="bundle-section" data-section-id="{{ section.id }}">
  <div class="page-width">
    {%- if section.settings.show_heading -%}
      <h2 class="bundle-heading {{ section.settings.heading_size }}">
        {{ section.settings.heading | default: product.title }}
      </h2>
    {%- endif -%}

    {%- if bundle_items != blank and bundle_items.size > 0 -%}
      <div class="bundle-container">
        <div class="bundle-items">
          {%- assign original_total = 0 -%}

          {%- for bundle_product in bundle_items -%}
            {%- assign original_total = original_total | plus: bundle_product.price -%}
            {%- render 'bundle-item',
                product: bundle_product,
                index: forloop.index,
                show_quantity: section.settings.show_quantity,
                show_toggle: section.settings.allow_item_toggle
            -%}

            {%- unless forloop.last -%}
              <div class="bundle-plus">
                <span>+</span>
              </div>
            {%- endunless -%}
          {%- endfor -%}
        </div>

        {%- comment -%} Calculate bundle price {%- endcomment -%}
        {%- case discount_type -%}
          {%- when 'percentage' -%}
            {%- assign discount_multiplier = 100 | minus: discount_value | divided_by: 100.0 -%}
            {%- assign bundle_price = original_total | times: discount_multiplier -%}
            {%- assign savings = original_total | minus: bundle_price -%}
          {%- when 'fixed' -%}
            {%- assign savings = discount_value | times: 100 -%}
            {%- assign bundle_price = original_total | minus: savings -%}
          {%- when 'fixed_price' -%}
            {%- assign bundle_price = discount_value | times: 100 -%}
            {%- assign savings = original_total | minus: bundle_price -%}
        {%- endcase -%}

        <div class="bundle-summary">
          <div class="bundle-pricing">
            {%- if savings > 0 -%}
              <div class="bundle-original-price">
                <span class="visually-hidden">{{ 'products.product.regular_price' | t }}</span>
                <s>{{ original_total | money }}</s>
              </div>
            {%- endif -%}

            <div class="bundle-price">
              <span class="visually-hidden">{{ 'products.product.sale_price' | t }}</span>
              {{ bundle_price | money }}
            </div>

            {%- if savings > 0 -%}
              <div class="bundle-savings">
                {{ 'products.bundle.save' | t: amount: savings | money }}
              </div>
            {%- endif -%}
          </div>

          <bundle-add-to-cart class="bundle-add-to-cart">
            <form action="/cart/add" method="post">
              {%- for bundle_product in bundle_items -%}
                <input
                  type="hidden"
                  name="items[][id]"
                  value="{{ bundle_product.selected_or_first_available_variant.id }}"
                  data-bundle-item="{{ forloop.index }}"
                >
                <input
                  type="hidden"
                  name="items[][quantity]"
                  value="1"
                  data-bundle-quantity="{{ forloop.index }}"
                >
                {%- comment -%} Add bundle identifier as line item property {%- endcomment -%}
                <input
                  type="hidden"
                  name="items[][properties][_bundle_id]"
                  value="{{ product.id }}"
                >
                <input
                  type="hidden"
                  name="items[][properties][Bundle]"
                  value="{{ product.title }}"
                >
              {%- endfor -%}

              <button
                type="submit"
                class="bundle-submit button button--primary"
                {% if bundle_items.size == 0 %}disabled{% endif %}
              >
                <span class="bundle-submit-text">
                  {{ section.settings.button_text | default: 'Add Bundle to Cart' }}
                </span>
                <span class="bundle-submit-loading hidden">
                  {% render 'loading-spinner' %}
                </span>
              </button>
            </form>
          </bundle-add-to-cart>
        </div>
      </div>
    {%- else -%}
      <p class="bundle-empty">{{ 'products.bundle.no_items' | t }}</p>
    {%- endif -%}
  </div>
</div>

<script src="{{ 'bundle-add-to-cart.js' | asset_url }}" defer="defer"></script>

{% schema %}
{
  "name": "Product Bundle",
  "tag": "section",
  "class": "section-bundle",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_heading",
      "label": "Show heading",
      "default": true
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Bundle & Save"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h3", "label": "Small" },
        { "value": "h2", "label": "Medium" },
        { "value": "h1", "label": "Large" }
      ],
      "default": "h2"
    },
    {
      "type": "checkbox",
      "id": "show_quantity",
      "label": "Show quantity selectors",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "allow_item_toggle",
      "label": "Allow removing items from bundle",
      "default": false,
      "info": "Lets customers customize which items to include"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button text",
      "default": "Add Bundle to Cart"
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Layout",
      "options": [
        { "value": "horizontal", "label": "Horizontal" },
        { "value": "vertical", "label": "Vertical" },
        { "value": "grid", "label": "Grid" }
      ],
      "default": "horizontal"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "label": "Padding top",
      "default": 36
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "label": "Padding bottom",
      "default": 36
    }
  ],
  "templates": ["product"],
  "presets": [
    {
      "name": "Product Bundle"
    }
  ]
}
{% endschema %}
```

---

## Bundle Item Snippet

### snippets/bundle-item.liquid

```liquid
{%- comment -%}
  Bundle Item

  Accepts:
  - product: {Product} Bundle item product
  - index: {Number} Item index
  - show_quantity: {Boolean} Show quantity selector
  - show_toggle: {Boolean} Show include/exclude toggle
{%- endcomment -%}

{%- assign current_variant = product.selected_or_first_available_variant -%}

<div
  class="bundle-item{% unless show_toggle %} bundle-item--no-toggle{% endunless %}"
  data-bundle-item-index="{{ index }}"
  data-product-id="{{ product.id }}"
>
  {%- if show_toggle -%}
    <div class="bundle-item-toggle">
      <input
        type="checkbox"
        id="bundle-toggle-{{ product.id }}"
        class="bundle-toggle-input"
        checked
        data-bundle-toggle="{{ index }}"
      >
      <label for="bundle-toggle-{{ product.id }}" class="bundle-toggle-label">
        <span class="visually-hidden">
          {{ 'products.bundle.include_item' | t: title: product.title }}
        </span>
      </label>
    </div>
  {%- endif -%}

  <div class="bundle-item-image">
    {%- if product.featured_image != blank -%}
      <img
        src="{{ product.featured_image | image_url: width: 200 }}"
        srcset="{{ product.featured_image | image_url: width: 100 }} 100w,
                {{ product.featured_image | image_url: width: 200 }} 200w,
                {{ product.featured_image | image_url: width: 300 }} 300w"
        sizes="(min-width: 750px) 150px, 100px"
        alt="{{ product.featured_image.alt | escape }}"
        width="150"
        height="{{ 150 | divided_by: product.featured_image.aspect_ratio | round }}"
        loading="lazy"
      >
    {%- else -%}
      {{ 'product-1' | placeholder_svg_tag: 'bundle-item-placeholder' }}
    {%- endif -%}
  </div>

  <div class="bundle-item-details">
    <h3 class="bundle-item-title">
      <a href="{{ product.url }}">{{ product.title }}</a>
    </h3>

    {%- if product.variants.size > 1 -%}
      <div class="bundle-item-variant">
        <select
          class="bundle-variant-select"
          data-bundle-variant="{{ index }}"
          data-product-url="{{ product.url }}"
          aria-label="{{ 'products.product.variant' | t }}"
        >
          {%- for variant in product.variants -%}
            <option
              value="{{ variant.id }}"
              data-price="{{ variant.price }}"
              {% if variant == current_variant %}selected{% endif %}
              {% unless variant.available %}disabled{% endunless %}
            >
              {{ variant.title }}
              {%- unless variant.available %} - {{ 'products.product.sold_out' | t }}{% endunless %}
            </option>
          {%- endfor -%}
        </select>
      </div>
    {%- endif -%}

    <div class="bundle-item-price">
      {%- if current_variant.compare_at_price > current_variant.price -%}
        <s class="bundle-item-compare-price">{{ current_variant.compare_at_price | money }}</s>
      {%- endif -%}
      <span class="bundle-item-current-price" data-bundle-price="{{ index }}">
        {{ current_variant.price | money }}
      </span>
    </div>

    {%- if show_quantity -%}
      <div class="bundle-item-quantity">
        <label for="bundle-qty-{{ product.id }}" class="visually-hidden">
          {{ 'products.product.quantity.label' | t }}
        </label>
        <div class="quantity-input">
          <button
            type="button"
            class="quantity-button quantity-minus"
            data-bundle-qty-minus="{{ index }}"
            aria-label="{{ 'products.product.quantity.decrease' | t }}"
          >
            {% render 'icon', icon: 'minus' %}
          </button>
          <input
            type="number"
            id="bundle-qty-{{ product.id }}"
            class="quantity-value"
            value="1"
            min="1"
            max="{{ current_variant.inventory_quantity | default: 99 }}"
            data-bundle-qty-input="{{ index }}"
          >
          <button
            type="button"
            class="quantity-button quantity-plus"
            data-bundle-qty-plus="{{ index }}"
            aria-label="{{ 'products.product.quantity.increase' | t }}"
          >
            {% render 'icon', icon: 'plus' %}
          </button>
        </div>
      </div>
    {%- endif -%}
  </div>
</div>
```

---

## JavaScript Component

### assets/bundle-add-to-cart.js

```javascript
class BundleAddToCart extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('.bundle-submit');
    this.section = this.closest('[data-section-id]');

    this.init();
  }

  init() {
    // Form submission
    this.form.addEventListener('submit', this.onSubmit.bind(this));

    // Variant selectors
    this.section.querySelectorAll('.bundle-variant-select').forEach(select => {
      select.addEventListener('change', this.onVariantChange.bind(this));
    });

    // Toggle switches
    this.section.querySelectorAll('.bundle-toggle-input').forEach(toggle => {
      toggle.addEventListener('change', this.onToggleChange.bind(this));
    });

    // Quantity buttons
    this.section.querySelectorAll('[data-bundle-qty-minus]').forEach(btn => {
      btn.addEventListener('click', (e) => this.adjustQuantity(e, -1));
    });

    this.section.querySelectorAll('[data-bundle-qty-plus]').forEach(btn => {
      btn.addEventListener('click', (e) => this.adjustQuantity(e, 1));
    });

    this.section.querySelectorAll('[data-bundle-qty-input]').forEach(input => {
      input.addEventListener('change', this.onQuantityChange.bind(this));
    });
  }

  async onSubmit(event) {
    event.preventDefault();

    if (this.submitButton.disabled) return;

    this.setLoading(true);

    // Build items array from enabled bundle items
    const items = [];
    const formData = new FormData(this.form);
    const ids = formData.getAll('items[][id]');
    const quantities = formData.getAll('items[][quantity]');
    const bundleIds = formData.getAll('items[][properties][_bundle_id]');
    const bundleNames = formData.getAll('items[][properties][Bundle]');

    for (let i = 0; i < ids.length; i++) {
      const itemElement = this.section.querySelector(`[data-bundle-item-index="${i + 1}"]`);
      const toggle = itemElement?.querySelector('.bundle-toggle-input');

      // Skip if toggle exists and is unchecked
      if (toggle && !toggle.checked) continue;

      items.push({
        id: parseInt(ids[i]),
        quantity: parseInt(quantities[i]) || 1,
        properties: {
          '_bundle_id': bundleIds[i],
          'Bundle': bundleNames[i]
        }
      });
    }

    if (items.length === 0) {
      this.setLoading(false);
      return;
    }

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Failed to add to cart');
      }

      const result = await response.json();

      // Dispatch event for cart drawer/notification
      document.dispatchEvent(new CustomEvent('cart:items-added', {
        detail: { items: result.items }
      }));

      // Update cart count
      this.updateCartCount();

    } catch (error) {
      console.error('Bundle add to cart error:', error);
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  onVariantChange(event) {
    const select = event.target;
    const index = select.dataset.bundleVariant;
    const variantId = select.value;
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.dataset.price;

    // Update hidden input
    const hiddenInput = this.form.querySelector(`[data-bundle-item="${index}"]`);
    if (hiddenInput) {
      hiddenInput.value = variantId;
    }

    // Update displayed price
    const priceElement = this.section.querySelector(`[data-bundle-price="${index}"]`);
    if (priceElement && price) {
      priceElement.textContent = Shopify.formatMoney(price);
    }

    // Recalculate bundle total
    this.recalculateTotal();
  }

  onToggleChange(event) {
    const toggle = event.target;
    const index = toggle.dataset.bundleToggle;
    const itemElement = this.section.querySelector(`[data-bundle-item-index="${index}"]`);

    if (itemElement) {
      itemElement.classList.toggle('bundle-item--excluded', !toggle.checked);
    }

    // Recalculate bundle total
    this.recalculateTotal();

    // Check if any items are still selected
    const anyChecked = Array.from(this.section.querySelectorAll('.bundle-toggle-input'))
      .some(t => t.checked);

    this.submitButton.disabled = !anyChecked;
  }

  adjustQuantity(event, delta) {
    const button = event.target.closest('button');
    const index = button.dataset.bundleQtyMinus || button.dataset.bundleQtyPlus;
    const input = this.section.querySelector(`[data-bundle-qty-input="${index}"]`);

    if (input) {
      const currentValue = parseInt(input.value) || 1;
      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 99;
      const newValue = Math.max(min, Math.min(max, currentValue + delta));

      input.value = newValue;
      this.updateQuantityInput(index, newValue);
    }
  }

  onQuantityChange(event) {
    const input = event.target;
    const index = input.dataset.bundleQtyInput;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 99;
    let value = parseInt(input.value) || 1;

    value = Math.max(min, Math.min(max, value));
    input.value = value;

    this.updateQuantityInput(index, value);
  }

  updateQuantityInput(index, quantity) {
    const hiddenInput = this.form.querySelector(`[data-bundle-quantity="${index}"]`);
    if (hiddenInput) {
      hiddenInput.value = quantity;
    }

    this.recalculateTotal();
  }

  recalculateTotal() {
    let total = 0;

    this.section.querySelectorAll('[data-bundle-item-index]').forEach(item => {
      const index = item.dataset.bundleItemIndex;
      const toggle = item.querySelector('.bundle-toggle-input');

      // Skip excluded items
      if (toggle && !toggle.checked) return;

      const priceElement = item.querySelector('[data-bundle-price]');
      const quantityInput = item.querySelector('[data-bundle-qty-input]');

      if (priceElement) {
        const priceText = priceElement.textContent;
        const price = this.parsePrice(priceText);
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        total += price * quantity;
      }
    });

    // Apply bundle discount
    // Note: This is a simplified calculation. In production,
    // you'd want to get the discount from the server or metafields
    const bundlePriceElement = this.section.querySelector('.bundle-price');
    const originalPriceElement = this.section.querySelector('.bundle-original-price s');
    const savingsElement = this.section.querySelector('.bundle-savings');

    if (originalPriceElement) {
      originalPriceElement.textContent = Shopify.formatMoney(total);
    }

    // Dispatch event for external price calculation
    this.dispatchEvent(new CustomEvent('bundle:recalculate', {
      detail: { originalTotal: total }
    }));
  }

  parsePrice(priceString) {
    // Remove currency symbol and parse
    return parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
        el.classList.toggle('hidden', cart.item_count === 0);
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }

  setLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.querySelector('.bundle-submit-text').classList.toggle('hidden', loading);
    this.submitButton.querySelector('.bundle-submit-loading').classList.toggle('hidden', !loading);
  }

  showError(message) {
    // Show error notification
    const errorEvent = new CustomEvent('cart:error', {
      detail: { message }
    });
    document.dispatchEvent(errorEvent);
  }
}

customElements.define('bundle-add-to-cart', BundleAddToCart);
```

---

## CSS Styles

### assets/section-bundle.css

```css
.bundle-section {
  padding-top: var(--section-padding-top);
  padding-bottom: var(--section-padding-bottom);
}

.bundle-heading {
  text-align: center;
  margin-bottom: 2rem;
}

.bundle-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Bundle Items Layout */
.bundle-items {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.bundle-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--color-foreground);
  opacity: 0.5;
}

/* Individual Bundle Item */
.bundle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 180px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.bundle-item--excluded {
  opacity: 0.4;
  transform: scale(0.95);
}

.bundle-item--excluded .bundle-item-details {
  text-decoration: line-through;
}

/* Toggle Switch */
.bundle-item-toggle {
  align-self: flex-end;
  margin-bottom: 0.5rem;
}

.bundle-toggle-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

/* Item Image */
.bundle-item-image {
  width: 100px;
  height: 100px;
  margin-bottom: 0.75rem;
}

.bundle-item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bundle-item-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-background-alt);
}

/* Item Details */
.bundle-item-details {
  width: 100%;
}

.bundle-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.bundle-item-title a {
  color: inherit;
  text-decoration: none;
}

.bundle-item-title a:hover {
  text-decoration: underline;
}

/* Variant Select */
.bundle-item-variant {
  margin-bottom: 0.5rem;
}

.bundle-variant-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
}

/* Item Price */
.bundle-item-price {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.bundle-item-compare-price {
  color: var(--color-foreground-muted);
  margin-right: 0.25rem;
}

.bundle-item-current-price {
  font-weight: 600;
}

/* Quantity Input */
.bundle-item-quantity {
  margin-top: 0.5rem;
}

.bundle-item-quantity .quantity-input {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

.bundle-item-quantity .quantity-button {
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-foreground);
}

.bundle-item-quantity .quantity-button:hover {
  background: var(--color-background-alt);
}

.bundle-item-quantity .quantity-value {
  width: 2.5rem;
  text-align: center;
  border: none;
  font-size: 0.875rem;
  -moz-appearance: textfield;
}

.bundle-item-quantity .quantity-value::-webkit-inner-spin-button,
.bundle-item-quantity .quantity-value::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* Bundle Summary */
.bundle-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.bundle-pricing {
  text-align: center;
}

.bundle-original-price {
  font-size: 1rem;
  color: var(--color-foreground-muted);
  margin-bottom: 0.25rem;
}

.bundle-price {
  font-size: 1.75rem;
  font-weight: 700;
}

.bundle-savings {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--color-sale);
  color: var(--color-sale-contrast);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 1rem;
}

/* Add to Cart Button */
.bundle-add-to-cart {
  width: 100%;
  max-width: 300px;
}

.bundle-submit {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1rem;
}

.bundle-submit-loading.hidden,
.bundle-submit-text.hidden {
  display: none;
}

/* Empty State */
.bundle-empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-foreground-muted);
}

/* Layout Variations */

/* Vertical Layout */
.bundle-section[data-layout="vertical"] .bundle-items {
  flex-direction: column;
}

.bundle-section[data-layout="vertical"] .bundle-plus {
  transform: rotate(90deg);
}

.bundle-section[data-layout="vertical"] .bundle-item {
  max-width: 100%;
  width: 100%;
  flex-direction: row;
  text-align: left;
  padding: 0.75rem;
}

.bundle-section[data-layout="vertical"] .bundle-item-image {
  width: 80px;
  height: 80px;
  margin-bottom: 0;
  margin-right: 1rem;
  flex-shrink: 0;
}

.bundle-section[data-layout="vertical"] .bundle-item-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  margin: 0;
}

.bundle-section[data-layout="vertical"] .bundle-item {
  position: relative;
}

/* Grid Layout */
.bundle-section[data-layout="grid"] .bundle-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.bundle-section[data-layout="grid"] .bundle-plus {
  display: none;
}

.bundle-section[data-layout="grid"] .bundle-item {
  max-width: none;
}

/* Responsive */
@media screen and (max-width: 749px) {
  .bundle-items {
    flex-direction: column;
  }

  .bundle-plus {
    transform: rotate(90deg);
  }

  .bundle-item {
    max-width: 100%;
    width: 100%;
    flex-direction: row;
    text-align: left;
    padding: 0.75rem;
  }

  .bundle-item-image {
    width: 80px;
    height: 80px;
    margin-bottom: 0;
    margin-right: 1rem;
    flex-shrink: 0;
  }

  .bundle-item-toggle {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    margin: 0;
  }

  .bundle-item {
    position: relative;
  }
}
```

---

## Cart Display for Bundles

### snippets/cart-bundle-group.liquid

Group bundle items visually in the cart:

```liquid
{%- comment -%}
  Cart Bundle Group
  Groups items that belong to the same bundle

  Accepts:
  - items: {Array} Cart items
{%- endcomment -%}

{%- assign bundle_groups = '' -%}
{%- assign standalone_items = '' -%}

{%- for item in items -%}
  {%- assign bundle_id = item.properties['_bundle_id'] -%}

  {%- if bundle_id != blank -%}
    {%- capture bundle_item -%}
      {{ item.key }}|{{ bundle_id }},
    {%- endcapture -%}
    {%- assign bundle_groups = bundle_groups | append: bundle_item -%}
  {%- else -%}
    {%- capture standalone -%}
      {{ item.key }},
    {%- endcapture -%}
    {%- assign standalone_items = standalone_items | append: standalone -%}
  {%- endif -%}
{%- endfor -%}

{%- comment -%} Render standalone items {%- endcomment -%}
{%- assign standalone_keys = standalone_items | split: ',' | compact -%}
{%- for key in standalone_keys -%}
  {%- for item in items -%}
    {%- if item.key == key -%}
      {% render 'cart-item', item: item %}
    {%- endif -%}
  {%- endfor -%}
{%- endfor -%}

{%- comment -%} Render bundle groups {%- endcomment -%}
{%- assign bundle_entries = bundle_groups | split: ',' | compact -%}
{%- assign processed_bundles = '' -%}

{%- for entry in bundle_entries -%}
  {%- assign parts = entry | split: '|' -%}
  {%- assign bundle_id = parts[1] -%}

  {%- unless processed_bundles contains bundle_id -%}
    {%- capture processed -%}{{ bundle_id }},{% endcapture -%}
    {%- assign processed_bundles = processed_bundles | append: processed -%}

    <div class="cart-bundle-group" data-bundle-id="{{ bundle_id }}">
      <div class="cart-bundle-header">
        {%- for item in items -%}
          {%- if item.properties['_bundle_id'] == bundle_id -%}
            <span class="cart-bundle-name">{{ item.properties['Bundle'] }}</span>
            {%- break -%}
          {%- endif -%}
        {%- endfor -%}
        <span class="cart-bundle-badge">{{ 'cart.bundle' | t }}</span>
      </div>

      <div class="cart-bundle-items">
        {%- for item in items -%}
          {%- if item.properties['_bundle_id'] == bundle_id -%}
            {% render 'cart-item', item: item, is_bundle_item: true %}
          {%- endif -%}
        {%- endfor -%}
      </div>
    </div>
  {%- endunless -%}
{%- endfor -%}
```

---

## Frequently Bought Together Pattern

### sections/frequently-bought-together.liquid

Alternative pattern for dynamic bundles:

```liquid
{%- assign fbt_products = product.metafields.custom.frequently_bought_together.value -%}

{%- if fbt_products != blank and fbt_products.size > 0 -%}
  <div class="fbt-section" data-section-id="{{ section.id }}">
    <div class="page-width">
      <h2 class="fbt-heading">{{ section.settings.heading }}</h2>

      <div class="fbt-container">
        <div class="fbt-main-product">
          <div class="fbt-checkbox">
            <input
              type="checkbox"
              id="fbt-main"
              checked
              disabled
              data-fbt-item="main"
              data-price="{{ product.selected_or_first_available_variant.price }}"
              data-variant-id="{{ product.selected_or_first_available_variant.id }}"
            >
            <label for="fbt-main">{{ 'products.fbt.this_item' | t }}</label>
          </div>
          <div class="fbt-product-info">
            <span class="fbt-product-title">{{ product.title }}</span>
            <span class="fbt-product-price">{{ product.selected_or_first_available_variant.price | money }}</span>
          </div>
        </div>

        {%- for fbt_product in fbt_products limit: 3 -%}
          <div class="fbt-product">
            <div class="fbt-checkbox">
              <input
                type="checkbox"
                id="fbt-{{ fbt_product.id }}"
                checked
                data-fbt-item="{{ fbt_product.id }}"
                data-price="{{ fbt_product.selected_or_first_available_variant.price }}"
                data-variant-id="{{ fbt_product.selected_or_first_available_variant.id }}"
              >
              <label for="fbt-{{ fbt_product.id }}">
                <img
                  src="{{ fbt_product.featured_image | image_url: width: 80 }}"
                  alt="{{ fbt_product.featured_image.alt | escape }}"
                  width="60"
                  height="60"
                  loading="lazy"
                >
              </label>
            </div>
            <div class="fbt-product-info">
              <a href="{{ fbt_product.url }}" class="fbt-product-title">{{ fbt_product.title }}</a>
              <span class="fbt-product-price">{{ fbt_product.selected_or_first_available_variant.price | money }}</span>
            </div>
          </div>
        {%- endfor -%}

        <div class="fbt-summary">
          <div class="fbt-total">
            <span class="fbt-total-label">{{ 'products.fbt.total' | t }}:</span>
            <span class="fbt-total-price" data-fbt-total></span>
          </div>
          <button
            type="button"
            class="fbt-add-all button button--primary"
            data-fbt-add-all
          >
            {{ 'products.fbt.add_selected' | t }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const section = document.querySelector('[data-section-id="{{ section.id }}"]');
      const checkboxes = section.querySelectorAll('[data-fbt-item]');
      const totalElement = section.querySelector('[data-fbt-total]');
      const addAllButton = section.querySelector('[data-fbt-add-all]');

      function updateTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
          if (cb.checked) {
            total += parseInt(cb.dataset.price);
          }
        });
        totalElement.textContent = Shopify.formatMoney(total);
      }

      checkboxes.forEach(cb => {
        cb.addEventListener('change', updateTotal);
      });

      addAllButton.addEventListener('click', async function() {
        const items = [];
        checkboxes.forEach(cb => {
          if (cb.checked) {
            items.push({
              id: parseInt(cb.dataset.variantId),
              quantity: 1
            });
          }
        });

        if (items.length === 0) return;

        try {
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });

          document.dispatchEvent(new CustomEvent('cart:items-added'));
        } catch (error) {
          console.error('Failed to add items:', error);
        }
      });

      updateTotal();
    });
  </script>
{%- endif -%}

{% schema %}
{
  "name": "Frequently Bought Together",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Frequently Bought Together"
    }
  ],
  "templates": ["product"],
  "presets": [
    {
      "name": "Frequently Bought Together"
    }
  ]
}
{% endschema %}
```

---

## Locales

### locales/en.default.json

```json
{
  "products": {
    "bundle": {
      "save": "Save {{ amount }}",
      "no_items": "This bundle has no items configured.",
      "include_item": "Include {{ title }} in bundle",
      "add_to_bundle": "Add to bundle"
    },
    "fbt": {
      "this_item": "This item",
      "total": "Total price",
      "add_selected": "Add Selected to Cart"
    }
  },
  "cart": {
    "bundle": "Bundle"
  }
}
```

---

## Best Practices

### 1. Bundle Inventory Management

Check all bundle items have stock before allowing add to cart:

```liquid
{%- assign bundle_available = true -%}
{%- for bundle_product in bundle_items -%}
  {%- unless bundle_product.available -%}
    {%- assign bundle_available = false -%}
    {%- break -%}
  {%- endunless -%}
{%- endfor -%}

<button
  type="submit"
  class="bundle-submit"
  {% unless bundle_available %}disabled{% endunless %}
>
  {%- if bundle_available -%}
    Add Bundle to Cart
  {%- else -%}
    Bundle Unavailable
  {%- endif -%}
</button>
```

### 2. Bundle Discount Display

Show clear savings messaging:

```liquid
{%- if savings > 0 -%}
  {%- assign savings_percent = savings | times: 100 | divided_by: original_total | round -%}
  <div class="bundle-value-proposition">
    <span class="bundle-discount-badge">{{ savings_percent }}% OFF</span>
    <span class="bundle-savings-amount">You save {{ savings | money }}</span>
  </div>
{%- endif -%}
```

### 3. Line Item Properties

Use underscore prefix for hidden properties:

```liquid
{%- comment -%}
  Properties starting with _ are hidden from customers
  but visible to merchants in order management
{%- endcomment -%}
<input type="hidden" name="properties[_bundle_id]" value="{{ product.id }}">
<input type="hidden" name="properties[_bundle_sku]" value="{{ product.variants.first.sku }}">

{%- comment -%} Visible property {%- endcomment -%}
<input type="hidden" name="properties[Bundle]" value="{{ product.title }}">
```

### 4. Bundle Validation

Validate bundle structure on the server with cart transform or checkout validation app.

---

## Integration with Apps

For complex bundle functionality, consider integrating with bundle apps:

- **Shopify Bundles** (native app)
- **Bold Bundles**
- **Bundler**
- **Wide Bundles**

These apps handle:
- Automatic inventory deduction
- Bundle-specific pricing rules
- Subscription bundles
- Mix-and-match bundles
- Volume discounts
