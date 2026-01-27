/**
 * Cart Manager
 * Handles all cart AJAX operations
 */

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
      await this.getCart();
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

/**
 * Quantity Input Component
 */
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.minusBtn = this.querySelector('.quantity-btn--minus');
    this.plusBtn = this.querySelector('.quantity-btn--plus');
  }

  connectedCallback() {
    this.minusBtn?.addEventListener('click', () => this.adjust(-1));
    this.plusBtn?.addEventListener('click', () => this.adjust(1));
    this.input?.addEventListener('change', () => this.onChange());
  }

  get value() {
    return parseInt(this.input?.value) || 1;
  }

  get min() {
    return parseInt(this.input?.min) || 1;
  }

  get max() {
    return parseInt(this.input?.max) || 99;
  }

  adjust(delta) {
    const newValue = Math.min(Math.max(this.value + delta, this.min), this.max);
    if (this.input) this.input.value = newValue;
    this.onChange();
  }

  onChange() {
    const lineKey = this.input?.dataset.lineKey;

    if (lineKey) {
      this.updateCart(lineKey, this.value);
    } else {
      this.dispatchEvent(new CustomEvent('quantity:change', {
        detail: { quantity: this.value },
        bubbles: true
      }));
    }

    this.updateButtons();
  }

  updateButtons() {
    if (this.minusBtn) this.minusBtn.disabled = this.value <= this.min;
    if (this.plusBtn) this.plusBtn.disabled = this.value >= this.max;
  }

  async updateCart(key, quantity) {
    this.classList.add('is-loading');

    try {
      await window.cart.updateItem(key, quantity);
    } catch (error) {
      if (this.input) this.input.value = this.input.defaultValue;
    } finally {
      this.classList.remove('is-loading');
    }
  }
}

customElements.define('quantity-input', QuantityInput);

/**
 * Quick Add Button Component
 */
class QuickAddButton extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('button');
    this.button?.addEventListener('click', () => this.addToCart());
  }

  async addToCart() {
    const variantId = this.button?.dataset.variantId;
    if (!variantId) return;

    this.button.disabled = true;
    this.button.classList.add('is-loading');

    try {
      await window.cart.addToCart({
        id: parseInt(variantId),
        quantity: 1
      });

      this.button.classList.add('is-success');
      setTimeout(() => {
        this.button.classList.remove('is-success');
      }, 1500);

    } catch (error) {
      console.error('Quick add failed:', error);
    } finally {
      this.button.disabled = false;
      this.button.classList.remove('is-loading');
    }
  }
}

customElements.define('quick-add-button', QuickAddButton);

/**
 * Cart Item Remove
 */
document.addEventListener('click', async (e) => {
  const removeButton = e.target.closest('[data-remove-item]');
  if (!removeButton) return;

  e.preventDefault();
  const key = removeButton.dataset.removeItem;

  removeButton.disabled = true;

  try {
    await window.cart.removeItem(key);

    // Remove item from DOM
    const cartItem = removeButton.closest('[data-cart-item]');
    cartItem?.remove();

    // Check if cart is empty
    const remainingItems = document.querySelectorAll('[data-cart-item]');
    if (remainingItems.length === 0) {
      window.location.reload();
    }

  } catch (error) {
    console.error('Failed to remove item:', error);
    removeButton.disabled = false;
  }
});

/**
 * Update cart count badges
 */
document.addEventListener('cart:updated', async () => {
  try {
    const cart = await window.cart.getCart();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
  } catch (error) {
    console.error('Failed to update cart count:', error);
  }
});

document.addEventListener('cart:item-added', async () => {
  try {
    const cart = await window.cart.getCart();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
  } catch (error) {
    console.error('Failed to update cart count:', error);
  }
});
