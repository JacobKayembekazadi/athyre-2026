/**
 * Recently Viewed Products Module
 * Tracks viewed products and persists to localStorage
 * Max 12 items to prevent storage bloat
 */

const RecentlyViewed = {
    STORAGE_KEY: 'athyre_recently_viewed',
    MAX_ITEMS: 12,

    /**
     * Get all recently viewed product handles
     * @returns {Array} Array of product handles (most recent first)
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('RecentlyViewed: Failed to parse localStorage', e);
            return [];
        }
    },

    /**
     * Add a product to recently viewed
     * @param {string} handle - Product handle
     */
    add(handle) {
        if (!handle) return;

        let items = this.getAll();

        // Remove if already exists (will re-add at front)
        items = items.filter(h => h !== handle);

        // Add to front
        items.unshift(handle);

        // Enforce max limit
        if (items.length > this.MAX_ITEMS) {
            items = items.slice(0, this.MAX_ITEMS);
        }

        this._save(items);
    },

    /**
     * Get handles excluding current product
     * @param {string} currentHandle - Handle to exclude
     * @returns {Array}
     */
    getExcluding(currentHandle) {
        return this.getAll().filter(h => h !== currentHandle);
    },

    /**
     * Clear all recently viewed
     */
    clear() {
        this._save([]);
    },

    /**
     * Get count
     * @returns {number}
     */
    count() {
        return this.getAll().length;
    },

    /**
     * Save to localStorage
     * @private
     */
    _save(items) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('RecentlyViewed: Failed to save to localStorage', e);
        }
    },

    /**
     * Track current product page
     * Call this on product page load
     */
    trackCurrentProduct() {
        const productHandle = document.querySelector('[data-product-handle]')?.dataset.productHandle;
        if (productHandle) {
            this.add(productHandle);
        }
    },

    /**
     * Render recently viewed section
     * Fetches product data via Section Rendering API
     * @param {HTMLElement} container - Container element
     * @param {string} currentHandle - Current product handle to exclude
     */
    async render(container, currentHandle = '') {
        if (!container) return;

        const handles = this.getExcluding(currentHandle).slice(0, 8);

        if (handles.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = '';

        // Fetch each product's card via section rendering
        const productCards = container.querySelector('[data-recently-viewed-products]');
        if (!productCards) return;

        productCards.innerHTML = '<div class="loading-placeholder h-48"></div>';

        try {
            const responses = await Promise.all(
                handles.map(handle =>
                    fetch(`/products/${handle}?section_id=product-card-ajax`)
                        .then(r => r.ok ? r.text() : '')
                        .catch(() => '')
                )
            );

            productCards.innerHTML = responses.filter(Boolean).join('');
        } catch (e) {
            console.error('RecentlyViewed: Failed to fetch products', e);
            productCards.innerHTML = '';
        }
    },

    /**
     * Initialize - track product and set up sections
     */
    init() {
        // Track current product page
        this.trackCurrentProduct();

        // Render recently viewed sections
        document.querySelectorAll('[data-recently-viewed]').forEach(section => {
            const currentHandle = section.dataset.currentHandle || '';
            this.render(section, currentHandle);
        });
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RecentlyViewed.init());
} else {
    RecentlyViewed.init();
}

// Expose globally
window.RecentlyViewed = RecentlyViewed;
