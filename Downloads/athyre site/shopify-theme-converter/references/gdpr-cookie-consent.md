# GDPR & Cookie Consent

Implementation guide for cookie banners, Shopify.customerPrivacy API, and tracking consent in Shopify themes.

## Overview

GDPR and privacy compliance in Shopify themes:
- **Cookie consent banner** - User permission before tracking
- **Shopify Customer Privacy API** - Built-in consent management
- **Conditional tracking** - Only load scripts when consented
- **Data rights** - Support for access/deletion requests

---

## Shopify Customer Privacy API

Shopify provides a built-in JavaScript API for consent management.

### API Methods
```javascript
// Check if consent is required for region
Shopify.customerPrivacy.shouldShowBanner();

// Get current consent state
Shopify.customerPrivacy.currentVisitorConsent();

// Set consent
Shopify.customerPrivacy.setTrackingConsent(consent, callback);

// Listen for consent changes
document.addEventListener('visitorConsentCollected', function(event) {
  console.log('Consent collected:', event.detail);
});
```

### Consent States
| State | Meaning |
|-------|---------|
| `'yes'` | User granted consent |
| `'no'` | User declined consent |
| `''` (empty) | No decision made yet |

---

## Cookie Consent Banner

### Section Implementation
```liquid
{% comment %} sections/cookie-banner.liquid {% endcomment %}

{%- comment -%}
  Cookie consent banner using Shopify Customer Privacy API
  Automatically shows in regions requiring consent (EU/UK/California)
{%- endcomment -%}

<div
  id="cookie-banner"
  class="cookie-banner"
  role="dialog"
  aria-modal="true"
  aria-labelledby="cookie-banner-title"
  aria-describedby="cookie-banner-description"
  hidden
>
  <div class="cookie-banner-overlay"></div>

  <div class="cookie-banner-content">
    <div class="cookie-banner-body">
      <h2 id="cookie-banner-title" class="cookie-banner-title">
        {{ section.settings.heading | default: 'We use cookies' }}
      </h2>

      <p id="cookie-banner-description" class="cookie-banner-description">
        {{ section.settings.description | default: 'We use cookies to personalize content, provide social media features, and analyze our traffic. We also share information about your use of our site with our social media, advertising, and analytics partners.' }}
      </p>

      {%- if section.settings.show_privacy_link -%}
        <a href="{{ section.settings.privacy_page.url | default: '/policies/privacy-policy' }}" class="cookie-banner-link">
          {{ 'general.cookie_banner.privacy_link' | t | default: 'Privacy Policy' }}
        </a>
      {%- endif -%}
    </div>

    <div class="cookie-banner-actions">
      <button type="button" class="cookie-btn cookie-btn--accept" data-cookie-accept>
        {{ section.settings.accept_text | default: 'Accept all' }}
      </button>

      <button type="button" class="cookie-btn cookie-btn--decline" data-cookie-decline>
        {{ section.settings.decline_text | default: 'Decline' }}
      </button>

      {%- if section.settings.show_preferences -%}
        <button type="button" class="cookie-btn cookie-btn--preferences" data-cookie-preferences>
          {{ section.settings.preferences_text | default: 'Manage preferences' }}
        </button>
      {%- endif -%}
    </div>
  </div>
</div>

{%- comment -%} Preferences Modal {%- endcomment -%}
{%- if section.settings.show_preferences -%}
  <div id="cookie-preferences" class="cookie-preferences-modal" hidden>
    <div class="cookie-preferences-overlay" data-preferences-close></div>

    <div class="cookie-preferences-content" role="dialog" aria-modal="true" aria-labelledby="preferences-title">
      <button type="button" class="cookie-preferences-close" data-preferences-close aria-label="Close">
        {% render 'icon', icon: 'close' %}
      </button>

      <h2 id="preferences-title" class="cookie-preferences-title">
        {{ 'general.cookie_banner.preferences_title' | t | default: 'Cookie Preferences' }}
      </h2>

      <form id="cookie-preferences-form" class="cookie-preferences-form">
        {%- comment -%} Essential cookies - always on {%- endcomment -%}
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-category-label">
              <input type="checkbox" checked disabled>
              <span class="cookie-category-name">
                {{ 'general.cookie_banner.essential' | t | default: 'Essential' }}
              </span>
            </label>
            <span class="cookie-category-required">Required</span>
          </div>
          <p class="cookie-category-description">
            {{ 'general.cookie_banner.essential_description' | t | default: 'These cookies are necessary for the website to function and cannot be switched off.' }}
          </p>
        </div>

        {%- comment -%} Analytics cookies {%- endcomment -%}
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-category-label">
              <input type="checkbox" name="analytics" value="true" data-cookie-analytics>
              <span class="cookie-category-name">
                {{ 'general.cookie_banner.analytics' | t | default: 'Analytics' }}
              </span>
            </label>
          </div>
          <p class="cookie-category-description">
            {{ 'general.cookie_banner.analytics_description' | t | default: 'These cookies help us understand how visitors interact with our website.' }}
          </p>
        </div>

        {%- comment -%} Marketing cookies {%- endcomment -%}
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-category-label">
              <input type="checkbox" name="marketing" value="true" data-cookie-marketing>
              <span class="cookie-category-name">
                {{ 'general.cookie_banner.marketing' | t | default: 'Marketing' }}
              </span>
            </label>
          </div>
          <p class="cookie-category-description">
            {{ 'general.cookie_banner.marketing_description' | t | default: 'These cookies are used to deliver personalized advertisements.' }}
          </p>
        </div>

        <div class="cookie-preferences-actions">
          <button type="button" class="cookie-btn cookie-btn--secondary" data-preferences-close>
            {{ 'general.cookie_banner.cancel' | t | default: 'Cancel' }}
          </button>
          <button type="submit" class="cookie-btn cookie-btn--primary">
            {{ 'general.cookie_banner.save' | t | default: 'Save preferences' }}
          </button>
        </div>
      </form>
    </div>
  </div>
{%- endif -%}

<script>
  (function() {
    const banner = document.getElementById('cookie-banner');
    const preferencesModal = document.getElementById('cookie-preferences');

    // Check if banner should be shown
    function initBanner() {
      if (typeof Shopify === 'undefined' || !Shopify.customerPrivacy) {
        console.warn('Shopify Customer Privacy API not available');
        return;
      }

      // Check if consent is needed for this region
      if (Shopify.customerPrivacy.shouldShowBanner()) {
        const currentConsent = Shopify.customerPrivacy.currentVisitorConsent();

        // Show banner if no consent decision made
        if (!currentConsent || currentConsent === '') {
          showBanner();
        }
      }
    }

    function showBanner() {
      banner.hidden = false;
      document.body.classList.add('cookie-banner-visible');

      // Focus first button for accessibility
      const firstButton = banner.querySelector('button');
      firstButton?.focus();
    }

    function hideBanner() {
      banner.hidden = true;
      document.body.classList.remove('cookie-banner-visible');
    }

    function setConsent(analyticsAllowed, marketingAllowed) {
      Shopify.customerPrivacy.setTrackingConsent({
        analytics: analyticsAllowed,
        marketing: marketingAllowed,
        preferences: true,
        sale_of_data: marketingAllowed
      }, function() {
        hideBanner();

        // Dispatch event for other scripts to listen
        document.dispatchEvent(new CustomEvent('consentUpdated', {
          detail: {
            analytics: analyticsAllowed,
            marketing: marketingAllowed
          }
        }));

        // If consent given, load tracking scripts
        if (analyticsAllowed || marketingAllowed) {
          loadTrackingScripts(analyticsAllowed, marketingAllowed);
        }
      });
    }

    // Accept all
    document.querySelector('[data-cookie-accept]')?.addEventListener('click', function() {
      setConsent(true, true);
    });

    // Decline all
    document.querySelector('[data-cookie-decline]')?.addEventListener('click', function() {
      setConsent(false, false);
    });

    // Open preferences
    document.querySelector('[data-cookie-preferences]')?.addEventListener('click', function() {
      banner.hidden = true;
      preferencesModal.hidden = false;
    });

    // Close preferences
    document.querySelectorAll('[data-preferences-close]').forEach(function(el) {
      el.addEventListener('click', function() {
        preferencesModal.hidden = true;
        banner.hidden = false;
      });
    });

    // Save preferences
    document.getElementById('cookie-preferences-form')?.addEventListener('submit', function(e) {
      e.preventDefault();

      const analyticsConsent = this.querySelector('[data-cookie-analytics]')?.checked || false;
      const marketingConsent = this.querySelector('[data-cookie-marketing]')?.checked || false;

      preferencesModal.hidden = true;
      setConsent(analyticsConsent, marketingConsent);
    });

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBanner);
    } else {
      initBanner();
    }

    // Also listen for Shopify API ready
    document.addEventListener('shopify:customer-privacy-api-loaded', initBanner);
  })();
</script>

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    padding: 1rem;
  }

  .cookie-banner[hidden] {
    display: none;
  }

  .cookie-banner-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
  }

  .cookie-banner-content {
    max-width: 800px;
    margin: 0 auto;
    background: var(--color-background, #fff);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .cookie-banner-title {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
  }

  .cookie-banner-description {
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .cookie-banner-link {
    font-size: 0.875rem;
    color: var(--color-accent, #2563eb);
  }

  .cookie-banner-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .cookie-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .cookie-btn:hover {
    opacity: 0.9;
  }

  .cookie-btn--accept,
  .cookie-btn--primary {
    background: var(--color-primary, #000);
    color: var(--color-primary-contrast, #fff);
    border: none;
  }

  .cookie-btn--decline,
  .cookie-btn--secondary {
    background: transparent;
    color: var(--color-text, #000);
    border: 1px solid var(--color-border, #e5e5e5);
  }

  .cookie-btn--preferences {
    background: transparent;
    color: var(--color-text-muted, #666);
    border: none;
    text-decoration: underline;
  }

  /* Preferences Modal */
  .cookie-preferences-modal {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .cookie-preferences-modal[hidden] {
    display: none;
  }

  .cookie-preferences-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .cookie-preferences-content {
    position: relative;
    background: var(--color-background, #fff);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .cookie-preferences-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .cookie-preferences-title {
    font-size: 1.25rem;
    margin: 0 0 1.5rem;
  }

  .cookie-category {
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border, #e5e5e5);
  }

  .cookie-category:last-of-type {
    border-bottom: none;
  }

  .cookie-category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cookie-category-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .cookie-category-name {
    font-weight: 500;
  }

  .cookie-category-required {
    font-size: 0.75rem;
    color: var(--color-text-muted, #666);
  }

  .cookie-category-description {
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
    margin: 0.5rem 0 0;
  }

  .cookie-preferences-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }

  /* Body scroll lock when banner visible */
  body.cookie-banner-visible {
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .cookie-banner-actions {
      flex-direction: column;
    }

    .cookie-btn {
      width: 100%;
      text-align: center;
    }
  }
</style>

{% schema %}
{
  "name": "Cookie banner",
  "settings": [
    {
      "type": "header",
      "content": "Content"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "We use cookies"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "We use cookies to personalize content, provide social media features, and analyze our traffic. We also share information about your use of our site with our partners."
    },
    {
      "type": "header",
      "content": "Buttons"
    },
    {
      "type": "text",
      "id": "accept_text",
      "label": "Accept button text",
      "default": "Accept all"
    },
    {
      "type": "text",
      "id": "decline_text",
      "label": "Decline button text",
      "default": "Decline"
    },
    {
      "type": "checkbox",
      "id": "show_preferences",
      "label": "Show preferences button",
      "default": true
    },
    {
      "type": "text",
      "id": "preferences_text",
      "label": "Preferences button text",
      "default": "Manage preferences"
    },
    {
      "type": "header",
      "content": "Links"
    },
    {
      "type": "checkbox",
      "id": "show_privacy_link",
      "label": "Show privacy policy link",
      "default": true
    },
    {
      "type": "page",
      "id": "privacy_page",
      "label": "Privacy policy page"
    }
  ]
}
{% endschema %}
```

