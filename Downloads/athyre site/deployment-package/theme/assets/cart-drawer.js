/**
 * Cart Drawer Module
 * AJAX cart functionality with drawer UI
 */

const CartDrawer = {
    drawer: null,
    overlay: null,
    isOpen: false,

    /**
     * Initialize cart drawer
     */
    init() {
        this.drawer = document.querySelector('[data-cart-drawer]');
        this.overlay = document.querySelector('[data-cart-drawer-overlay]');

        if (!this.drawer) return;

        this._bindEvents();
        this.updateCount();
    },

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Open drawer
        document.querySelectorAll('[data-cart-drawer-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        });

        // Close drawer
        document.querySelectorAll('[data-cart-drawer-close]').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Intercept add-to-cart forms
        document.addEventListener('submit', async (e) => {
            const form = e.target.closest('form[action*="/cart/add"]');
            if (!form) return;

            e.preventDefault();
            await this.addItem(form);
        });

        // Quantity change handlers (delegated)
        this.drawer.addEventListener('click', async (e) => {
            const minusBtn = e.target.closest('[data-cart-quantity-minus]');
            const plusBtn = e.target.closest('[data-cart-quantity-plus]');
            const removeBtn = e.target.closest('[data-cart-remove]');

            if (minusBtn) {
                const key = minusBtn.dataset.cartQuantityMinus;
                await this.changeQuantity(key, -1);
            } else if (plusBtn) {
                const key = plusBtn.dataset.cartQuantityPlus;
                await this.changeQuantity(key, 1);
            } else if (removeBtn) {
                const key = removeBtn.dataset.cartRemove;
                await this.removeItem(key);
            }
        });
    },

    /**
     * Open drawer
     */
    async open() {
        if (this.isOpen) return;

        this.isOpen = true;
        await this.refresh();

        this.drawer.classList.add('is-open');
        this.overlay?.classList.add('is-visible');
        document.body.style.overflow = 'hidden';

        // Focus first interactive element
        const firstFocusable = this.drawer.querySelector('a, button');
        firstFocusable?.focus();
    },

    /**
     * Close drawer
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.drawer.classList.remove('is-open');
        this.overlay?.classList.remove('is-visible');
        document.body.style.overflow = '';
    },

    /**
     * Toggle drawer
     */
    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    /**
     * Add item to cart
     * @param {HTMLFormElement} form
     */
    async addItem(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn?.textContent;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
        }

        try {
            const formData = new FormData(form);
            const response = await fetch(window.routes.cart_add_url + '.js', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.description || 'Failed to add item');
            }

            await this.refresh();
            this.open();

            // Dispatch event
            document.dispatchEvent(new CustomEvent('cart:add', {
                detail: await response.json()
            }));

        } catch (e) {
            console.error('CartDrawer: Add failed', e);
            alert(e.message || 'Failed to add item to cart');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    },

    /**
     * Change item quantity
     * @param {string} key - Line item key
     * @param {number} change - Amount to change (+1 or -1)
     */
    async changeQuantity(key, change) {
        const itemRow = this.drawer.querySelector(`[data-cart-item="${key}"]`);
        const quantityEl = itemRow?.querySelector('[data-cart-item-quantity]');
        const currentQty = parseInt(quantityEl?.textContent || '1', 10);
        const newQty = Math.max(0, currentQty + change);

        if (newQty === 0) {
            await this.removeItem(key);
            return;
        }

        await this.updateItem(key, newQty);
    },

    /**
     * Update item quantity
     * @param {string} key - Line item key
     * @param {number} quantity
     */
    async updateItem(key, quantity) {
        this._setLoading(true);

        try {
            const response = await fetch(window.routes.cart_change_url + '.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: key, quantity })
            });

            if (!response.ok) throw new Error('Update failed');

            await this.refresh();

        } catch (e) {
            console.error('CartDrawer: Update failed', e);
        } finally {
            this._setLoading(false);
        }
    },

    /**
     * Remove item from cart
     * @param {string} key - Line item key
     */
    async removeItem(key) {
        await this.updateItem(key, 0);
    },

    /**
     * Refresh cart contents
     */
    async refresh() {
        try {
            const response = await fetch(`${window.routes.cart_url}?section_id=cart-drawer-contents`);
            if (!response.ok) throw new Error('Refresh failed');

            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const newContent = doc.querySelector('#shopify-section-cart-drawer-contents');

            const contentContainer = this.drawer.querySelector('[data-cart-drawer-contents]');
            if (contentContainer && newContent) {
                contentContainer.innerHTML = newContent.innerHTML;
            }

            this.updateCount();

        } catch (e) {
            console.error('CartDrawer: Refresh failed', e);
        }
    },

    /**
     * Update cart count badge
     */
    async updateCount() {
        try {
            const response = await fetch(`${window.routes.cart_url}.js`);
            const cart = await response.json();

            document.querySelectorAll('[data-cart-count]').forEach(el => {
                el.textContent = cart.item_count;
                el.style.display = cart.item_count > 0 ? '' : 'none';
            });

        } catch (e) {
            console.error('CartDrawer: Count update failed', e);
        }
    },

    /**
     * Set loading state
     * @private
     */
    _setLoading(loading) {
        this.drawer.classList.toggle('is-loading', loading);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CartDrawer.init());
} else {
    CartDrawer.init();
}

window.CartDrawer = CartDrawer;
