# Pre-order & Backorder Handling

Complete guide for handling inventory states, pre-orders, and backorders in Shopify themes.

## Inventory State Detection

### Understanding Shopify Inventory States

```liquid
{% comment %}
  Shopify provides these inventory-related properties:
  - variant.available: Boolean - can this be purchased?
  - variant.inventory_quantity: Number - current stock count
  - variant.inventory_policy: 'deny' or 'continue'
    - 'deny': Stop selling when out of stock
    - 'continue': Allow selling even when out of stock (pre-orders/backorders)
  - variant.inventory_management: 'shopify', 'manual', or blank
{% endcomment %}

{%- liquid
  # Determine inventory state
  assign is_in_stock = variant.available
  assign can_continue_selling = false
  assign is_preorder = false
  assign is_backorder = false

  if variant.inventory_policy == 'continue'
    assign can_continue_selling = true
  endif

  # Check if this is a backorder situation (out of stock but can continue selling)
  if can_continue_selling and variant.inventory_quantity <= 0
    assign is_backorder = true
  endif

  # Check for pre-order using metafield
  if product.metafields.custom.preorder == true or product.metafields.custom.is_preorder == true
    assign is_preorder = true
    assign is_backorder = false
  endif

  # Or check by tag
  if product.tags contains 'preorder' or product.tags contains 'pre-order'
    assign is_preorder = true
    assign is_backorder = false
  endif
-%}
```

---

## Add to Cart Button with State

### Product Form Snippet

```liquid
{% comment %} snippets/buy-buttons.liquid {% endcomment %}

{%- liquid
  # Accept product and optional form_id
  assign current_variant = product.selected_or_first_available_variant
  assign form_id = form_id | default: product.id | prepend: 'product-form-'

  # Inventory state detection
  assign is_available = current_variant.available
  assign can_preorder = current_variant.inventory_policy == 'continue'
  assign inventory_qty = current_variant.inventory_quantity | default: 0

  # Pre-order detection
  assign is_preorder = false
  if product.metafields.custom.is_preorder == true
    assign is_preorder = true
  elsif product.tags contains 'preorder'
    assign is_preorder = true
  endif

  # Backorder detection (out of stock but can continue)
  assign is_backorder = false
  if can_preorder and inventory_qty <= 0 and is_preorder == false
    assign is_backorder = true
  endif

  # Expected date (if available)
  assign expected_date = product.metafields.custom.expected_date.value
  assign expected_date_formatted = expected_date | date: '%B %d, %Y'
-%}

<div class="buy-buttons" data-buy-buttons>
  {%- if is_available or can_preorder -%}
    <button
      type="submit"
      name="add"
      form="{{ form_id }}"
      class="button button--primary button--full-width {% if is_preorder %}button--preorder{% elsif is_backorder %}button--backorder{% endif %}"
      {% unless is_available or can_preorder %}disabled{% endunless %}
      data-add-to-cart
    >
      <span class="button__text" data-add-to-cart-text>
        {%- if is_preorder -%}
          {{ 'products.product.preorder' | t }}
        {%- elsif is_backorder -%}
          {{ 'products.product.backorder' | t }}
        {%- else -%}
          {{ 'products.product.add_to_cart' | t }}
        {%- endif -%}
      </span>
      <span class="button__spinner" hidden>
        {% render 'icon-spinner' %}
      </span>
    </button>

    {%- comment -%} Status message {%- endcomment -%}
    {%- if is_preorder or is_backorder -%}
      <div class="buy-buttons__status">
        {%- if is_preorder -%}
          <span class="status-badge status-badge--preorder">
            {% render 'icon-clock' %}
            {{ 'products.product.preorder_badge' | t }}
          </span>
          {%- if expected_date -%}
            <p class="buy-buttons__expected">
              {{ 'products.product.expected_ship_date' | t: date: expected_date_formatted }}
            </p>
          {%- endif -%}
        {%- elsif is_backorder -%}
          <span class="status-badge status-badge--backorder">
            {% render 'icon-truck' %}
            {{ 'products.product.backorder_badge' | t }}
          </span>
          {%- if expected_date -%}
            <p class="buy-buttons__expected">
              {{ 'products.product.expected_restock_date' | t: date: expected_date_formatted }}
            </p>
          {%- endif -%}
        {%- endif -%}
      </div>
    {%- endif -%}

  {%- else -%}
    <button type="button" class="button button--secondary button--full-width" disabled>
      {{ 'products.product.sold_out' | t }}
    </button>

    {%- comment -%} Optional: Back in stock notification {%- endcomment -%}
    {% render 'back-in-stock-form', product: product, variant: current_variant %}
  {%- endif -%}
</div>
```

