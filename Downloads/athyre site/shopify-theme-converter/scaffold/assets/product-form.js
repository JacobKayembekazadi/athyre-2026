/**
 * Product Form - Scaffold Template
 * Handles variant selection, price updates, and AJAX add-to-cart
 *
 * SCAFFOLD: Copy this file to your theme's assets/ directory
 */

// ============================================
// VARIANT SELECTS (Dropdown Style)
// ============================================

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange.bind(this));
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(`[data-product-gallery]`);
    mediaGalleries.forEach(gallery => {
      const activeMedia = gallery.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
      if (activeMedia) {
        gallery.querySelectorAll('.is-active').forEach(el => el.classList.remove('is-active'));
        activeMedia.classList.add('is-active');
        activeMedia.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      if (input) input.value = this.currentVariant.id;
    });
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const errorMessage = section.querySelector('.product-form__error-message');
    if (errorMessage) errorMessage.hidden = true;
  }

  renderProductInfo() {
    const sectionId = this.dataset.section;
    const url = `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${sectionId}`;

    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        // Update price
        const priceDestination = document.getElementById(`price-${sectionId}`);
        const priceSource = html.getElementById(`price-${sectionId}`);
        if (priceSource && priceDestination) {
          priceDestination.innerHTML = priceSource.innerHTML;
        }

        // Update SKU
        const skuDestination = document.getElementById(`sku-${sectionId}`);
        const skuSource = html.getElementById(`sku-${sectionId}`);
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
        }

        // Update inventory status
        const inventoryDestination = document.getElementById(`inventory-${sectionId}`);
        const inventorySource = html.getElementById(`inventory-${sectionId}`);
        if (inventorySource && inventoryDestination) {
          inventoryDestination.innerHTML = inventorySource.innerHTML;
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span:not(.loading-spinner)');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings?.addToCart || 'Add to cart';
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const addButton = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add"]');
    const addButtonText = addButton?.querySelector('span:not(.loading-spinner)');
    const priceElement = document.getElementById(`price-${this.dataset.section}`);

    if (addButtonText) addButtonText.textContent = window.variantStrings?.unavailable || 'Unavailable';
    if (priceElement) priceElement.classList.add('visibility-hidden');
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

// ============================================
// VARIANT RADIOS (Button/Swatch Style)
// ============================================

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)?.value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

// ============================================
// PRODUCT FORM (AJAX Add to Cart)
// ============================================

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');
    this.errorMessageWrapper = this.querySelector('.product-form__error-message');

    if (this.form) {
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();

    if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

    this.handleErrorMessage();
    this.submitButton.setAttribute('aria-disabled', 'true');
    this.submitButton.classList.add('loading');

    const config = {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/javascript'
      }
    };

    const formData = new FormData(this.form);

    // Add sections to render for cart drawer
    if (this.dataset.sectionsToRender) {
      formData.append('sections', this.dataset.sectionsToRender);
      formData.append('sections_url', window.location.pathname);
    }

    config.body = formData;

    fetch('/cart/add.js', config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          // Error from Shopify
          this.handleErrorMessage(response.description);
          return;
        }

        // Success - dispatch event for cart drawer
        document.dispatchEvent(new CustomEvent('cart:item-added', {
          detail: {
            items: response.items || [response],
            sections: response.sections
          },
          bubbles: true
        }));

        // Show success feedback
        this.showSuccessFeedback();
      })
      .catch((error) => {
        console.error('Error:', error);
        this.handleErrorMessage(error.message || 'Something went wrong');
      })
      .finally(() => {
        this.submitButton.classList.remove('loading');
        this.submitButton.removeAttribute('aria-disabled');
      });
  }

  handleErrorMessage(errorMessage = false) {
    if (!this.errorMessageWrapper) return;

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    const errorText = this.errorMessageWrapper.querySelector('.product-form__error-message-text');
    if (errorText) {
      errorText.textContent = errorMessage || '';
    }
  }

  showSuccessFeedback() {
    // Temporarily change button text
    const buttonText = this.submitButton.querySelector('span:not(.loading-spinner)');
    const originalText = buttonText?.textContent;

    if (buttonText) {
      buttonText.textContent = window.variantStrings?.addedToCart || 'Added!';
      setTimeout(() => {
        buttonText.textContent = originalText;
      }, 2000);
    }
  }
}

customElements.define('product-form', ProductForm);

// ============================================
// QUANTITY INPUT
// ============================================

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });

    this.input.addEventListener('change', this.onInputChange.bind(this));
  }

  get value() {
    return parseInt(this.input.value) || 1;
  }

  get min() {
    return parseInt(this.input.min) || 1;
  }

  get max() {
    return parseInt(this.input.max) || 9999;
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.value;
    const button = event.currentTarget;

    if (button.name === 'plus') {
      this.input.value = Math.min(this.value + 1, this.max);
    } else {
      this.input.value = Math.max(this.value - 1, this.min);
    }

    if (previousValue !== this.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }

  onInputChange() {
    // Clamp value to min/max
    const value = Math.min(Math.max(this.value, this.min), this.max);
    this.input.value = value;

    // If this is in a cart context, trigger cart update
    if (this.input.dataset.lineKey) {
      this.updateCart();
    }
  }

  async updateCart() {
    const key = this.input.dataset.lineKey;
    const quantity = this.value;

    this.classList.add('loading');

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: key, quantity })
      });

      const cart = await response.json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart, bubbles: true }));
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      this.classList.remove('loading');
    }
  }
}

customElements.define('quantity-input', QuantityInput);

// ============================================
// CART MANAGER (Global Instance)
// ============================================

class CartManager {
  constructor() {
    this.cart = null;
  }

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

  async addToCart(items) {
    const itemsArray = Array.isArray(items) ? items : [items];

    try {
      const response = await fetch('/cart/add.js', {
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
      document.dispatchEvent(new CustomEvent('cart:item-added', { detail: result, bubbles: true }));
      await this.getCart();
      return result;
    } catch (error) {
      document.dispatchEvent(new CustomEvent('cart:error', { detail: { error: error.message }, bubbles: true }));
      throw error;
    }
  }

  async updateItem(key, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: key, quantity })
      });

      if (!response.ok) throw new Error('Error updating cart');

      this.cart = await response.json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: this.cart, bubbles: true }));
      return this.cart;
    } catch (error) {
      document.dispatchEvent(new CustomEvent('cart:error', { detail: { error: error.message }, bubbles: true }));
      throw error;
    }
  }

  async removeItem(key) {
    return this.updateItem(key, 0);
  }

  async clearCart() {
    try {
      const response = await fetch('/cart/clear.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      this.cart = await response.json();
      document.dispatchEvent(new CustomEvent('cart:cleared', { detail: this.cart, bubbles: true }));
      return this.cart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

// Initialize global cart instance
window.cart = window.cart || new CartManager();

// ============================================
// QUICK ADD BUTTON (For product cards)
// ============================================

class QuickAddButton extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button');
    if (this.button) {
      this.button.addEventListener('click', this.onClick.bind(this));
    }
  }

  async onClick(event) {
    event.preventDefault();

    const variantId = this.dataset.variantId;
    if (!variantId) return;

    this.button.classList.add('loading');
    this.button.disabled = true;

    try {
      await window.cart.addToCart({ id: parseInt(variantId), quantity: 1 });
    } catch (error) {
      console.error('Quick add error:', error);
    } finally {
      this.button.classList.remove('loading');
      this.button.disabled = false;
    }
  }
}

customElements.define('quick-add-button', QuickAddButton);
