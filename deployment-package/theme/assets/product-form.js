/**
 * Product Form - Handles variant selection, price updates, and add to cart
 * This is the core JavaScript for proper Shopify product functionality
 */

class ProductForm {
    constructor(container) {
        this.container = container;
        this.productId = container.dataset.productId;
        this.productJson = JSON.parse(
            document.getElementById(`ProductJson-${this.productId}`).textContent
        );

        this.variants = this.productJson.variants;
        this.options = this.productJson.options;

        // DOM Elements
        this.form = container.querySelector('form[action*="/cart/add"]');
        this.variantIdInput = container.querySelector('[name="id"]');
        this.priceElement = container.querySelector('[data-product-price]');
        this.comparePriceElement = container.querySelector('[data-compare-price]');
        this.addToCartButton = container.querySelector('[data-add-to-cart]');
        this.addToCartText = container.querySelector('[data-add-to-cart-text]');
        this.stockStatus = container.querySelector('[data-stock-status]');
        this.optionInputs = container.querySelectorAll('[data-option-input]');
        this.mainImage = container.querySelector('[data-product-main-image]');
        this.quantityInput = container.querySelector('[data-quantity-input]');

        // Current state
        this.currentVariant = this.getInitialVariant();

        this.init();
    }

    init() {
        // Listen for option changes
        this.optionInputs.forEach(input => {
            input.addEventListener('change', this.onOptionChange.bind(this));
        });

        // Quantity controls
        const quantityMinus = this.container.querySelector('[data-quantity-minus]');
        const quantityPlus = this.container.querySelector('[data-quantity-plus]');

        if (quantityMinus) {
            quantityMinus.addEventListener('click', () => this.updateQuantity(-1));
        }
        if (quantityPlus) {
            quantityPlus.addEventListener('click', () => this.updateQuantity(1));
        }

        // AJAX add to cart
        if (this.form) {
            this.form.addEventListener('submit', this.onFormSubmit.bind(this));
        }

        // Check URL for variant parameter
        this.checkUrlForVariant();

        // Initial UI update
        this.updateUI();
    }

    getInitialVariant() {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const variantId = urlParams.get('variant');

        if (variantId) {
            const variant = this.variants.find(v => v.id === parseInt(variantId));
            if (variant) return variant;
        }

        // Otherwise return first available variant
        return this.variants.find(v => v.available) || this.variants[0];
    }

    checkUrlForVariant() {
        const urlParams = new URLSearchParams(window.location.search);
        const variantId = urlParams.get('variant');

        if (variantId) {
            const variant = this.variants.find(v => v.id === parseInt(variantId));
            if (variant) {
                // Set the option inputs to match this variant
                variant.options.forEach((optionValue, index) => {
                    const input = this.container.querySelector(
                        `[data-option-input][data-option-index="${index}"][value="${optionValue}"]`
                    );
                    if (input) {
                        input.checked = true;
                    }
                });
                this.currentVariant = variant;
            }
        }
    }

    onOptionChange(event) {
        const selectedOptions = this.getSelectedOptions();
        this.currentVariant = this.getVariantFromOptions(selectedOptions);

        this.updateUI();
        this.updateUrl();
    }

    getSelectedOptions() {
        const options = [];

        this.options.forEach((option, index) => {
            const input = this.container.querySelector(
                `[data-option-input][data-option-index="${index}"]:checked`
            );
            if (input) {
                options.push(input.value);
            }
        });

        return options;
    }

    getVariantFromOptions(options) {
        return this.variants.find(variant => {
            return options.every((option, index) => variant.options[index] === option);
        });
    }

    updateUI() {
        if (!this.currentVariant) {
            this.updateAddToCartState(false, 'Unavailable');
            return;
        }

        // Update hidden variant ID
        if (this.variantIdInput) {
            this.variantIdInput.value = this.currentVariant.id;
        }

        // Update price
        this.updatePrice();

        // Update availability 
        this.updateAvailability();

        // Update image
        this.updateImage();

        // Update stock status
        this.updateStockStatus();
    }

