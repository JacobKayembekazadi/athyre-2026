# Popup & Modal Patterns

Newsletter signups, exit intent popups, promotional modals, and announcement overlays.

---

## Basic Popup Modal Structure

### Modal Component

```liquid
{%- comment -%}
  sections/popup-modal.liquid
  Newsletter popup with multiple trigger options
{%- endcomment -%}

{%- if section.settings.enable_popup -%}
  <div
    id="PopupModal-{{ section.id }}"
    class="popup-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="PopupTitle-{{ section.id }}"
    aria-hidden="true"
    data-popup-modal
    data-popup-id="{{ section.id }}"
    data-trigger="{{ section.settings.trigger_type }}"
    data-delay="{{ section.settings.delay_seconds | times: 1000 }}"
    data-scroll-percent="{{ section.settings.scroll_percent }}"
    data-show-once="{{ section.settings.show_once }}"
    data-cookie-days="{{ section.settings.cookie_days }}"
  >
    <div class="popup-modal__overlay" data-popup-close></div>

    <div class="popup-modal__container">
      {%- if section.settings.show_close_button -%}
        <button
          type="button"
          class="popup-modal__close"
          data-popup-close
          aria-label="{{ 'general.popup.close' | t }}"
        >
          {% render 'icon', icon: 'close' %}
        </button>
      {%- endif -%}

      <div class="popup-modal__content">
        {%- if section.settings.image != blank -%}
          <div class="popup-modal__image">
            <img
              src="{{ section.settings.image | image_url: width: 600 }}"
              alt="{{ section.settings.image.alt | escape }}"
              width="{{ section.settings.image.width }}"
              height="{{ section.settings.image.height }}"
              loading="lazy"
            >
          </div>
        {%- endif -%}

        <div class="popup-modal__body">
          {%- if section.settings.title != blank -%}
            <h2 id="PopupTitle-{{ section.id }}" class="popup-modal__title">
              {{ section.settings.title }}
            </h2>
          {%- endif -%}

          {%- if section.settings.text != blank -%}
            <div class="popup-modal__text">
              {{ section.settings.text }}
            </div>
          {%- endif -%}

          {%- case section.settings.content_type -%}
            {%- when 'newsletter' -%}
              {% render 'popup-newsletter-form', section: section %}

            {%- when 'discount' -%}
              {% render 'popup-discount-display', section: section %}

            {%- when 'custom' -%}
              <div class="popup-modal__custom">
                {{ section.settings.custom_html }}
              </div>

            {%- when 'age_gate' -%}
              {% render 'popup-age-gate', section: section %}
          {%- endcase -%}

          {%- if section.settings.show_dismiss_link -%}
            <button
              type="button"
              class="popup-modal__dismiss"
              data-popup-close
            >
              {{ section.settings.dismiss_text | default: 'No thanks' }}
            </button>
          {%- endif -%}
        </div>
      </div>
    </div>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Popup Modal",
  "tag": "section",
  "class": "popup-section",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable_popup",
      "label": "Enable popup",
      "default": false
    },
    {
      "type": "header",
      "content": "Trigger Settings"
    },
    {
      "type": "select",
      "id": "trigger_type",
      "label": "Trigger type",
      "options": [
        { "value": "delay", "label": "Time delay" },
        { "value": "scroll", "label": "Scroll percentage" },
        { "value": "exit_intent", "label": "Exit intent" },
        { "value": "manual", "label": "Manual (button click)" }
      ],
      "default": "delay"
    },
    {
      "type": "range",
      "id": "delay_seconds",
      "label": "Delay (seconds)",
      "min": 1,
      "max": 60,
      "step": 1,
      "default": 5,
      "info": "Used when trigger is 'Time delay'"
    },
    {
      "type": "range",
      "id": "scroll_percent",
      "label": "Scroll percentage",
      "min": 10,
      "max": 90,
      "step": 10,
      "default": 50,
      "info": "Used when trigger is 'Scroll percentage'"
    },
    {
      "type": "header",
      "content": "Display Settings"
    },
    {
      "type": "checkbox",
      "id": "show_once",
      "label": "Show only once per visitor",
      "default": true
    },
    {
      "type": "range",
      "id": "cookie_days",
      "label": "Days before showing again",
      "min": 1,
      "max": 90,
      "step": 1,
      "default": 7,
      "info": "After dismissal or submission"
    },
    {
      "type": "checkbox",
      "id": "show_close_button",
      "label": "Show close button",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_dismiss_link",
      "label": "Show dismiss link",
      "default": true
    },
    {
      "type": "text",
      "id": "dismiss_text",
      "label": "Dismiss link text",
      "default": "No thanks"
    },
    {
      "type": "header",
      "content": "Content"
    },
    {
      "type": "select",
      "id": "content_type",
      "label": "Content type",
      "options": [
        { "value": "newsletter", "label": "Newsletter signup" },
        { "value": "discount", "label": "Discount code" },
        { "value": "custom", "label": "Custom HTML" },
        { "value": "age_gate", "label": "Age verification" }
      ],
      "default": "newsletter"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Image"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Join our newsletter"
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Text",
      "default": "<p>Subscribe for exclusive offers and updates.</p>"
    },
    {
      "type": "header",
      "content": "Newsletter Settings"
    },
    {
      "type": "text",
      "id": "newsletter_placeholder",
      "label": "Email placeholder",
      "default": "Enter your email"
    },
    {
      "type": "text",
      "id": "newsletter_button_text",
      "label": "Button text",
      "default": "Subscribe"
    },
    {
      "type": "text",
      "id": "newsletter_success_message",
      "label": "Success message",
      "default": "Thanks for subscribing!"
    },
    {
      "type": "header",
      "content": "Discount Settings"
    },
    {
      "type": "text",
      "id": "discount_code",
      "label": "Discount code",
      "default": "WELCOME10"
    },
    {
      "type": "text",
      "id": "discount_description",
      "label": "Discount description",
      "default": "Use this code at checkout for 10% off"
    },
    {
      "type": "header",
      "content": "Custom Content"
    },
    {
      "type": "html",
      "id": "custom_html",
      "label": "Custom HTML"
    },
    {
      "type": "header",
      "content": "Age Gate Settings"
    },
    {
      "type": "text",
      "id": "age_minimum",
      "label": "Minimum age",
      "default": "21"
    },
    {
      "type": "text",
      "id": "age_confirm_text",
      "label": "Confirm button text",
      "default": "Yes, I am 21+"
    },
    {
      "type": "text",
      "id": "age_deny_text",
      "label": "Deny button text",
      "default": "No, I am not"
    },
    {
      "type": "url",
      "id": "age_deny_redirect",
      "label": "Deny redirect URL"
    }
  ],
  "presets": [
    {
      "name": "Popup Modal"
    }
  ]
}
{% endschema %}
```

