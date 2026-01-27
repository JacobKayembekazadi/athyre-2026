# B2B & Wholesale Features

Implementation patterns for wholesale, tiered pricing, and B2B commerce in Shopify themes.

---

## Overview

B2B and wholesale functionality allows merchants to offer different pricing, quantities, and experiences for business customers. This guide covers customer tag-based pricing, tiered pricing displays, minimum order quantities, quick order forms, and customer-specific catalogs.

---

## Customer Tag-Based Pricing

### Detecting Wholesale Customers

```liquid
{%- comment -%}
  Check if current customer is wholesale
  Common tags: 'wholesale', 'b2b', 'trade', 'vip'
{%- endcomment -%}

{%- assign is_wholesale = false -%}
{%- assign wholesale_tags = 'wholesale,b2b,trade' | split: ',' -%}

{%- if customer -%}
  {%- for tag in customer.tags -%}
    {%- assign tag_lower = tag | downcase -%}
    {%- if wholesale_tags contains tag_lower -%}
      {%- assign is_wholesale = true -%}
      {%- assign customer_tier = tag_lower -%}
      {%- break -%}
    {%- endif -%}
  {%- endfor -%}
{%- endif -%}
```

### Price Display with Wholesale Discount

```liquid
{%- comment -%}
  snippets/price-wholesale.liquid

  Accepts:
  - product: {Product} Product object
  - variant: {Variant} Current variant (optional)
{%- endcomment -%}

{%- assign current_variant = variant | default: product.selected_or_first_available_variant -%}

{%- comment -%} Get wholesale discount from metafield or settings {%- endcomment -%}
{%- if is_wholesale -%}
  {%- assign wholesale_discount = product.metafields.wholesale.discount_percent.value | default: settings.wholesale_discount_percent | default: 0 -%}
  {%- assign discount_multiplier = 100 | minus: wholesale_discount | divided_by: 100.0 -%}
  {%- assign wholesale_price = current_variant.price | times: discount_multiplier | round -%}
{%- endif -%}

<div class="price{% if is_wholesale %} price--wholesale{% endif %}">
  {%- if is_wholesale and wholesale_discount > 0 -%}
    <div class="price__wholesale">
      <span class="price__label">{{ 'products.product.wholesale_price' | t }}</span>
      <span class="price__value price__value--wholesale">
        {{ wholesale_price | money }}
      </span>
      <span class="price__discount">
        {{ 'products.product.save_percent' | t: percent: wholesale_discount }}
      </span>
    </div>
    <div class="price__retail">
      <span class="price__label">{{ 'products.product.retail_price' | t }}</span>
      <s class="price__value price__value--retail">{{ current_variant.price | money }}</s>
    </div>
  {%- else -%}
    <span class="price__value">{{ current_variant.price | money }}</span>
    {%- if current_variant.compare_at_price > current_variant.price -%}
      <s class="price__compare">{{ current_variant.compare_at_price | money }}</s>
    {%- endif -%}
  {%- endif -%}
</div>
```

### Metafield Structure for Wholesale Pricing

```
Namespace: wholesale
Key: discount_percent
Type: number_decimal

Namespace: wholesale
Key: price
Type: money (for fixed wholesale price)

Namespace: wholesale
Key: minimum_quantity
Type: number_integer
```

---

## Tiered Pricing Display

### Quantity-Based Pricing Table

