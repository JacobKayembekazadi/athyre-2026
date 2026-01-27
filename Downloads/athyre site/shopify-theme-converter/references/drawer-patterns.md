# Drawer Patterns

Comprehensive guide for implementing drawer components in Shopify themes: cart drawer, mobile menu, filter drawer, and accessibility best practices.

## Overview

Drawers are overlay panels that slide in from screen edges. Common uses:
- **Cart drawer** - Quick cart access without page navigation
- **Menu drawer** - Mobile navigation
- **Filter drawer** - Collection filtering on mobile
- **Quick view drawer** - Product preview

---

## Core Drawer Architecture

### React Input
```jsx
function Drawer({ isOpen, onClose, position = 'right', children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      trapFocus(drawerRef.current);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className={`drawer-overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose}>
      <aside
        className={`drawer drawer--${position}`}
        onClick={e => e.stopPropagation()}
        ref={drawerRef}
      >
        {children}
      </aside>
    </div>
  );
}
```

### Shopify Section Pattern
```liquid
{%- comment -%}
  Drawer component - Include in theme.liquid or as a section
  Triggered by data-drawer-toggle="[drawer-id]"
{%- endcomment -%}

<div
  id="{{ drawer_id }}"
  class="drawer drawer--{{ position | default: 'right' }}"
  data-drawer
  hidden
>
  <div class="drawer-backdrop" data-drawer-close></div>

  <div
    class="drawer-content"
    role="dialog"
    aria-modal="true"
    aria-labelledby="{{ drawer_id }}-title"
    tabindex="-1"
  >
    <div class="drawer-header">
      <h2 id="{{ drawer_id }}-title" class="drawer-title">
        {{ title }}
      </h2>
      <button
        type="button"
        class="drawer-close"
        data-drawer-close
        aria-label="{{ 'general.drawer.close' | t }}"
      >
        {% render 'icon', icon: 'close' %}
      </button>
    </div>

    <div class="drawer-body">
      {{ content }}
    </div>

    {%- if footer -%}
      <div class="drawer-footer">
        {{ footer }}
      </div>
    {%- endif -%}
  </div>
</div>
```

---

## Cart Drawer

### Section Implementation
```liquid
{% comment %} sections/cart-drawer.liquid {% endcomment %}

<div
  id="cart-drawer"
  class="drawer drawer--right cart-drawer"
  data-cart-drawer
  hidden
>
  <div class="drawer-backdrop" data-drawer-close></div>

  <div class="drawer-content" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
    <div class="drawer-header">
      <h2 id="cart-drawer-title" class="drawer-title">
        {{ 'cart.general.title' | t }}
        <span class="cart-count" data-cart-count>{{ cart.item_count }}</span>
      </h2>
      <button type="button" class="drawer-close" data-drawer-close aria-label="Close">
        {% render 'icon', icon: 'close' %}
      </button>
    </div>

    <div class="drawer-body" data-cart-items>
      {%- if cart.item_count > 0 -%}
        {%- for item in cart.items -%}
          <div class="cart-item" data-cart-item="{{ item.key }}">
            <a href="{{ item.url }}" class="cart-item-image">
              {%- if item.image -%}
                {{ item.image | image_url: width: 150 | image_tag: loading: 'lazy' }}
              {%- endif -%}
            </a>

            <div class="cart-item-details">
              <a href="{{ item.url }}" class="cart-item-title">{{ item.product.title }}</a>

              {%- unless item.product.has_only_default_variant -%}
                <p class="cart-item-variant">{{ item.variant.title }}</p>
              {%- endunless -%}

              {%- if item.selling_plan_allocation -%}
                <p class="cart-item-subscription">
                  {{ item.selling_plan_allocation.selling_plan.name }}
                </p>
              {%- endif -%}

              <div class="cart-item-quantity">
                <button
                  type="button"
                  class="quantity-btn"
                  data-quantity-minus
                  data-key="{{ item.key }}"
                  aria-label="Decrease quantity"
                >
                  {% render 'icon', icon: 'minus' %}
                </button>
                <input
                  type="number"
                  class="quantity-input"
                  name="updates[]"
                  value="{{ item.quantity }}"
                  min="0"
                  data-quantity-input
                  data-key="{{ item.key }}"
                  aria-label="Quantity"
                >
                <button
                  type="button"
                  class="quantity-btn"
                  data-quantity-plus
                  data-key="{{ item.key }}"
                  aria-label="Increase quantity"
                >
                  {% render 'icon', icon: 'plus' %}
                </button>
              </div>
            </div>

            <div class="cart-item-price">
              {%- if item.original_line_price != item.final_line_price -%}
                <s class="cart-item-original-price">{{ item.original_line_price | money }}</s>
              {%- endif -%}
              <span class="cart-item-final-price">{{ item.final_line_price | money }}</span>
            </div>

            <button
              type="button"
              class="cart-item-remove"
              data-remove-item="{{ item.key }}"
              aria-label="Remove {{ item.title }}"
            >
              {% render 'icon', icon: 'trash' %}
            </button>
          </div>
        {%- endfor -%}
      {%- else -%}
        <div class="cart-empty">
          <p>{{ 'cart.general.empty' | t }}</p>
          <a href="{{ routes.all_products_collection_url }}" class="btn btn--primary">
            {{ 'cart.general.continue_shopping' | t }}
          </a>
        </div>
      {%- endif -%}
    </div>

    {%- if cart.item_count > 0 -%}
      <div class="drawer-footer">
        {%- if section.settings.show_cart_note -%}
          <div class="cart-note">
            <label for="cart-note">{{ 'cart.general.note' | t }}</label>
            <textarea id="cart-note" name="note" data-cart-note>{{ cart.note }}</textarea>
          </div>
        {%- endif -%}

        <div class="cart-totals">
          <div class="cart-subtotal">
            <span>{{ 'cart.general.subtotal' | t }}</span>
            <span data-cart-subtotal>{{ cart.total_price | money }}</span>
          </div>
          <p class="cart-taxes-note">
            {{ 'cart.general.taxes_and_shipping_at_checkout' | t }}
          </p>
        </div>

        <div class="cart-actions">
          <a href="{{ routes.cart_url }}" class="btn btn--secondary">
            {{ 'cart.general.view_cart' | t }}
          </a>
          <button type="submit" name="checkout" class="btn btn--primary" form="cart-drawer-form">
            {{ 'cart.general.checkout' | t }}
          </button>
        </div>
      </div>
    {%- endif -%}
  </div>
