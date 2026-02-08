# Shopify Cart API Complete Reference

## Overview

The Cart API is essential for building custom cart experiences. It's the bridge between your theme and Shopify's checkout.

## Ajax API Endpoints

### GET /cart.js
Returns the current cart state as JSON.

```javascript
fetch('/cart.js')
  .then(response => response.json())
  .then(cart => {
    console.log(cart.item_count);
    console.log(cart.total_price); // in cents
    console.log(cart.items);
  });
```

### POST /cart/add.js
Add items to cart.

```javascript
// Simple add
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 12345678901234, // variant ID
    quantity: 1
  })
});

// Add with line item properties
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 12345678901234,
    quantity: 1,
    properties: {
      'Engraving': 'Happy Birthday!',
      'Gift Wrap': 'Yes',
      '_hidden_note': 'Internal tracking' // underscore = hidden at checkout
    }
  })
});

// Add multiple items
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      { id: 12345678901234, quantity: 1 },
      { id: 12345678901235, quantity: 2 }
    ]
  })
});
```

### POST /cart/update.js
Update quantities by variant ID or line item key.

```javascript
// Update by variant ID (risky if duplicate variants)
fetch('/cart/update.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updates: {
      12345678901234: 3, // variant_id: quantity
      12345678901235: 0  // 0 removes item
    }
  })
});

// Update by line item key (recommended)
fetch('/cart/update.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updates: {
      'abc123:def456': 2 // line item key: quantity
    }
  })
});
```

### POST /cart/change.js
Change a specific line item (by line number or key).

```javascript
// By line number (1-indexed)
fetch('/cart/change.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    line: 1,
    quantity: 2
  })
});

// By line item key (recommended)
fetch('/cart/change.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'abc123:def456', // line item key
    quantity: 2,
    properties: {
      'Gift Message': 'Updated message'
    }
  })
});
```

### POST /cart/clear.js
Empty the cart.

```javascript
fetch('/cart/clear.js', {
  method: 'POST'
});
```

---

## Line Item Properties

Line item properties store custom data for individual items.

### Setting Properties (Add to Cart Form)

```html
<form action="/cart/add" method="post">
  <input type="hidden" name="id" value="{{ variant.id }}">

  <!-- Visible property -->
  <label for="engraving">Engraving Text:</label>
  <input type="text" name="properties[Engraving]" id="engraving">

  <!-- Checkbox property -->
  <label>
    <input type="checkbox" name="properties[Gift Wrap]" value="Yes">
    Add gift wrapping (+$5)
  </label>

  <!-- Hidden property (underscore prefix) -->
  <input type="hidden" name="properties[_source]" value="product_page">

  <button type="submit">Add to Cart</button>
</form>
```

### Displaying Properties in Cart

```liquid
{% for item in cart.items %}
  <div class="cart-item">
    <h3>{{ item.product.title }}</h3>

    {% if item.properties.size > 0 %}
      <ul class="line-item-properties">
        {% for property in item.properties %}
          {% unless property.first contains '_' %}
            <li>
              <strong>{{ property.first }}:</strong>
              {{ property.last }}
            </li>
          {% endunless %}
        {% endfor %}
      </ul>
    {% endif %}
  </div>
{% endfor %}
```

### Common Use Cases

| Property | Purpose | Example Value |
|----------|---------|---------------|
| Engraving | Personalization | "Happy Birthday!" |
| Gift Wrap | Upsell service | "Yes" |
| Gift Message | Gift note | "From Mom and Dad" |
| Color Choice | Custom option | "#FF0000" |
| Size (custom) | Non-variant size | "Custom: 42" |
| _source | Hidden tracking | "homepage_banner" |
| _campaign | Hidden attribution | "summer_sale" |

---

## Cart Attributes

Cart attributes store order-level data (not tied to specific items).

### Setting Cart Attributes