```liquid
{%- comment -%}
  snippets/tiered-pricing.liquid

  Accepts:
  - product: {Product} Product object
  - variant: {Variant} Current variant
{%- endcomment -%}

{%- assign tiers = product.metafields.pricing.tiers.value -%}

{%- comment -%}
  Expected metafield structure (JSON):
  [
    { "min_qty": 1, "max_qty": 9, "discount": 0 },
    { "min_qty": 10, "max_qty": 24, "discount": 10 },
    { "min_qty": 25, "max_qty": 49, "discount": 15 },
    { "min_qty": 50, "max_qty": null, "discount": 20 }
  ]
{%- endcomment -%}

{%- if tiers != blank and tiers.size > 0 -%}
  <div class="tiered-pricing" data-tiered-pricing>
    <h4 class="tiered-pricing__title">
      {{ 'products.product.volume_pricing' | t }}
    </h4>

    <table class="tiered-pricing__table">
      <thead>
        <tr>
          <th>{{ 'products.product.quantity' | t }}</th>
          <th>{{ 'products.product.price_each' | t }}</th>
          <th>{{ 'products.product.discount' | t }}</th>
        </tr>
      </thead>
      <tbody>
        {%- for tier in tiers -%}
          {%- assign discount_multiplier = 100 | minus: tier.discount | divided_by: 100.0 -%}
          {%- assign tier_price = variant.price | times: discount_multiplier | round -%}

          <tr
            class="tiered-pricing__row"
            data-tier-min="{{ tier.min_qty }}"
            data-tier-max="{{ tier.max_qty }}"
            data-tier-price="{{ tier_price }}"
          >
            <td class="tiered-pricing__qty">
              {%- if tier.max_qty -%}
                {{ tier.min_qty }} - {{ tier.max_qty }}
              {%- else -%}
                {{ tier.min_qty }}+
              {%- endif -%}
            </td>
            <td class="tiered-pricing__price">
              {{ tier_price | money }}
            </td>
            <td class="tiered-pricing__discount">
              {%- if tier.discount > 0 -%}
                {{ 'products.product.save_percent' | t: percent: tier.discount }}
              {%- else -%}
                -
              {%- endif -%}
            </td>
          </tr>
        {%- endfor -%}
      </tbody>
    </table>
  </div>
{%- endif -%}
```

### Tiered Pricing JavaScript

```javascript
class TieredPricing {
  constructor(container) {
    this.container = container;
    this.quantityInput = document.querySelector('[data-quantity-input]');
    this.priceDisplay = document.querySelector('[data-product-price]');
    this.rows = container.querySelectorAll('.tiered-pricing__row');

    this.init();
  }

  init() {
    this.quantityInput?.addEventListener('change', () => this.updatePricing());
    this.quantityInput?.addEventListener('input', () => this.updatePricing());

    // Initial highlight
    this.updatePricing();
  }

  updatePricing() {
    const quantity = parseInt(this.quantityInput?.value) || 1;

    this.rows.forEach(row => {
      const min = parseInt(row.dataset.tierMin);
      const max = row.dataset.tierMax ? parseInt(row.dataset.tierMax) : Infinity;

      const isActive = quantity >= min && quantity <= max;
      row.classList.toggle('is-active', isActive);

      if (isActive && this.priceDisplay) {
        const tierPrice = parseInt(row.dataset.tierPrice);
        this.priceDisplay.textContent = Shopify.formatMoney(tierPrice);
      }
    });
  }
}

// Initialize
document.querySelectorAll('[data-tiered-pricing]').forEach(container => {
  new TieredPricing(container);
});
```

### Tiered Pricing CSS

```css
.tiered-pricing {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.tiered-pricing__title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.tiered-pricing__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.tiered-pricing__table th,
.tiered-pricing__table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.tiered-pricing__table th {
  font-weight: 600;
  color: var(--color-foreground-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.tiered-pricing__row.is-active {
  background: var(--color-primary-background);
}

.tiered-pricing__row.is-active td {
  font-weight: 600;
}

.tiered-pricing__discount {
  color: var(--color-sale);
}
```

---

## Minimum Order Quantities

### Product Page MOQ

