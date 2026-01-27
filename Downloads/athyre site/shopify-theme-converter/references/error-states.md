# Error State Patterns

Implementation patterns for handling and displaying errors in Shopify themes.

---

## Overview

Proper error handling improves user experience by providing clear feedback when something goes wrong. This guide covers form validation, network errors, out of stock handling, empty states, and 404 page customization.

---

## Form Validation

### Client-Side Validation

```liquid
{%- comment -%}
  snippets/form-field.liquid
  Reusable form field with validation

  Accepts:
  - type: {String} Input type
  - name: {String} Field name
  - label: {String} Field label
  - required: {Boolean} Is required
  - pattern: {String} Validation pattern
  - error_message: {String} Custom error message
{%- endcomment -%}

<div class="form-field" data-form-field>
  <label for="{{ name }}" class="form-field__label">
    {{ label }}
    {%- if required -%}
      <span class="form-field__required" aria-hidden="true">*</span>
    {%- endif -%}
  </label>

  <input
    type="{{ type | default: 'text' }}"
    id="{{ name }}"
    name="{{ name }}"
    class="form-field__input"
    {% if required %}required aria-required="true"{% endif %}
    {% if pattern %}pattern="{{ pattern }}"{% endif %}
    {% if error_message %}data-error-message="{{ error_message }}"{% endif %}
    aria-describedby="{{ name }}-error"
  >

  <span
    id="{{ name }}-error"
    class="form-field__error"
    role="alert"
    aria-live="polite"
  ></span>
</div>
```

### Form Validation JavaScript

```javascript
class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = form.querySelectorAll('[data-form-field]');

    this.init();
  }

  init() {
    // Validate on blur
    this.fields.forEach(field => {
      const input = field.querySelector('input, select, textarea');
      input?.addEventListener('blur', () => this.validateField(field));
      input?.addEventListener('input', () => this.clearError(field));
    });

    // Validate on submit
    this.form.addEventListener('submit', (e) => {
      if (!this.validateAll()) {
        e.preventDefault();
        this.focusFirstError();
      }
    });
  }

  validateField(field) {
    const input = field.querySelector('input, select, textarea');
    const errorEl = field.querySelector('.form-field__error');

    if (!input) return true;

    // Clear previous error
    this.clearError(field);

    // Check validity
    if (!input.checkValidity()) {
      const message = this.getErrorMessage(input);
      this.showError(field, message);
      return false;
    }

    // Custom validations
    if (input.type === 'email' && input.value) {
      if (!this.isValidEmail(input.value)) {
        this.showError(field, this.getTranslation('email_invalid'));
        return false;
      }
    }

    return true;
  }

  validateAll() {
    let isValid = true;

    this.fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  getErrorMessage(input) {
    // Custom error message from data attribute
    if (input.dataset.errorMessage) {
      return input.dataset.errorMessage;
    }

    // Validity state messages
    if (input.validity.valueMissing) {
      return this.getTranslation('required');
    }
    if (input.validity.typeMismatch) {
      return this.getTranslation(`${input.type}_invalid`);
    }
    if (input.validity.patternMismatch) {
      return this.getTranslation('pattern_invalid');
    }
    if (input.validity.tooShort) {
      return this.getTranslation('too_short', { min: input.minLength });
    }
    if (input.validity.tooLong) {
      return this.getTranslation('too_long', { max: input.maxLength });
    }

    return this.getTranslation('invalid');
  }

  showError(field, message) {
    const input = field.querySelector('input, select, textarea');
    const errorEl = field.querySelector('.form-field__error');

    field.classList.add('has-error');
    input?.setAttribute('aria-invalid', 'true');

    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  clearError(field) {
    const input = field.querySelector('input, select, textarea');
    const errorEl = field.querySelector('.form-field__error');

    field.classList.remove('has-error');
    input?.removeAttribute('aria-invalid');

    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  focusFirstError() {
    const firstError = this.form.querySelector('.has-error input, .has-error select, .has-error textarea');
    firstError?.focus();
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getTranslation(key, vars = {}) {
    const translations = window.formValidationTranslations || {};
    let message = translations[key] || key;

    Object.entries(vars).forEach(([k, v]) => {
      message = message.replace(`{{ ${k} }}`, v);
    });

    return message;
  }
}

// Initialize on all forms
document.querySelectorAll('form[data-validate]').forEach(form => {
  new FormValidator(form);
});
```

### Form Validation CSS