---

## Conditional Script Loading

### Loading Scripts After Consent
```liquid
{% comment %} snippets/tracking-scripts.liquid {% endcomment %}

<script>
  function loadTrackingScripts(analyticsConsent, marketingConsent) {
    // Google Analytics
    if (analyticsConsent) {
      {%- if settings.google_analytics_id != blank -%}
        loadScript('https://www.googletagmanager.com/gtag/js?id={{ settings.google_analytics_id }}', function() {
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '{{ settings.google_analytics_id }}', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
          });
        });
      {%- endif -%}
    }

    // Facebook Pixel
    if (marketingConsent) {
      {%- if settings.facebook_pixel_id != blank -%}
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '{{ settings.facebook_pixel_id }}');
        fbq('track', 'PageView');
      {%- endif -%}
    }

    // Other marketing scripts
    if (marketingConsent) {
      // TikTok, Pinterest, etc.
    }
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Check existing consent on page load
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof Shopify !== 'undefined' && Shopify.customerPrivacy) {
      var consent = Shopify.customerPrivacy.currentVisitorConsent();

      // Consent already given - load scripts
      if (consent && consent.marketing === 'yes') {
        loadTrackingScripts(consent.analytics === 'yes', consent.marketing === 'yes');
      }
    }
  });

  // Listen for consent updates
  document.addEventListener('consentUpdated', function(event) {
    loadTrackingScripts(event.detail.analytics, event.detail.marketing);
  });
</script>
```

