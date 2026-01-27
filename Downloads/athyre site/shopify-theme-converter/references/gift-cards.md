# Gift Card Patterns

Gift card product templates, balance checkers, recipient forms, and redemption displays.

---

## Gift Card Product Template

### Template JSON

```json
{
  "sections": {
    "main": {
      "type": "main-gift-card-product",
      "settings": {
        "show_recipient_form": true,
        "show_preview": true
      }
    },
    "info": {
      "type": "gift-card-info",
      "settings": {}
    }
  },
  "order": ["main", "info"]
}
```

### Gift Card Product Section

```liquid
{%- comment -%}
  sections/main-gift-card-product.liquid
  Product page for gift cards
{%- endcomment -%}

<section class="gift-card-product section-{{ section.id }}">
  <div class="page-width">
    <div class="gift-card-product__grid">
      {%- comment -%} Image / Preview {%- endcomment -%}
      <div class="gift-card-product__media">
        {%- if section.settings.show_preview -%}
          <gift-card-preview class="gift-card-preview">
            <div class="gift-card-preview__card">
              {%- if product.featured_image -%}
                <img
                  src="{{ product.featured_image | image_url: width: 600 }}"
                  alt="{{ product.featured_image.alt | escape }}"
                  width="600"
                  height="400"
                  class="gift-card-preview__image"
                >
              {%- else -%}
                <div class="gift-card-preview__placeholder">
                  {% render 'icon', icon: 'gift' %}
                </div>
              {%- endif -%}

              {%- comment -%} Overlay with amount {%- endcomment -%}
              <div class="gift-card-preview__overlay">
                <span class="gift-card-preview__amount" data-preview-amount>
                  {{ product.selected_or_first_available_variant.price | money }}
                </span>
              </div>
            </div>

            {%- comment -%} Recipient preview {%- endcomment -%}
            <div class="gift-card-preview__message hidden" data-preview-message>
              <p class="gift-card-preview__to">
                {{ 'gift_card.to' | t }}: <span data-preview-recipient></span>
              </p>
              <p class="gift-card-preview__text" data-preview-text></p>
            </div>
          </gift-card-preview>
        {%- else -%}
          {%- if product.featured_image -%}
            <img
              src="{{ product.featured_image | image_url: width: 600 }}"
              alt="{{ product.featured_image.alt | escape }}"
              width="600"
              height="400"
            >
          {%- endif -%}
        {%- endif -%}
      </div>

      {%- comment -%} Product Info {%- endcomment -%}
      <div class="gift-card-product__info">
        <h1 class="gift-card-product__title">{{ product.title }}</h1>

        {%- if product.description != blank -%}
          <div class="gift-card-product__description rte">
            {{ product.description }}
          </div>
        {%- endif -%}

        {%- form 'product', product, class: 'gift-card-form', data-gift-card-form: '' -%}
          {%- comment -%} Amount Selection {%- endcomment -%}
          <div class="gift-card-form__amount">
            <label class="gift-card-form__label">
              {{ 'gift_card.select_amount' | t }}
            </label>

            <div class="gift-card-form__amounts">
              {%- for variant in product.variants -%}
                <label class="gift-card-amount">
                  <input
                    type="radio"
                    name="id"
                    value="{{ variant.id }}"
                    {% if variant == product.selected_or_first_available_variant %}checked{% endif %}
                    data-amount="{{ variant.price }}"
                  >
                  <span class="gift-card-amount__value">
                    {{ variant.price | money_without_trailing_zeros }}
                  </span>
                </label>
              {%- endfor -%}
            </div>

            {%- comment -%} Custom amount (if enabled) {%- endcomment -%}
            {%- if section.settings.enable_custom_amount -%}
              <div class="gift-card-form__custom">
                <label class="gift-card-amount gift-card-amount--custom">
                  <input type="radio" name="id" value="custom" data-custom-toggle>
                  <span class="gift-card-amount__value">
                    {{ 'gift_card.custom_amount' | t }}
                  </span>
                </label>

                <div class="gift-card-form__custom-input hidden" data-custom-amount>
                  <span class="gift-card-form__currency">{{ cart.currency.symbol }}</span>
                  <input
                    type="number"
                    name="properties[_custom_amount]"
                    min="{{ section.settings.min_custom_amount }}"
                    max="{{ section.settings.max_custom_amount }}"
                    step="1"
                    placeholder="{{ section.settings.min_custom_amount }}"
                    aria-label="{{ 'gift_card.custom_amount' | t }}"
                  >
                </div>
              </div>
            {%- endif -%}
          </div>

          {%- comment -%} Recipient Form {%- endcomment -%}
          {%- if section.settings.show_recipient_form -%}
            <div class="gift-card-form__recipient">
              <div class="gift-card-form__recipient-toggle">
                <label class="checkbox-label">
                  <input type="checkbox" name="properties[__shopify_send_gift_card_to_recipient]" data-recipient-toggle>
                  <span>{{ 'gift_card.send_as_gift' | t }}</span>
                </label>
              </div>

              <div class="gift-card-form__recipient-fields hidden" data-recipient-fields>
                <div class="gift-card-form__field">
                  <label for="RecipientEmail">
                    {{ 'gift_card.recipient_email' | t }} *
                  </label>
                  <input
                    type="email"
                    id="RecipientEmail"
                    name="properties[Recipient email]"
                    placeholder="{{ 'gift_card.recipient_email_placeholder' | t }}"
                  >
                </div>

                <div class="gift-card-form__field">
                  <label for="RecipientName">
                    {{ 'gift_card.recipient_name' | t }}
                  </label>
                  <input
                    type="text"
                    id="RecipientName"
                    name="properties[Recipient name]"
                    placeholder="{{ 'gift_card.recipient_name_placeholder' | t }}"
                  >
                </div>

                <div class="gift-card-form__field">
                  <label for="GiftMessage">
                    {{ 'gift_card.message' | t }}
                  </label>
                  <textarea
                    id="GiftMessage"
                    name="properties[Message]"
                    rows="3"
                    maxlength="200"
                    placeholder="{{ 'gift_card.message_placeholder' | t }}"
                  ></textarea>
                  <span class="gift-card-form__char-count">
                    <span data-char-count>0</span>/200
                  </span>
                </div>

                <div class="gift-card-form__field">
                  <label for="SendDate">
                    {{ 'gift_card.send_date' | t }}
                  </label>
                  <input
                    type="date"
                    id="SendDate"
                    name="properties[Send on]"
                    min="{{ 'now' | date: '%Y-%m-%d' }}"
                  >
                  <span class="gift-card-form__hint">
                    {{ 'gift_card.send_date_hint' | t }}
                  </span>
                </div>
              </div>
            </div>
          {%- endif -%}

          {%- comment -%} Quantity {%- endcomment -%}
          <div class="gift-card-form__quantity">
            <label for="Quantity">{{ 'gift_card.quantity' | t }}</label>
            <div class="quantity-selector">
              <button type="button" class="quantity-selector__button" data-quantity-minus>-</button>
              <input
                type="number"
                id="Quantity"
                name="quantity"
                value="1"
                min="1"
                max="10"
                class="quantity-selector__input"
              >
              <button type="button" class="quantity-selector__button" data-quantity-plus>+</button>
            </div>
          </div>

          {%- comment -%} Add to Cart {%- endcomment -%}
          <button type="submit" class="gift-card-form__submit button button--primary button--full">
            {{ 'gift_card.add_to_cart' | t }} - <span data-total-price>{{ product.selected_or_first_available_variant.price | money }}</span>
          </button>
        {%- endform -%}
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Gift Card Product",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_preview",
      "label": "Show gift card preview",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_recipient_form",
      "label": "Show recipient form",
      "default": true,
      "info": "Allow sending as a gift via email"
    },
    {
      "type": "header",
      "content": "Custom Amount"
    },
    {
      "type": "checkbox",
      "id": "enable_custom_amount",
      "label": "Enable custom amount",
      "default": false,
      "info": "Requires app or custom backend"
    },
    {
      "type": "number",
      "id": "min_custom_amount",
      "label": "Minimum custom amount",
      "default": 10
    },
    {
      "type": "number",
      "id": "max_custom_amount",
      "label": "Maximum custom amount",
      "default": 500
    }
  ]
}
{% endschema %}
```