```css
.form-field {
  margin-bottom: 1rem;
}

.form-field__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.form-field__required {
  color: var(--color-error);
}

.form-field__input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 2px var(--color-focus-ring);
}

/* Error state */
.form-field.has-error .form-field__input {
  border-color: var(--color-error);
}

.form-field.has-error .form-field__input:focus {
  box-shadow: 0 0 0 2px var(--color-error-ring);
}

.form-field__error {
  display: block;
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.25rem;
  min-height: 1rem;
}

.form-field__error:empty {
  display: none;
}

/* Success state */
.form-field.is-valid .form-field__input {
  border-color: var(--color-success);
}
```

### Validation Translations

```liquid
<script>
  window.formValidationTranslations = {
    required: {{ 'forms.errors.required' | t | json }},
    email_invalid: {{ 'forms.errors.email_invalid' | t | json }},
    pattern_invalid: {{ 'forms.errors.pattern_invalid' | t | json }},
    too_short: {{ 'forms.errors.too_short' | t | json }},
    too_long: {{ 'forms.errors.too_long' | t | json }},
    invalid: {{ 'forms.errors.invalid' | t | json }}
  };
</script>
```

---

## Network Error Handling

### AJAX Error Handler

```javascript
class AjaxErrorHandler {
  constructor() {
    this.toastContainer = this.createToastContainer();
  }

  createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }
    return container;
  }

  async fetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      return await response.json();

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async parseError(response) {
    try {
      const data = await response.json();
      return {
        status: response.status,
        message: data.message || data.description || data.error,
        errors: data.errors
      };
    } catch {
      return {
        status: response.status,
        message: this.getHttpErrorMessage(response.status)
      };
    }
  }

  handleError(error) {
    console.error('Request failed:', error);

    // Network error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      this.showToast(this.getTranslation('network_error'), 'error');
      return;
    }

    // HTTP error
    if (error.status) {
      this.showToast(error.message || this.getHttpErrorMessage(error.status), 'error');
      return;
    }

    // Generic error
    this.showToast(error.message || this.getTranslation('generic_error'), 'error');
  }

  getHttpErrorMessage(status) {
    const messages = {
      400: this.getTranslation('error_400'),
      401: this.getTranslation('error_401'),
      403: this.getTranslation('error_403'),
      404: this.getTranslation('error_404'),
      422: this.getTranslation('error_422'),
      429: this.getTranslation('error_429'),
      500: this.getTranslation('error_500'),
      502: this.getTranslation('error_502'),
      503: this.getTranslation('error_503')
    };
    return messages[status] || this.getTranslation('generic_error');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast__icon">${this.getIcon(type)}</span>
      <span class="toast__message">${message}</span>
      <button type="button" class="toast__close" aria-label="Dismiss">×</button>
    `;

    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => {
      this.removeToast(toast);
    });

    // Auto dismiss
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('is-visible'), 10);
    setTimeout(() => this.removeToast(toast), 5000);
  }

  removeToast(toast) {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }

  getIcon(type) {
    const icons = {
      error: '⚠',
      success: '✓',
      warning: '⚡',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  getTranslation(key) {
    const translations = window.errorTranslations || {};
    return translations[key] || key;
  }
}

// Global instance
window.ajaxHandler = new AjaxErrorHandler();
```

### Toast CSS

```css
.toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

@media screen and (max-width: 749px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast.is-visible {
  transform: translateX(0);
  opacity: 1;
}

.toast__icon {
  flex-shrink: 0;
  font-size: 1.25rem;
}

.toast__message {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toast__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.5;
}

.toast__close:hover {
  opacity: 1;
}

/* Toast types */
.toast--error {
  border-left: 4px solid var(--color-error);
}

.toast--error .toast__icon {
  color: var(--color-error);
}

.toast--success {
  border-left: 4px solid var(--color-success);
}

.toast--success .toast__icon {
  color: var(--color-success);
}

.toast--warning {
  border-left: 4px solid var(--color-warning);
}

.toast--warning .toast__icon {
  color: var(--color-warning);
}
```

---

## Out of Stock Handling

### Product Availability State

```liquid
{%- comment -%}
  snippets/product-availability.liquid

  Accepts:
  - product: {Product} Product object
  - variant: {Variant} Current variant
{%- endcomment -%}

{%- assign current_variant = variant | default: product.selected_or_first_available_variant -%}

<div class="product-availability" data-product-availability>
  {%- if current_variant.available -%}
    {%- if current_variant.inventory_management -%}
      {%- if current_variant.inventory_quantity <= 5 and current_variant.inventory_quantity > 0 -%}
        <div class="product-availability__status product-availability__status--low-stock">
          {% render 'icon', icon: 'warning' %}
          <span>
            {{ 'products.product.low_stock' | t: count: current_variant.inventory_quantity }}
          </span>
        </div>
      {%- else -%}
        <div class="product-availability__status product-availability__status--in-stock">
          {% render 'icon', icon: 'check' %}
          <span>{{ 'products.product.in_stock' | t }}</span>
        </div>
      {%- endif -%}
    {%- else -%}
      <div class="product-availability__status product-availability__status--in-stock">
        {% render 'icon', icon: 'check' %}
        <span>{{ 'products.product.in_stock' | t }}</span>
      </div>
    {%- endif -%}

  {%- else -%}
    <div class="product-availability__status product-availability__status--out-of-stock">
      {% render 'icon', icon: 'x' %}
      <span>{{ 'products.product.out_of_stock' | t }}</span>
    </div>

    {%- comment -%} Back in stock notification {%- endcomment -%}
    <div class="product-availability__notify">
      <button
        type="button"
        class="product-availability__notify-btn"
        data-notify-btn
        aria-expanded="false"
        aria-controls="notify-form-{{ product.id }}"
      >
        {{ 'products.product.notify_me' | t }}
      </button>

      <form
        id="notify-form-{{ product.id }}"
        class="product-availability__notify-form hidden"
        data-notify-form
      >
        <input
          type="email"
          name="email"
          placeholder="{{ 'products.product.notify_email' | t }}"
          required
          class="product-availability__notify-input"
        >
        <input type="hidden" name="variant_id" value="{{ current_variant.id }}">
        <button type="submit" class="button button--primary">
          {{ 'products.product.notify_submit' | t }}
        </button>
      </form>

      <p class="product-availability__notify-success hidden" data-notify-success>
        {{ 'products.product.notify_success' | t }}
      </p>
    </div>
  {%- endif -%}
</div>
```

### Availability CSS

```css
.product-availability__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

.product-availability__status--in-stock {
  color: var(--color-success);
}

.product-availability__status--low-stock {
  color: var(--color-warning);
}

.product-availability__status--out-of-stock {
  color: var(--color-error);
}

.product-availability__notify {
  margin-top: 1rem;
}

.product-availability__notify-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
}

.product-availability__notify-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.product-availability__notify-form.hidden {
  display: none;
}

.product-availability__notify-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
}