```liquid
{%- comment -%}
  snippets/quantity-input-moq.liquid

  Accepts:
  - product: {Product} Product object
  - variant: {Variant} Current variant
{%- endcomment -%}

{%- assign min_qty = product.metafields.wholesale.minimum_quantity.value | default: 1 -%}
{%- assign qty_increment = product.metafields.wholesale.quantity_increment.value | default: 1 -%}

<div class="quantity-selector" data-quantity-selector>
  <label for="quantity" class="quantity-selector__label">
    {{ 'products.product.quantity' | t }}
    {%- if min_qty > 1 -%}
      <span class="quantity-selector__min">
        ({{ 'products.product.minimum' | t: qty: min_qty }})
      </span>
    {%- endif -%}
  </label>

  <div class="quantity-selector__input-group">
    <button
      type="button"
      class="quantity-selector__btn quantity-selector__btn--minus"
      data-quantity-minus
      aria-label="{{ 'products.product.decrease_quantity' | t }}"
      {% if min_qty >= qty_increment %}disabled{% endif %}
    >
      {% render 'icon', icon: 'minus' %}
    </button>

    <input
      type="number"
      id="quantity"
      name="quantity"
      class="quantity-selector__input"
      value="{{ min_qty }}"
      min="{{ min_qty }}"
      step="{{ qty_increment }}"
      data-quantity-input
      data-min="{{ min_qty }}"
      data-step="{{ qty_increment }}"
      aria-label="{{ 'products.product.quantity' | t }}"
    >

    <button
      type="button"
      class="quantity-selector__btn quantity-selector__btn--plus"
      data-quantity-plus
      aria-label="{{ 'products.product.increase_quantity' | t }}"
    >
      {% render 'icon', icon: 'plus' %}
    </button>
  </div>

  {%- if qty_increment > 1 -%}
    <p class="quantity-selector__increment-note">
      {{ 'products.product.sold_in_increments' | t: qty: qty_increment }}
    </p>
  {%- endif -%}
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const selector = document.querySelector('[data-quantity-selector]');
    const input = selector.querySelector('[data-quantity-input]');
    const minusBtn = selector.querySelector('[data-quantity-minus]');
    const plusBtn = selector.querySelector('[data-quantity-plus]');

    const min = parseInt(input.dataset.min) || 1;
    const step = parseInt(input.dataset.step) || 1;

    function updateValue(delta) {
      let value = parseInt(input.value) || min;
      value = value + (delta * step);

      // Enforce minimum
      if (value < min) value = min;

      // Round to nearest increment
      value = Math.ceil((value - min) / step) * step + min;

      input.value = value;
      minusBtn.disabled = value <= min;

      // Dispatch change event for tiered pricing
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    minusBtn.addEventListener('click', () => updateValue(-1));
    plusBtn.addEventListener('click', () => updateValue(1));

    input.addEventListener('blur', function() {
      let value = parseInt(this.value) || min;
      if (value < min) value = min;
      value = Math.ceil((value - min) / step) * step + min;
      this.value = value;
    });
  });
</script>
```

### Cart MOQ Validation

```liquid
{%- comment -%}
  Check cart items meet minimum quantities
  Add to cart template
{%- endcomment -%}

{%- assign moq_warnings = '' -%}

{%- for item in cart.items -%}
  {%- assign product_min = item.product.metafields.wholesale.minimum_quantity.value | default: 1 -%}
  {%- if item.quantity < product_min -%}
    {%- capture warning -%}
      {{ item.product.title }}: {{ 'cart.moq_warning' | t: min: product_min }}
    {%- endcapture -%}
    {%- assign moq_warnings = moq_warnings | append: warning | append: '|' -%}
  {%- endif -%}
{%- endfor -%}

{%- if moq_warnings != '' -%}
  <div class="cart-moq-warning" role="alert">
    <strong>{{ 'cart.moq_title' | t }}</strong>
    <ul>
      {%- assign warnings_array = moq_warnings | split: '|' -%}
      {%- for warning in warnings_array -%}
        {%- if warning != '' -%}
          <li>{{ warning }}</li>
        {%- endif -%}
      {%- endfor -%}
    </ul>
  </div>
{%- endif -%}
```

---

## Quick Order Form

### Bulk Add to Cart Form