---

## Newsletter Form Snippet

```liquid
{%- comment -%}
  snippets/popup-newsletter-form.liquid
  Newsletter signup form for popup
{%- endcomment -%}

<div class="popup-newsletter" data-popup-newsletter>
  {%- form 'customer', class: 'popup-newsletter__form', data-popup-form: '' -%}
    <input type="hidden" name="contact[tags]" value="newsletter,popup">

    <div class="popup-newsletter__field">
      <label for="PopupEmail-{{ section.id }}" class="visually-hidden">
        {{ 'general.newsletter.email_label' | t }}
      </label>
      <input
        type="email"
        name="contact[email]"
        id="PopupEmail-{{ section.id }}"
        class="popup-newsletter__input"
        placeholder="{{ section.settings.newsletter_placeholder }}"
        required
        autocomplete="email"
        autocapitalize="off"
        autocorrect="off"
      >
      <button type="submit" class="popup-newsletter__button button">
        {{ section.settings.newsletter_button_text }}
      </button>
    </div>

    {%- if form.errors -%}
      <div class="popup-newsletter__error" role="alert">
        {{ form.errors.translated_fields['email'] | capitalize }}
        {{ form.errors.messages['email'] }}
      </div>
    {%- endif -%}

    {%- if form.posted_successfully? -%}
      <div class="popup-newsletter__success" role="status" data-popup-success>
        {{ section.settings.newsletter_success_message }}
      </div>
    {%- endif -%}
  {%- endform -%}
</div>
```