---

## Gift Card JavaScript

```javascript
/**
 * Gift Card Form Controller
 */
class GiftCardForm {
  constructor(form) {
    this.form = form;
    this.amountInputs = form.querySelectorAll('input[name="id"]');
    this.recipientToggle = form.querySelector('[data-recipient-toggle]');
    this.recipientFields = form.querySelector('[data-recipient-fields]');
    this.messageInput = form.querySelector('#GiftMessage');
    this.charCount = form.querySelector('[data-char-count]');
    this.totalPrice = form.querySelector('[data-total-price]');
    this.quantityInput = form.querySelector('input[name="quantity"]');
    this.customToggle = form.querySelector('[data-custom-toggle]');
    this.customAmountWrapper = form.querySelector('[data-custom-amount]');

    this.init();
  }

  init() {
    // Amount selection
    this.amountInputs.forEach(input => {
      input.addEventListener('change', () => this.updateTotal());
    });

    // Recipient toggle
    this.recipientToggle?.addEventListener('change', () => {
      this.toggleRecipientFields();
    });

    // Message character count
    this.messageInput?.addEventListener('input', () => {
      this.updateCharCount();
      this.updatePreview();
    });

    // Quantity
    this.quantityInput?.addEventListener('change', () => this.updateTotal());

    // Custom amount toggle
    this.customToggle?.addEventListener('change', () => {
      this.customAmountWrapper?.classList.toggle('hidden', !this.customToggle.checked);
    });

    // Quantity buttons
    this.form.querySelector('[data-quantity-minus]')?.addEventListener('click', () => {
      this.adjustQuantity(-1);
    });
    this.form.querySelector('[data-quantity-plus]')?.addEventListener('click', () => {
      this.adjustQuantity(1);
    });

    // Form validation
    this.form.addEventListener('submit', (e) => this.validateForm(e));

    // Preview updates
    const recipientName = this.form.querySelector('#RecipientName');
    recipientName?.addEventListener('input', () => this.updatePreview());
  }

  toggleRecipientFields() {
    const isGift = this.recipientToggle.checked;
    this.recipientFields?.classList.toggle('hidden', !isGift);

    // Toggle required on email
    const emailField = this.recipientFields?.querySelector('#RecipientEmail');
    if (emailField) {
      emailField.required = isGift;
    }
  }

  updateCharCount() {
    if (this.messageInput && this.charCount) {
      this.charCount.textContent = this.messageInput.value.length;
    }
  }

  updateTotal() {
    const selectedAmount = this.form.querySelector('input[name="id"]:checked');
    const quantity = parseInt(this.quantityInput?.value) || 1;

    if (selectedAmount && selectedAmount.dataset.amount) {
      const price = parseInt(selectedAmount.dataset.amount);
      const total = price * quantity;
      this.totalPrice.textContent = this.formatMoney(total);

      // Update preview amount
      const previewAmount = document.querySelector('[data-preview-amount]');
      if (previewAmount) {
        previewAmount.textContent = this.formatMoney(price);
      }
    }
  }

  adjustQuantity(delta) {
    const current = parseInt(this.quantityInput.value) || 1;
    const min = parseInt(this.quantityInput.min) || 1;
    const max = parseInt(this.quantityInput.max) || 10;
    const newValue = Math.min(Math.max(current + delta, min), max);

    this.quantityInput.value = newValue;
    this.updateTotal();
  }

  updatePreview() {
    const recipientName = this.form.querySelector('#RecipientName')?.value;
    const message = this.messageInput?.value;
    const previewMessage = document.querySelector('[data-preview-message]');
    const previewRecipient = document.querySelector('[data-preview-recipient]');
    const previewText = document.querySelector('[data-preview-text]');

    if (previewMessage && (recipientName || message)) {
      previewMessage.classList.remove('hidden');
      if (previewRecipient) previewRecipient.textContent = recipientName || '';
      if (previewText) previewText.textContent = message || '';
    } else if (previewMessage) {
      previewMessage.classList.add('hidden');
    }
  }

  validateForm(e) {
    if (this.recipientToggle?.checked) {
      const email = this.form.querySelector('#RecipientEmail');
      if (!email?.value || !this.isValidEmail(email.value)) {
        e.preventDefault();
        email?.focus();
        alert('Please enter a valid recipient email address.');
        return false;
      }
    }
    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  formatMoney(cents) {
    return new Intl.NumberFormat(Shopify.locale, {
      style: 'currency',
      currency: Shopify.currency.active
    }).format(cents / 100);
  }
}

// Initialize
document.querySelectorAll('[data-gift-card-form]').forEach(form => {
  new GiftCardForm(form);
});
```