### Noscript Fallback for Pixels
```liquid
{%- comment -%} Only render if consent might be given {%- endcomment -%}
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id={{ settings.facebook_pixel_id }}&ev=PageView&noscript=1"
  />
</noscript>
```

---

## Data Request Handling

### Privacy Page Link
```liquid
{% comment %} Link in footer for data requests {% endcomment %}

{%- if settings.enable_gdpr_tools -%}
  <div class="privacy-tools">
    <a href="{{ routes.account_url }}">
      {{ 'general.privacy.manage_data' | t }}
    </a>
  </div>
{%- endif -%}
```

### Customer Data Export (Account Page)
```liquid
{%- comment -%}
  Note: Shopify handles actual data requests through Settings > Legal
  This is just for linking customers to their account
{%- endcomment -%}

<div class="customer-privacy-section">
  <h2>{{ 'customer.account.privacy_title' | t | default: 'Your Privacy' }}</h2>

  <p>{{ 'customer.account.privacy_description' | t | default: 'You can request a copy of your data or ask us to delete it.' }}</p>

  <div class="privacy-actions">
    <a href="mailto:{{ settings.privacy_email | default: shop.email }}?subject=Data%20Access%20Request" class="btn btn--secondary">
      {{ 'customer.account.request_data' | t | default: 'Request my data' }}
    </a>

    <a href="mailto:{{ settings.privacy_email | default: shop.email }}?subject=Data%20Deletion%20Request" class="btn btn--secondary">
      {{ 'customer.account.delete_data' | t | default: 'Delete my data' }}
    </a>
  </div>

  <p class="privacy-note">
    {{ 'customer.account.privacy_note' | t | default: 'Requests are processed within 30 days as required by law.' }}
  </p>
</div>
```