</div>

<form id="cart-drawer-form" action="{{ routes.cart_url }}" method="post"></form>

{% schema %}
{
  "name": "Cart drawer",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_cart_note",
      "label": "Show cart note",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "show_recommendations",
      "label": "Show product recommendations",
      "default": true
    }
  ]
}
{% endschema %}
```

---

## JavaScript Controller

### Drawer Manager
```javascript
// assets/drawer.js

class DrawerManager {
  constructor() {
    this.activeDrawer = null;
    this.previousFocus = null;
    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.querySelectorAll('[data-drawer-toggle]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const drawerId = trigger.dataset.drawerToggle;
        this.open(drawerId);
      });
    });

    // Close triggers
    document.querySelectorAll('[data-drawer-close]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        this.close();
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeDrawer) {
        this.close();
      }
    });
  }

  open(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;

    // Store previous focus
    this.previousFocus = document.activeElement;

    // Close any open drawer first
    if (this.activeDrawer) {
      this.close(false);
    }

    // Open drawer
    drawer.hidden = false;
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';

    // Focus management
    const content = drawer.querySelector('.drawer-content');
    content.focus();

    // Trap focus
    this.trapFocus(drawer);

    this.activeDrawer = drawer;

    // Dispatch event
    drawer.dispatchEvent(new CustomEvent('drawer:open', { bubbles: true }));
  }

  close(restoreFocus = true) {
    if (!this.activeDrawer) return;

    const drawer = this.activeDrawer;

    // Start closing animation
    drawer.classList.add('is-closing');

    // Wait for animation
    setTimeout(() => {
      drawer.hidden = true;
      drawer.classList.remove('is-closing');
      document.body.classList.remove('drawer-open');
      document.body.style.overflow = '';

      // Restore focus
      if (restoreFocus && this.previousFocus) {
        this.previousFocus.focus();
      }

      drawer.dispatchEvent(new CustomEvent('drawer:close', { bubbles: true }));
      this.activeDrawer = null;
    }, 300); // Match CSS transition duration
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }
}

// Initialize
const drawerManager = new DrawerManager();

// Expose globally for cart AJAX
window.drawerManager = drawerManager;
```

### Cart Drawer Integration
```javascript
// assets/cart-drawer.js

