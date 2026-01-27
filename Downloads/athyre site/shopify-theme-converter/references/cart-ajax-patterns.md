# Cart AJAX Patterns

Complete reference for AJAX cart functionality in Shopify.

## Cart API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cart.js` | GET | Get full cart as JSON |
| `/cart/add.js` | POST | Add items to cart |
| `/cart/update.js` | POST | Update quantities |
| `/cart/change.js` | POST | Change specific line item |
| `/cart/clear.js` | POST | Empty the cart |

---

## Cart Data Structure

```javascript
// Response from /cart.js
{
  "token": "cart_token_string",
  "note": "Customer note",
  "attributes": {},
  "original_total_price": 9999,
  "total_price": 9999,
  "total_discount": 0,
  "total_weight": 500.0,
  "item_count": 2,
  "items": [
    {
      "id": 40789349580985,           // Variant ID
      "quantity": 1,
      "variant_id": 40789349580985,
      "key": "40789349580985:abc123", // Unique line item key
      "title": "Product - Size",
      "price": 4999,
      "original_price": 4999,
      "discounted_price": 4999,
      "line_price": 4999,
      "original_line_price": 4999,
      "total_discount": 0,
      "discounts": [],
      "sku": "SKU123",
      "grams": 250,
      "vendor": "Brand",
      "taxable": true,
      "product_id": 7234567890123,
      "product_has_only_default_variant": false,
      "gift_card": false,
      "final_price": 4999,
      "final_line_price": 4999,
      "url": "/products/product-handle?variant=40789349580985",
      "featured_image": {
        "aspect_ratio": 1.0,
        "alt": "Alt text",
        "height": 500,
        "url": "https://cdn.shopify.com/...",
        "width": 500
      },
      "image": "https://cdn.shopify.com/...",
      "handle": "product-handle",
      "requires_shipping": true,
      "product_type": "Category",
      "product_title": "Product Name",
      "product_description": "Description...",
      "variant_title": "Size",
      "variant_options": ["Size"],
      "options_with_values": [
        { "name": "Size", "value": "Medium" }
      ],
      "line_level_discount_allocations": [],
      "line_level_total_discount": 0,
      "properties": {}
    }
  ],
  "requires_shipping": true,
  "currency": "USD",
  "items_subtotal_price": 9999,
  "cart_level_discount_applications": []
}
```

---

## JavaScript Cart Class

### Full-Featured Cart Manager

```javascript
// assets/cart.js

class CartManager {
  constructor() {
    this.cart = null;
    this.routes = window.Shopify?.routes || {
      cartUrl: '/cart',
      cartAddUrl: '/cart/add.js',
      cartChangeUrl: '/cart/change.js',
      cartUpdateUrl: '/cart/update.js',
      cartClearUrl: '/cart/clear.js'
    };
  }

  /**
   * Fetch current cart state
   */
  async getCart() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      return this.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Add item(s) to cart
   * @param {Object|Array} items - Item or array of items to add
   */
  async addToCart(items) {
    const itemsArray = Array.isArray(items) ? items : [items];

    try {
      const response = await fetch(this.routes.cartAddUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items: itemsArray })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Error adding to cart');
      }

      const result = await response.json();
      this.dispatchEvent('cart:item-added', result);
      await this.getCart(); // Refresh cart state
      return result;

    } catch (error) {
      this.dispatchEvent('cart:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update item quantity by line key
   * @param {string} key - Line item key
   * @param {number} quantity - New quantity
   */
  async updateItem(key, quantity) {
    try {
      const response = await fetch(this.routes.cartChangeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: key, quantity })
      });

      if (!response.ok) throw new Error('Error updating cart');

      this.cart = await response.json();
      this.dispatchEvent('cart:updated', this.cart);
      return this.cart;

    } catch (error) {
      this.dispatchEvent('cart:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} key - Line item key
   */
  async removeItem(key) {
    return this.updateItem(key, 0);
  }

  /**
   * Update cart note
   * @param {string} note - Cart note text
   */
  async updateNote(note) {
    try {
      const response = await fetch(this.routes.cartUpdateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ note })
      });

      this.cart = await response.json();
      return this.cart;

    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Update cart attributes
   * @param {Object} attributes - Key-value pairs
   */
  async updateAttributes(attributes) {
    try {
      const response = await fetch(this.routes.cartUpdateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ attributes })
      });

      this.cart = await response.json();
      return this.cart;

    } catch (error) {
      console.error('Error updating attributes:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      const response = await fetch(this.routes.cartClearUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      this.cart = await response.json();
      this.dispatchEvent('cart:cleared', this.cart);
      return this.cart;

    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true
    }));
  }
}

// Initialize global cart instance
window.cart = new CartManager();
```