---

## Dynamic Button Text (JavaScript)

For variant switching to update button text dynamically:

```javascript
// assets/product-form.js

class ProductForm {
  constructor(container) {
    this.container = container;
    this.form = container.querySelector('form');
    this.addToCartBtn = container.querySelector('[data-add-to-cart]');
    this.addToCartText = container.querySelector('[data-add-to-cart-text]');
    this.statusContainer = container.querySelector('.buy-buttons__status');

    // Product data from JSON
    this.productData = JSON.parse(
      container.querySelector('[data-product-json]')?.textContent || '{}'
    );

    this.init();
  }

  init() {
    // Listen for variant changes
    this.container.addEventListener('variant:change', (e) => {
      this.updateButton(e.detail.variant);
    });
  }

  updateButton(variant) {
    if (!variant) {
      this.setUnavailable();
      return;
    }

    const isPreorder = this.isPreorder();
    const isBackorder = this.isBackorder(variant);

    if (variant.available) {
      this.setAvailable(variant, isPreorder, isBackorder);
    } else if (variant.inventory_policy === 'continue') {
      this.setAvailable(variant, isPreorder, true);
    } else {
      this.setSoldOut();
    }
  }

  isPreorder() {
    // Check product metafield or tag
    return this.productData.metafields?.custom?.is_preorder === true ||
           this.productData.tags?.includes('preorder') ||
           this.productData.tags?.includes('pre-order');
  }

  isBackorder(variant) {
    return variant.inventory_policy === 'continue' &&
           variant.inventory_quantity <= 0 &&
           !this.isPreorder();
  }

  setAvailable(variant, isPreorder, isBackorder) {
    this.addToCartBtn.disabled = false;

    if (isPreorder) {
      this.addToCartText.textContent = window.theme.strings.preorder || 'Pre-order';
      this.addToCartBtn.classList.add('button--preorder');
      this.addToCartBtn.classList.remove('button--backorder');
      this.showStatus('preorder');
    } else if (isBackorder) {
      this.addToCartText.textContent = window.theme.strings.backorder || 'Backorder';
      this.addToCartBtn.classList.add('button--backorder');
      this.addToCartBtn.classList.remove('button--preorder');
      this.showStatus('backorder');
    } else {
      this.addToCartText.textContent = window.theme.strings.addToCart || 'Add to cart';
      this.addToCartBtn.classList.remove('button--preorder', 'button--backorder');
      this.hideStatus();
    }
  }

  setSoldOut() {
    this.addToCartBtn.disabled = true;
    this.addToCartText.textContent = window.theme.strings.soldOut || 'Sold out';
    this.addToCartBtn.classList.remove('button--preorder', 'button--backorder');
    this.hideStatus();
  }

  setUnavailable() {
    this.addToCartBtn.disabled = true;
    this.addToCartText.textContent = window.theme.strings.unavailable || 'Unavailable';
    this.addToCartBtn.classList.remove('button--preorder', 'button--backorder');
    this.hideStatus();
  }

  showStatus(type) {
    if (this.statusContainer) {
      this.statusContainer.hidden = false;
      this.statusContainer.dataset.status = type;
    }
  }

  hideStatus() {
    if (this.statusContainer) {
      this.statusContainer.hidden = true;
    }
  }
}
```

---

## Cart Line Item Messaging

### Cart Item Snippet