class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('[data-cart-drawer]');
    this.itemsContainer = this.drawer?.querySelector('[data-cart-items]');
    this.countElements = document.querySelectorAll('[data-cart-count]');
    this.subtotalElements = document.querySelectorAll('[data-cart-subtotal]');

    this.bindEvents();
  }

  bindEvents() {
    // Add to cart buttons
    document.addEventListener('submit', async (e) => {
      const form = e.target.closest('form[action*="/cart/add"]');
      if (!form) return;

      e.preventDefault();
      await this.addToCart(form);
    });

    // Quantity changes
    this.drawer?.addEventListener('click', async (e) => {
      const minus = e.target.closest('[data-quantity-minus]');
      const plus = e.target.closest('[data-quantity-plus]');
      const remove = e.target.closest('[data-remove-item]');

      if (minus) {
        const key = minus.dataset.key;
        const input = this.drawer.querySelector(`[data-quantity-input][data-key="${key}"]`);
        const newQty = Math.max(0, parseInt(input.value) - 1);
        await this.updateQuantity(key, newQty);
      }

      if (plus) {
        const key = plus.dataset.key;
        const input = this.drawer.querySelector(`[data-quantity-input][data-key="${key}"]`);
        const newQty = parseInt(input.value) + 1;
        await this.updateQuantity(key, newQty);
      }

      if (remove) {
        await this.updateQuantity(remove.dataset.removeItem, 0);
      }
    });

    // Cart note
    const noteField = this.drawer?.querySelector('[data-cart-note]');
    noteField?.addEventListener('change', async () => {
      await this.updateNote(noteField.value);
    });
  }

  async addToCart(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      const formData = new FormData(form);

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Add to cart failed');
      }

      await this.refresh();
      window.drawerManager.open('cart-drawer');

    } catch (error) {
      console.error('Add to cart error:', error);
      // Show error notification
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  }

  async updateQuantity(key, quantity) {
    const item = this.drawer.querySelector(`[data-cart-item="${key}"]`);
    item?.classList.add('is-updating');

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      });

      if (!response.ok) throw new Error('Update failed');

      await this.refresh();

    } catch (error) {
      console.error('Update quantity error:', error);
      item?.classList.remove('is-updating');
    }
  }

  async updateNote(note) {
    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
    } catch (error) {
      console.error('Update note error:', error);
    }
  }

  async refresh() {
    try {
      // Fetch fresh cart HTML from section rendering
      const response = await fetch('/?sections=cart-drawer');
      const data = await response.json();

      // Update drawer content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data['cart-drawer'];

      const newItems = tempDiv.querySelector('[data-cart-items]');
      const newFooter = tempDiv.querySelector('.drawer-footer');
      const newCount = tempDiv.querySelector('[data-cart-count]');

      if (this.itemsContainer && newItems) {
        this.itemsContainer.innerHTML = newItems.innerHTML;
      }

      const footer = this.drawer.querySelector('.drawer-footer');
      if (footer && newFooter) {
        footer.innerHTML = newFooter.innerHTML;
      } else if (newFooter && !footer) {
        this.drawer.querySelector('.drawer-content').appendChild(newFooter.cloneNode(true));
      } else if (!newFooter && footer) {
        footer.remove();
      }

      // Update all cart counts on page
      this.countElements.forEach(el => {
        if (newCount) {
          el.textContent = newCount.textContent;
        }
      });

    } catch (error) {
      console.error('Cart refresh error:', error);
    }
  }
}

// Initialize
new CartDrawer();
```

---

## Mobile Menu Drawer

### Section Implementation
```liquid
{% comment %} sections/mobile-menu-drawer.liquid {% endcomment %}

<div
  id="menu-drawer"
  class="drawer drawer--left menu-drawer"
  data-menu-drawer
  hidden