---

## Gift Card Balance Checker

### Balance Checker Section

```liquid
{%- comment -%}
  sections/gift-card-balance.liquid
  Check gift card balance
{%- endcomment -%}

<section class="gift-card-balance section-{{ section.id }}">
  <div class="page-width">
    <div class="gift-card-balance__container">
      <h2 class="gift-card-balance__title">
        {{ section.settings.title | default: 'Check Gift Card Balance' }}
      </h2>

      {%- if section.settings.description != blank -%}
        <p class="gift-card-balance__description">
          {{ section.settings.description }}
        </p>
      {%- endif -%}

      <gift-card-balance-checker class="gift-card-balance__form">
        <form data-balance-form>
          <div class="gift-card-balance__field">
            <label for="GiftCardCode">
              {{ 'gift_card.balance.code_label' | t | default: 'Gift Card Code' }}
            </label>
            <input
              type="text"
              id="GiftCardCode"
              name="gift_card_code"
              placeholder="{{ 'gift_card.balance.code_placeholder' | t | default: 'Enter your gift card code' }}"
              required
              autocomplete="off"
              pattern="[a-zA-Z0-9]{16,}"
              minlength="16"
            >
          </div>

          <button type="submit" class="gift-card-balance__submit button">
            <span class="gift-card-balance__submit-text">
              {{ 'gift_card.balance.check' | t | default: 'Check Balance' }}
            </span>
            <span class="gift-card-balance__submit-loading hidden">
              {% render 'loading-spinner' %}
            </span>
          </button>
        </form>

        <div class="gift-card-balance__result hidden" data-balance-result>
          <div class="gift-card-balance__success hidden" data-balance-success>
            <p class="gift-card-balance__amount-label">
              {{ 'gift_card.balance.current_balance' | t | default: 'Current Balance' }}
            </p>
            <p class="gift-card-balance__amount" data-balance-amount></p>
            <p class="gift-card-balance__expires" data-balance-expires></p>
          </div>

          <div class="gift-card-balance__error hidden" data-balance-error>
            <p>{{ 'gift_card.balance.not_found' | t | default: 'Gift card not found. Please check the code and try again.' }}</p>
          </div>
        </div>
      </gift-card-balance-checker>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Gift Card Balance",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Check Gift Card Balance"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "Enter your gift card code to check the remaining balance."
    }
  ],
  "presets": [
    {
      "name": "Gift Card Balance"
    }
  ]
}
{% endschema %}
```

