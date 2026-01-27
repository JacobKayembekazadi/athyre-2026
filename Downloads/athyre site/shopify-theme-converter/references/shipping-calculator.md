# Shipping Calculator

Implementation patterns for cart page shipping rate estimators in Shopify themes.

---

## Overview

A shipping calculator allows customers to estimate shipping costs before checkout. This guide covers the Shopify AJAX Shipping Rates API, form patterns, and result display.

---

## Basic Shipping Calculator

### snippets/shipping-calculator.liquid

```liquid
{%- comment -%}
  Shipping Calculator
  Displays a form to estimate shipping rates

  Usage:
  {% render 'shipping-calculator' %}
{%- endcomment -%}

<div
  class="shipping-calculator"
  id="shipping-calculator"
  data-shipping-calculator
>
  <h3 class="shipping-calculator__title">
    {{ 'cart.shipping_calculator.title' | t }}
  </h3>

  <form class="shipping-calculator__form" data-shipping-form>
    <div class="shipping-calculator__fields">
      {%- comment -%} Country Select {%- endcomment -%}
      <div class="shipping-calculator__field">
        <label for="shipping-country" class="visually-hidden">
          {{ 'cart.shipping_calculator.country' | t }}
        </label>
        <select
          id="shipping-country"
          name="shipping_address[country]"
          class="shipping-calculator__select"
          data-shipping-country
          aria-label="{{ 'cart.shipping_calculator.country' | t }}"
        >
          <option value="" disabled selected>
            {{ 'cart.shipping_calculator.country' | t }}
          </option>
          {%- for country in shop.countries -%}
            <option
              value="{{ country.iso_code }}"
              data-provinces='{{ country.provinces | json }}'
              {% if country.iso_code == shop.address.country_code %}selected{% endif %}
            >
              {{ country.name }}
            </option>
          {%- endfor -%}
        </select>
      </div>

      {%- comment -%} Province/State Select {%- endcomment -%}
      <div class="shipping-calculator__field shipping-calculator__field--province hidden" data-province-wrapper>
        <label for="shipping-province" class="visually-hidden">
          {{ 'cart.shipping_calculator.province' | t }}
        </label>
        <select
          id="shipping-province"
          name="shipping_address[province]"
          class="shipping-calculator__select"
          data-shipping-province
          aria-label="{{ 'cart.shipping_calculator.province' | t }}"
        >
          <option value="">
            {{ 'cart.shipping_calculator.province' | t }}
          </option>
        </select>
      </div>

      {%- comment -%} Zip/Postal Code {%- endcomment -%}
      <div class="shipping-calculator__field">
        <label for="shipping-zip" class="visually-hidden">
          {{ 'cart.shipping_calculator.zip' | t }}
        </label>
        <input
          type="text"
          id="shipping-zip"
          name="shipping_address[zip]"
          class="shipping-calculator__input"
          placeholder="{{ 'cart.shipping_calculator.zip' | t }}"
          data-shipping-zip
          autocomplete="postal-code"
        >
      </div>
    </div>

    <button
      type="submit"
      class="shipping-calculator__submit button button--secondary"
      data-shipping-submit
    >
      <span class="shipping-calculator__submit-text">
        {{ 'cart.shipping_calculator.calculate' | t }}
      </span>
      <span class="shipping-calculator__submit-loading hidden">
        {% render 'loading-spinner', size: 'small' %}
      </span>
    </button>
  </form>

  {%- comment -%} Results Container {%- endcomment -%}
  <div class="shipping-calculator__results hidden" data-shipping-results>
    <div class="shipping-calculator__rates" data-shipping-rates></div>
    <div class="shipping-calculator__error hidden" data-shipping-error></div>
  </div>
</div>
```

---

## JavaScript Component

### assets/shipping-calculator.js