```liquid
{%- comment -%}
  sections/quick-order-form.liquid
  Allows adding multiple products at once
{%- endcomment -%}

{{ 'quick-order.css' | asset_url | stylesheet_tag }}

<div class="quick-order" data-section-id="{{ section.id }}">
  <div class="page-width">
    <h2 class="quick-order__title">{{ section.settings.title }}</h2>

    {%- if section.settings.collection != blank -%}
      <form class="quick-order__form" data-quick-order-form>
        <table class="quick-order__table">
          <thead>
            <tr>
              <th class="quick-order__th-product">{{ 'quick_order.product' | t }}</th>
              <th class="quick-order__th-sku">{{ 'quick_order.sku' | t }}</th>
              <th class="quick-order__th-price">{{ 'quick_order.price' | t }}</th>
              <th class="quick-order__th-qty">{{ 'quick_order.quantity' | t }}</th>
              <th class="quick-order__th-total">{{ 'quick_order.total' | t }}</th>
            </tr>
          </thead>
          <tbody>
            {%- for product in section.settings.collection.products -%}
              {%- for variant in product.variants -%}
                {%- if variant.available -%}
                  <tr class="quick-order__row" data-variant-id="{{ variant.id }}">
                    <td class="quick-order__product">
                      <div class="quick-order__product-info">
                        <img
                          src="{{ variant.image | default: product.featured_image | image_url: width: 60 }}"
                          alt=""
                          width="40"
                          height="40"
                          loading="lazy"
                        >
                        <div>
                          <a href="{{ product.url }}">{{ product.title }}</a>
                          {%- if variant.title != 'Default Title' -%}
                            <span class="quick-order__variant-title">{{ variant.title }}</span>
                          {%- endif -%}
                        </div>
                      </div>
                    </td>
                    <td class="quick-order__sku">{{ variant.sku }}</td>
                    <td class="quick-order__price" data-unit-price="{{ variant.price }}">
                      {{ variant.price | money }}
                    </td>
                    <td class="quick-order__qty">
                      <input
                        type="number"
                        name="items[{{ variant.id }}]"
                        value="0"
                        min="0"
                        class="quick-order__qty-input"
                        data-qty-input
                        aria-label="{{ 'quick_order.quantity_for' | t: product: product.title }}"
                      >
                    </td>
                    <td class="quick-order__total" data-line-total>-</td>
                  </tr>
                {%- endif -%}
              {%- endfor -%}
            {%- endfor -%}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="quick-order__subtotal-label">
                {{ 'quick_order.subtotal' | t }}
              </td>
              <td class="quick-order__subtotal-value" data-subtotal>{{ 0 | money }}</td>
            </tr>
          </tfoot>
        </table>

        <div class="quick-order__actions">
          <button
            type="button"
            class="quick-order__clear button button--secondary"
            data-clear-form
          >
            {{ 'quick_order.clear_all' | t }}
          </button>
          <button
            type="submit"
            class="quick-order__submit button button--primary"
            data-submit-form
            disabled
          >
            {{ 'quick_order.add_to_cart' | t }}
            (<span data-item-count>0</span> {{ 'quick_order.items' | t }})
          </button>
        </div>
      </form>
    {%- endif -%}
  </div>
</div>

<script src="{{ 'quick-order.js' | asset_url }}" defer="defer"></script>

{% schema %}
{
  "name": "Quick Order Form",
  "tag": "section",
  "class": "section-quick-order",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Quick Order"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    }
  ],
  "presets": [
    {
      "name": "Quick Order Form"
    }
  ]
}
{% endschema %}
```

### Quick Order JavaScript

```javascript
// assets/quick-order.js

class QuickOrderForm {
  constructor(form) {
    this.form = form;
    this.qtyInputs = form.querySelectorAll('[data-qty-input]');
    this.subtotalEl = form.querySelector('[data-subtotal]');
    this.itemCountEl = form.querySelector('[data-item-count]');
    this.submitBtn = form.querySelector('[data-submit-form]');
    this.clearBtn = form.querySelector('[data-clear-form]');

    this.init();
  }

  init() {
    this.qtyInputs.forEach(input => {
      input.addEventListener('change', () => this.updateTotals());
      input.addEventListener('input', () => this.updateTotals());
    });

    this.clearBtn?.addEventListener('click', () => this.clearForm());
    this.form.addEventListener('submit', (e) => this.onSubmit(e));
  }

  updateTotals() {
    let subtotal = 0;
    let itemCount = 0;

    this.form.querySelectorAll('.quick-order__row').forEach(row => {
      const qtyInput = row.querySelector('[data-qty-input]');
      const priceEl = row.querySelector('[data-unit-price]');
      const lineTotalEl = row.querySelector('[data-line-total]');

      const qty = parseInt(qtyInput.value) || 0;
      const unitPrice = parseInt(priceEl.dataset.unitPrice) || 0;
      const lineTotal = qty * unitPrice;

      if (qty > 0) {
        lineTotalEl.textContent = Shopify.formatMoney(lineTotal);
        itemCount += qty;
        subtotal += lineTotal;
      } else {
        lineTotalEl.textContent = '-';
      }
    });

    this.subtotalEl.textContent = Shopify.formatMoney(subtotal);
    this.itemCountEl.textContent = itemCount;
    this.submitBtn.disabled = itemCount === 0;
  }

  clearForm() {
    this.qtyInputs.forEach(input => {
      input.value = 0;
    });
    this.updateTotals();
  }

  async onSubmit(event) {
    event.preventDefault();

    const items = [];

    this.form.querySelectorAll('.quick-order__row').forEach(row => {
      const variantId = row.dataset.variantId;
      const qty = parseInt(row.querySelector('[data-qty-input]').value) || 0;

      if (qty > 0) {
        items.push({
          id: parseInt(variantId),
          quantity: qty
        });
      }
    });

    if (items.length === 0) return;

    this.submitBtn.disabled = true;
    this.submitBtn.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error('Failed to add items');
      }

      // Success - clear form and show notification
      this.clearForm();
      document.dispatchEvent(new CustomEvent('cart:items-added'));

      // Show success message
      window.ajaxHandler?.showToast(
        window.quickOrderTranslations?.success || 'Items added to cart',
        'success'
      );

    } catch (error) {
      console.error('Quick order error:', error);
      window.ajaxHandler?.showToast(
        window.quickOrderTranslations?.error || 'Failed to add items',
        'error'
      );
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.removeAttribute('aria-busy');
    }
  }
}

// Initialize
document.querySelectorAll('[data-quick-order-form]').forEach(form => {
  new QuickOrderForm(form);
});
```