### Balance Checker JavaScript

```javascript
/**
 * Gift Card Balance Checker
 * Note: Shopify doesn't have a public API for gift card balance.
 * This requires a custom app or middleware.
 */
class GiftCardBalanceChecker extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('[data-balance-form]');
    this.result = this.querySelector('[data-balance-result]');
    this.success = this.querySelector('[data-balance-success]');
    this.error = this.querySelector('[data-balance-error]');
    this.amountEl = this.querySelector('[data-balance-amount]');
    this.expiresEl = this.querySelector('[data-balance-expires]');
  }

  connectedCallback() {
    this.form.addEventListener('submit', (e) => this.checkBalance(e));
  }

  async checkBalance(e) {
    e.preventDefault();

    const code = this.form.querySelector('input[name="gift_card_code"]').value.trim();
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const textEl = submitBtn.querySelector('.gift-card-balance__submit-text');
    const loadingEl = submitBtn.querySelector('.gift-card-balance__submit-loading');

    // Show loading
    submitBtn.disabled = true;
    textEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');

    try {
      // Option 1: Custom app endpoint
      const response = await fetch('/apps/gift-cards/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (response.ok) {
        const data = await response.json();
        this.showSuccess(data);
      } else {
        this.showError();
      }
    } catch (error) {
      console.error('Balance check failed:', error);
      this.showError();
    } finally {
      submitBtn.disabled = false;
      textEl.classList.remove('hidden');
      loadingEl.classList.add('hidden');
    }
  }

  showSuccess(data) {
    this.result.classList.remove('hidden');
    this.success.classList.remove('hidden');
    this.error.classList.add('hidden');

    this.amountEl.textContent = this.formatMoney(data.balance);

    if (data.expires_on) {
      this.expiresEl.textContent = `Expires: ${new Date(data.expires_on).toLocaleDateString()}`;
      this.expiresEl.classList.remove('hidden');
    } else {
      this.expiresEl.classList.add('hidden');
    }
  }

  showError() {
    this.result.classList.remove('hidden');
    this.success.classList.add('hidden');
    this.error.classList.remove('hidden');
  }

  formatMoney(cents) {
    return new Intl.NumberFormat(Shopify.locale, {
      style: 'currency',
      currency: Shopify.currency.active
    }).format(cents / 100);
  }
}

customElements.define('gift-card-balance-checker', GiftCardBalanceChecker);
```