>
  <div class="drawer-backdrop" data-drawer-close></div>

  <div class="drawer-content" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="drawer-header">
      <h2 class="drawer-title visually-hidden">{{ 'general.menu.title' | t }}</h2>
      <button type="button" class="drawer-close" data-drawer-close aria-label="Close menu">
        {% render 'icon', icon: 'close' %}
      </button>
    </div>

    <nav class="drawer-body menu-drawer-nav" role="navigation">
      <ul class="menu-drawer-list" role="menu">
        {%- for link in linklists[section.settings.menu].links -%}
          <li class="menu-drawer-item" role="none">
            {%- if link.links.size > 0 -%}
              <details class="menu-drawer-details">
                <summary class="menu-drawer-link menu-drawer-link--parent" role="menuitem" aria-haspopup="true">
                  {{ link.title }}
                  <span class="menu-drawer-chevron">
                    {% render 'icon', icon: 'chevron-down' %}
                  </span>
                </summary>

                <div class="menu-drawer-submenu">
                  {%- if link.url != '#' -%}
                    <a href="{{ link.url }}" class="menu-drawer-link menu-drawer-link--view-all">
                      {{ 'general.menu.view_all' | t: title: link.title }}
                    </a>
                  {%- endif -%}

                  <ul class="menu-drawer-sublist" role="menu">
                    {%- for child_link in link.links -%}
                      <li role="none">
                        {%- if child_link.links.size > 0 -%}
                          <details class="menu-drawer-details">
                            <summary class="menu-drawer-link" role="menuitem">
                              {{ child_link.title }}
                              {% render 'icon', icon: 'chevron-down' %}
                            </summary>
                            <ul class="menu-drawer-sublist" role="menu">
                              {%- for grandchild_link in child_link.links -%}
                                <li role="none">
                                  <a href="{{ grandchild_link.url }}" class="menu-drawer-link" role="menuitem">
                                    {{ grandchild_link.title }}
                                  </a>
                                </li>
                              {%- endfor -%}
                            </ul>
                          </details>
                        {%- else -%}
                          <a href="{{ child_link.url }}" class="menu-drawer-link" role="menuitem">
                            {{ child_link.title }}
                          </a>
                        {%- endif -%}
                      </li>
                    {%- endfor -%}
                  </ul>
                </div>
              </details>
            {%- else -%}
              <a href="{{ link.url }}" class="menu-drawer-link" role="menuitem">
                {{ link.title }}
              </a>
            {%- endif -%}
          </li>
        {%- endfor -%}
      </ul>
    </nav>

    <div class="drawer-footer menu-drawer-footer">
      {%- if shop.customer_accounts_enabled -%}
        <a href="{{ routes.account_url }}" class="menu-drawer-utility">
          {% render 'icon', icon: 'account' %}
          {%- if customer -%}
            {{ 'customer.account.title' | t }}
          {%- else -%}
            {{ 'customer.login.title' | t }}
          {%- endif -%}
        </a>
      {%- endif -%}

      {%- if section.settings.show_locale_selector and localization.available_countries.size > 1 -%}
        <div class="menu-drawer-localization">
          {% render 'localization-form', type: 'country' %}
        </div>
      {%- endif -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Mobile menu",
  "settings": [
    {
      "type": "link_list",
      "id": "menu",
      "label": "Menu",
      "default": "main-menu"
    },
    {
      "type": "checkbox",
      "id": "show_locale_selector",
      "label": "Show country/region selector",
      "default": true
    }
  ]
}
{% endschema %}
```

---

## Filter Drawer (Mobile Collections)

```liquid
{% comment %} snippets/filter-drawer.liquid {% endcomment %}

<div
  id="filter-drawer"
  class="drawer drawer--left filter-drawer"
  hidden
>
  <div class="drawer-backdrop" data-drawer-close></div>

  <div class="drawer-content" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
    <div class="drawer-header">
      <h2 id="filter-drawer-title" class="drawer-title">
        {{ 'collections.filtering.title' | t }}
      </h2>
      <button type="button" class="drawer-close" data-drawer-close>
        {% render 'icon', icon: 'close' %}
      </button>
    </div>

    <form class="drawer-body filter-drawer-form" data-filter-form>
      {%- for filter in collection.filters -%}
        <details class="filter-group" open>
          <summary class="filter-group-title">
            {{ filter.label }}
            {% render 'icon', icon: 'chevron-down' %}
          </summary>

          <div class="filter-group-content">
            {%- case filter.type -%}
              {%- when 'list' -%}
                <ul class="filter-options">
                  {%- for value in filter.values -%}
                    <li class="filter-option">
                      <label class="filter-checkbox">
                        <input
                          type="checkbox"
                          name="{{ value.param_name }}"
                          value="{{ value.value }}"
                          {% if value.active %}checked{% endif %}
                          {% if value.count == 0 and value.active == false %}disabled{% endif %}
                        >
                        <span class="filter-checkbox-label">
                          {%- if filter.param_name == 'filter.v.option.color' -%}
                            <span
                              class="filter-swatch"
                              style="background-color: {{ value.value | handle | replace: '-', '' }}"
                            ></span>
                          {%- endif -%}
                          {{ value.label }}
                          <span class="filter-count">({{ value.count }})</span>
                        </span>
                      </label>
                    </li>
                  {%- endfor -%}
                </ul>

              {%- when 'price_range' -%}
                <div class="filter-price-range">
                  <div class="filter-price-inputs">
                    <div class="filter-price-field">
                      <label for="filter-price-min">{{ 'collections.filtering.from' | t }}</label>
                      <input
                        type="number"
                        id="filter-price-min"
                        name="{{ filter.min_value.param_name }}"
                        value="{{ filter.min_value.value | money_without_currency | replace: ',', '' }}"
                        min="0"
                        max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                        placeholder="0"
                      >
                    </div>
                    <span class="filter-price-separator">–</span>
                    <div class="filter-price-field">
                      <label for="filter-price-max">{{ 'collections.filtering.to' | t }}</label>
                      <input
                        type="number"
                        id="filter-price-max"
                        name="{{ filter.max_value.param_name }}"
                        value="{{ filter.max_value.value | money_without_currency | replace: ',', '' }}"
                        min="0"
                        max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                        placeholder="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                      >
                    </div>
                  </div>
                </div>
            {%- endcase -%}
          </div>
        </details>
      {%- endfor -%}
    </form>

    <div class="drawer-footer filter-drawer-footer">
      <button type="button" class="btn btn--secondary" data-clear-filters>
        {{ 'collections.filtering.clear_all' | t }}
      </button>
      <button type="button" class="btn btn--primary" data-apply-filters>
        {{ 'collections.filtering.apply' | t }}
      </button>
    </div>
  </div>