```javascript
class ShippingCalculator {
  constructor(container) {
    this.container = container;
    this.form = container.querySelector('[data-shipping-form]');
    this.countrySelect = container.querySelector('[data-shipping-country]');
    this.provinceWrapper = container.querySelector('[data-province-wrapper]');
    this.provinceSelect = container.querySelector('[data-shipping-province]');
    this.zipInput = container.querySelector('[data-shipping-zip]');
    this.submitButton = container.querySelector('[data-shipping-submit]');
    this.resultsContainer = container.querySelector('[data-shipping-results]');
    this.ratesContainer = container.querySelector('[data-shipping-rates]');
    this.errorContainer = container.querySelector('[data-shipping-error]');

    this.init();
  }

  init() {
    // Country change handler
    this.countrySelect.addEventListener('change', this.onCountryChange.bind(this));

    // Form submission
    this.form.addEventListener('submit', this.onSubmit.bind(this));

    // Initialize province dropdown if country is pre-selected
    if (this.countrySelect.value) {
      this.updateProvinces();
    }
  }

  onCountryChange() {
    this.updateProvinces();
    this.clearResults();
  }

  updateProvinces() {
    const selectedOption = this.countrySelect.options[this.countrySelect.selectedIndex];
    const provincesData = selectedOption.dataset.provinces;

    if (provincesData) {
      const provinces = JSON.parse(provincesData);

      if (provinces.length > 0) {
        // Populate province dropdown
        this.provinceSelect.innerHTML = `
          <option value="">${this.getTranslation('province')}</option>
          ${provinces.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('')}
        `;
        this.provinceWrapper.classList.remove('hidden');
      } else {
        this.provinceWrapper.classList.add('hidden');
        this.provinceSelect.innerHTML = '';
      }
    } else {
      this.provinceWrapper.classList.add('hidden');
      this.provinceSelect.innerHTML = '';
    }
  }

  async onSubmit(event) {
    event.preventDefault();

    const country = this.countrySelect.value;
    const province = this.provinceSelect.value;
    const zip = this.zipInput.value.trim();

    if (!country) {
      this.showError(this.getTranslation('error_country'));
      return;
    }

    this.setLoading(true);
    this.clearResults();

    try {
      const rates = await this.fetchRates(country, province, zip);
      this.displayRates(rates);
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async fetchRates(country, province, zip) {
    const params = new URLSearchParams({
      'shipping_address[country]': country,
      'shipping_address[province]': province,
      'shipping_address[zip]': zip
    });

    const response = await fetch(`/cart/shipping_rates.json?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(this.parseError(errorData));
    }

    const data = await response.json();
    return data.shipping_rates || [];
  }

  displayRates(rates) {
    this.resultsContainer.classList.remove('hidden');
    this.errorContainer.classList.add('hidden');

    if (rates.length === 0) {
      this.ratesContainer.innerHTML = `
        <p class="shipping-calculator__no-rates">
          ${this.getTranslation('no_rates')}
        </p>
      `;
      return;
    }

    const ratesHTML = rates.map(rate => this.renderRate(rate)).join('');

    this.ratesContainer.innerHTML = `
      <p class="shipping-calculator__rates-heading">
        ${this.getTranslation('rates_heading')}
      </p>
      <ul class="shipping-calculator__rates-list">
        ${ratesHTML}
      </ul>
    `;
  }

  renderRate(rate) {
    const price = rate.price === '0.00'
      ? this.getTranslation('free')
      : Shopify.formatMoney(parseFloat(rate.price) * 100);

    const deliveryDays = rate.delivery_days;
    let deliveryText = '';

    if (deliveryDays) {
      if (Array.isArray(deliveryDays)) {
        deliveryText = `(${deliveryDays[0]}-${deliveryDays[1]} ${this.getTranslation('days')})`;
      } else {
        deliveryText = `(${deliveryDays} ${this.getTranslation('days')})`;
      }
    }

    return `
      <li class="shipping-calculator__rate">
        <span class="shipping-calculator__rate-name">${rate.name}</span>
        <span class="shipping-calculator__rate-price">${price}</span>
        ${deliveryText ? `<span class="shipping-calculator__rate-delivery">${deliveryText}</span>` : ''}
      </li>
    `;
  }

  showError(message) {
    this.resultsContainer.classList.remove('hidden');
    this.ratesContainer.innerHTML = '';
    this.errorContainer.classList.remove('hidden');
    this.errorContainer.innerHTML = `
      <p class="shipping-calculator__error-message">
        ${message}
      </p>
    `;
  }

  clearResults() {
    this.resultsContainer.classList.add('hidden');
    this.ratesContainer.innerHTML = '';
    this.errorContainer.classList.add('hidden');
    this.errorContainer.innerHTML = '';
  }

  parseError(errorData) {
    if (errorData.errors) {
      // Handle specific field errors
      const errors = errorData.errors;
      if (errors.zip) {
        return this.getTranslation('error_zip');
      }
      if (errors.country) {
        return this.getTranslation('error_country');
      }
      if (errors.province) {
        return this.getTranslation('error_province');
      }
    }

    return this.getTranslation('error_general');
  }

  setLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.querySelector('.shipping-calculator__submit-text')
      .classList.toggle('hidden', loading);
    this.submitButton.querySelector('.shipping-calculator__submit-loading')
      .classList.toggle('hidden', !loading);
  }

  getTranslation(key) {
    const translations = window.shippingCalculatorTranslations || {};
    return translations[key] || key;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-shipping-calculator]').forEach(container => {
    new ShippingCalculator(container);
  });
});
```

---

## CSS Styles

### assets/shipping-calculator.css

```css
.shipping-calculator {
  padding: 1.5rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
  margin-top: 1.5rem;
}