---

## Gift Card Issued Template

```liquid
{%- comment -%}
  templates/gift_card.liquid
  Display page for issued gift cards (after purchase)
{%- endcomment -%}

<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">

  <title>{{ 'gift_card.title' | t }} | {{ shop.name }}</title>

  {{ 'gift-card.css' | asset_url | stylesheet_tag }}

  <script src="{{ 'vendor/qrcode.js' | shopify_asset_url }}" defer></script>
</head>

<body class="gift-card-page">
  <header class="gift-card-page__header">
    {%- if shop.brand.logo -%}
      <img
        src="{{ shop.brand.logo | image_url: width: 200 }}"
        alt="{{ shop.name }}"
        width="200"
        height="auto"
        class="gift-card-page__logo"
      >
    {%- else -%}
      <h1 class="gift-card-page__shop-name">{{ shop.name }}</h1>
    {%- endif -%}
  </header>

  <main class="gift-card-page__main">
    <div class="gift-card-issued">
      {%- comment -%} Card Visual {%- endcomment -%}
      <div class="gift-card-issued__card">
        {%- if gift_card.product.featured_image -%}
          <img
            src="{{ gift_card.product.featured_image | image_url: width: 600 }}"
            alt="{{ gift_card.product.title | escape }}"
            class="gift-card-issued__image"
          >
        {%- endif -%}

        <div class="gift-card-issued__amount">
          {%- if gift_card.balance != gift_card.initial_value -%}
            <span class="gift-card-issued__initial-value">
              {{ gift_card.initial_value | money }}
            </span>
          {%- endif -%}
          <span class="gift-card-issued__balance">
            {{ gift_card.balance | money }}
          </span>
        </div>

        {%- if gift_card.expired -%}
          <div class="gift-card-issued__expired">
            {{ 'gift_card.expired' | t }}
          </div>
        {%- endif -%}
      </div>

      {%- comment -%} Gift Card Code {%- endcomment -%}
      <div class="gift-card-issued__code-section">
        <p class="gift-card-issued__code-label">
          {{ 'gift_card.code' | t }}
        </p>

        <div class="gift-card-issued__code-wrapper">
          <code class="gift-card-issued__code" data-gift-card-code>
            {{ gift_card.code | format_code }}
          </code>
          <button
            type="button"
            class="gift-card-issued__copy"
            onclick="copyCode()"
            aria-label="{{ 'gift_card.copy_code' | t }}"
          >
            {% render 'icon', icon: 'copy' %}
          </button>
        </div>

        <p class="gift-card-issued__copy-success hidden" id="copy-success">
          {{ 'gift_card.copied' | t | default: 'Code copied!' }}
        </p>
      </div>

      {%- comment -%} QR Code {%- endcomment -%}
      <div class="gift-card-issued__qr">
        <div
          id="QRCode"
          class="gift-card-issued__qr-code"
          data-identifier="{{ gift_card.qr_identifier }}"
        ></div>
        <p class="gift-card-issued__qr-hint">
          {{ 'gift_card.scan_to_redeem' | t }}
        </p>
      </div>

      {%- comment -%} Expiration {%- endcomment -%}
      {%- if gift_card.expires_on -%}
        <p class="gift-card-issued__expires">
          {%- if gift_card.expired -%}
            {{ 'gift_card.expired_on' | t: date: gift_card.expires_on | date: format: 'date' }}
          {%- else -%}
            {{ 'gift_card.expires_on' | t: date: gift_card.expires_on | date: format: 'date' }}
          {%- endif -%}
        </p>
      {%- endif -%}

      {%- comment -%} Actions {%- endcomment -%}
      <div class="gift-card-issued__actions">
        <button type="button" class="button" onclick="window.print()">
          {% render 'icon', icon: 'print' %}
          {{ 'gift_card.print' | t }}
        </button>

        {%- if gift_card.pass_url -%}
          <a href="{{ gift_card.pass_url }}" class="button button--secondary">
            {% render 'icon', icon: 'wallet' %}
            {{ 'gift_card.add_to_wallet' | t }}
          </a>
        {%- endif -%}
      </div>

      {%- comment -%} Shop Link {%- endcomment -%}
      <a href="{{ shop.url }}" class="gift-card-issued__shop-link button button--outline">
        {{ 'gift_card.shop_now' | t }}
      </a>
    </div>
  </main>

  <script>
    // Generate QR code
    document.addEventListener('DOMContentLoaded', function() {
      const qrEl = document.getElementById('QRCode');
      if (qrEl && typeof QRCode !== 'undefined') {
        new QRCode(qrEl, {
          text: qrEl.dataset.identifier,
          width: 150,
          height: 150
        });
      }
    });

    // Copy code function
    function copyCode() {
      const code = document.querySelector('[data-gift-card-code]').textContent.trim();
      navigator.clipboard.writeText(code).then(() => {
        const success = document.getElementById('copy-success');
        success.classList.remove('hidden');
        setTimeout(() => success.classList.add('hidden'), 2000);
      });
    }
  </script>
</body>
</html>
```