</div>
```

---

## CSS Styles

```css
/* assets/drawer.css */

/* Base Drawer Styles */
.drawer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
}

.drawer[hidden] {
  display: none;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

.drawer.is-closing .drawer-backdrop {
  animation: fadeOut 0.3s forwards;
}

.drawer-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  height: 100%;
  background: var(--color-background);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Position Variants */
.drawer--right {
  justify-content: flex-end;
}

.drawer--right .drawer-content {
  transform: translateX(100%);
  animation: slideInRight 0.3s forwards;
}

.drawer--right.is-closing .drawer-content {
  animation: slideOutRight 0.3s forwards;
}

.drawer--left .drawer-content {
  transform: translateX(-100%);
  animation: slideInLeft 0.3s forwards;
}

.drawer--left.is-closing .drawer-content {
  animation: slideOutLeft 0.3s forwards;
}

/* Drawer Sections */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.drawer-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.drawer-close:hover {
  background: var(--color-background-secondary);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.5rem;
}

.drawer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideOutRight {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideOutLeft {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

/* Body scroll lock */
body.drawer-open {
  overflow: hidden;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .drawer-backdrop,
  .drawer-content {
    animation: none;
    transition: none;
  }

  .drawer-backdrop {
    opacity: 1;
  }

  .drawer--right .drawer-content,
  .drawer--left .drawer-content {
    transform: translateX(0);
  }
}

/* Cart Drawer Specific */
.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item.is-updating {
  opacity: 0.5;
  pointer-events: none;
}

.cart-item-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-title {
  font-weight: 500;
  text-decoration: none;
  color: inherit;
}

.cart-item-variant,
.cart-item-subscription {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: none;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-input {
  width: 48px;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.25rem;
}

.cart-empty {
  text-align: center;
  padding: 3rem 1rem;
}

.cart-totals {
  margin-bottom: 1rem;
}

.cart-subtotal {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.125rem;
}

.cart-taxes-note {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.cart-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
```

---

## Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Tab cycles within drawer only |
| Escape to close | `keydown` listener for Escape |
| ARIA attributes | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Return focus | Focus returns to trigger on close |
| Scroll lock | `body.style.overflow = 'hidden'` |
| Screen reader | Hidden content via `hidden` attribute |
| Reduced motion | Disable animations when preference set |

---

## Testing Checklist

1. **Keyboard Navigation**
   - [ ] Opens with Enter/Space on trigger
   - [ ] Focus moves to drawer on open
   - [ ] Tab cycles within drawer
   - [ ] Escape closes drawer
   - [ ] Focus returns to trigger on close

2. **Touch Devices**
   - [ ] Backdrop tap closes drawer
   - [ ] Smooth scroll in drawer body
   - [ ] No body scroll when drawer open

3. **Screen Readers**
   - [ ] Announces "dialog" on open
   - [ ] Close button is labeled
   - [ ] Content updates are announced

4. **Performance**
   - [ ] Animations are 60fps
   - [ ] No layout thrashing
   - [ ] Reduced motion respected