    updatePrice() {
        if (!this.priceElement) return;

        const price = this.formatMoney(this.currentVariant.price);
        this.priceElement.textContent = price;

        if (this.comparePriceElement) {
            if (this.currentVariant.compare_at_price > this.currentVariant.price) {
                this.comparePriceElement.textContent = this.formatMoney(this.currentVariant.compare_at_price);
                this.comparePriceElement.classList.remove('hidden');
                this.priceElement.classList.add('text-red-600');
            } else {
                this.comparePriceElement.classList.add('hidden');
                this.priceElement.classList.remove('text-red-600');
            }
        }
    }

    updateAvailability() {
        if (this.currentVariant.available) {
            this.updateAddToCartState(true, 'Add to Cart');
        } else {
            this.updateAddToCartState(false, 'Sold Out');
        }
    }

    updateAddToCartState(enabled, text) {
        if (this.addToCartButton) {
            this.addToCartButton.disabled = !enabled;
            this.addToCartButton.classList.toggle('opacity-50', !enabled);
            this.addToCartButton.classList.toggle('cursor-not-allowed', !enabled);
        }

        if (this.addToCartText) {
            this.addToCartText.textContent = text;
        }
    }

    updateImage() {
        if (!this.mainImage || !this.currentVariant.featured_image) return;

        const newSrc = this.currentVariant.featured_image.src.replace(/(\.[^.]*)$/, '_800x$1');
        this.mainImage.src = newSrc;
        this.mainImage.alt = this.currentVariant.featured_image.alt || this.productJson.title;
    }

    updateStockStatus() {
        if (!this.stockStatus) return;

        if (!this.currentVariant.available) {
            this.stockStatus.innerHTML = '<span class="text-red-600">Out of Stock</span>';
        } else if (this.currentVariant.inventory_management &&
            this.currentVariant.inventory_quantity <= 5 &&
            this.currentVariant.inventory_quantity > 0) {
            this.stockStatus.innerHTML = `<span class="text-amber-600">Only ${this.currentVariant.inventory_quantity} left</span>`;
        } else {
            this.stockStatus.innerHTML = '<span class="text-green-600">In Stock</span>';
        }
    }

    updateUrl() {
        if (!this.currentVariant) return;

        const url = new URL(window.location.href);
        url.searchParams.set('variant', this.currentVariant.id);
        window.history.replaceState({}, '', url);
    }

    updateQuantity(change) {
        if (!this.quantityInput) return;

        const currentValue = parseInt(this.quantityInput.value) || 1;
        const newValue = Math.max(1, currentValue + change);
        this.quantityInput.value = newValue;
    }

    async onFormSubmit(event) {
        // Check if AJAX cart is enabled
        if (!window.theme?.ajaxCart) return;

        event.preventDefault();

        const formData = new FormData(this.form);

        // Show loading state
        this.updateAddToCartState(false, 'Adding...');

        try {
            const response = await fetch(window.routes.cart_add_url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Add to cart failed');
            }

            const result = await response.json();

            // Trigger cart update event
            document.dispatchEvent(new CustomEvent('cart:updated', {
                detail: { item: result }
            }));

            // Brief success state
            this.updateAddToCartState(true, 'Added!');

            setTimeout(() => {
                this.updateAddToCartState(true, 'Add to Cart');
            }, 1500);

            // Open cart drawer if available
            document.dispatchEvent(new CustomEvent('cart:open'));

        } catch (error) {
            console.error('Add to cart error:', error);
            this.updateAddToCartState(true, 'Error - Try Again');

            setTimeout(() => {
                this.updateAvailability();
            }, 2000);
        }
    }

    formatMoney(cents) {
        // Basic money formatting - uses Shopify's money format if available
        const amount = (cents / 100).toFixed(2);
        const format = window.theme?.moneyFormat || '${{amount}}';
        return format.replace('{{amount}}', amount).replace('{{amount_no_decimals}}', Math.floor(cents / 100));
    }
}

// Initialize all product forms on page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-product-form]').forEach(container => {
        new ProductForm(container);
    });
});

// Export for use in other scripts
window.ProductForm = ProductForm;