```html
<form action="/cart" method="post">
  <!-- Order note -->
  <label for="note">Special Instructions:</label>
  <textarea name="note" id="note">{{ cart.note }}</textarea>

  <!-- Cart attribute -->
  <label for="delivery-date">Preferred Delivery Date:</label>
  <input type="date" name="attributes[Delivery Date]" id="delivery-date"
         value="{{ cart.attributes['Delivery Date'] }}">

  <!-- Hidden attribute (double underscore suffix) -->
  <input type="hidden" name="attributes[utm_source__]" value="{{ request.query_string | split: 'utm_source=' | last | split: '&' | first }}">

  <button type="submit">Update Cart</button>
</form>
```

### Via JavaScript

```javascript
fetch('/cart/update.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    note: 'Please leave at door',
    attributes: {
      'Delivery Date': '2026-02-15',
      'Gift Order': 'true',
      'utm_source__': 'google' // hidden with double underscore
    }
  })
});
```

### Displaying Cart Attributes

```liquid
{% if cart.attributes['Delivery Date'] %}
  <p>Delivery requested for: {{ cart.attributes['Delivery Date'] }}</p>
{% endif %}

{% if cart.attributes['Gift Order'] == 'true' %}
  <p>This is a gift order</p>
{% endif %}
```

---

## Cart Drawer Pattern

Complete cart drawer implementation:

### HTML Structure (snippets/cart-drawer.liquid)

```liquid
<div id="cart-drawer" class="cart-drawer" aria-hidden="true">
  <div class="cart-drawer__overlay" data-cart-drawer-close></div>

  <div class="cart-drawer__content" role="dialog" aria-label="Shopping cart">
    <header class="cart-drawer__header">
      <h2>Your Cart (<span class="cart-count">{{ cart.item_count }}</span>)</h2>
      <button class="cart-drawer__close" data-cart-drawer-close aria-label="Close cart">
        {% render 'icon-close' %}
      </button>
    </header>

    <div class="cart-drawer__items" data-cart-items>
      {% if cart.item_count > 0 %}
        {% for item in cart.items %}
          {% render 'cart-drawer-item', item: item %}
        {% endfor %}
      {% else %}
        <p class="cart-drawer__empty">Your cart is empty</p>
      {% endif %}
    </div>

    {% if cart.item_count > 0 %}
      <footer class="cart-drawer__footer">
        <div class="cart-drawer__subtotal">
          <span>Subtotal</span>
          <span data-cart-subtotal>{{ cart.total_price | money }}</span>
        </div>

        <p class="cart-drawer__shipping-note">
          Shipping & taxes calculated at checkout
        </p>

        <a href="/checkout" class="cart-drawer__checkout button button--primary">
          Checkout
        </a>

        <a href="/cart" class="cart-drawer__view-cart">
          View Cart
        </a>
      </footer>
    {% endif %}
  </div>
</div>
```

### JavaScript (assets/cart-drawer.js)