### Quick Order CSS

```css
.quick-order {
  padding: 2rem 0;
}

.quick-order__title {
  margin-bottom: 1.5rem;
}

.quick-order__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.quick-order__table th,
.quick-order__table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.quick-order__table th {
  font-weight: 600;
  background: var(--color-background-alt);
}

.quick-order__th-qty,
.quick-order__th-total {
  text-align: center;
  width: 100px;
}

.quick-order__product-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quick-order__product-info img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.quick-order__variant-title {
  display: block;
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
}

.quick-order__qty,
.quick-order__total {
  text-align: center;
}

.quick-order__qty-input {
  width: 60px;
  text-align: center;
  padding: 0.5rem;
}

.quick-order__subtotal-label {
  text-align: right;
  font-weight: 600;
}

.quick-order__subtotal-value {
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
}

.quick-order__actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Responsive */
@media screen and (max-width: 749px) {
  .quick-order__th-sku,
  .quick-order__sku {
    display: none;
  }

  .quick-order__product-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
```

---

## Customer-Specific Catalogs

### Conditional Product Display

```liquid
{%- comment -%}
  Show/hide products based on customer tags
{%- endcomment -%}

{%- assign show_product = true -%}

{%- comment -%} Check if product is wholesale-only {%- endcomment -%}
{%- if product.tags contains 'wholesale-only' -%}
  {%- unless is_wholesale -%}
    {%- assign show_product = false -%}
  {%- endunless -%}
{%- endif -%}

{%- comment -%} Check if product is hidden for certain customer tags {%- endcomment -%}
{%- assign hide_from_tags = product.metafields.visibility.hide_from_tags.value | split: ',' -%}
{%- if customer and hide_from_tags.size > 0 -%}
  {%- for customer_tag in customer.tags -%}
    {%- if hide_from_tags contains customer_tag -%}
      {%- assign show_product = false -%}
      {%- break -%}
    {%- endif -%}
  {%- endfor -%}
{%- endif -%}

{%- if show_product -%}
  {% render 'product-card', product: product %}
{%- endif -%}
```

### Collection Filtering by Customer Type

```liquid
{%- comment -%}
  sections/collection-template.liquid excerpt
  Filter collection based on customer access
{%- endcomment -%}

{%- assign accessible_products = '' -%}

{%- for product in collection.products -%}
  {%- assign can_view = true -%}

  {%- comment -%} Check wholesale-only {%- endcomment -%}
  {%- if product.tags contains 'wholesale-only' and is_wholesale == false -%}
    {%- assign can_view = false -%}
  {%- endif -%}

  {%- comment -%} Check retail-only (hide from wholesale) {%- endcomment -%}
  {%- if product.tags contains 'retail-only' and is_wholesale == true -%}
    {%- assign can_view = false -%}
  {%- endif -%}

  {%- if can_view -%}
    {%- capture product_id -%}{{ product.id }},{%- endcapture -%}
    {%- assign accessible_products = accessible_products | append: product_id -%}
  {%- endif -%}
{%- endfor -%}

{%- assign product_ids = accessible_products | split: ',' | compact -%}
<p>{{ 'collections.products_count' | t: count: product_ids.size }}</p>
```

### Wholesale Login Gate

```liquid
{%- comment -%}
  Show login prompt for wholesale-only content
{%- endcomment -%}

{%- if product.tags contains 'wholesale-only' and is_wholesale == false -%}
  <div class="wholesale-gate">
    <div class="wholesale-gate__content">
      <h3>{{ 'wholesale.gate_title' | t }}</h3>
      <p>{{ 'wholesale.gate_text' | t }}</p>

      {%- if customer -%}
        {%- comment -%} Logged in but not wholesale {%- endcomment -%}
        <p>{{ 'wholesale.apply_for_access' | t }}</p>
        <a href="{{ pages['wholesale-application'].url }}" class="button">
          {{ 'wholesale.apply_button' | t }}
        </a>
      {%- else -%}
        {%- comment -%} Not logged in {%- endcomment -%}
        <a href="{{ routes.account_login_url }}" class="button button--primary">
          {{ 'wholesale.login_button' | t }}
        </a>
        <p class="wholesale-gate__register">
          {{ 'wholesale.no_account' | t }}
          <a href="{{ pages['wholesale-application'].url }}">
            {{ 'wholesale.apply_link' | t }}
          </a>
        </p>
      {%- endif -%}
    </div>
  </div>
{%- endif -%}
```