.product-availability__notify-success {
  color: var(--color-success);
  font-size: 0.875rem;
  margin-top: 0.75rem;
}

.product-availability__notify-success.hidden {
  display: none;
}
```

### Cart Add Error for Out of Stock

```javascript
async function addToCart(variantId, quantity = 1) {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();

  } catch (error) {
    // Handle specific cart errors
    if (error.status === 422) {
      if (error.description?.includes('sold out')) {
        window.ajaxHandler.showToast(
          window.errorTranslations.sold_out,
          'error'
        );
      } else if (error.description?.includes('not enough')) {
        window.ajaxHandler.showToast(
          window.errorTranslations.not_enough_stock,
          'error'
        );
      } else {
        window.ajaxHandler.showToast(
          error.description || error.message,
          'error'
        );
      }
    }
    throw error;
  }
}
```

---

## Empty States

### Empty Cart

```liquid
{%- comment -%}
  snippets/cart-empty.liquid
{%- endcomment -%}

<div class="cart-empty">
  <div class="cart-empty__icon">
    {% render 'icon', icon: 'cart', size: 'large' %}
  </div>

  <h2 class="cart-empty__title">
    {{ 'cart.empty.title' | t }}
  </h2>

  <p class="cart-empty__text">
    {{ 'cart.empty.text' | t }}
  </p>

  <a href="{{ routes.all_products_collection_url }}" class="button button--primary">
    {{ 'cart.empty.continue_shopping' | t }}
  </a>
</div>
```

### Empty Search Results

```liquid
{%- comment -%}
  snippets/search-empty.liquid

  Accepts:
  - query: {String} Search query
{%- endcomment -%}