---

## Discount Display Snippet

```liquid
{%- comment -%}
  snippets/popup-discount-display.liquid
  Discount code display with copy functionality
{%- endcomment -%}

<div class="popup-discount" data-popup-discount>
  <p class="popup-discount__description">
    {{ section.settings.discount_description }}
  </p>

  <div class="popup-discount__code-wrapper">
    <code class="popup-discount__code" data-discount-code>
      {{ section.settings.discount_code }}
    </code>
    <button
      type="button"
      class="popup-discount__copy"
      data-copy-discount
      aria-label="{{ 'general.popup.copy_code' | t }}"
    >
      <span class="popup-discount__copy-text" data-copy-text>
        {{ 'general.popup.copy' | t | default: 'Copy' }}
      </span>
      <span class="popup-discount__copied-text hidden" data-copied-text>
        {{ 'general.popup.copied' | t | default: 'Copied!' }}
      </span>
    </button>
  </div>

  <a
    href="/collections/all"
    class="popup-discount__cta button"
    data-popup-close
  >
    {{ 'general.popup.shop_now' | t | default: 'Shop Now' }}
  </a>
</div>
```

---

## Age Gate Snippet

```liquid
{%- comment -%}
  snippets/popup-age-gate.liquid
  Age verification gate
{%- endcomment -%}

<div class="popup-age-gate" data-age-gate>
  <p class="popup-age-gate__question">
    {{ 'general.popup.age_question' | t: age: section.settings.age_minimum }}
  </p>

  <div class="popup-age-gate__buttons">
    <button
      type="button"
      class="popup-age-gate__confirm button"
      data-age-confirm
    >
      {{ section.settings.age_confirm_text }}
    </button>

    <button
      type="button"
      class="popup-age-gate__deny button button--secondary"
      data-age-deny
      {%- if section.settings.age_deny_redirect != blank -%}
        data-deny-redirect="{{ section.settings.age_deny_redirect }}"
      {%- endif -%}
    >
      {{ section.settings.age_deny_text }}
    </button>
  </div>

  <p class="popup-age-gate__disclaimer">
    {{ 'general.popup.age_disclaimer' | t }}
  </p>
</div>
```

---

## JavaScript Controller