---

## Add to Cart Form Handler

### AJAX Form Submission

```javascript
// assets/product-form.js

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');
    this.errorContainer = this.querySelector('.form-errors');

    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();

    if (this.submitButton.disabled) return;

    this.setLoading(true);
    this.clearErrors();

    const formData = new FormData(this.form);
    const config = {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/javascript'
      }
    };

    // Handle sections to render
    if (this.dataset.sectionsToRender) {
      formData.append('sections', this.dataset.sectionsToRender);
      formData.append('sections_url', window.location.pathname);
    }

    config.body = formData;

    try {
      const response = await fetch('/cart/add.js', config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || 'Error adding to cart');
      }

      // Success - update cart UI
      this.onSuccess(data);

    } catch (error) {
      this.onError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  onSuccess(data) {
    // Dispatch event for cart drawer/notification
    document.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: {
        items: data.items || [data],
        sections: data.sections
      },
      bubbles: true
    }));

    // Optional: Show success message
    this.showMessage('Added to cart!', 'success');
  }

  onError(message) {
    if (this.errorContainer) {
      this.errorContainer.textContent = message;
      this.errorContainer.hidden = false;
    }

    document.dispatchEvent(new CustomEvent('cart:error', {
      detail: { message },
      bubbles: true
    }));
  }

  clearErrors() {
    if (this.errorContainer) {
      this.errorContainer.textContent = '';
      this.errorContainer.hidden = true;
    }
  }

  setLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.classList.toggle('is-loading', loading);
  }

  showMessage(text, type = 'info') {
    // Implement toast/notification
  }
}

customElements.define('product-form', ProductForm);
```

---

## Cart Drawer Component

### Slide-Out Cart

