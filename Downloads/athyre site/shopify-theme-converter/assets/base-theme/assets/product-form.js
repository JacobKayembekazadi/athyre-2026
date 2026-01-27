/**
 * Product Form Component
 * Handles AJAX add to cart and variant selection
 */

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');
    this.errorContainer = this.querySelector('[data-error]') || this.querySelector('.product-form-error');
  }

  connectedCallback() {
    this.form?.addEventListener('submit', this.onSubmit.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();
    if (this.submitButton?.disabled) return;

    this.setLoading(true);
    this.clearError();

    const formData = new FormData(this.form);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || 'Error adding to cart');
      }

      this.onSuccess(data);

    } catch (error) {
      this.onError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  onSuccess(data) {
    document.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: { item: data },
      bubbles: true
    }));

    // Show success state
    if (this.submitButton) {
      const originalText = this.submitButton.querySelector('.btn-text')?.textContent;
      const textEl = this.submitButton.querySelector('.btn-text');

      this.submitButton.classList.add('is-success');
      if (textEl) textEl.textContent = window.variantStrings?.addedToCart || 'Added!';

      setTimeout(() => {
        this.submitButton.classList.remove('is-success');
        if (textEl && originalText) textEl.textContent = originalText;
      }, 2000);
    }
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

  clearError() {
    if (this.errorContainer) {
      this.errorContainer.textContent = '';
      this.errorContainer.hidden = true;
    }
  }

  setLoading(loading) {
    if (this.submitButton) {
      this.submitButton.disabled = loading;
      this.submitButton.classList.toggle('is-loading', loading);
    }
  }
}

customElements.define('product-form', ProductForm);

/**
 * Variant Selects Component
 * Handles variant selection via dropdowns
 */
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    const jsonScript = this.querySelector('script[type="application/json"]');
    this.variants = JSON.parse(jsonScript?.textContent || '[]');
    this.productUrl = this.dataset.url;
    this.sectionId = this.dataset.section;
  }

  connectedCallback() {
    this.selects = this.querySelectorAll('select');
    this.selects.forEach(select => {
      select.addEventListener('change', () => this.onVariantChange());
    });
  }

  onVariantChange() {
    const selectedOptions = Array.from(this.selects).map(select => select.value);
    const variant = this.findVariant(selectedOptions);

    if (variant) {
      this.updateUrl(variant);
      this.updateFormId(variant);
      this.updatePrice(variant);
      this.updateButton(variant);
      this.updateSku(variant);
      this.dispatchVariantChange(variant);
    }
  }

  findVariant(options) {
    return this.variants.find(variant => {
      return variant.options.every((option, index) => option === options[index]);
    });
  }

  updateUrl(variant) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  }

  updateFormId(variant) {
    const input = document.querySelector('[data-type="add-to-cart-form"] input[name="id"]');
    if (input) input.value = variant.id;
  }

  updatePrice(variant) {
    // Find and update price elements
    const priceContainer = document.querySelector('.product-price-wrapper');
    if (!priceContainer) return;

    // This would ideally re-render the price snippet
    // For now, do basic price update
    const priceEl = priceContainer.querySelector('.price-regular');
    if (priceEl) {
      priceEl.textContent = this.formatMoney(variant.price);
    }

    const compareEl = priceContainer.querySelector('.price-compare s');
    if (compareEl) {
      if (variant.compare_at_price > variant.price) {
        compareEl.textContent = this.formatMoney(variant.compare_at_price);
        compareEl.parentElement.hidden = false;
      } else {
        compareEl.parentElement.hidden = true;
      }
    }

    // Update sale class
    priceContainer.querySelector('.price')?.classList.toggle(
      'price--on-sale',
      variant.compare_at_price > variant.price
    );
  }

  updateButton(variant) {
    const button = document.querySelector('.btn--add-to-cart');
    const buttonText = button?.querySelector('.btn-text');

    if (button && buttonText) {
      if (variant.available) {
        button.disabled = false;
        buttonText.textContent = window.variantStrings?.addToCart || 'Add to cart';
      } else {
        button.disabled = true;
        buttonText.textContent = window.variantStrings?.soldOut || 'Sold out';
      }
    }
  }

  updateSku(variant) {
    const skuEl = document.querySelector('[data-sku]');
    if (skuEl) {
      skuEl.textContent = variant.sku || '';
    }
  }

  dispatchVariantChange(variant) {
    this.dispatchEvent(new CustomEvent('variant:change', {
      detail: { variant },
      bubbles: true
    }));

    // Also notify the media gallery if variant has featured media
    if (variant.featured_media) {
      document.querySelector('[data-product-gallery]')?.dispatchEvent(
        new CustomEvent('variant:change', {
          detail: { mediaId: variant.featured_media.id }
        })
      );
    }
  }

  formatMoney(cents) {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(amount);
  }
}

customElements.define('variant-selects', VariantSelects);

/**
 * Variant Radios Component
 * Handles variant selection via radio buttons/swatches
 */
class VariantRadios extends HTMLElement {
  constructor() {
    super();
    const jsonScript = this.querySelector('script[type="application/json"]');
    this.variants = JSON.parse(jsonScript?.textContent || '[]');
    this.productUrl = this.dataset.url;
    this.sectionId = this.dataset.section;
  }

  connectedCallback() {
    this.radios = this.querySelectorAll('input[type="radio"]');
    this.radios.forEach(radio => {
      radio.addEventListener('change', () => this.onVariantChange());
    });
  }

  onVariantChange() {
    const selectedOptions = [];
    this.querySelectorAll('fieldset').forEach(fieldset => {
      const checked = fieldset.querySelector('input:checked');
      if (checked) selectedOptions.push(checked.value);
    });

    const variant = this.findVariant(selectedOptions);

    if (variant) {
      this.updateUrl(variant);
      this.updateFormId(variant);
      this.updateAvailability(variant);
      this.dispatchVariantChange(variant);
    }
  }

  findVariant(options) {
    return this.variants.find(variant => {
      return variant.options.every((option, index) => option === options[index]);
    });
  }

  updateUrl(variant) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  }

  updateFormId(variant) {
    const input = document.querySelector('[data-type="add-to-cart-form"] input[name="id"]');
    if (input) input.value = variant.id;
  }

  updateAvailability(selectedVariant) {
    // Disable unavailable combinations
    this.querySelectorAll('fieldset').forEach((fieldset, fieldsetIndex) => {
      fieldset.querySelectorAll('input[type="radio"]').forEach(radio => {
        // Check if this option value creates any available variant
        const testOptions = [];
        this.querySelectorAll('fieldset').forEach((fs, i) => {
          if (i === fieldsetIndex) {
            testOptions.push(radio.value);
          } else {
            const checked = fs.querySelector('input:checked');
            testOptions.push(checked?.value);
          }
        });

        const matchingVariant = this.variants.find(v =>
          v.options.every((opt, i) => !testOptions[i] || opt === testOptions[i])
        );

        const label = radio.nextElementSibling;
        if (matchingVariant?.available) {
          radio.disabled = false;
          label?.classList.remove('is-disabled');
        } else {
          // Option leads to unavailable variant
          radio.disabled = true;
          label?.classList.add('is-disabled');
        }
      });
    });
  }

  dispatchVariantChange(variant) {
    this.dispatchEvent(new CustomEvent('variant:change', {
      detail: { variant },
      bubbles: true
    }));
  }
}

customElements.define('variant-radios', VariantRadios);