---

## Gift Card Info Section

```liquid
{%- comment -%}
  sections/gift-card-info.liquid
  Information about gift cards
{%- endcomment -%}

<section class="gift-card-info section-{{ section.id }}">
  <div class="page-width">
    <div class="gift-card-info__grid">
      {%- for block in section.blocks -%}
        <div class="gift-card-info__item" {{ block.shopify_attributes }}>
          {%- if block.settings.icon != 'none' -%}
            <div class="gift-card-info__icon">
              {% render 'icon', icon: block.settings.icon %}
            </div>
          {%- endif -%}

          <h3 class="gift-card-info__title">
            {{ block.settings.title }}
          </h3>

          <p class="gift-card-info__text">
            {{ block.settings.text }}
          </p>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Gift Card Info",
  "settings": [],
  "blocks": [
    {
      "type": "info_item",
      "name": "Info item",
      "settings": [
        {
          "type": "select",
          "id": "icon",
          "label": "Icon",
          "options": [
            { "value": "none", "label": "None" },
            { "value": "email", "label": "Email" },
            { "value": "gift", "label": "Gift" },
            { "value": "clock", "label": "Clock" },
            { "value": "check", "label": "Checkmark" },
            { "value": "store", "label": "Store" }
          ],
          "default": "gift"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title",
          "default": "Instant Delivery"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Text",
          "default": "Gift cards are delivered instantly via email."
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Gift Card Info",
      "blocks": [
        {
          "type": "info_item",
          "settings": {
            "icon": "email",
            "title": "Instant Delivery",
            "text": "Gift cards are delivered instantly via email to the recipient."
          }
        },
        {
          "type": "info_item",
          "settings": {
            "icon": "clock",
            "title": "Never Expires",
            "text": "Our gift cards never expire, so they can be used anytime."
          }
        },
        {
          "type": "info_item",
          "settings": {
            "icon": "store",
            "title": "Use Anywhere",
            "text": "Valid for all products in our online store."
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## CSS Styles

```css
/* Gift Card Product Page */
.gift-card-product__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 768px) {
  .gift-card-product__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.gift-card-product__title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.gift-card-product__description {
  color: var(--color-foreground-muted);
  margin-bottom: 2rem;
}

/* Preview Card */
.gift-card-preview__card {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.gift-card-preview__image {
  width: 100%;
  height: auto;
  display: block;
}

.gift-card-preview__placeholder {
  aspect-ratio: 3/2;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-card-preview__placeholder svg {
  width: 4rem;
  height: 4rem;
  color: var(--color-primary-contrast);
}

.gift-card-preview__overlay {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.gift-card-preview__amount {
  background: var(--color-background);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.gift-card-preview__message {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.gift-card-preview__to {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Amount Selection */
.gift-card-form__amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.gift-card-amount {
  position: relative;
}

.gift-card-amount input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.gift-card-amount__value {
  display: block;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-card-amount input:checked + .gift-card-amount__value {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}

.gift-card-amount input:focus + .gift-card-amount__value {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}

/* Custom Amount */
.gift-card-form__custom-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.gift-card-form__currency {
  font-size: 1.25rem;
  font-weight: 600;
}

.gift-card-form__custom-input input {
  width: 120px;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

/* Recipient Form */
.gift-card-form__recipient {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.gift-card-form__recipient-toggle {
  margin-bottom: 1rem;
}

.gift-card-form__recipient-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gift-card-form__field label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.gift-card-form__field input,
.gift-card-form__field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1rem;
}

.gift-card-form__char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
  margin-top: 0.25rem;
}

.gift-card-form__hint {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-top: 0.25rem;
}

/* Quantity */
.gift-card-form__quantity {
  margin: 1.5rem 0;
}

.gift-card-form__quantity label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

/* Balance Checker */
.gift-card-balance__container {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.gift-card-balance__title {
  margin-bottom: 0.5rem;
}

.gift-card-balance__description {
  color: var(--color-foreground-muted);
  margin-bottom: 2rem;
}

.gift-card-balance__field {
  margin-bottom: 1rem;
  text-align: left;
}

.gift-card-balance__field label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.gift-card-balance__field input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.gift-card-balance__result {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: var(--border-radius);
}

.gift-card-balance__success {
  background: var(--color-success-background);
}

.gift-card-balance__amount-label {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-bottom: 0.25rem;
}

.gift-card-balance__amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-success);
}

.gift-card-balance__expires {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-top: 0.5rem;
}

.gift-card-balance__error {
  background: var(--color-error-background);
  color: var(--color-error);
}

/* Gift Card Issued Page */
.gift-card-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background-alt);
}

.gift-card-page__header {
  padding: 2rem;
  text-align: center;
}

.gift-card-page__logo {
  max-height: 50px;
  width: auto;
}

.gift-card-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.gift-card-issued {
  background: var(--color-background);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.gift-card-issued__card {
  position: relative;
  margin-bottom: 1.5rem;
}

.gift-card-issued__image {
  width: 100%;
  border-radius: var(--border-radius);
}

.gift-card-issued__amount {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.gift-card-issued__balance {
  background: var(--color-background);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 1.5rem;
  font-weight: 700;
}

.gift-card-issued__initial-value {
  display: block;
  text-decoration: line-through;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
}

.gift-card-issued__expired {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  background: var(--color-error);
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 700;
  text-transform: uppercase;
}

.gift-card-issued__code-section {
  margin-bottom: 1.5rem;
}

.gift-card-issued__code-label {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-bottom: 0.5rem;
}

.gift-card-issued__code-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.gift-card-issued__code {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 0.5rem 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.gift-card-issued__copy {
  padding: 0.5rem;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.gift-card-issued__copy-success {
  color: var(--color-success);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.gift-card-issued__qr {
  margin-bottom: 1.5rem;
}

.gift-card-issued__qr-code {
  display: inline-block;
}

.gift-card-issued__qr-hint {
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
  margin-top: 0.5rem;
}

.gift-card-issued__expires {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-bottom: 1.5rem;
}

.gift-card-issued__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.gift-card-issued__shop-link {
  display: block;
}

/* Info Section */
.gift-card-info__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .gift-card-info__grid {
    grid-template-columns: 1fr;
  }
}

.gift-card-info__item {
  text-align: center;
}

.gift-card-info__icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-background);
  border-radius: 50%;
  color: var(--color-primary);
}

.gift-card-info__title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.gift-card-info__text {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

/* Print Styles */
@media print {
  .gift-card-issued__actions {
    display: none;
  }

  .gift-card-issued__shop-link {
    display: none;
  }
}
```

---

## Locales

```json
{
  "gift_card": {
    "title": "Your Gift Card",
    "select_amount": "Select amount",
    "custom_amount": "Custom amount",
    "send_as_gift": "Send as a gift",
    "recipient_email": "Recipient email",
    "recipient_email_placeholder": "Enter recipient's email",
    "recipient_name": "Recipient name",
    "recipient_name_placeholder": "Enter recipient's name",
    "message": "Personal message (optional)",
    "message_placeholder": "Write a personal message...",
    "send_date": "Send on date",
    "send_date_hint": "Leave empty to send immediately",
    "quantity": "Quantity",
    "add_to_cart": "Add to Cart",
    "to": "To",
    "code": "Gift Card Code",
    "copy_code": "Copy code",
    "copied": "Code copied!",
    "scan_to_redeem": "Scan to redeem in store",
    "print": "Print",
    "add_to_wallet": "Add to Apple Wallet",
    "shop_now": "Start Shopping",
    "expired": "Expired",
    "expires_on": "Expires on {{ date }}",
    "expired_on": "Expired on {{ date }}",
    "balance": {
      "code_label": "Gift Card Code",
      "code_placeholder": "Enter your gift card code",
      "check": "Check Balance",
      "current_balance": "Current Balance",
      "not_found": "Gift card not found. Please check the code and try again."
    }
  }
}
```