```javascript
class CartDrawer {
  constructor() {
    this.drawer = document.getElementById('cart-drawer');
    this.itemsContainer = this.drawer.querySelector('[data-cart-items]');
    this.subtotalEl = this.drawer.querySelector('[data-cart-subtotal]');
    this.countEls = document.querySelectorAll('.cart-count');

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.querySelectorAll('[data-cart-drawer-open]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close triggers
    document.querySelectorAll('[data-cart-drawer-close]').forEach(trigger => {
      trigger.addEventListener('click', () => this.close());
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });

    // Quantity changes
    this.drawer.addEventListener('change', (e) => {
      if (e.target.matches('[data-quantity-input]')) {
        this.updateQuantity(e.target.dataset.lineKey, e.target.value);
      }
    });

    // Remove buttons
    this.drawer.addEventListener('click', (e) => {
      if (e.target.matches('[data-remove-item]')) {
        this.removeItem(e.target.dataset.lineKey);
      }
    });
  }

  open() {
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-drawer-open');
    this.drawer.querySelector('.cart-drawer__close').focus();
  }

  close() {
    this.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-drawer-open');
  }

  isOpen() {
    return this.drawer.getAttribute('aria-hidden') === 'false';
  }

  async updateQuantity(lineKey, quantity) {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lineKey,
        quantity: parseInt(quantity)
      })
    });

    const cart = await response.json();
    this.refreshCart(cart);
  }

  async removeItem(lineKey) {
    await this.updateQuantity(lineKey, 0);
  }

  async addItem(variantId, quantity = 1, properties = {}) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity,
        properties: properties
      })
    });

    if (response.ok) {
      const cart = await this.getCart();
      this.refreshCart(cart);
      this.open();
    }
  }

  async getCart() {
    const response = await fetch('/cart.js');
    return response.json();
  }

  refreshCart(cart) {
    // Update count
    this.countEls.forEach(el => el.textContent = cart.item_count);

    // Update subtotal
    if (this.subtotalEl) {
      this.subtotalEl.textContent = this.formatMoney(cart.total_price);
    }

    // Re-render items (fetch section or rebuild HTML)
    this.fetchCartSection();
  }

  async fetchCartSection() {
    const response = await fetch('/?sections=cart-drawer-items');
    const data = await response.json();
    this.itemsContainer.innerHTML = data['cart-drawer-items'];
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.cartDrawer = new CartDrawer();
});
```

---

## Section Rendering API

Dynamically refresh cart sections without full page reload:

```javascript
// Fetch specific sections
async function refreshCartSections(sections = ['cart-drawer', 'cart-icon-bubble']) {
  const sectionParam = sections.join(',');
  const response = await fetch(`/?sections=${sectionParam}`);
  const data = await response.json();

  sections.forEach(section => {
    const container = document.querySelector(`[data-section="${section}"]`);
    if (container && data[section]) {
      container.innerHTML = data[section];
    }
  });
}
```

---

## Free Shipping Progress Bar

```liquid
{% comment %} snippets/free-shipping-bar.liquid {% endcomment %}
{% assign free_shipping_threshold = settings.free_shipping_threshold | times: 100 %}
{% assign cart_total = cart.total_price %}
{% assign remaining = free_shipping_threshold | minus: cart_total %}
{% assign progress = cart_total | times: 100 | divided_by: free_shipping_threshold %}

{% if progress > 100 %}
  {% assign progress = 100 %}
{% endif %}

<div class="free-shipping-bar">
  {% if remaining > 0 %}
    <p>Add <strong>{{ remaining | money }}</strong> more for FREE shipping!</p>
  {% else %}
    <p>Congratulations! You qualify for FREE shipping!</p>
  {% endif %}

  <div class="free-shipping-bar__progress">
    <div class="free-shipping-bar__fill" style="width: {{ progress }}%"></div>
  </div>
</div>
```

---

## Cart Error Handling

```javascript
async function addToCart(variantId, quantity) {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.description || 'Failed to add to cart');
    }

    return await response.json();

  } catch (error) {
    // Handle specific errors
    if (error.message.includes('not enough inventory')) {
      showNotification('Sorry, this item is out of stock', 'error');
    } else if (error.message.includes('cannot find variant')) {
      showNotification('This product variant is no longer available', 'error');
    } else {
      showNotification('Unable to add to cart. Please try again.', 'error');
    }

    throw error;
  }
}
```

---

## Conversion Checklist

When converting a React/Vue cart to Shopify:

| Source Feature | Shopify Implementation |
|----------------|----------------------|
| Cart state (Redux/Context) | `/cart.js` endpoint |
| Add to cart action | `/cart/add.js` POST |
| Update quantity | `/cart/change.js` POST |
| Remove item | `/cart/change.js` with quantity: 0 |
| Cart count badge | `{{ cart.item_count }}` |
| Cart total | `{{ cart.total_price | money }}` |
| Custom item data | Line item properties |
| Order-level data | Cart attributes |
| Cart drawer | Section + Ajax API |
| Real-time updates | Section Rendering API |