```liquid
{% comment %} snippets/cart-item.liquid {% endcomment %}

{%- liquid
  # Detect pre-order/backorder for this line item
  assign is_preorder = false
  assign is_backorder = false

  # Check product tags
  if item.product.tags contains 'preorder' or item.product.tags contains 'pre-order'
    assign is_preorder = true
  endif

  # Check metafield
  if item.product.metafields.custom.is_preorder == true
    assign is_preorder = true
  endif

  # Check backorder (continue selling + out of stock + not pre-order)
  if item.variant.inventory_policy == 'continue' and item.variant.inventory_quantity <= 0
    unless is_preorder
      assign is_backorder = true
    endunless
  endif

  # Get expected date
  assign expected_date = item.product.metafields.custom.expected_date.value | date: '%B %d, %Y'
-%}

<div class="cart-item" data-cart-item="{{ item.key }}">
  <div class="cart-item__image">
    {{ item.image | image_url: width: 150 | image_tag: loading: 'lazy' }}
  </div>

  <div class="cart-item__details">
    <a href="{{ item.url }}" class="cart-item__title">{{ item.product.title }}</a>

    {%- if item.variant.title != 'Default Title' -%}
      <p class="cart-item__variant">{{ item.variant.title }}</p>
    {%- endif -%}

    {%- comment -%} Pre-order/Backorder badge {%- endcomment -%}
    {%- if is_preorder -%}
      <div class="cart-item__status cart-item__status--preorder">
        <span class="status-badge status-badge--preorder">
          {% render 'icon-clock' %}
          {{ 'cart.preorder_item' | t }}
        </span>
        {%- if expected_date != blank -%}
          <span class="cart-item__expected">
            {{ 'cart.expected_ship' | t: date: expected_date }}
          </span>
        {%- endif -%}
      </div>
    {%- elsif is_backorder -%}
      <div class="cart-item__status cart-item__status--backorder">
        <span class="status-badge status-badge--backorder">
          {% render 'icon-truck' %}
          {{ 'cart.backorder_item' | t }}
        </span>
        {%- if expected_date != blank -%}
          <span class="cart-item__expected">
            {{ 'cart.expected_restock' | t: date: expected_date }}
          </span>
        {%- endif -%}
      </div>
    {%- endif -%}

    <div class="cart-item__price">
      {{ item.final_line_price | money }}
    </div>
  </div>

  <div class="cart-item__quantity">
    {% render 'quantity-input', item: item %}
  </div>

  <button type="button" class="cart-item__remove" data-remove-item="{{ item.key }}">
    {% render 'icon-trash' %}
    <span class="visually-hidden">{{ 'cart.remove' | t }}</span>
  </button>
</div>
```

---

## Cart Page Notices

### Cart-Level Pre-order Notice

```liquid
{% comment %} In cart template or section {% endcomment %}

{%- liquid
  assign has_preorder_items = false
  assign has_backorder_items = false
  assign longest_wait_date = nil

  for item in cart.items
    if item.product.tags contains 'preorder' or item.product.metafields.custom.is_preorder == true
      assign has_preorder_items = true
      assign item_date = item.product.metafields.custom.expected_date.value
      if item_date != blank
        if longest_wait_date == nil or item_date > longest_wait_date
          assign longest_wait_date = item_date
        endif
      endif
    elsif item.variant.inventory_policy == 'continue' and item.variant.inventory_quantity <= 0
      assign has_backorder_items = true
    endif
  endfor
-%}

{%- if has_preorder_items or has_backorder_items -%}
  <div class="cart__notices">
    {%- if has_preorder_items -%}
      <div class="notice notice--info">
        {% render 'icon-info' %}
        <div class="notice__content">
          <p class="notice__title">{{ 'cart.contains_preorder' | t }}</p>
          <p class="notice__text">{{ 'cart.preorder_notice' | t }}</p>
          {%- if longest_wait_date -%}
            <p class="notice__text">
              {{ 'cart.earliest_ship_date' | t: date: longest_wait_date | date: '%B %d, %Y' }}
            </p>
          {%- endif -%}
        </div>
      </div>
    {%- endif -%}

    {%- if has_backorder_items -%}
      <div class="notice notice--warning">
        {% render 'icon-alert' %}
        <div class="notice__content">
          <p class="notice__title">{{ 'cart.contains_backorder' | t }}</p>
          <p class="notice__text">{{ 'cart.backorder_notice' | t }}</p>
        </div>
      </div>
    {%- endif -%}
  </div>
{%- endif -%}
```

