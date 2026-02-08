/**
 * Wishlist Module
 * Persists wishlist data to localStorage with product handles
 * Max 50 items to prevent localStorage quota issues
 */

const Wishlist = {
    STORAGE_KEY: 'athyre_wishlist',
    MAX_ITEMS: 50,

    /**
     * Get all wishlist items
     * @returns {Array} Array of product handles
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('Wishlist: Failed to parse localStorage', e);
            return [];
        }
    },

    /**
     * Check if product is in wishlist
     * @param {string} handle - Product handle
     * @returns {boolean}
     */
    has(handle) {
        return this.getAll().includes(handle);
    },

    /**
     * Add product to wishlist
     * @param {string} handle - Product handle
     * @returns {boolean} Success status
     */
    add(handle) {
        if (!handle) return false;

        const items = this.getAll();
        if (items.includes(handle)) return false;

        // Enforce max items limit
        if (items.length >= this.MAX_ITEMS) {
            items.shift(); // Remove oldest
        }

        items.push(handle);
        this._save(items);
        this._dispatch('wishlist:add', { handle });
        return true;
    },

    /**
     * Remove product from wishlist
     * @param {string} handle - Product handle
     * @returns {boolean} Success status
     */
    remove(handle) {
        const items = this.getAll();
        const index = items.indexOf(handle);

        if (index === -1) return false;

        items.splice(index, 1);
        this._save(items);
        this._dispatch('wishlist:remove', { handle });
        return true;
    },

    /**
     * Toggle product in wishlist
     * @param {string} handle - Product handle
     * @returns {boolean} True if added, false if removed
     */
    toggle(handle) {
        if (this.has(handle)) {
            this.remove(handle);
            return false;
        } else {
            this.add(handle);
            return true;
        }
    },

    /**
     * Clear all wishlist items
     */
    clear() {
        this._save([]);
        this._dispatch('wishlist:clear', {});
    },

    /**
     * Get count of items
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
            this._updateCounters();
        } catch (e) {
            console.error('Wishlist: Failed to save to localStorage', e);
        }
    },

    /**
     * Update all wishlist counter elements on page
     * @private
     */
    _updateCounters() {
        const count = this.count();
        document.querySelectorAll('[data-wishlist-count]').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? '' : 'none';
        });
    },

    /**
     * Dispatch custom event
     * @private
     */
    _dispatch(eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    /**
     * Initialize wishlist buttons and counters
     */
    init() {
        // Update counters on load
        this._updateCounters();

        // Update all wishlist button states
        document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
            const handle = btn.dataset.wishlistToggle;
            if (this.has(handle)) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-pressed', 'true');
            }
        });

        // Delegate click events
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-wishlist-toggle]');
            if (!btn) return;

            e.preventDefault();
            const handle = btn.dataset.wishlistToggle;
            const added = this.toggle(handle);

            btn.classList.toggle('is-active', added);
            btn.setAttribute('aria-pressed', added.toString());
        });
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Wishlist.init());
} else {
    Wishlist.init();
}

// Expose globally
window.Wishlist = Wishlist;
