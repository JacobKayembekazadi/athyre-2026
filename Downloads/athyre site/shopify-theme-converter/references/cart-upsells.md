# Cart Upsells & Cross-sells Patterns

Patterns for in-cart product recommendations, order bumps, frequently bought together, and free shipping threshold upsells.

---

## Table of Contents

1. [Cart Upsell Section](#cart-upsell-section)
2. [Order Bump Checkbox Pattern](#order-bump-checkbox-pattern)
3. [Frequently Bought Together](#frequently-bought-together)
4. [Free Shipping Progress Bar](#free-shipping-progress-bar)
5. [Cart Drawer Upsells](#cart-drawer-upsells)
6. [Product Recommendations API](#product-recommendations-api)

---

## Cart Upsell Section

### Cart Page Upsell Section

```liquid
{% comment %} sections/cart-upsells.liquid {% endcomment %}
{%- if cart.item_count > 0 -%}
  <div class="cart-upsells" id="CartUpsells-{{ section.id }}">
    <h3 class="cart-upsells__title">{{ section.settings.heading }}</h3>

    <div class="cart-upsells__grid">
      {%- liquid
        assign upsell_products = section.settings.products
        assign max_items = section.settings.max_items | default: 4

        if upsell_products == blank or section.settings.use_recommendations
          assign cart_product_ids = cart.items | map: 'product_id'
          assign first_product = cart.items.first.product
        endif
      -%}

      {%- if section.settings.use_recommendations and first_product -%}
        {%- comment -%} Use Product Recommendations API {%- endcomment -%}
        <cart-recommendations
          data-product-id="{{ first_product.id }}"
          data-limit="{{ max_items }}"
          data-intent="related"
          data-exclude="{{ cart_product_ids | join: ',' }}"
        >
          <div class="cart-upsells__loading">
            {% render 'loading-spinner' %}
          </div>
        </cart-recommendations>
      {%- else -%}
        {%- comment -%} Use manually selected products {%- endcomment -%}
        {%- for product in upsell_products limit: max_items -%}
          {%- unless cart.items | where: 'product_id', product.id | first -%}
            {% render 'cart-upsell-card', product: product %}
          {%- endunless -%}
        {%- endfor -%}
      {%- endif -%}
    </div>
  </div>
{%- endif -%}

<script>
  class CartRecommendations extends HTMLElement {
    connectedCallback() {
      this.productId = this.dataset.productId;
      this.limit = parseInt(this.dataset.limit) || 4;
      this.intent = this.dataset.intent || 'related';
      this.excludeIds = (this.dataset.exclude || '').split(',').filter(Boolean);

      this.fetchRecommendations();
    }

    async fetchRecommendations() {
      try {
        const url = `${window.Shopify.routes.root}recommendations/products.json?product_id=${this.productId}&limit=${this.limit + this.excludeIds.length}&intent=${this.intent}`;
        const response = await fetch(url);
        const data = await response.json();

        // Filter out products already in cart
        const filteredProducts = data.products.filter(
          product => !this.excludeIds.includes(String(product.id))
        ).slice(0, this.limit);

        this.renderProducts(filteredProducts);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        this.innerHTML = '';
      }
    }

    renderProducts(products) {
      if (products.length === 0) {
        this.innerHTML = '';
        return;
      }

      this.innerHTML = products.map(product => `
        <div class="cart-upsell-card">
          <a href="${product.url}" class="cart-upsell-card__image-link">
            <img
              src="${product.featured_image ? this.getImageUrl(product.featured_image, 200) : ''}"
              alt="${this.escapeHtml(product.title)}"
              width="100"
              height="100"
              loading="lazy"
            >
          </a>
          <div class="cart-upsell-card__info">
            <a href="${product.url}" class="cart-upsell-card__title">
              ${this.escapeHtml(product.title)}
            </a>
            <div class="cart-upsell-card__price">
              ${this.formatMoney(product.price)}
            </div>
            <button
              type="button"
              class="cart-upsell-card__add button button--secondary"
              data-variant-id="${product.variants[0].id}"
              ${!product.available ? 'disabled' : ''}
            >
              ${product.available ? 'Add' : 'Sold Out'}
            </button>
          </div>
        </div>
      `).join('');

      // Bind add buttons
      this.querySelectorAll('[data-variant-id]').forEach(btn => {
        btn.addEventListener('click', () => this.addToCart(btn.dataset.variantId, btn));
      });
    }

    async addToCart(variantId, button) {
      button.disabled = true;
      button.textContent = 'Adding...';

      try {
        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ id: parseInt(variantId), quantity: 1 }]
          })
        });

        if (!response.ok) throw new Error('Add to cart failed');

        // Refresh cart
        document.dispatchEvent(new CustomEvent('cart:refresh'));

        button.textContent = 'Added!';
        setTimeout(() => {
          // Remove this card from upsells
          button.closest('.cart-upsell-card')?.remove();
        }, 1000);
      } catch (error) {
        console.error('Add to cart error:', error);
        button.disabled = false;
        button.textContent = 'Add';
      }
    }

    getImageUrl(url, size) {
      return url.replace(/(_\d+x\d+)?(\.[a-zA-Z]+)(\?.*)?$/, `_${size}x$2`);
    }

    formatMoney(cents) {
      return new Intl.NumberFormat(Shopify.locale, {
        style: 'currency',
        currency: Shopify.currency.active
      }).format(cents / 100);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  customElements.define('cart-recommendations', CartRecommendations);
</script>

{% schema %}
{
  "name": "Cart Upsells",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "You may also like"
    },
    {
      "type": "checkbox",
      "id": "use_recommendations",
      "label": "Use automatic recommendations",
      "info": "Uses Shopify's Product Recommendations API",
      "default": true
    },
    {
      "type": "product_list",
      "id": "products",
      "label": "Manual product selection",
      "info": "Used when automatic recommendations is disabled",
      "limit": 8
    },
    {
      "type": "range",
      "id": "max_items",
      "label": "Maximum items to show",
      "min": 2,
      "max": 8,
      "default": 4
    }
  ],
  "presets": [
    {
      "name": "Cart Upsells"
    }
  ]
}
{% endschema %}
```

### Cart Upsell Card Snippet

```liquid
{% comment %} snippets/cart-upsell-card.liquid {% endcomment %}
{% comment %}
  Renders a compact product card for cart upsells

  Accepts:
  - product: Product object (required)
  - show_variant_selector: Show variant dropdown (default: false)

  Usage:
  {% render 'cart-upsell-card', product: product %}
{% endcomment %}

{%- liquid
  assign first_available_variant = product.variants | where: 'available' | first
  assign selected_variant = first_available_variant | default: product.selected_or_first_available_variant
-%}

<div class="cart-upsell-card" data-product-id="{{ product.id }}">
  <a href="{{ product.url }}" class="cart-upsell-card__image-link">
    {%- if product.featured_image -%}
      <img
        src="{{ product.featured_image | image_url: width: 200 }}"
        alt="{{ product.featured_image.alt | escape }}"
        width="100"
        height="100"
        loading="lazy"
      >
    {%- else -%}
      {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg' }}
    {%- endif -%}
  </a>

  <div class="cart-upsell-card__info">
    <a href="{{ product.url }}" class="cart-upsell-card__title">
      {{ product.title }}
    </a>

    <div class="cart-upsell-card__price">
      {%- if selected_variant.compare_at_price > selected_variant.price -%}
        <span class="price--sale">{{ selected_variant.price | money }}</span>
        <span class="price--compare">{{ selected_variant.compare_at_price | money }}</span>
      {%- else -%}
        {{ selected_variant.price | money }}
      {%- endif -%}
    </div>

    {%- if show_variant_selector and product.variants.size > 1 -%}
      <select
        class="cart-upsell-card__variant-select"
        aria-label="Select variant"
        data-variant-select
      >
        {%- for variant in product.variants -%}
          <option
            value="{{ variant.id }}"
            {% unless variant.available %}disabled{% endunless %}
            {% if variant == selected_variant %}selected{% endif %}
          >
            {{ variant.title }}{% unless variant.available %} - Sold out{% endunless %}
          </option>
        {%- endfor -%}
      </select>
    {%- endif -%}

    <button
      type="button"
      class="cart-upsell-card__add button button--secondary button--small"
      data-add-upsell
      data-variant-id="{{ selected_variant.id }}"
      {% unless product.available %}disabled{% endunless %}
    >
      {%- if product.available -%}
        {{ 'products.product.add_to_cart' | t | default: 'Add' }}
      {%- else -%}
        {{ 'products.product.sold_out' | t | default: 'Sold Out' }}
      {%- endif -%}
    </button>
  </div>
</div>

<style>
  .cart-upsell-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .cart-upsell-card__image-link {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
  }

  .cart-upsell-card__image-link img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .cart-upsell-card__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cart-upsell-card__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    text-decoration: none;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cart-upsell-card__title:hover {
    text-decoration: underline;
  }

  .cart-upsell-card__price {
    font-size: 0.875rem;
  }

  .cart-upsell-card__price .price--sale {
    color: var(--color-sale);
  }

  .cart-upsell-card__price .price--compare {
    text-decoration: line-through;
    color: var(--color-text-secondary);
    margin-left: 0.5rem;
  }

  .cart-upsell-card__variant-select {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    margin-top: auto;
  }

  .cart-upsell-card__add {
    margin-top: auto;
    align-self: flex-start;
  }
</style>
```

### Cart Upsells Styles

```css
/* assets/cart-upsells.css */
.cart-upsells {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.cart-upsells__title {
  font-size: 1.125rem;
  margin: 0 0 1rem;
}

.cart-upsells__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.cart-upsells__loading {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 2rem;
}

@media (max-width: 640px) {
  .cart-upsells__grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Order Bump Checkbox Pattern

### Order Bump Component

```liquid
{% comment %} snippets/order-bump.liquid {% endcomment %}
{% comment %}
  Renders an order bump checkbox offer

  Accepts:
  - product: Product to upsell (required)
  - discount_percent: Discount percentage (optional)
  - custom_message: Custom promotional message (optional)

  Usage:
  {% render 'order-bump', product: all_products['product-handle'], discount_percent: 20 %}
{% endcomment %}

{%- if product and product.available -%}
  {%- liquid
    assign variant = product.selected_or_first_available_variant
    assign original_price = variant.price
    if discount_percent
      assign discount_amount = original_price | times: discount_percent | divided_by: 100
      assign discounted_price = original_price | minus: discount_amount
    else
      assign discounted_price = original_price
    endif
  -%}

  <order-bump class="order-bump" data-variant-id="{{ variant.id }}" data-product-id="{{ product.id }}">
    <div class="order-bump__inner">
      <div class="order-bump__checkbox-wrapper">
        <input
          type="checkbox"
          id="order-bump-{{ product.id }}"
          class="order-bump__checkbox"
          data-bump-checkbox
        >
        <label for="order-bump-{{ product.id }}" class="order-bump__content">
          <div class="order-bump__image">
            {%- if product.featured_image -%}
              <img
                src="{{ product.featured_image | image_url: width: 120 }}"
                alt="{{ product.featured_image.alt | escape }}"
                width="60"
                height="60"
                loading="lazy"
              >
            {%- endif -%}
          </div>

          <div class="order-bump__details">
            <div class="order-bump__badge">
              {%- if discount_percent -%}
                {{ 'cart.order_bump.limited_offer' | t | default: 'LIMITED OFFER' }}
              {%- else -%}
                {{ 'cart.order_bump.add_this' | t | default: 'ADD THIS' }}
              {%- endif -%}
            </div>

            <p class="order-bump__message">
              {%- if custom_message -%}
                {{ custom_message }}
              {%- else -%}
                {{ 'cart.order_bump.default_message' | t: product_title: product.title | default: 'Add this item to your order!' }}
              {%- endif -%}
            </p>

            <div class="order-bump__title">
              {{ product.title }}
            </div>

            <div class="order-bump__price">
              {%- if discount_percent -%}
                <span class="order-bump__price--original">{{ original_price | money }}</span>
                <span class="order-bump__price--sale">{{ discounted_price | money }}</span>
                <span class="order-bump__price--badge">-{{ discount_percent }}%</span>
              {%- else -%}
                {{ discounted_price | money }}
              {%- endif -%}
            </div>
          </div>

          <div class="order-bump__action">
            <span class="order-bump__checkmark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </div>
        </label>
      </div>
    </div>

    {%- if discount_percent -%}
      <input type="hidden" name="discount_code" value="BUMP{{ discount_percent }}" data-bump-discount>
    {%- endif -%}
  </order-bump>
{%- endif -%}

<script>
  class OrderBump extends HTMLElement {
    connectedCallback() {
      this.checkbox = this.querySelector('[data-bump-checkbox]');
      this.variantId = this.dataset.variantId;

      this.checkbox.addEventListener('change', () => this.handleChange());
    }

    async handleChange() {
      const isChecked = this.checkbox.checked;

      if (isChecked) {
        await this.addToCart();
      } else {
        await this.removeFromCart();
      }
    }

    async addToCart() {
      this.classList.add('is-loading');

      try {
        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              id: parseInt(this.variantId),
              quantity: 1,
              properties: {
                '_order_bump': 'true'
              }
            }]
          })
        });

        if (!response.ok) throw new Error('Failed to add');

        document.dispatchEvent(new CustomEvent('cart:refresh'));
        this.classList.add('is-added');
      } catch (error) {
        console.error('Order bump add error:', error);
        this.checkbox.checked = false;
      } finally {
        this.classList.remove('is-loading');
      }
    }

    async removeFromCart() {
      this.classList.add('is-loading');

      try {
        // Get current cart to find line item
        const cartResponse = await fetch(`${window.Shopify.routes.root}cart.js`);
        const cart = await cartResponse.json();

        const lineItem = cart.items.find(item =>
          item.variant_id === parseInt(this.variantId) &&
          item.properties?._order_bump === 'true'
        );

        if (lineItem) {
          await fetch(`${window.Shopify.routes.root}cart/change.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: lineItem.key,
              quantity: 0
            })
          });

          document.dispatchEvent(new CustomEvent('cart:refresh'));
        }

        this.classList.remove('is-added');
      } catch (error) {
        console.error('Order bump remove error:', error);
        this.checkbox.checked = true;
      } finally {
        this.classList.remove('is-loading');
      }
    }
  }

  customElements.define('order-bump', OrderBump);
</script>

<style>
  .order-bump {
    margin: 1.5rem 0;
  }

  .order-bump__inner {
    border: 2px dashed var(--color-primary);
    border-radius: 8px;
    background: var(--color-primary-light, rgba(var(--color-primary-rgb), 0.05));
    overflow: hidden;
  }

  .order-bump__checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .order-bump__content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .order-bump__content:hover {
    background: rgba(var(--color-primary-rgb), 0.1);
  }

  .order-bump__image {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    background: white;
  }

  .order-bump__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .order-bump__details {
    flex: 1;
    min-width: 0;
  }

  .order-bump__badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: var(--color-primary);
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 2px;
    margin-bottom: 0.25rem;
  }

  .order-bump__message {
    font-size: 0.875rem;
    margin: 0 0 0.25rem;
    color: var(--color-text-secondary);
  }

  .order-bump__title {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .order-bump__price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .order-bump__price--original {
    text-decoration: line-through;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .order-bump__price--sale {
    font-weight: 600;
    color: var(--color-sale);
  }

  .order-bump__price--badge {
    padding: 0.125rem 0.375rem;
    background: var(--color-sale);
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 2px;
  }

  .order-bump__action {
    flex-shrink: 0;
  }

  .order-bump__checkmark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    transition: all 0.2s;
  }

  .order-bump__checkmark svg {
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s;
    color: white;
  }

  .order-bump__checkbox:checked ~ .order-bump__content .order-bump__checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .order-bump__checkbox:checked ~ .order-bump__content .order-bump__checkmark svg {
    opacity: 1;
    transform: scale(1);
  }

  .order-bump.is-loading {
    opacity: 0.7;
    pointer-events: none;
  }

  @media (max-width: 480px) {
    .order-bump__content {
      flex-wrap: wrap;
    }

    .order-bump__action {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
  }
</style>
```

### Order Bump in Cart Form

```liquid
{% comment %} Usage in cart page {% endcomment %}
<form action="{{ routes.cart_url }}" method="post" id="cart">
  {%- comment -%} Cart items here {%- endcomment -%}

  {%- comment -%} Order bump before totals {%- endcomment -%}
  {%- assign bump_product = all_products['warranty-protection'] -%}
  {%- if bump_product != blank -%}
    {% render 'order-bump',
      product: bump_product,
      discount_percent: 25,
      custom_message: 'Protect your purchase with our 2-year warranty!'
    %}
  {%- endif -%}

  {%- comment -%} Cart totals {%- endcomment -%}
</form>
```

---

## Frequently Bought Together

### FBT Section

```liquid
{% comment %} sections/frequently-bought-together.liquid {% endcomment %}
{%- assign main_product = product | default: section.settings.product -%}

{%- if main_product != blank -%}
  <frequently-bought-together
    class="fbt"
    id="FBT-{{ section.id }}"
    data-product-id="{{ main_product.id }}"
    data-section-id="{{ section.id }}"
  >
    <h3 class="fbt__title">{{ section.settings.heading }}</h3>

    <div class="fbt__wrapper">
      <div class="fbt__products">
        {%- comment -%} Main product (always selected) {%- endcomment -%}
        <div class="fbt__product fbt__product--main">
          <div class="fbt__product-image">
            <img
              src="{{ main_product.featured_image | image_url: width: 200 }}"
              alt="{{ main_product.featured_image.alt | escape }}"
              width="100"
              height="100"
              loading="lazy"
            >
          </div>
          <div class="fbt__product-info">
            <span class="fbt__product-badge">{{ 'products.fbt.this_item' | t | default: 'This item' }}</span>
            <h4 class="fbt__product-title">{{ main_product.title }}</h4>
            <div class="fbt__product-price">
              {{ main_product.price | money }}
            </div>
          </div>
        </div>

        {%- comment -%} Companion products from metafield or recommendations {%- endcomment -%}
        <div class="fbt__companions" data-companions>
          {%- assign fbt_products = main_product.metafields.custom.frequently_bought_together.value -%}

          {%- if fbt_products != blank -%}
            {%- for fbt_product in fbt_products limit: 3 -%}
              <div class="fbt__plus" aria-hidden="true">+</div>
              {% render 'fbt-product-item', product: fbt_product, index: forloop.index %}
            {%- endfor -%}
          {%- else -%}
            {%- comment -%} Placeholder for JS-loaded recommendations {%- endcomment -%}
            <div class="fbt__loading">
              {% render 'loading-spinner' %}
            </div>
          {%- endif -%}
        </div>
      </div>

      <div class="fbt__summary">
        <div class="fbt__total">
          <span class="fbt__total-label">{{ 'products.fbt.total' | t | default: 'Total:' }}</span>
          <span class="fbt__total-price" data-total-price>
            {{ main_product.price | money }}
          </span>
          {%- if section.settings.show_savings -%}
            <span class="fbt__savings" data-savings style="display: none;">
              {{ 'products.fbt.save' | t | default: 'Save' }} <span data-savings-amount></span>
            </span>
          {%- endif -%}
        </div>

        <button
          type="button"
          class="fbt__add-all button"
          data-add-all
        >
          {{ section.settings.button_text | default: 'Add all to cart' }}
        </button>
      </div>
    </div>
  </frequently-bought-together>
{%- endif -%}

<script>
  class FrequentlyBoughtTogether extends HTMLElement {
    constructor() {
      super();
      this.selectedProducts = new Map();
      this.mainProductId = this.dataset.productId;
    }

    connectedCallback() {
      this.companionsContainer = this.querySelector('[data-companions]');
      this.totalPriceEl = this.querySelector('[data-total-price]');
      this.savingsEl = this.querySelector('[data-savings]');
      this.savingsAmountEl = this.querySelector('[data-savings-amount]');
      this.addAllBtn = this.querySelector('[data-add-all]');

      // Initialize main product as selected
      this.initMainProduct();

      // Load recommendations if no metafield products
      if (this.querySelector('.fbt__loading')) {
        this.loadRecommendations();
      } else {
        this.initCompanionProducts();
      }

      this.addAllBtn?.addEventListener('click', () => this.addAllToCart());
    }

    initMainProduct() {
      const mainProduct = this.querySelector('.fbt__product--main');
      if (!mainProduct) return;

      // Extract price from data or text
      const priceText = mainProduct.querySelector('.fbt__product-price')?.textContent;
      const price = this.parseMoney(priceText);

      this.mainProduct = {
        variantId: mainProduct.dataset.variantId || this.getMainVariantId(),
        price: price
      };
    }

    getMainVariantId() {
      // Get from product form on page
      const form = document.querySelector('form[action*="/cart/add"]');
      const variantInput = form?.querySelector('[name="id"]');
      return variantInput?.value;
    }

    initCompanionProducts() {
      this.querySelectorAll('.fbt__product-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.addEventListener('change', () => this.updateSelection());
          if (checkbox.checked) {
            this.selectedProducts.set(checkbox.value, {
              variantId: checkbox.value,
              price: parseFloat(item.dataset.price) || 0
            });
          }
        }
      });

      this.updateTotal();
    }

    async loadRecommendations() {
      try {
        const response = await fetch(
          `${window.Shopify.routes.root}recommendations/products.json?product_id=${this.mainProductId}&limit=3&intent=complementary`
        );
        const data = await response.json();

        if (data.products.length > 0) {
          this.renderCompanions(data.products);
        } else {
          this.companionsContainer.innerHTML = '';
        }
      } catch (error) {
        console.error('FBT recommendations error:', error);
        this.companionsContainer.innerHTML = '';
      }
    }

    renderCompanions(products) {
      this.companionsContainer.innerHTML = products.map((product, index) => `
        <div class="fbt__plus" aria-hidden="true">+</div>
        <div class="fbt__product-item" data-price="${product.price}">
          <label class="fbt__product-label">
            <input
              type="checkbox"
              value="${product.variants[0].id}"
              checked
              class="fbt__checkbox"
            >
            <div class="fbt__product-image">
              <img
                src="${product.featured_image ? this.getImageUrl(product.featured_image, 200) : ''}"
                alt="${this.escapeHtml(product.title)}"
                width="100"
                height="100"
                loading="lazy"
              >
              <span class="fbt__checkmark"></span>
            </div>
            <div class="fbt__product-info">
              <h4 class="fbt__product-title">${this.escapeHtml(product.title)}</h4>
              <div class="fbt__product-price">${this.formatMoney(product.price)}</div>
            </div>
          </label>
        </div>
      `).join('');

      this.initCompanionProducts();
    }

    updateSelection() {
      this.selectedProducts.clear();

      this.querySelectorAll('.fbt__product-item input:checked').forEach(checkbox => {
        const item = checkbox.closest('.fbt__product-item');
        this.selectedProducts.set(checkbox.value, {
          variantId: checkbox.value,
          price: parseFloat(item.dataset.price) || 0
        });
      });

      this.updateTotal();
    }

    updateTotal() {
      let total = this.mainProduct?.price || 0;

      this.selectedProducts.forEach(product => {
        total += product.price;
      });

      this.totalPriceEl.textContent = this.formatMoney(total * 100);

      // Calculate savings if bundle discount configured
      const bundleDiscount = parseFloat(this.dataset.bundleDiscount) || 0;
      if (bundleDiscount > 0 && this.selectedProducts.size > 0) {
        const savings = total * (bundleDiscount / 100);
        this.savingsAmountEl.textContent = this.formatMoney(savings * 100);
        this.savingsEl.style.display = '';
      } else {
        this.savingsEl.style.display = 'none';
      }
    }

    async addAllToCart() {
      const items = [];

      // Add main product
      if (this.mainProduct?.variantId) {
        items.push({ id: parseInt(this.mainProduct.variantId), quantity: 1 });
      }

      // Add selected companions
      this.selectedProducts.forEach(product => {
        items.push({ id: parseInt(product.variantId), quantity: 1 });
      });

      if (items.length === 0) return;

      this.addAllBtn.disabled = true;
      this.addAllBtn.textContent = 'Adding...';

      try {
        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });

        if (!response.ok) throw new Error('Add to cart failed');

        document.dispatchEvent(new CustomEvent('cart:refresh'));
        this.addAllBtn.textContent = 'Added!';

        setTimeout(() => {
          this.addAllBtn.disabled = false;
          this.addAllBtn.textContent = 'Add all to cart';
        }, 2000);
      } catch (error) {
        console.error('FBT add to cart error:', error);
        this.addAllBtn.disabled = false;
        this.addAllBtn.textContent = 'Add all to cart';
      }
    }

    parseMoney(text) {
      if (!text) return 0;
      const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }

    formatMoney(cents) {
      return new Intl.NumberFormat(Shopify.locale, {
        style: 'currency',
        currency: Shopify.currency.active
      }).format(cents / 100);
    }

    getImageUrl(url, size) {
      return url.replace(/(_\d+x\d+)?(\.[a-zA-Z]+)(\?.*)?$/, `_${size}x$2`);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  customElements.define('frequently-bought-together', FrequentlyBoughtTogether);
</script>

{% schema %}
{
  "name": "Frequently Bought Together",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Frequently Bought Together"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button text",
      "default": "Add all to cart"
    },
    {
      "type": "checkbox",
      "id": "show_savings",
      "label": "Show savings",
      "default": false
    },
    {
      "type": "range",
      "id": "bundle_discount",
      "label": "Bundle discount percentage",
      "min": 0,
      "max": 30,
      "step": 5,
      "default": 0,
      "unit": "%",
      "info": "Requires checkout script or app for actual discount"
    }
  ],
  "presets": [
    {
      "name": "Frequently Bought Together"
    }
  ]
}
{% endschema %}
```

### FBT Product Item Snippet

```liquid
{% comment %} snippets/fbt-product-item.liquid {% endcomment %}
<div class="fbt__product-item" data-price="{{ product.price }}">
  <label class="fbt__product-label">
    <input
      type="checkbox"
      value="{{ product.selected_or_first_available_variant.id }}"
      {% if index <= 2 %}checked{% endif %}
      class="fbt__checkbox"
    >
    <div class="fbt__product-image">
      {%- if product.featured_image -%}
        <img
          src="{{ product.featured_image | image_url: width: 200 }}"
          alt="{{ product.featured_image.alt | escape }}"
          width="100"
          height="100"
          loading="lazy"
        >
      {%- endif -%}
      <span class="fbt__checkmark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
    </div>
    <div class="fbt__product-info">
      <h4 class="fbt__product-title">{{ product.title }}</h4>
      <div class="fbt__product-price">{{ product.price | money }}</div>
    </div>
  </label>
</div>
```

### FBT Styles

```css
/* assets/frequently-bought-together.css */
.fbt {
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
  margin-top: 2rem;
}

.fbt__title {
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
}

.fbt__wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fbt__products {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fbt__product,
.fbt__product-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  min-width: 180px;
}

.fbt__product--main {
  border-color: var(--color-primary);
  background: var(--color-primary-light, rgba(var(--color-primary-rgb), 0.05));
}

.fbt__product-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.fbt__checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.fbt__product-image {
  position: relative;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.fbt__product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fbt__checkmark {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 50%;
  color: white;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s;
}

.fbt__checkbox:checked ~ .fbt__product-image .fbt__checkmark {
  opacity: 1;
  transform: scale(1);
}

.fbt__checkbox:not(:checked) ~ .fbt__product-image {
  opacity: 0.5;
}

.fbt__product-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 2px;
  margin-bottom: 0.25rem;
}

.fbt__product-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fbt__product-price {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.fbt__plus {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--color-text-secondary);
  padding: 0 0.5rem;
}

.fbt__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
}

.fbt__total {
  display: flex;
  flex-direction: column;
}

.fbt__total-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.fbt__total-price {
  font-size: 1.25rem;
  font-weight: 600;
}

.fbt__savings {
  font-size: 0.75rem;
  color: var(--color-sale);
  font-weight: 500;
}

.fbt__add-all {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .fbt__products {
    flex-direction: column;
    align-items: stretch;
  }

  .fbt__plus {
    justify-content: center;
  }

  .fbt__summary {
    flex-direction: column;
    text-align: center;
  }

  .fbt__add-all {
    width: 100%;
  }
}
```

---

## Free Shipping Progress Bar

### Shipping Progress Component

```liquid
{% comment %} snippets/free-shipping-bar.liquid {% endcomment %}
{% comment %}
  Renders a free shipping progress bar

  Accepts:
  - threshold: Free shipping threshold in shop currency (required)
  - cart: Cart object (required)

  Usage:
  {% render 'free-shipping-bar', threshold: 75, cart: cart %}
{% endcomment %}

{%- liquid
  assign threshold_cents = threshold | times: 100
  assign cart_total = cart.total_price
  assign remaining = threshold_cents | minus: cart_total
  assign progress_percent = cart_total | times: 100 | divided_by: threshold_cents
  if progress_percent > 100
    assign progress_percent = 100
  endif
  assign qualified = false
  if remaining <= 0
    assign qualified = true
    assign remaining = 0
  endif
-%}

<free-shipping-bar
  class="shipping-bar {% if qualified %}shipping-bar--qualified{% endif %}"
  data-threshold="{{ threshold_cents }}"
>
  <div class="shipping-bar__content">
    {%- if qualified -%}
      <span class="shipping-bar__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </span>
      <span class="shipping-bar__message">
        {{ 'cart.free_shipping.qualified' | t | default: "Congratulations! You've qualified for free shipping!" }}
      </span>
    {%- else -%}
      <span class="shipping-bar__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </span>
      <span class="shipping-bar__message">
        {{ 'cart.free_shipping.spend_more' | t: remaining: remaining | money_without_trailing_zeros | default: "Spend {remaining} more for free shipping!" | replace: '{remaining}', remaining | money_without_trailing_zeros }}
      </span>
    {%- endif -%}
  </div>

  <div class="shipping-bar__track">
    <div class="shipping-bar__progress" style="width: {{ progress_percent }}%"></div>
  </div>
</free-shipping-bar>

<script>
  class FreeShippingBar extends HTMLElement {
    connectedCallback() {
      this.threshold = parseInt(this.dataset.threshold);
      this.progressBar = this.querySelector('.shipping-bar__progress');
      this.messageEl = this.querySelector('.shipping-bar__message');

      // Listen for cart updates
      document.addEventListener('cart:updated', (e) => this.update(e.detail?.cart));
    }

    update(cart) {
      if (!cart) return;

      const cartTotal = cart.total_price;
      const remaining = Math.max(0, this.threshold - cartTotal);
      const progress = Math.min(100, (cartTotal / this.threshold) * 100);
      const qualified = remaining <= 0;

      // Update progress bar
      this.progressBar.style.width = `${progress}%`;

      // Update qualified state
      this.classList.toggle('shipping-bar--qualified', qualified);

      // Update message
      if (qualified) {
        this.messageEl.textContent = "Congratulations! You've qualified for free shipping!";
      } else {
        const remainingFormatted = this.formatMoney(remaining);
        this.messageEl.textContent = `Spend ${remainingFormatted} more for free shipping!`;
      }
    }

    formatMoney(cents) {
      return new Intl.NumberFormat(Shopify.locale, {
        style: 'currency',
        currency: Shopify.currency.active,
        minimumFractionDigits: 0
      }).format(cents / 100);
    }
  }

  customElements.define('free-shipping-bar', FreeShippingBar);
</script>

<style>
  .shipping-bar {
    padding: 1rem;
    background: var(--color-background-secondary);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .shipping-bar__content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .shipping-bar__icon {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  .shipping-bar--qualified .shipping-bar__icon {
    color: var(--color-success, #22c55e);
  }

  .shipping-bar__message {
    font-size: 0.875rem;
  }

  .shipping-bar__track {
    height: 6px;
    background: var(--color-border);
    border-radius: 3px;
    overflow: hidden;
  }

  .shipping-bar__progress {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark, var(--color-primary)));
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .shipping-bar--qualified .shipping-bar__progress {
    background: var(--color-success, #22c55e);
  }
</style>
```

---

## Cart Drawer Upsells

### Cart Drawer with Upsells

```liquid
{% comment %} sections/cart-drawer.liquid {% endcomment %}
<cart-drawer class="cart-drawer" id="cart-drawer">
  <div class="cart-drawer__overlay" data-close></div>

  <div class="cart-drawer__content">
    <div class="cart-drawer__header">
      <h2 class="cart-drawer__title">
        {{ 'cart.general.title' | t | default: 'Your Cart' }}
        (<span data-cart-count>{{ cart.item_count }}</span>)
      </h2>
      <button type="button" class="cart-drawer__close" data-close aria-label="Close cart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    {%- comment -%} Free shipping bar {%- endcomment -%}
    {% render 'free-shipping-bar', threshold: settings.free_shipping_threshold, cart: cart %}

    <div class="cart-drawer__body" data-cart-body>
      {%- if cart.item_count > 0 -%}
        <div class="cart-drawer__items" data-cart-items>
          {%- for item in cart.items -%}
            {% render 'cart-drawer-item', item: item %}
          {%- endfor -%}
        </div>
      {%- else -%}
        <div class="cart-drawer__empty">
          <p>{{ 'cart.general.empty' | t | default: 'Your cart is empty' }}</p>
          <a href="{{ routes.all_products_collection_url }}" class="button">
            {{ 'cart.general.continue_shopping' | t | default: 'Continue Shopping' }}
          </a>
        </div>
      {%- endif -%}
    </div>

    {%- comment -%} Upsell section in drawer {%- endcomment -%}
    {%- if cart.item_count > 0 -%}
      <div class="cart-drawer__upsells" data-drawer-upsells>
        <h4 class="cart-drawer__upsells-title">{{ section.settings.upsell_heading }}</h4>
        <div class="cart-drawer__upsells-slider" data-upsell-slider>
          {%- comment -%} Loaded via JS {%- endcomment -%}
          <div class="cart-drawer__upsells-loading">
            {% render 'loading-spinner', size: 'small' %}
          </div>
        </div>
      </div>
    {%- endif -%}

    {%- comment -%} Footer with totals {%- endcomment -%}
    {%- if cart.item_count > 0 -%}
      <div class="cart-drawer__footer">
        <div class="cart-drawer__totals">
          <div class="cart-drawer__subtotal">
            <span>{{ 'cart.general.subtotal' | t | default: 'Subtotal' }}</span>
            <span data-cart-subtotal>{{ cart.total_price | money }}</span>
          </div>
          <p class="cart-drawer__note">
            {{ 'cart.general.taxes_shipping_note' | t | default: 'Taxes and shipping calculated at checkout' }}
          </p>
        </div>

        <div class="cart-drawer__actions">
          <a href="{{ routes.cart_url }}" class="button button--secondary">
            {{ 'cart.general.view_cart' | t | default: 'View Cart' }}
          </a>
          <button type="submit" name="checkout" class="button" form="cart-drawer-form">
            {{ 'cart.general.checkout' | t | default: 'Checkout' }}
          </button>
        </div>
      </div>
    {%- endif -%}
  </div>

  <form id="cart-drawer-form" action="{{ routes.cart_url }}" method="post"></form>
</cart-drawer>

<script>
  class CartDrawer extends HTMLElement {
    constructor() {
      super();
      this.upsellProducts = [];
    }

    connectedCallback() {
      this.overlay = this.querySelector('[data-close]');
      this.closeBtns = this.querySelectorAll('[data-close]');
      this.upsellSlider = this.querySelector('[data-upsell-slider]');

      this.bindEvents();
      this.loadUpsells();
    }

    bindEvents() {
      this.closeBtns.forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.classList.contains('is-open')) {
          this.close();
        }
      });

      // Listen for cart updates
      document.addEventListener('cart:refresh', () => this.refreshCart());
      document.addEventListener('cart:open', () => this.open());
    }

    open() {
      this.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    async refreshCart() {
      try {
        const response = await fetch(`${window.Shopify.routes.root}cart.js`);
        const cart = await response.json();

        // Update count
        this.querySelector('[data-cart-count]').textContent = cart.item_count;

        // Update subtotal
        const subtotalEl = this.querySelector('[data-cart-subtotal]');
        if (subtotalEl) {
          subtotalEl.textContent = this.formatMoney(cart.total_price);
        }

        // Reload items HTML
        await this.reloadItems();

        // Reload upsells
        this.loadUpsells();

        // Dispatch updated event
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      } catch (error) {
        console.error('Cart refresh error:', error);
      }
    }

    async reloadItems() {
      try {
        const response = await fetch(`${window.Shopify.routes.root}?sections=cart-drawer`);
        const sections = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(sections['cart-drawer'], 'text/html');

        const newBody = doc.querySelector('[data-cart-body]');
        const currentBody = this.querySelector('[data-cart-body]');
        if (newBody && currentBody) {
          currentBody.innerHTML = newBody.innerHTML;
        }
      } catch (error) {
        console.error('Cart items reload error:', error);
      }
    }

    async loadUpsells() {
      if (!this.upsellSlider) return;

      try {
        // Get cart items to exclude
        const cartResponse = await fetch(`${window.Shopify.routes.root}cart.js`);
        const cart = await cartResponse.json();

        if (cart.items.length === 0) {
          this.upsellSlider.innerHTML = '';
          return;
        }

        const excludeIds = cart.items.map(item => item.product_id);
        const firstProductId = cart.items[0].product_id;

        // Fetch recommendations
        const recResponse = await fetch(
          `${window.Shopify.routes.root}recommendations/products.json?product_id=${firstProductId}&limit=6&intent=related`
        );
        const data = await recResponse.json();

        // Filter excluded and render
        const products = data.products.filter(p => !excludeIds.includes(p.id)).slice(0, 4);
        this.renderUpsells(products);
      } catch (error) {
        console.error('Upsell load error:', error);
        this.upsellSlider.innerHTML = '';
      }
    }

    renderUpsells(products) {
      if (products.length === 0) {
        this.upsellSlider.closest('.cart-drawer__upsells').style.display = 'none';
        return;
      }

      this.upsellSlider.closest('.cart-drawer__upsells').style.display = '';
      this.upsellSlider.innerHTML = products.map(product => `
        <div class="cart-drawer__upsell-item">
          <a href="${product.url}" class="cart-drawer__upsell-image">
            <img src="${this.getImageUrl(product.featured_image, 100)}" alt="${this.escapeHtml(product.title)}" width="60" height="60" loading="lazy">
          </a>
          <div class="cart-drawer__upsell-info">
            <a href="${product.url}" class="cart-drawer__upsell-title">${this.escapeHtml(product.title)}</a>
            <span class="cart-drawer__upsell-price">${this.formatMoney(product.price)}</span>
          </div>
          <button type="button" class="cart-drawer__upsell-add" data-add-variant="${product.variants[0].id}" aria-label="Add ${this.escapeHtml(product.title)} to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      `).join('');

      // Bind add buttons
      this.upsellSlider.querySelectorAll('[data-add-variant]').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            await fetch(`${window.Shopify.routes.root}cart/add.js`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: [{ id: parseInt(btn.dataset.addVariant), quantity: 1 }]
              })
            });
            document.dispatchEvent(new CustomEvent('cart:refresh'));
          } catch (error) {
            console.error('Add upsell error:', error);
            btn.disabled = false;
          }
        });
      });
    }

    formatMoney(cents) {
      return new Intl.NumberFormat(Shopify.locale, {
        style: 'currency',
        currency: Shopify.currency.active
      }).format(cents / 100);
    }

    getImageUrl(url, size) {
      if (!url) return '';
      return url.replace(/(_\d+x\d+)?(\.[a-zA-Z]+)(\?.*)?$/, `_${size}x$2`);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  customElements.define('cart-drawer', CartDrawer);
</script>

{% schema %}
{
  "name": "Cart Drawer",
  "settings": [
    {
      "type": "text",
      "id": "upsell_heading",
      "label": "Upsell heading",
      "default": "You might also like"
    }
  ]
}
{% endschema %}
```

### Cart Drawer Styles

```css
/* assets/cart-drawer.css */
cart-drawer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  visibility: hidden;
  pointer-events: none;
}