---

## Checkout Note Injection

### Add Cart Attributes for Special Items

```liquid
{% comment %} In cart form {% endcomment %}

{%- liquid
  assign preorder_items = ''
  assign backorder_items = ''

  for item in cart.items
    if item.product.tags contains 'preorder' or item.product.metafields.custom.is_preorder == true
      assign preorder_items = preorder_items | append: item.product.title | append: ', '
    elsif item.variant.inventory_policy == 'continue' and item.variant.inventory_quantity <= 0
      assign backorder_items = backorder_items | append: item.product.title | append: ', '
    endif
  endfor

  assign preorder_items = preorder_items | strip | remove_last: ', '
  assign backorder_items = backorder_items | strip | remove_last: ', '
-%}

{%- if preorder_items != blank -%}
  <input type="hidden" name="attributes[Pre-order items]" value="{{ preorder_items }}">
{%- endif -%}

{%- if backorder_items != blank -%}
  <input type="hidden" name="attributes[Backorder items]" value="{{ backorder_items }}">
{%- endif -%}
```

### JavaScript Alternative for Cart Attributes

```javascript
// assets/cart.js

async function updateCartAttributes() {
  const response = await fetch('/cart.js');
  const cart = await response.json();

  const preorderItems = [];
  const backorderItems = [];

  cart.items.forEach(item => {
    // Check for preorder tag in properties
    if (item.properties?._is_preorder) {
      preorderItems.push(item.product_title);
    }
    // Check for backorder
    if (item.properties?._is_backorder) {
      backorderItems.push(item.product_title);
    }
  });

  const attributes = {};
  if (preorderItems.length > 0) {
    attributes['Pre-order items'] = preorderItems.join(', ');
  }
  if (backorderItems.length > 0) {
    attributes['Backorder items'] = backorderItems.join(', ');
  }

  if (Object.keys(attributes).length > 0) {
    await fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes })
    });
  }
}
```

---

## Product Card Badge

### Collection/Product Card Snippet

```liquid
{% comment %} snippets/product-card.liquid {% endcomment %}

{%- liquid
  assign is_preorder = false
  assign is_backorder = false
  assign first_variant = product.first_available_variant | default: product.variants.first

  if product.tags contains 'preorder' or product.metafields.custom.is_preorder == true
    assign is_preorder = true
  elsif first_variant.inventory_policy == 'continue' and first_variant.inventory_quantity <= 0 and first_variant.available
    assign is_backorder = true
  endif
-%}

<div class="product-card">
  <div class="product-card__image-wrapper">
    {%- comment -%} Badges {%- endcomment -%}
    <div class="product-card__badges">
      {%- if is_preorder -%}
        <span class="badge badge--preorder">{{ 'products.product.preorder_badge' | t }}</span>
      {%- elsif is_backorder -%}
        <span class="badge badge--backorder">{{ 'products.product.backorder_badge' | t }}</span>
      {%- elsif product.available == false -%}
        <span class="badge badge--sold-out">{{ 'products.product.sold_out' | t }}</span>
      {%- elsif product.compare_at_price > product.price -%}
        <span class="badge badge--sale">{{ 'products.product.sale' | t }}</span>
      {%- endif -%}
    </div>

    {{ product.featured_image | image_url: width: 400 | image_tag }}
  </div>

  <div class="product-card__info">
    <h3 class="product-card__title">
      <a href="{{ product.url }}">{{ product.title }}</a>
    </h3>
    {% render 'price', product: product %}
  </div>
</div>
```

---

## Metafield Structure