---

## Region Detection

### Shopify's Built-in Detection
```javascript
// Shopify automatically detects regions requiring consent
// GDPR: EU countries
// CCPA: California
// Other: UK, Brazil (LGPD), etc.

// Check if current visitor needs consent
if (Shopify.customerPrivacy.shouldShowBanner()) {
  // Show consent UI
}

// Get visitor's region
// Note: Shopify handles this internally
```

### Manual Region Override (Testing)
```liquid
{%- comment -%} Force cookie banner for testing {%- endcomment -%}
{%- if settings.force_cookie_banner or shop.password_required == false -%}
  <script>
    // Override region detection for testing
    window.Shopify = window.Shopify || {};
    window.Shopify.customerPrivacy = window.Shopify.customerPrivacy || {};
    window.Shopify.customerPrivacy.shouldShowBanner = function() { return true; };
  </script>
{%- endif -%}
```

---

## Consent Storage

Shopify stores consent in:
1. `_shopify_privacyconsentcookie` - Encrypted cookie
2. Browser localStorage - For persistence

### Checking Stored Consent
```javascript
// Use API, don't read cookie directly
const consent = Shopify.customerPrivacy.currentVisitorConsent();

console.log({
  analytics: consent.analytics,    // 'yes', 'no', or ''
  marketing: consent.marketing,    // 'yes', 'no', or ''
  preferences: consent.preferences,
  saleOfData: consent.sale_of_data
});
```

---

## Testing Checklist

- [ ] Banner shows only in GDPR/CCPA regions
- [ ] Accept all enables all tracking
- [ ] Decline disables all non-essential tracking
- [ ] Preferences modal allows granular control
- [ ] Consent persists across page loads
- [ ] Consent persists across sessions
- [ ] Tracking scripts only load after consent
- [ ] Privacy policy link works
- [ ] Mobile layout is usable
- [ ] Keyboard navigation works
- [ ] Screen reader announces banner

---

## Compliance Notes

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| GDPR (EU) | Opt-in consent | Banner before any tracking |
| CCPA (CA) | Opt-out option | "Do Not Sell" link |
| LGPD (Brazil) | Consent + legal basis | Similar to GDPR |
| UK GDPR | Same as EU GDPR | Handled by Shopify |

**Important**: This is technical guidance only. Consult legal counsel for compliance requirements specific to your business.