```javascript
/**
 * Popup Modal Controller
 * Handles all popup trigger types and interactions
 */

class PopupModal extends HTMLElement {
  constructor() {
    super();
    this.popupId = this.dataset.popupId;
    this.trigger = this.dataset.trigger;
    this.delay = parseInt(this.dataset.delay) || 5000;
    this.scrollPercent = parseInt(this.dataset.scrollPercent) || 50;
    this.showOnce = this.dataset.showOnce === 'true';
    this.cookieDays = parseInt(this.dataset.cookieDays) || 7;

    this.overlay = this.querySelector('[data-popup-close]');
    this.closeButtons = this.querySelectorAll('[data-popup-close]');
    this.form = this.querySelector('[data-popup-form]');
    this.discountCopy = this.querySelector('[data-copy-discount]');
    this.ageConfirm = this.querySelector('[data-age-confirm]');
    this.ageDeny = this.querySelector('[data-age-deny]');

    this.cookieName = `popup_${this.popupId}_dismissed`;
    this.hasTriggered = false;
  }

  connectedCallback() {
    // Check if should show
    if (this.shouldShow()) {
      this.initTrigger();
    }

    this.bindEvents();
  }

  shouldShow() {
    // Check cookie
    if (this.showOnce && this.getCookie(this.cookieName)) {
      return false;
    }

    // Check sessionStorage for this session
    if (sessionStorage.getItem(this.cookieName)) {
      return false;
    }

    return true;
  }

  initTrigger() {
    switch (this.trigger) {
      case 'delay':
        setTimeout(() => this.open(), this.delay);
        break;

      case 'scroll':
        this.initScrollTrigger();
        break;

      case 'exit_intent':
        this.initExitIntent();
        break;

      case 'manual':
        // Triggered by external button
        break;
    }
  }

  initScrollTrigger() {
    const checkScroll = () => {
      if (this.hasTriggered) return;

      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrolled / docHeight) * 100;

      if (scrollPercent >= this.scrollPercent) {
        this.hasTriggered = true;
        this.open();
        window.removeEventListener('scroll', checkScroll);
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  initExitIntent() {
    const handleMouseLeave = (e) => {
      if (this.hasTriggered) return;

      // Detect mouse leaving through top of viewport
      if (e.clientY <= 0) {
        this.hasTriggered = true;
        this.open();
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Only on desktop
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mouseleave', handleMouseLeave);
    } else {
      // Mobile fallback: use scroll up detection
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        if (this.hasTriggered) return;

        const currentScrollY = window.scrollY;
        const isScrollingUp = currentScrollY < lastScrollY;
        const isNearTop = currentScrollY < 100;

        if (isScrollingUp && isNearTop && lastScrollY > 200) {
          this.hasTriggered = true;
          this.open();
          window.removeEventListener('scroll', handleScroll);
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  bindEvents() {
    // Close buttons
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Discount copy
    if (this.discountCopy) {
      this.discountCopy.addEventListener('click', () => this.copyDiscount());
    }

    // Age gate
    if (this.ageConfirm) {
      this.ageConfirm.addEventListener('click', () => this.confirmAge());
    }

    if (this.ageDeny) {
      this.ageDeny.addEventListener('click', () => this.denyAge());
    }

    // Listen for manual trigger
    document.addEventListener('popup:open', (e) => {
      if (e.detail.id === this.popupId) {
        this.open();
      }
    });
  }

  open() {
    this.setAttribute('aria-hidden', 'false');
    this.classList.add('is-open');
    document.body.classList.add('popup-open');

    // Focus management
    this.previousFocus = document.activeElement;
    const firstFocusable = this.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Trap focus
    this.trapFocus();
  }

  close() {
    this.setAttribute('aria-hidden', 'true');
    this.classList.remove('is-open');
    document.body.classList.remove('popup-open');

    // Set cookie/session to prevent re-showing
    if (this.showOnce) {
      this.setCookie(this.cookieName, 'true', this.cookieDays);
    }
    sessionStorage.setItem(this.cookieName, 'true');

    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  isOpen() {
    return this.classList.contains('is-open');
  }

  trapFocus() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Show success message
        const successEl = this.querySelector('[data-popup-success]');
        if (successEl) {
          form.style.display = 'none';
          successEl.classList.remove('hidden');
        }

        // Set cookie for longer period on success
        this.setCookie(this.cookieName, 'subscribed', 365);

        // Auto-close after delay
        setTimeout(() => this.close(), 3000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Show error state
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
    }
  }

  copyDiscount() {
    const codeEl = this.querySelector('[data-discount-code]');
    const code = codeEl.textContent.trim();

    navigator.clipboard.writeText(code).then(() => {
      const copyText = this.querySelector('[data-copy-text]');
      const copiedText = this.querySelector('[data-copied-text]');

      copyText.classList.add('hidden');
      copiedText.classList.remove('hidden');

      setTimeout(() => {
        copyText.classList.remove('hidden');
        copiedText.classList.add('hidden');
      }, 2000);
    });
  }

  confirmAge() {
    this.setCookie('age_verified', 'true', 365);
    this.close();
  }

  denyAge() {
    const redirectUrl = this.ageDeny.dataset.denyRedirect;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = 'https://www.google.com';
    }
  }

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }
}

customElements.define('popup-modal', PopupModal);

/**
 * Helper to trigger popup from anywhere
 */
function openPopup(popupId) {
  document.dispatchEvent(new CustomEvent('popup:open', {
    detail: { id: popupId }
  }));
}
```

---

## Manual Trigger Button

```liquid
{%- comment -%}
  snippets/popup-trigger-button.liquid
  Button to manually trigger a popup

  Usage:
  {% render 'popup-trigger-button', popup_id: section.id, text: 'Get Discount' %}
{%- endcomment -%}

<button
  type="button"
  class="popup-trigger-button button"
  onclick="openPopup('{{ popup_id }}')"
>
  {{ text | default: 'Open Popup' }}
</button>
```

---

## Exit Intent Popup (Standalone)