.shipping-calculator__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

/* Form Layout */
.shipping-calculator__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shipping-calculator__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.shipping-calculator__field {
  display: flex;
  flex-direction: column;
}

.shipping-calculator__field--province {
  grid-column: span 2;
}

/* Inputs */
.shipping-calculator__select,
.shipping-calculator__input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
  color: var(--color-foreground);
  transition: border-color 0.2s ease;
}

.shipping-calculator__select:focus,
.shipping-calculator__input:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 2px var(--color-focus-ring);
}

.shipping-calculator__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

/* Submit Button */
.shipping-calculator__submit {
  align-self: flex-start;
  min-width: 150px;
}

.shipping-calculator__submit-loading.hidden,
.shipping-calculator__submit-text.hidden {
  display: none;
}

/* Results */
.shipping-calculator__results {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.shipping-calculator__results.hidden {
  display: none;
}

.shipping-calculator__rates-heading {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.shipping-calculator__rates-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.shipping-calculator__rate {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.shipping-calculator__rate:last-child {
  border-bottom: none;
}

.shipping-calculator__rate-name {
  flex: 1;
  font-size: 0.875rem;
}

.shipping-calculator__rate-price {
  font-weight: 600;
  font-size: 0.875rem;
}

.shipping-calculator__rate-delivery {
  width: 100%;
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
}

.shipping-calculator__no-rates {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin: 0;
}

/* Error State */
.shipping-calculator__error {
  padding: 0.75rem 1rem;
  background: var(--color-error-background);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius);
  color: var(--color-error);
}

.shipping-calculator__error.hidden {
  display: none;
}

.shipping-calculator__error-message {
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive */
@media screen and (max-width: 749px) {
  .shipping-calculator__fields {
    grid-template-columns: 1fr;
  }

  .shipping-calculator__field--province {
    grid-column: span 1;
  }

  .shipping-calculator__submit {
    width: 100%;
  }
}
```

---

## Translations Script Block

Include translations for JavaScript:

```liquid
{%- comment -%} Add to shipping-calculator.liquid or cart template {%- endcomment -%}

<script>
  window.shippingCalculatorTranslations = {
    province: {{ 'cart.shipping_calculator.province' | t | json }},
    free: {{ 'cart.shipping_calculator.free' | t | json }},
    days: {{ 'cart.shipping_calculator.days' | t | json }},
    rates_heading: {{ 'cart.shipping_calculator.rates_available' | t | json }},
    no_rates: {{ 'cart.shipping_calculator.no_rates' | t | json }},
    error_general: {{ 'cart.shipping_calculator.error_general' | t | json }},
    error_country: {{ 'cart.shipping_calculator.error_country' | t | json }},
    error_province: {{ 'cart.shipping_calculator.error_province' | t | json }},
    error_zip: {{ 'cart.shipping_calculator.error_zip' | t | json }}
  };
</script>
```

---

## Locales

### locales/en.default.json

```json
{
  "cart": {
    "shipping_calculator": {
      "title": "Estimate Shipping",
      "country": "Country/Region",
      "province": "State/Province",
      "zip": "Postal/ZIP Code",
      "calculate": "Calculate Shipping",
      "rates_available": "Available shipping rates:",
      "no_rates": "No shipping rates available for this address.",
      "free": "Free",
      "days": "business days",
      "error_general": "Unable to calculate shipping rates. Please try again.",
      "error_country": "Please select a country.",
      "error_province": "Please select a state or province.",
      "error_zip": "Please enter a valid postal or ZIP code."
    }
  }
}
```

---

## Integration with Cart

### sections/main-cart.liquid (excerpt)

```liquid
<div class="cart-page">
  <div class="cart-items">
    {%- comment -%} Cart items here {%- endcomment -%}
  </div>

  <div class="cart-sidebar">
    <div class="cart-totals">
      {%- comment -%} Subtotal, discounts, etc. {%- endcomment -%}
    </div>

    {%- if section.settings.show_shipping_calculator -%}
      {{ 'shipping-calculator.css' | asset_url | stylesheet_tag }}
      {% render 'shipping-calculator' %}
      <script src="{{ 'shipping-calculator.js' | asset_url }}" defer="defer"></script>
    {%- endif -%}

    <div class="cart-checkout">
      <button type="submit" name="checkout" class="button button--primary">
        {{ 'cart.checkout' | t }}
      </button>
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Cart",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_shipping_calculator",
      "label": "Show shipping calculator",
      "default": true
    }
  ]
}
{% endschema %}
```

---

## Cart Drawer Integration

### snippets/cart-drawer-shipping.liquid

Compact version for cart drawer:

```liquid
<details class="cart-drawer__shipping-calculator" data-shipping-calculator>
  <summary class="cart-drawer__shipping-toggle">
    {% render 'icon', icon: 'shipping' %}
    <span>{{ 'cart.shipping_calculator.title' | t }}</span>
    {% render 'icon', icon: 'chevron-down' %}
  </summary>

  <div class="cart-drawer__shipping-content">
    <form class="cart-drawer__shipping-form" data-shipping-form>
      <select
        name="shipping_address[country]"
        class="cart-drawer__shipping-select"
        data-shipping-country
        aria-label="{{ 'cart.shipping_calculator.country' | t }}"
      >
        <option value="">{{ 'cart.shipping_calculator.country' | t }}</option>
        {%- for country in shop.countries -%}
          <option
            value="{{ country.iso_code }}"
            data-provinces='{{ country.provinces | json }}'
          >
            {{ country.name }}
          </option>
        {%- endfor -%}
      </select>

      <div class="cart-drawer__shipping-province hidden" data-province-wrapper>
        <select
          name="shipping_address[province]"
          class="cart-drawer__shipping-select"
          data-shipping-province
          aria-label="{{ 'cart.shipping_calculator.province' | t }}"
        >
          <option value="">{{ 'cart.shipping_calculator.province' | t }}</option>
        </select>
      </div>

      <input
        type="text"
        name="shipping_address[zip]"
        class="cart-drawer__shipping-input"
        placeholder="{{ 'cart.shipping_calculator.zip' | t }}"
        data-shipping-zip
      >

      <button type="submit" class="cart-drawer__shipping-button" data-shipping-submit>
        {{ 'cart.shipping_calculator.calculate' | t }}
      </button>
    </form>

    <div class="cart-drawer__shipping-results hidden" data-shipping-results>
      <div data-shipping-rates></div>
      <div class="cart-drawer__shipping-error hidden" data-shipping-error></div>
    </div>
  </div>