<div class="search-empty">
  <div class="search-empty__icon">
    {% render 'icon', icon: 'search', size: 'large' %}
  </div>

  <h2 class="search-empty__title">
    {{ 'search.empty.title' | t }}
  </h2>

  <p class="search-empty__text">
    {{ 'search.empty.text' | t: query: query }}
  </p>

  <div class="search-empty__suggestions">
    <h3>{{ 'search.empty.suggestions_title' | t }}</h3>
    <ul>
      <li>{{ 'search.empty.suggestion_1' | t }}</li>
      <li>{{ 'search.empty.suggestion_2' | t }}</li>
      <li>{{ 'search.empty.suggestion_3' | t }}</li>
    </ul>
  </div>

  {%- comment -%} Popular products fallback {%- endcomment -%}
  {%- if settings.search_empty_collection != blank -%}
    <div class="search-empty__popular">
      <h3>{{ 'search.empty.popular_title' | t }}</h3>
      <div class="search-empty__products">
        {%- for product in settings.search_empty_collection.products limit: 4 -%}
          {% render 'product-card', product: product %}
        {%- endfor -%}
      </div>
    </div>
  {%- endif -%}
</div>
```

### Empty Collection

```liquid
{%- comment -%}
  snippets/collection-empty.liquid
{%- endcomment -%}

<div class="collection-empty">
  <div class="collection-empty__icon">
    {% render 'icon', icon: 'filter', size: 'large' %}
  </div>

  {%- if collection.filters.size > 0 and collection.all_products_count > 0 -%}
    {%- comment -%} Filters active but no results {%- endcomment -%}
    <h2 class="collection-empty__title">
      {{ 'collections.empty.no_filter_results' | t }}
    </h2>
    <p class="collection-empty__text">
      {{ 'collections.empty.try_different_filters' | t }}
    </p>
    <a href="{{ collection.url }}" class="button button--secondary">
      {{ 'collections.empty.clear_filters' | t }}
    </a>
  {%- else -%}
    {%- comment -%} Collection is truly empty {%- endcomment -%}
    <h2 class="collection-empty__title">
      {{ 'collections.empty.title' | t }}
    </h2>
    <p class="collection-empty__text">
      {{ 'collections.empty.text' | t }}
    </p>
    <a href="{{ routes.collections_url }}" class="button button--primary">
      {{ 'collections.empty.browse_collections' | t }}
    </a>
  {%- endif -%}