```liquid
{%- comment -%}
  sections/cart-drawer.liquid
{%- endcomment -%}

<cart-drawer class="cart-drawer" id="cart-drawer">
  <div class="cart-drawer-overlay" data-cart-close></div>

  <div class="cart-drawer-container">
    <header class="cart-drawer-header">
      <h2>{{ 'sections.cart.title' | t }}</h2>
      <button class="cart-drawer-close" data-cart-close aria-label="{{ 'accessibility.close' | t }}">
        {% render 'icon-close' %}
      </button>
    </header>

    <div class="cart-drawer-content" id="cart-drawer-content">
      {%- if cart.item_count > 0 -%}
        <form action="{{ routes.cart_url }}" method="post" id="cart-drawer-form">
          <ul class="cart-drawer-items">
            {%- for item in cart.items -%}
              {% render 'cart-drawer-item', item: item %}
            {%- endfor -%}
          </ul>
        </form>
      {%- else -%}
        <div class="cart-drawer-empty">
          <p>{{ 'sections.cart.empty' | t }}</p>
          <a href="{{ routes.collections_url }}" class="btn btn--primary">
            {{ 'sections.cart.continue_shopping' | t }}
          </a>
        </div>
      {%- endif -%}
    </div>

    {%- if cart.item_count > 0 -%}
      <footer class="cart-drawer-footer">
        <div class="cart-drawer-subtotal">
          <span>{{ 'sections.cart.subtotal' | t }}</span>
          <span class="cart-subtotal-value">{{ cart.total_price | money }}</span>
        </div>

        {%- if cart.cart_level_discount_applications.size > 0 -%}
          <ul class="cart-drawer-discounts">
            {%- for discount in cart.cart_level_discount_applications -%}
              <li>
                {{ discount.title }} (-{{ discount.total_allocated_amount | money }})
              </li>
            {%- endfor -%}
          </ul>
        {%- endif -%}

        <p class="cart-drawer-taxes">
          {%- if cart.taxes_included and shop.shipping_policy.body != blank -%}
            {{ 'sections.cart.taxes_included_and_shipping_policy_html' | t: link: shop.shipping_policy.url }}
          {%- elsif cart.taxes_included -%}
            {{ 'sections.cart.taxes_included_but_shipping_at_checkout' | t }}
          {%- elsif shop.shipping_policy.body != blank -%}
            {{ 'sections.cart.taxes_and_shipping_policy_at_checkout_html' | t: link: shop.shipping_policy.url }}
          {%- else -%}
            {{ 'sections.cart.taxes_and_shipping_at_checkout' | t }}
          {%- endif -%}
        </p>

        <div class="cart-drawer-actions">
          <a href="{{ routes.cart_url }}" class="btn btn--secondary">
            {{ 'sections.cart.view_cart' | t }}
          </a>
          <button type="submit" name="checkout" class="btn btn--primary" form="cart-drawer-form">
            {{ 'sections.cart.checkout' | t }}
          </button>
        </div>
      </footer>
    {%- endif -%}
  </div>
</cart-drawer>
```

### Cart Drawer JavaScript

```javascript
// assets/cart-drawer.js

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.closeButtons = this.querySelectorAll('[data-cart-close]');
    this.contentElement = this.querySelector('#cart-drawer-content');

    // Bind close handlers
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Listen for cart updates
    document.addEventListener('cart:item-added', (e) => {
      this.refresh(e.detail.sections);
      this.open();
    });

    document.addEventListener('cart:updated', () => {
      this.refresh();
    });
  }

  get isOpen() {
    return this.classList.contains('is-open');
  }

  open() {
    this.classList.add('is-open');
    document.body.classList.add('cart-drawer-open');
    this.setAttribute('aria-hidden', 'false');

    // Focus trap
    this.querySelector('.cart-drawer-close')?.focus();
  }

  close() {
    this.classList.remove('is-open');
    document.body.classList.remove('cart-drawer-open');
    this.setAttribute('aria-hidden', 'true');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  async refresh(sections = null) {
    try {
      if (sections && sections['cart-drawer']) {
        // Use pre-rendered section from response
        this.updateContent(sections['cart-drawer']);
      } else {
        // Fetch fresh content
        const response = await fetch('/?sections=cart-drawer');
        const data = await response.json();
        this.updateContent(data['cart-drawer']);
      }
    } catch (error) {
      console.error('Error refreshing cart drawer:', error);
    }
  }

  updateContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newContent = doc.querySelector('#cart-drawer-content');

    if (newContent && this.contentElement) {
      this.contentElement.innerHTML = newContent.innerHTML;
    }

    // Update cart count in header
    this.updateCartCount();
  }

  async updateCartCount() {
    try {
      const cart = await (await fetch('/cart.js')).json();
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
        el.hidden = cart.item_count === 0;
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }
}

customElements.define('cart-drawer', CartDrawer);
```

---

## Quantity Updates in Cart

### Quantity Selector Component