</details>
```

---

## Advanced: Show Cheapest Rate

Display cheapest shipping option prominently:

```javascript
displayRates(rates) {
  if (rates.length === 0) {
    this.showNoRates();
    return;
  }

  // Sort by price (ascending)
  const sortedRates = [...rates].sort((a, b) =>
    parseFloat(a.price) - parseFloat(b.price)
  );

  const cheapest = sortedRates[0];
  const others = sortedRates.slice(1);

  let html = `
    <div class="shipping-calculator__cheapest">
      <span class="shipping-calculator__cheapest-label">
        ${this.getTranslation('cheapest_option')}
      </span>
      ${this.renderRate(cheapest, true)}
    </div>
  `;

  if (others.length > 0) {
    html += `
      <details class="shipping-calculator__other-rates">
        <summary>${this.getTranslation('other_options', { count: others.length })}</summary>
        <ul class="shipping-calculator__rates-list">
          ${others.map(rate => this.renderRate(rate)).join('')}
        </ul>
      </details>
    `;
  }

  this.ratesContainer.innerHTML = html;
  this.resultsContainer.classList.remove('hidden');
}
```

---

## Handling Special Cases

### International Shipping Notice

```liquid
{%- comment -%} Show notice for international addresses {%- endcomment -%}
<div class="shipping-calculator__international-notice hidden" data-international-notice>
  <p>{{ 'cart.shipping_calculator.international_notice' | t }}</p>
</div>

<script>
  // In ShippingCalculator class
  onCountryChange() {
    const isInternational = this.countrySelect.value !== '{{ shop.address.country_code }}';
    const notice = this.container.querySelector('[data-international-notice]');

    if (notice) {
      notice.classList.toggle('hidden', !isInternational);
    }

    this.updateProvinces();
    this.clearResults();
  }
</script>
```

### Free Shipping Threshold Progress

```liquid
{%- assign free_shipping_threshold = settings.free_shipping_threshold | times: 100 -%}
{%- assign cart_total = cart.total_price -%}
{%- assign remaining = free_shipping_threshold | minus: cart_total -%}

