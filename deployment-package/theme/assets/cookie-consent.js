/**
 * Cookie Consent Module
 * Handles cookie consent with Shopify's Customer Privacy API
 */

const CookieConsent = {
    STORAGE_KEY: 'athyre_cookie_consent',
    banner: null,

    /**
     * Initialize cookie consent
     */
    init() {
        this.banner = document.querySelector('[data-cookie-banner]');
        if (!this.banner) return;

        // Check if Shopify's privacy API is available
        if (window.Shopify && window.Shopify.customerPrivacy) {
            this._setupShopifyPrivacy();
        } else {
            this._setupFallback();
        }

        this._bindEvents();
    },

    /**
     * Setup with Shopify's Customer Privacy API
     * @private
     */
    _setupShopifyPrivacy() {
        const privacySettings = window.Shopify.customerPrivacy;

        // If consent already given, don't show banner
        if (privacySettings.userCanBeTracked()) {
            this.banner.style.display = 'none';
            this._loadTrackingScripts();
            return;
        }

        // Show banner for new visitors
        this._showBanner();
    },

    /**
     * Fallback for when Shopify privacy API isn't available
     * @private
     */
    _setupFallback() {
        const consent = localStorage.getItem(this.STORAGE_KEY);

        if (consent === 'accepted') {
            this.banner.style.display = 'none';
            this._loadTrackingScripts();
        } else if (consent === 'rejected') {
            this.banner.style.display = 'none';
        } else {
            this._showBanner();
        }
    },

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Accept all
        document.querySelectorAll('[data-cookie-accept]').forEach(btn => {
            btn.addEventListener('click', () => this.acceptAll());
        });

        // Reject non-essential
        document.querySelectorAll('[data-cookie-reject]').forEach(btn => {
            btn.addEventListener('click', () => this.rejectNonEssential());
        });

        // Manage preferences
        document.querySelectorAll('[data-cookie-manage]').forEach(btn => {
            btn.addEventListener('click', () => this.showPreferences());
        });

        // Save preferences
        document.querySelectorAll('[data-cookie-save]').forEach(btn => {
            btn.addEventListener('click', () => this.savePreferences());
        });
    },

    /**
     * Show the cookie banner
     * @private
     */
    _showBanner() {
        this.banner.style.display = '';
        this.banner.classList.add('is-visible');
    },

    /**
     * Hide the cookie banner
     * @private
     */
    _hideBanner() {
        this.banner.classList.remove('is-visible');
        setTimeout(() => {
            this.banner.style.display = 'none';
        }, 300);
    },

    /**
     * Accept all cookies
     */
    acceptAll() {
        this._setConsent({
            analytics: true,
            marketing: true,
            preferences: true
        });

        this._hideBanner();
        this._loadTrackingScripts();
    },

    /**
     * Reject non-essential cookies
     */
    rejectNonEssential() {
        this._setConsent({
            analytics: false,
            marketing: false,
            preferences: false
        });

        this._hideBanner();
    },

    /**
     * Show preferences panel
     */
    showPreferences() {
        const preferencesPanel = document.querySelector('[data-cookie-preferences]');
        if (preferencesPanel) {
            preferencesPanel.classList.add('is-visible');
        }
    },

    /**
     * Save preferences from panel
     */
    savePreferences() {
        const analyticsCheckbox = document.querySelector('[data-cookie-analytics]');
        const marketingCheckbox = document.querySelector('[data-cookie-marketing]');
        const preferencesCheckbox = document.querySelector('[data-cookie-preferences-toggle]');

        const consent = {
            analytics: analyticsCheckbox?.checked || false,
            marketing: marketingCheckbox?.checked || false,
            preferences: preferencesCheckbox?.checked || false
        };

        this._setConsent(consent);
        this._hideBanner();

        const preferencesPanel = document.querySelector('[data-cookie-preferences]');
        if (preferencesPanel) {
            preferencesPanel.classList.remove('is-visible');
        }

        if (consent.analytics || consent.marketing) {
            this._loadTrackingScripts();
        }
    },

    /**
     * Set consent in Shopify API and localStorage
     * @private
     */
    _setConsent(consent) {
        // Store locally
        localStorage.setItem(this.STORAGE_KEY, consent.analytics || consent.marketing ? 'accepted' : 'rejected');
        localStorage.setItem(this.STORAGE_KEY + '_details', JSON.stringify(consent));

        // Use Shopify API if available
        if (window.Shopify && window.Shopify.customerPrivacy) {
            window.Shopify.customerPrivacy.setTrackingConsent({
                analytics: consent.analytics,
                marketing: consent.marketing,
                preferences: consent.preferences
            }, () => {
                console.log('Cookie consent saved via Shopify API');
            });
        }

        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent('cookie:consent', { detail: consent }));
    },

    /**
     * Load tracking scripts after consent
     * @private
     */
    _loadTrackingScripts() {
        const consent = this.getConsent();

        // Dispatch event for conditional script loading
        document.dispatchEvent(new CustomEvent('cookie:load-scripts', { detail: consent }));

        // Load scripts marked with data attributes
        if (consent.analytics) {
            document.querySelectorAll('[data-cookie-category="analytics"]').forEach(script => {
                this._activateScript(script);
            });
        }

        if (consent.marketing) {
            document.querySelectorAll('[data-cookie-category="marketing"]').forEach(script => {
                this._activateScript(script);
            });
        }
    },

    /**
     * Activate a deferred script
     * @private
     */
    _activateScript(script) {
        if (script.dataset.activated) return;

        script.dataset.activated = 'true';

        if (script.dataset.src) {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            if (script.dataset.async) newScript.async = true;
            document.head.appendChild(newScript);
        } else if (script.textContent) {
            eval(script.textContent);
        }
    },

    /**
     * Get current consent status
     * @returns {Object}
     */
    getConsent() {
        try {
            const details = localStorage.getItem(this.STORAGE_KEY + '_details');
            return details ? JSON.parse(details) : { analytics: false, marketing: false, preferences: false };
        } catch (e) {
            return { analytics: false, marketing: false, preferences: false };
        }
    },

    /**
     * Check if specific category is consented
     * @param {string} category - 'analytics', 'marketing', or 'preferences'
     * @returns {boolean}
     */
    hasConsent(category) {
        return this.getConsent()[category] || false;
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}

window.CookieConsent = CookieConsent;