---

## B2B Price Lists

### Company-Specific Pricing (Shopify B2B)

```liquid
{%- comment -%}
  For Shopify Plus B2B features
  Uses company and company_location objects
{%- endcomment -%}

{%- if customer.current_company -%}
  {%- assign company = customer.current_company -%}
  {%- assign location = customer.current_location -%}

  <div class="b2b-info">
    <p class="b2b-company">{{ company.name }}</p>

    {%- if location -%}
      <p class="b2b-location">{{ location.name }}</p>
    {%- endif -%}

    {%- comment -%} Payment terms {%- endcomment -%}
    {%- if location.payment_terms -%}
      <p class="b2b-terms">
        {{ 'b2b.payment_terms' | t }}: {{ location.payment_terms.payment_terms_name }}
      </p>
    {%- endif -%}
  </div>

  {%- comment -%}
    Price display uses catalog pricing automatically
    when B2B is enabled for the store
  {%- endcomment -%}
{%- endif -%}
```

---

## Locales

```json
{
  "products": {
    "product": {
      "wholesale_price": "Wholesale price",
      "retail_price": "Retail price",
      "save_percent": "Save {{ percent }}%",
      "volume_pricing": "Volume pricing",
      "quantity": "Quantity",
      "price_each": "Price each",
      "discount": "Discount",
      "minimum": "Min. {{ qty }}",
      "sold_in_increments": "Sold in increments of {{ qty }}"
    }
  },
  "cart": {
    "moq_title": "Minimum quantity not met",
    "moq_warning": "Minimum order quantity is {{ min }}"
  },
  "quick_order": {
    "product": "Product",
    "sku": "SKU",
    "price": "Price",
    "quantity": "Qty",
    "total": "Total",
    "subtotal": "Subtotal",
    "clear_all": "Clear All",
    "add_to_cart": "Add to Cart",
    "items": "items",
    "quantity_for": "Quantity for {{ product }}",
    "success": "Items added to cart",
    "error": "Failed to add items to cart"
  },
  "wholesale": {
    "gate_title": "Wholesale Only",
    "gate_text": "This product is only available to approved wholesale customers.",
    "apply_for_access": "Your account is not approved for wholesale access.",
    "apply_button": "Apply for Wholesale",
    "login_button": "Log In",
    "no_account": "Don't have an account?",
    "apply_link": "Apply for wholesale access"
  },
  "b2b": {
    "payment_terms": "Payment terms"
  }
}
```

---

## Best Practices

### 1. Price Security

Never rely solely on front-end for wholesale pricing. Use:
- Shopify Scripts (Plus)
- Discount codes
- Automatic discounts
- B2B catalogs (Plus)

### 2. Performance with Large Catalogs

```liquid
{%- comment -%} Use pagination for quick order forms {%- endcomment -%}
{% paginate collection.products by 50 %}
  {%- for product in collection.products -%}
    ...
  {%- endfor -%}

  {% render 'pagination', paginate: paginate %}
{% endpaginate %}
```

### 3. SKU Search for Quick Orders

```javascript
// Add SKU search functionality
const skuSearchInput = document.querySelector('[data-sku-search]');

skuSearchInput?.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();

  document.querySelectorAll('.quick-order__row').forEach(row => {
    const sku = row.querySelector('.quick-order__sku')?.textContent.toLowerCase() || '';
    const title = row.querySelector('.quick-order__product a')?.textContent.toLowerCase() || '';

    const matches = sku.includes(searchTerm) || title.includes(searchTerm);
    row.style.display = matches ? '' : 'none';
  });
});
```

### 4. Export/Import Orders

Provide CSV import capability for regular wholesale orders:

```javascript
function parseCSVOrder(csvText) {
  const lines = csvText.split('\n');
  const items = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const [sku, qty] = lines[i].split(',');
    if (sku && qty) {
      items.push({ sku: sku.trim(), quantity: parseInt(qty) });
    }
  }

  return items;
}
```