{%- if remaining > 0 -%}
  <div class="shipping-calculator__threshold">
    <p class="shipping-calculator__threshold-message">
      {{ 'cart.shipping_calculator.free_shipping_remaining' | t: amount: remaining | money }}
    </p>
    <div class="shipping-calculator__threshold-bar">
      {%- assign progress = cart_total | times: 100 | divided_by: free_shipping_threshold -%}
      <div
        class="shipping-calculator__threshold-progress"
        style="width: {{ progress | at_most: 100 }}%"
      ></div>
    </div>
  </div>
{%- else -%}
  <div class="shipping-calculator__threshold shipping-calculator__threshold--complete">
    <p>{{ 'cart.shipping_calculator.free_shipping_eligible' | t }}</p>
  </div>
{%- endif -%}
```

---

## API Reference

### Shipping Rates Endpoint

```
GET /cart/shipping_rates.json
```

**Parameters:**
- `shipping_address[country]` (required): ISO country code
- `shipping_address[province]`: Province/state code
- `shipping_address[zip]`: Postal/ZIP code

**Response:**
```json
{
  "shipping_rates": [
    {
      "name": "Standard Shipping",
      "price": "5.99",
      "delivery_days": [3, 5],
      "source": "shopify"
    },
    {
      "name": "Express Shipping",
      "price": "12.99",
      "delivery_days": [1, 2],
      "source": "shopify"
    }
  ]
}
```

**Error Response:**
```json
{
  "errors": {
    "zip": ["is not valid for United States"]
  }
}
```

---

## Best Practices

### 1. Cache Country/Province Data

Pre-load province data to avoid JSON parsing on each selection:

```javascript
constructor(container) {
  // ... other init code
  this.provincesCache = new Map();
  this.cacheProvinces();
}

cacheProvinces() {
  this.countrySelect.querySelectorAll('option').forEach(option => {
    if (option.dataset.provinces) {
      this.provincesCache.set(option.value, JSON.parse(option.dataset.provinces));
    }
  });
}

updateProvinces() {
  const provinces = this.provincesCache.get(this.countrySelect.value) || [];
  // ... rest of method
}
```

### 2. Debounce ZIP Input

For auto-calculation on input:

```javascript
constructor(container) {
  // ... other init code
  this.zipInput.addEventListener('input', this.debounce(this.autoCalculate.bind(this), 500));
}

debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

autoCalculate() {
  if (this.countrySelect.value && this.zipInput.value.length >= 3) {
    this.form.dispatchEvent(new Event('submit'));
  }
}
```

### 3. Remember Last Address

Store and restore last used address:

```javascript
init() {
  this.loadSavedAddress();
  // ... rest of init
}

loadSavedAddress() {
  const saved = localStorage.getItem('shipping_calculator_address');
  if (saved) {
    const { country, province, zip } = JSON.parse(saved);
    if (country) {
      this.countrySelect.value = country;
      this.updateProvinces();
    }
    if (province) this.provinceSelect.value = province;
    if (zip) this.zipInput.value = zip;
  }
}

onSubmit(event) {
  // ... before fetch
  this.saveAddress();
  // ... rest of method
}

saveAddress() {
  const address = {
    country: this.countrySelect.value,
    province: this.provinceSelect.value,
    zip: this.zipInput.value
  };
  localStorage.setItem('shipping_calculator_address', JSON.stringify(address));
}
```

### 4. Accessibility

Announce rate updates to screen readers:

```javascript
displayRates(rates) {
  // ... display logic

  // Announce to screen readers
  this.announce(`${rates.length} shipping options available`);
}

announce(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'visually-hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

---

## Troubleshooting

### No Rates Returned

Common causes:
1. **Products not configured for shipping**: Check product settings
2. **Shipping zones not set up**: Configure in Shopify Admin > Settings > Shipping
3. **Address not in any zone**: Add the country/region to a shipping zone
4. **Cart is empty**: API requires items in cart

### Rate Calculation Errors

```javascript
parseError(errorData) {
  // Handle common API errors
  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.errors) {
    const errorMessages = [];

    Object.entries(errorData.errors).forEach(([field, messages]) => {
      messages.forEach(msg => {
        errorMessages.push(`${this.fieldLabel(field)}: ${msg}`);
      });
    });

    return errorMessages.join('. ');
  }

  return this.getTranslation('error_general');
}

fieldLabel(field) {
  const labels = {
    zip: this.getTranslation('zip'),
    country: this.getTranslation('country'),
    province: this.getTranslation('province')
  };
  return labels[field] || field;
}
```