### Recommended Product Metafields

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `custom` | `is_preorder` | `boolean` | Mark product as pre-order |
| `custom` | `expected_date` | `date` | Expected ship/restock date |
| `custom` | `preorder_message` | `single_line_text_field` | Custom pre-order message |
| `custom` | `backorder_message` | `single_line_text_field` | Custom backorder message |
| `custom` | `max_preorder_qty` | `number_integer` | Limit pre-order quantity |

### Setup in Shopify Admin

```markdown
## Metafield Setup

1. Go to Settings → Custom data → Products
2. Add definition:
   - Name: "Is Pre-order"
   - Namespace and key: custom.is_preorder
   - Type: True or false
3. Add definition:
   - Name: "Expected Date"
   - Namespace and key: custom.expected_date
   - Type: Date
```

---

## CSS Styles

```css
/* assets/inventory-states.css */

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--border-radius-sm);
}

.status-badge svg {
  width: 1em;
  height: 1em;
}

.status-badge--preorder {
  background-color: var(--color-preorder-bg, #E8F4FD);
  color: var(--color-preorder-text, #1976D2);
}

.status-badge--backorder {
  background-color: var(--color-backorder-bg, #FFF3E0);
  color: var(--color-backorder-text, #E65100);
}

/* Button variants */
.button--preorder {
  background-color: var(--color-preorder-button, #1976D2);
  border-color: var(--color-preorder-button, #1976D2);
}

.button--backorder {
  background-color: var(--color-backorder-button, #E65100);
  border-color: var(--color-backorder-button, #E65100);
}

/* Buy buttons status */
.buy-buttons__status {
  margin-top: 0.75rem;
  text-align: center;
}

.buy-buttons__expected {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

/* Product card badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--border-radius-sm);
}

.badge--preorder {
  background-color: var(--color-preorder-bg);
  color: var(--color-preorder-text);
}

.badge--backorder {
  background-color: var(--color-backorder-bg);
  color: var(--color-backorder-text);
}

.badge--sold-out {
  background-color: var(--color-sold-out-bg, #f5f5f5);
  color: var(--color-sold-out-text, #757575);
}

/* Cart item status */
.cart-item__status {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8125rem;
}

.cart-item__status--preorder {
  background-color: var(--color-preorder-bg);
}

.cart-item__status--backorder {
  background-color: var(--color-backorder-bg);
}

.cart-item__expected {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
}

/* Notices */
.cart__notices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--border-radius);
}

.notice--info {
  background-color: var(--color-preorder-bg);
  color: var(--color-preorder-text);
}

.notice--warning {
  background-color: var(--color-backorder-bg);
  color: var(--color-backorder-text);
}

.notice svg {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.notice__title {
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.notice__text {
  margin: 0;
  font-size: 0.875rem;
}
```

---

## Locales

```json
{
  "products": {
    "product": {
      "add_to_cart": "Add to cart",
      "preorder": "Pre-order Now",
      "backorder": "Backorder",
      "sold_out": "Sold out",
      "preorder_badge": "Pre-order",
      "backorder_badge": "Backorder",
      "expected_ship_date": "Expected to ship: {{ date }}",
      "expected_restock_date": "Expected restock: {{ date }}"
    }
  },
  "cart": {
    "preorder_item": "Pre-order",
    "backorder_item": "Backorder",
    "expected_ship": "Ships: {{ date }}",
    "expected_restock": "Restocks: {{ date }}",
    "contains_preorder": "Your cart contains pre-order items",
    "contains_backorder": "Your cart contains backordered items",
    "preorder_notice": "Pre-order items will ship when available. Your entire order will ship together.",
    "backorder_notice": "Backordered items may take longer to ship.",
    "earliest_ship_date": "Earliest ship date: {{ date }}"
  }
}
```

---

## Best Practices

1. **Clear Communication:** Always show expected dates when available
2. **Visual Distinction:** Use different colors for pre-order vs backorder
3. **Cart Awareness:** Show notices before checkout
4. **Checkout Attributes:** Pass special status to order for fulfillment team
5. **Quantity Limits:** Consider limiting pre-order quantities
6. **Metafields:** Use metafields over tags for structured data
7. **Fallbacks:** Always handle cases where dates aren't set
