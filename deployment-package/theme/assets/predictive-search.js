/**
 * Predictive Search Module
 * Fetches search results from Shopify's Predictive Search API
 */

const PredictiveSearch = {
    debounceTimer: null,
    DEBOUNCE_MS: 300,
    MIN_CHARS: 2,

    /**
     * Initialize predictive search
     * @param {Object} options
     */
    init(options = {}) {
        const searchInput = document.querySelector('[data-predictive-search-input]');
        const resultsContainer = document.querySelector('[data-predictive-search-results]');

        if (!searchInput || !resultsContainer) return;

        this.searchInput = searchInput;
        this.resultsContainer = resultsContainer;
        this.searchForm = searchInput.closest('form');
        this.loadingIndicator = document.querySelector('[data-predictive-search-loading]');

        this._bindEvents();
    },

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Handle input changes
        this.searchInput.addEventListener('input', (e) => {
            this._debounce(() => this.search(e.target.value.trim()));
        });

        // Handle focus
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.length >= this.MIN_CHARS) {
                this._showResults();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-predictive-search]')) {
                this._hideResults();
            }
        });

        // Keyboard navigation
        this.resultsContainer.addEventListener('keydown', (e) => {
            this._handleKeyboard(e);
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._hideResults();
                this.searchInput.blur();
            }
        });
    },

    /**
     * Perform search
     * @param {string} query
     */
    async search(query) {
        if (query.length < this.MIN_CHARS) {
            this._hideResults();
            return;
        }

        this._showLoading();

        try {
            const response = await fetch(
                `${window.routes.predictive_search_url}?q=${encodeURIComponent(query)}&resources[type]=product,collection,article,page&resources[limit]=4&section_id=predictive-search-results`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (!response.ok) throw new Error('Search failed');

            const text = await response.text();

            // Parse section rendering response
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.querySelector('#shopify-section-predictive-search-results')?.innerHTML || '';

            this.resultsContainer.innerHTML = content;
            this._showResults();
        } catch (e) {
            console.error('PredictiveSearch: Error', e);
            this.resultsContainer.innerHTML = '<p class="p-4 text-stone-500">An error occurred. Please try again.</p>';
            this._showResults();
        } finally {
            this._hideLoading();
        }
    },

    /**
     * Show results container
     * @private
     */
    _showResults() {
        this.resultsContainer.style.display = '';
        this.resultsContainer.setAttribute('aria-hidden', 'false');
    },

    /**
     * Hide results container
     * @private
     */
    _hideResults() {
        this.resultsContainer.style.display = 'none';
        this.resultsContainer.setAttribute('aria-hidden', 'true');
    },

    /**
     * Show loading indicator
     * @private
     */
    _showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = '';
        }
    },

    /**
     * Hide loading indicator
     * @private
     */
    _hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    },

    /**
     * Handle keyboard navigation
     * @private
     */
    _handleKeyboard(e) {
        const focusableItems = this.resultsContainer.querySelectorAll('a, button');
        const currentIndex = Array.from(focusableItems).indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < focusableItems.length - 1) {
                    focusableItems[currentIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    focusableItems[currentIndex - 1].focus();
                } else {
                    this.searchInput.focus();
                }
                break;
        }
    },

    /**
     * Debounce helper
     * @private
     */
    _debounce(fn) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(fn, this.DEBOUNCE_MS);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PredictiveSearch.init());
} else {
    PredictiveSearch.init();
}

window.PredictiveSearch = PredictiveSearch;