```liquid
{%- comment -%}
  sections/exit-intent-popup.liquid
  Standalone exit intent popup for cart abandonment
{%- endcomment -%}

{%- if section.settings.enable and cart.item_count > 0 -%}
  <popup-modal
    id="ExitIntent-{{ section.id }}"
    class="popup-modal popup-modal--exit-intent"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ExitIntentTitle-{{ section.id }}"
    aria-hidden="true"
    data-popup-modal
    data-popup-id="exit-intent-{{ section.id }}"
    data-trigger="exit_intent"
    data-show-once="true"
    data-cookie-days="{{ section.settings.cookie_days }}"
  >
    <div class="popup-modal__overlay" data-popup-close></div>

    <div class="popup-modal__container">
      <button
        type="button"
        class="popup-modal__close"
        data-popup-close
        aria-label="{{ 'general.popup.close' | t }}"
      >
        {% render 'icon', icon: 'close' %}
      </button>

      <div class="popup-modal__content">
        <h2 id="ExitIntentTitle-{{ section.id }}" class="popup-modal__title">
          {{ section.settings.title }}
        </h2>

        <p class="popup-modal__text">
          {{ section.settings.text }}
        </p>

        {%- if section.settings.show_cart_preview -%}
          <div class="exit-intent__cart-preview">
            {%- for item in cart.items limit: 3 -%}
              <img
                src="{{ item.image | image_url: width: 60 }}"
                alt="{{ item.title | escape }}"
                width="60"
                height="60"
                loading="lazy"
              >
            {%- endfor -%}
            {%- if cart.item_count > 3 -%}
              <span class="exit-intent__more">+{{ cart.item_count | minus: 3 }}</span>
            {%- endif -%}
          </div>
        {%- endif -%}

        <div class="exit-intent__actions">
          <a href="/cart" class="button" data-popup-close>
            {{ section.settings.cta_text }}
          </a>

          <button
            type="button"
            class="popup-modal__dismiss"
            data-popup-close
          >
            {{ section.settings.dismiss_text }}
          </button>
        </div>
      </div>
    </div>
  </popup-modal>
{%- endif -%}

{% schema %}
{
  "name": "Exit Intent Popup",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable",
      "label": "Enable exit intent popup",
      "default": false,
      "info": "Shows when visitor is about to leave with items in cart"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Wait! Don't forget your items"
    },
    {
      "type": "textarea",
      "id": "text",
      "label": "Text",
      "default": "Complete your purchase now and get free shipping!"
    },
    {
      "type": "checkbox",
      "id": "show_cart_preview",
      "label": "Show cart item preview",
      "default": true
    },
    {
      "type": "text",
      "id": "cta_text",
      "label": "CTA button text",
      "default": "Complete Purchase"
    },
    {
      "type": "text",
      "id": "dismiss_text",
      "label": "Dismiss text",
      "default": "No thanks, I'll come back later"
    },
    {
      "type": "range",
      "id": "cookie_days",
      "label": "Days before showing again",
      "min": 1,
      "max": 30,
      "step": 1,
      "default": 1
    }
  ],
  "presets": [
    {
      "name": "Exit Intent Popup"
    }
  ]
}
{% endschema %}
```

---

## CSS Styles