cart-drawer.is-open {
  visibility: visible;
  pointer-events: auto;
}

.cart-drawer__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s;
}

cart-drawer.is-open .cart-drawer__overlay {
  background: rgba(0, 0, 0, 0.5);
}

.cart-drawer__content {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

cart-drawer.is-open .cart-drawer__content {
  transform: translateX(0);
}

.cart-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.cart-drawer__title {
  font-size: 1.125rem;
  margin: 0;
}

.cart-drawer__close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
}

.cart-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.cart-drawer__empty {
  text-align: center;
  padding: 3rem 1rem;
}

.cart-drawer__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Upsells in drawer */
.cart-drawer__upsells {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-secondary);
}

.cart-drawer__upsells-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.cart-drawer__upsells-slider {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 0.5rem;
}

.cart-drawer__upsell-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 200px;
  padding: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.cart-drawer__upsell-image {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
}

.cart-drawer__upsell-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.cart-drawer__upsell-info {
  flex: 1;
  min-width: 0;
}

.cart-drawer__upsell-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-drawer__upsell-price {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.cart-drawer__upsell-add {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cart-drawer__upsell-add:hover {
  opacity: 0.8;
}

.cart-drawer__upsell-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.cart-drawer__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
}

.cart-drawer__subtotal {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.cart-drawer__note {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0 0 1rem;
}

.cart-drawer__actions {
  display: flex;
  gap: 0.75rem;
}

.cart-drawer__actions .button {
  flex: 1;
}
```

---

## Product Recommendations API

### Recommendations Helper

```javascript
// assets/recommendations.js
class ProductRecommendations {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch product recommendations
   * @param {number} productId - Product ID to get recommendations for
   * @param {Object} options - Options
   * @param {string} options.intent - 'related' or 'complementary'
   * @param {number} options.limit - Max products to return
   * @param {number[]} options.exclude - Product IDs to exclude
   * @returns {Promise<Object[]>} Array of product objects
   */
  async fetch(productId, { intent = 'related', limit = 4, exclude = [] } = {}) {
    const cacheKey = `${productId}-${intent}-${limit}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return this.filterExcluded(cached.products, exclude);
    }

    try {
      const url = `${window.Shopify.routes.root}recommendations/products.json?product_id=${productId}&limit=${limit + exclude.length}&intent=${intent}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Recommendations request failed');

      const data = await response.json();

      // Cache results
      this.cache.set(cacheKey, {
        products: data.products,
        timestamp: Date.now()
      });

      return this.filterExcluded(data.products, exclude);
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }

  filterExcluded(products, excludeIds) {
    if (!excludeIds.length) return products;
    return products.filter(p => !excludeIds.includes(p.id));
  }

  /**
   * Get recommendations for multiple products (e.g., cart items)
   * @param {number[]} productIds - Array of product IDs
   * @param {Object} options - Options
   * @returns {Promise<Object[]>} Deduplicated array of product objects
   */
  async fetchForMultiple(productIds, { intent = 'related', limitPerProduct = 2, totalLimit = 8, exclude = [] } = {}) {
    const allProducts = new Map();

    await Promise.all(productIds.map(async (id) => {
      const products = await this.fetch(id, { intent, limit: limitPerProduct, exclude });
      products.forEach(p => {
        if (!allProducts.has(p.id) && !exclude.includes(p.id)) {
          allProducts.set(p.id, p);
        }
      });
    }));

    return Array.from(allProducts.values()).slice(0, totalLimit);
  }
}

// Global instance
window.recommendations = new ProductRecommendations();
```

### Usage Examples

```javascript
// Get related products
const related = await window.recommendations.fetch(productId, {
  intent: 'related',
  limit: 4,
  exclude: [cartProductIds]
});

// Get complementary products (for FBT)
const complementary = await window.recommendations.fetch(productId, {
  intent: 'complementary',
  limit: 3
});

// Get recommendations for all cart items
const cartRecs = await window.recommendations.fetchForMultiple(
  cart.items.map(item => item.product_id),
  {
    intent: 'related',
    totalLimit: 6,
    exclude: cart.items.map(item => item.product_id)
  }
);
```

---

## Checklist

When implementing cart upsells:

- [ ] Use Product Recommendations API for automatic suggestions
- [ ] Exclude products already in cart from upsells
- [ ] Provide fallback for manual product selection
- [ ] Update upsells when cart changes
- [ ] Ensure quick add works without page refresh
- [ ] Show loading states during AJAX operations
- [ ] Test free shipping bar threshold calculations
- [ ] Verify order bump adds correct variant
- [ ] Check FBT checkbox states update totals
- [ ] Ensure cart drawer refreshes properly
- [ ] Test on mobile devices (touch interactions)
- [ ] Consider rate limiting API requests