</div>
```

### Empty State CSS

```css
.cart-empty,
.search-empty,
.collection-empty {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.cart-empty__icon,
.search-empty__icon,
.collection-empty__icon {
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.cart-empty__icon svg,
.search-empty__icon svg,
.collection-empty__icon svg {
  width: 64px;
  height: 64px;
}

.cart-empty__title,
.search-empty__title,
.collection-empty__title {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.cart-empty__text,
.search-empty__text,
.collection-empty__text {
  color: var(--color-foreground-muted);
  margin-bottom: 1.5rem;
}

.search-empty__suggestions {
  text-align: left;
  margin: 2rem 0;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.search-empty__suggestions h3 {
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.search-empty__suggestions ul {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin: 0;
  padding-left: 1.25rem;
}

.search-empty__popular {
  margin-top: 3rem;
  text-align: left;
}

.search-empty__products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

@media screen and (max-width: 749px) {
  .search-empty__products {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 404 Page

### templates/404.liquid

```liquid
{%- comment -%}
  Custom 404 page template
{%- endcomment -%}

<div class="page-404">
  <div class="page-width">
    <div class="page-404__content">
      <h1 class="page-404__code">404</h1>
      <h2 class="page-404__title">{{ 'general.404.title' | t }}</h2>
      <p class="page-404__text">{{ 'general.404.text' | t }}</p>

      {%- comment -%} Search form {%- endcomment -%}
      <form action="{{ routes.search_url }}" method="get" class="page-404__search">
        <input
          type="search"
          name="q"
          placeholder="{{ 'general.404.search_placeholder' | t }}"
          class="page-404__search-input"
        >
        <button type="submit" class="button button--primary">
          {{ 'general.404.search_button' | t }}
        </button>
      </form>

      <div class="page-404__links">
        <a href="{{ routes.root_url }}">{{ 'general.404.home_link' | t }}</a>
        <a href="{{ routes.collections_url }}">{{ 'general.404.collections_link' | t }}</a>
        <a href="{{ routes.contact_url }}">{{ 'general.404.contact_link' | t }}</a>
      </div>
    </div>

    {%- comment -%} Featured products {%- endcomment -%}
    {%- if settings.404_featured_collection != blank -%}
      <div class="page-404__featured">
        <h3>{{ 'general.404.featured_title' | t }}</h3>
        <div class="page-404__products">
          {%- for product in settings.404_featured_collection.products limit: 4 -%}
            {% render 'product-card', product: product %}
          {%- endfor -%}
        </div>
      </div>
    {%- endif -%}
  </div>
</div>

{% schema %}
{
  "name": "404 Page"
}
{% endschema %}
```

### 404 Page CSS

```css
.page-404 {
  padding: 4rem 0;
}

.page-404__content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.page-404__code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.2;
  margin: 0;
}

.page-404__title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.page-404__text {
  color: var(--color-foreground-muted);
  margin-bottom: 2rem;
}

.page-404__search {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.page-404__search-input {
  flex: 1;
}

.page-404__links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.page-404__links a {
  color: var(--color-primary);
}

.page-404__featured {
  margin-top: 4rem;
  text-align: center;
}

.page-404__featured h3 {
  margin-bottom: 1.5rem;
}

.page-404__products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media screen and (max-width: 989px) {
  .page-404__products {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Locales

```json
{
  "general": {
    "404": {
      "title": "Page not found",
      "text": "The page you're looking for doesn't exist or has been moved.",
      "search_placeholder": "Search our store",
      "search_button": "Search",
      "home_link": "Go to homepage",
      "collections_link": "Browse collections",
      "contact_link": "Contact us",
      "featured_title": "You might like these"
    }
  },
  "forms": {
    "errors": {
      "required": "This field is required",
      "email_invalid": "Please enter a valid email address",
      "pattern_invalid": "Please match the requested format",
      "too_short": "Please use at least {{ min }} characters",
      "too_long": "Please use no more than {{ max }} characters",
      "invalid": "This value is invalid"
    }
  },
  "cart": {
    "empty": {
      "title": "Your cart is empty",
      "text": "Looks like you haven't added any items to your cart yet.",
      "continue_shopping": "Continue Shopping"
    }
  },
  "search": {
    "empty": {
      "title": "No results found",
      "text": "We couldn't find any results for \"{{ query }}\".",
      "suggestions_title": "Search tips",
      "suggestion_1": "Check the spelling of your search term",
      "suggestion_2": "Try using different keywords",
      "suggestion_3": "Try more general search terms",
      "popular_title": "Popular products"
    }
  },
  "collections": {
    "empty": {
      "title": "No products",
      "text": "This collection doesn't have any products yet.",
      "no_filter_results": "No products match your filters",
      "try_different_filters": "Try adjusting or removing some filters.",
      "clear_filters": "Clear all filters",
      "browse_collections": "Browse Collections"
    }
  },
  "products": {
    "product": {
      "in_stock": "In stock",
      "out_of_stock": "Out of stock",
      "low_stock": "Only {{ count }} left",
      "notify_me": "Notify me when available",
      "notify_email": "Enter your email",
      "notify_submit": "Notify Me",
      "notify_success": "We'll email you when this product is back in stock."
    }
  },
  "errors": {
    "network_error": "Connection error. Please check your internet connection.",
    "generic_error": "Something went wrong. Please try again.",
    "sold_out": "Sorry, this item is sold out.",
    "not_enough_stock": "Sorry, we don't have enough stock for this quantity.",
    "error_400": "Invalid request. Please try again.",
    "error_401": "Please sign in to continue.",
    "error_403": "You don't have permission for this action.",
    "error_404": "The requested resource was not found.",
    "error_422": "Unable to process your request.",
    "error_429": "Too many requests. Please wait a moment.",
    "error_500": "Server error. Please try again later.",
    "error_502": "Service temporarily unavailable.",
    "error_503": "Service temporarily unavailable. Please try again later."
  }
}
```

---

## Best Practices

### 1. Error Message Guidelines

- Be specific about what went wrong
- Suggest how to fix the issue
- Use friendly, non-technical language
- Avoid blaming the user

### 2. Graceful Degradation

```javascript
// Always provide fallback behavior
async function loadData() {
  try {
    const data = await fetchData();
    renderData(data);
  } catch (error) {
    // Show cached/default content instead of blank
    renderFallback();
    showRetryOption();
  }
}
```

### 3. Retry Mechanisms

```javascript
async function fetchWithRetry(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### 4. Accessibility

- Use `role="alert"` for error messages
- Use `aria-invalid="true"` on invalid inputs
- Ensure error messages are associated with inputs via `aria-describedby`
- Focus management after errors