```css
/* Popup Modal Base */
.popup-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.popup-modal.is-open {
  opacity: 1;
  visibility: visible;
}

.popup-modal[aria-hidden="true"] {
  pointer-events: none;
}

/* Overlay */
.popup-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

/* Container */
.popup-modal__container {
  position: relative;
  background: var(--color-background);
  border-radius: var(--border-radius-lg, 1rem);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(0.95) translateY(20px);
  transition: transform 0.3s ease;
}

.popup-modal.is-open .popup-modal__container {
  transform: scale(1) translateY(0);
}

/* Close Button */
.popup-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.popup-modal__close:hover {
  background: var(--color-background-alt);
}

.popup-modal__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Content Layout */
.popup-modal__content {
  display: flex;
  flex-direction: column;
}

/* With Image Layout */
.popup-modal__image {
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: var(--border-radius-lg, 1rem) var(--border-radius-lg, 1rem) 0 0;
}

.popup-modal__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-modal__body {
  padding: 2rem;
}

/* Typography */
.popup-modal__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

.popup-modal__text {
  color: var(--color-foreground-muted);
  margin-bottom: 1.5rem;
}

.popup-modal__text p {
  margin: 0;
}

/* Dismiss Link */
.popup-modal__dismiss {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.popup-modal__dismiss:hover {
  color: var(--color-foreground);
}

/* Newsletter Form */
.popup-newsletter__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popup-newsletter__field {
  display: flex;
  gap: 0.5rem;
}

.popup-newsletter__input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.popup-newsletter__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.popup-newsletter__button {
  flex-shrink: 0;
}

.popup-newsletter__error {
  color: var(--color-error);
  font-size: 0.875rem;
}

.popup-newsletter__success {
  padding: 1rem;
  background: var(--color-success-background);
  color: var(--color-success);
  border-radius: var(--border-radius);
  text-align: center;
}

/* Discount Display */
.popup-discount {
  text-align: center;
}

.popup-discount__description {
  margin-bottom: 1rem;
  color: var(--color-foreground-muted);
}

.popup-discount__code-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.popup-discount__code {
  padding: 0.75rem 1.5rem;
  background: var(--color-background-alt);
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.popup-discount__copy {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.popup-discount__copy:hover {
  opacity: 0.9;
}

/* Age Gate */
.popup-age-gate {
  text-align: center;
}

.popup-age-gate__question {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.popup-age-gate__buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.popup-age-gate__disclaimer {
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
}

/* Exit Intent Specific */
.popup-modal--exit-intent .popup-modal__container {
  max-width: 450px;
}

.exit-intent__cart-preview {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.exit-intent__cart-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.exit-intent__more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

.exit-intent__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Body scroll lock */
body.popup-open {
  overflow: hidden;
}

/* Mobile Adjustments */
@media (max-width: 640px) {
  .popup-modal {
    padding: 0;
    align-items: flex-end;
  }

  .popup-modal__container {
    max-width: 100%;
    max-height: 85vh;
    border-radius: var(--border-radius-lg, 1rem) var(--border-radius-lg, 1rem) 0 0;
  }

  .popup-modal__image {
    border-radius: var(--border-radius-lg, 1rem) var(--border-radius-lg, 1rem) 0 0;
  }

  .popup-newsletter__field {
    flex-direction: column;
  }

  .popup-age-gate__buttons {
    flex-direction: column;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .popup-modal,
  .popup-modal__container {
    transition: none;
  }
}

/* Utility */
.hidden {
  display: none !important;
}
```

---

## Locales

```json
{
  "general": {
    "newsletter": {
      "email_label": "Email address",
      "subscribe": "Subscribe",
      "success": "Thanks for subscribing!",
      "error": "Please enter a valid email address"
    },
    "popup": {
      "close": "Close popup",
      "copy": "Copy",
      "copied": "Copied!",
      "copy_code": "Copy discount code",
      "shop_now": "Shop Now",
      "age_question": "Are you {{ age }} years or older?",
      "age_disclaimer": "By entering this site, you confirm you are of legal age."
    }
  }
}
```

---

## Integration Tips

### Conditional Loading

```liquid
{%- comment -%}
  Only load popup on first visit or specific pages
{%- endcomment -%}

{%- unless request.page_type == 'cart' or request.page_type == 'checkout' -%}
  {% section 'popup-modal' %}
{%- endunless -%}
```

### A/B Testing Integration

```liquid
{%- comment -%}
  Support for A/B testing different popup variants
{%- endcomment -%}

{%- assign popup_variant = 'a' -%}
{%- if customer.tags contains 'popup-b' -%}
  {%- assign popup_variant = 'b' -%}
{%- endif -%}

{%- case popup_variant -%}
  {%- when 'a' -%}
    {% section 'popup-modal-a' %}
  {%- when 'b' -%}
    {% section 'popup-modal-b' %}
{%- endcase -%}
```

### Analytics Events

```javascript
// Track popup interactions
document.addEventListener('popup:open', (e) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'popup_view',
      popup_id: e.detail.id
    });
  }
});

document.querySelectorAll('[data-popup-form]').forEach(form => {
  form.addEventListener('submit', () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'popup_submit',
        popup_type: 'newsletter'
      });
    }
  });
});
```