```liquid
{%- comment -%}
  snippets/quantity-selector.liquid
{%- endcomment -%}

<quantity-input class="quantity-selector">
  <button
    type="button"
    class="quantity-btn quantity-btn--minus"
    aria-label="{{ 'products.product.quantity.decrease' | t }}"
  >
    {% render 'icon-minus' %}
  </button>

  <input
    type="number"
    class="quantity-input"
    name="quantity"
    min="1"
    max="{{ max | default: 99 }}"
    value="{{ value | default: 1 }}"
    data-line-key="{{ line_key }}"
    aria-label="{{ 'products.product.quantity.input_label' | t }}"
  >

  <button
    type="button"
    class="quantity-btn quantity-btn--plus"
    aria-label="{{ 'products.product.quantity.increase' | t }}"
  >
    {% render 'icon-plus' %}
  </button>
</quantity-input>
```

```javascript
// assets/quantity-input.js

class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input');
    this.minusBtn = this.querySelector('.quantity-btn--minus');
    this.plusBtn = this.querySelector('.quantity-btn--plus');

    this.minusBtn.addEventListener('click', () => this.adjust(-1));
    this.plusBtn.addEventListener('click', () => this.adjust(1));
    this.input.addEventListener('change', () => this.onChange());
  }

  get value() {
    return parseInt(this.input.value) || 1;
  }

  get min() {
    return parseInt(this.input.min) || 1;
  }

  get max() {
    return parseInt(this.input.max) || 99;
  }

  adjust(delta) {
    const newValue = Math.min(Math.max(this.value + delta, this.min), this.max);
    this.input.value = newValue;
    this.onChange();
  }

  onChange() {
    const lineKey = this.input.dataset.lineKey;

    if (lineKey) {
      // This is a cart item - update via AJAX
      this.updateCart(lineKey, this.value);
    } else {
      // This is a product form - just dispatch event
      this.dispatchEvent(new CustomEvent('quantity:change', {
        detail: { quantity: this.value },
        bubbles: true
      }));
    }
  }

  async updateCart(key, quantity) {
    this.classList.add('is-loading');

    try {
      await window.cart.updateItem(key, quantity);
    } catch (error) {
      // Revert to original value on error
      this.input.value = this.input.defaultValue;
    } finally {
      this.classList.remove('is-loading');
    }
  }
}

customElements.define('quantity-input', QuantityInput);
```

---

## Section Rendering

### Request Specific Sections

```javascript
// Fetch multiple sections with cart update
async function updateCartWithSections(key, quantity) {
  const sections = 'cart-drawer,cart-icon-bubble,cart-live-region';

  const response = await fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: key,
      quantity: quantity,
      sections: sections,
      sections_url: window.location.pathname
    })
  });

  const cart = await response.json();

  // cart.sections contains rendered HTML for each section
  // { 'cart-drawer': '<cart-drawer>...</cart-drawer>', ... }

  return cart;
}
```

---

## Error Handling

### Common Cart Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 422 - Cannot find variant | Invalid variant ID | Verify variant exists |
| 422 - Product not available | Out of stock | Check `available` before add |
| 422 - Quantity exceeded | Over inventory | Show max available |
| 422 - All items removed | Cart conflict | Refresh cart state |

### Error Display Pattern

```liquid
<div class="cart-errors" role="alert" aria-live="polite" hidden>
  <p class="cart-error-message"></p>
</div>
```

```javascript
document.addEventListener('cart:error', (e) => {
  const errorContainer = document.querySelector('.cart-errors');
  const messageEl = errorContainer.querySelector('.cart-error-message');

  messageEl.textContent = e.detail.message || 'An error occurred';
  errorContainer.hidden = false;

  setTimeout(() => {
    errorContainer.hidden = true;
  }, 5000);
});
```

---

## Conversion Reference: React to Shopify

| React Pattern | Shopify Equivalent |
|---------------|-------------------|
| Redux cart state | `/cart.js` API + events |
| `useContext` cart | Global `window.cart` instance |
| `addToCart()` action | POST to `/cart/add.js` |
| Cart component state | Liquid `{{ cart }}` + AJAX refresh |
| Optimistic updates | Loading states + rollback on error |
| Cart persistence | Shopify handles via cookies |
