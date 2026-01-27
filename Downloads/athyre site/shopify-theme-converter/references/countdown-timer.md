# Countdown Timer Section

Complete guide for implementing countdown timers for sales, launches, and product-specific events.

## Standalone Countdown Section

### Basic Section

```liquid
{% comment %} sections/countdown-timer.liquid {% endcomment %}

{%- style -%}
  #shopify-section-{{ section.id }} {
    --countdown-bg: {{ section.settings.background_color }};
    --countdown-text: {{ section.settings.text_color }};
    --countdown-accent: {{ section.settings.accent_color }};
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<div class="countdown-section color-{{ section.settings.color_scheme }}">
  <div class="container countdown-section__inner">
    {%- if section.settings.heading != blank -%}
      <h2 class="countdown-section__heading">{{ section.settings.heading }}</h2>
    {%- endif -%}

    {%- if section.settings.subheading != blank -%}
      <p class="countdown-section__subheading">{{ section.settings.subheading }}</p>
    {%- endif -%}

    <div
      class="countdown"
      data-countdown
      data-end-date="{{ section.settings.end_date }}"
      data-end-time="{{ section.settings.end_time | default: '23:59' }}"
      data-timezone="{{ section.settings.timezone }}"
      data-expired-action="{{ section.settings.expired_action }}"
      data-expired-message="{{ section.settings.expired_message | escape }}"
    >
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-days>00</span>
        <span class="countdown__label">{{ 'sections.countdown.days' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-hours>00</span>
        <span class="countdown__label">{{ 'sections.countdown.hours' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-minutes>00</span>
        <span class="countdown__label">{{ 'sections.countdown.minutes' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-seconds>00</span>
        <span class="countdown__label">{{ 'sections.countdown.seconds' | t }}</span>
      </div>
    </div>

    {%- if section.settings.button_text != blank -%}
      <a href="{{ section.settings.button_link }}" class="button button--{{ section.settings.button_style }}">
        {{ section.settings.button_text }}
      </a>
    {%- endif -%}
  </div>
</div>

{% schema %}
{
  "name": "Countdown timer",
  "tag": "section",
  "class": "section-countdown",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Sale Ends In"
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading",
      "default": "Don't miss out on these amazing deals!"
    },
    {
      "type": "header",
      "content": "Countdown settings"
    },
    {
      "type": "text",
      "id": "end_date",
      "label": "End date",
      "info": "Format: YYYY-MM-DD (e.g., 2024-12-31)"
    },
    {
      "type": "text",
      "id": "end_time",
      "label": "End time",
      "default": "23:59",
      "info": "Format: HH:MM in 24-hour format"
    },
    {
      "type": "select",
      "id": "timezone",
      "label": "Timezone",
      "default": "America/New_York",
      "options": [
        { "value": "Pacific/Honolulu", "label": "Hawaii (HST)" },
        { "value": "America/Anchorage", "label": "Alaska (AKST)" },
        { "value": "America/Los_Angeles", "label": "Pacific (PST)" },
        { "value": "America/Denver", "label": "Mountain (MST)" },
        { "value": "America/Chicago", "label": "Central (CST)" },
        { "value": "America/New_York", "label": "Eastern (EST)" },
        { "value": "America/Toronto", "label": "Toronto (EST)" },
        { "value": "Europe/London", "label": "London (GMT)" },
        { "value": "Europe/Paris", "label": "Paris (CET)" },
        { "value": "Europe/Berlin", "label": "Berlin (CET)" },
        { "value": "Asia/Dubai", "label": "Dubai (GST)" },
        { "value": "Asia/Singapore", "label": "Singapore (SGT)" },
        { "value": "Asia/Tokyo", "label": "Tokyo (JST)" },
        { "value": "Australia/Sydney", "label": "Sydney (AEDT)" },
        { "value": "UTC", "label": "UTC" }
      ]
    },
    {
      "type": "header",
      "content": "When timer expires"
    },
    {
      "type": "select",
      "id": "expired_action",
      "label": "Action when expired",
      "default": "message",
      "options": [
        { "value": "hide", "label": "Hide entire section" },
        { "value": "message", "label": "Show message" },
        { "value": "zeros", "label": "Show 00:00:00:00" }
      ]
    },
    {
      "type": "text",
      "id": "expired_message",
      "label": "Expired message",
      "default": "This sale has ended"
    },
    {
      "type": "header",
      "content": "Button"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button text",
      "default": "Shop the Sale"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button link"
    },
    {
      "type": "select",
      "id": "button_style",
      "label": "Button style",
      "default": "primary",
      "options": [
        { "value": "primary", "label": "Primary" },
        { "value": "secondary", "label": "Secondary" },
        { "value": "outline", "label": "Outline" }
      ]
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Background color"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text color"
    },
    {
      "type": "color",
      "id": "accent_color",
      "label": "Accent color"
    },
    {
      "type": "header",
      "content": "Spacing"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Top padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 40
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 40
    }
  ],
  "presets": [
    {
      "name": "Countdown timer",
      "settings": {
        "heading": "Flash Sale Ends In",
        "subheading": "Up to 50% off selected items",
        "end_date": "2024-12-31"
      }
    }
  ]
}
{% endschema %}
```

---

## Countdown JavaScript

```javascript
// assets/countdown.js

class CountdownTimer {
  constructor(element) {
    this.element = element;
    this.endDate = element.dataset.endDate;
    this.endTime = element.dataset.endTime || '23:59';
    this.timezone = element.dataset.timezone || 'UTC';
    this.expiredAction = element.dataset.expiredAction || 'message';
    this.expiredMessage = element.dataset.expiredMessage || 'Sale has ended';

    // DOM elements
    this.daysEl = element.querySelector('[data-countdown-days]');
    this.hoursEl = element.querySelector('[data-countdown-hours]');
    this.minutesEl = element.querySelector('[data-countdown-minutes]');
    this.secondsEl = element.querySelector('[data-countdown-seconds]');

    this.interval = null;
    this.targetDate = null;

    this.init();
  }

  init() {
    if (!this.endDate) {
      console.warn('Countdown: No end date specified');
      return;
    }

    this.targetDate = this.parseTargetDate();

    // Initial update
    this.update();

    // Start interval
    this.interval = setInterval(() => this.update(), 1000);
  }

  parseTargetDate() {
    // Create date string with timezone consideration
    const dateTimeString = `${this.endDate}T${this.endTime}:00`;

    // Parse as local time then adjust for timezone
    // For proper timezone support, consider using a library like date-fns-tz
    const targetDate = new Date(dateTimeString);

    return targetDate;
  }

  update() {
    const now = new Date();
    const diff = this.targetDate - now;

    if (diff <= 0) {
      this.handleExpired();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.render(days, hours, minutes, seconds);
  }

  render(days, hours, minutes, seconds) {
    if (this.daysEl) this.daysEl.textContent = this.pad(days);
    if (this.hoursEl) this.hoursEl.textContent = this.pad(hours);
    if (this.minutesEl) this.minutesEl.textContent = this.pad(minutes);
    if (this.secondsEl) this.secondsEl.textContent = this.pad(seconds);
  }

  pad(num) {
    return String(num).padStart(2, '0');
  }

  handleExpired() {
    clearInterval(this.interval);

    switch (this.expiredAction) {
      case 'hide':
        this.hideSection();
        break;
      case 'message':
        this.showMessage();
        break;
      case 'zeros':
        this.render(0, 0, 0, 0);
        break;
    }

    // Dispatch event for other scripts to listen
    this.element.dispatchEvent(new CustomEvent('countdown:expired', {
      bubbles: true,
      detail: { element: this.element }
    }));
  }

  hideSection() {
    const section = this.element.closest('.shopify-section');
    if (section) {
      section.style.display = 'none';
    }
  }

  showMessage() {
    this.element.innerHTML = `
      <div class="countdown__expired">
        <p class="countdown__expired-message">${this.expiredMessage}</p>
      </div>
    `;
    this.element.classList.add('countdown--expired');
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Initialize all countdowns
function initCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(element => {
    if (!element.countdownInstance) {
      element.countdownInstance = new CountdownTimer(element);
    }
  });
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', initCountdowns);

// Re-init on Shopify section events
document.addEventListener('shopify:section:load', initCountdowns);
```

---

## Product-Specific Countdown (Metafield)

### Product Page Integration

```liquid
{% comment %} Use in product page section {% endcomment %}

{%- liquid
  assign sale_end_date = product.metafields.custom.sale_end_date.value
  assign sale_end_time = product.metafields.custom.sale_end_time.value | default: '23:59'
  assign show_countdown = false

  if sale_end_date != blank
    assign sale_end_datetime = sale_end_date | append: 'T' | append: sale_end_time | append: ':00'
    assign sale_end_timestamp = sale_end_datetime | date: '%s'
    assign now_timestamp = 'now' | date: '%s'

    if sale_end_timestamp > now_timestamp
      assign show_countdown = true
    endif
  endif
-%}

{%- if show_countdown -%}
  <div class="product__countdown">
    <p class="product__countdown-label">{{ 'products.product.sale_ends_in' | t }}</p>
    <div
      class="countdown countdown--compact"
      data-countdown
      data-end-date="{{ sale_end_date }}"
      data-end-time="{{ sale_end_time }}"
      data-expired-action="hide"
    >
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-days>00</span>
        <span class="countdown__label">{{ 'sections.countdown.days_short' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-hours>00</span>
        <span class="countdown__label">{{ 'sections.countdown.hours_short' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-minutes>00</span>
        <span class="countdown__label">{{ 'sections.countdown.mins_short' | t }}</span>
      </div>
      <div class="countdown__separator">:</div>
      <div class="countdown__unit">
        <span class="countdown__value" data-countdown-seconds>00</span>
        <span class="countdown__label">{{ 'sections.countdown.secs_short' | t }}</span>
      </div>
    </div>
  </div>
{%- endif -%}
```

### Metafield Setup

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `custom` | `sale_end_date` | `date` | Sale end date |
| `custom` | `sale_end_time` | `single_line_text_field` | Sale end time (HH:MM) |
| `custom` | `launch_date` | `date` | Product launch date |

---

## Countdown Snippet (Reusable)

```liquid
{% comment %} snippets/countdown.liquid {% endcomment %}

{%- comment -%}
  Renders a countdown timer
  Accepts:
  - end_date: Date string YYYY-MM-DD (required)
  - end_time: Time string HH:MM (optional, default: '23:59')
  - timezone: Timezone string (optional, default: 'UTC')
  - expired_action: 'hide', 'message', or 'zeros' (optional, default: 'message')
  - expired_message: String (optional)
  - style: 'default', 'compact', or 'large' (optional, default: 'default')
  - show_labels: Boolean (optional, default: true)
{%- endcomment -%}

{%- liquid
  assign end_time = end_time | default: '23:59'
  assign timezone = timezone | default: 'UTC'
  assign expired_action = expired_action | default: 'message'
  assign expired_message = expired_message | default: 'Sale has ended'
  assign style = style | default: 'default'
  assign show_labels = show_labels | default: true
-%}

<div
  class="countdown countdown--{{ style }}"
  data-countdown
  data-end-date="{{ end_date }}"
  data-end-time="{{ end_time }}"
  data-timezone="{{ timezone }}"
  data-expired-action="{{ expired_action }}"
  data-expired-message="{{ expired_message | escape }}"
>
  <div class="countdown__unit">
    <span class="countdown__value" data-countdown-days>00</span>
    {%- if show_labels -%}
      <span class="countdown__label">
        {%- if style == 'compact' -%}
          {{ 'sections.countdown.days_short' | t }}
        {%- else -%}
          {{ 'sections.countdown.days' | t }}
        {%- endif -%}
      </span>
    {%- endif -%}
  </div>
  <div class="countdown__separator">:</div>
  <div class="countdown__unit">
    <span class="countdown__value" data-countdown-hours>00</span>
    {%- if show_labels -%}
      <span class="countdown__label">
        {%- if style == 'compact' -%}
          {{ 'sections.countdown.hours_short' | t }}
        {%- else -%}
          {{ 'sections.countdown.hours' | t }}
        {%- endif -%}
      </span>
    {%- endif -%}
  </div>
  <div class="countdown__separator">:</div>
  <div class="countdown__unit">
    <span class="countdown__value" data-countdown-minutes>00</span>
    {%- if show_labels -%}
      <span class="countdown__label">
        {%- if style == 'compact' -%}
          {{ 'sections.countdown.mins_short' | t }}
        {%- else -%}
          {{ 'sections.countdown.minutes' | t }}
        {%- endif -%}
      </span>
    {%- endif -%}
  </div>
  <div class="countdown__separator">:</div>
  <div class="countdown__unit">
    <span class="countdown__value" data-countdown-seconds>00</span>
    {%- if show_labels -%}
      <span class="countdown__label">
        {%- if style == 'compact' -%}
          {{ 'sections.countdown.secs_short' | t }}
        {%- else -%}
          {{ 'sections.countdown.seconds' | t }}
        {%- endif -%}
      </span>
    {%- endif -%}
  </div>
</div>
```

### Usage Examples

```liquid
{% comment %} Basic usage {% endcomment %}
{% render 'countdown', end_date: '2024-12-31' %}

{% comment %} Compact style without labels {% endcomment %}
{% render 'countdown',
  end_date: '2024-12-31',
  end_time: '09:00',
  style: 'compact',
  show_labels: false
%}

{% comment %} With custom expired behavior {% endcomment %}
{% render 'countdown',
  end_date: product.metafields.custom.sale_end_date.value,
  expired_action: 'hide'
%}
```

---

## CSS Styles

```css
/* assets/countdown.css */

/* Base countdown styles */
.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.countdown__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.countdown__value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--countdown-accent, var(--color-primary));
}

.countdown__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--countdown-text, var(--color-foreground-muted));
  margin-top: 0.25rem;
}

.countdown__separator {
  font-size: 2rem;
  font-weight: 700;
  color: var(--countdown-text, var(--color-foreground-muted));
  opacity: 0.5;
  align-self: flex-start;
  padding-top: 0.25rem;
}

/* Compact style */
.countdown--compact {
  gap: 0.25rem;
}

.countdown--compact .countdown__unit {
  min-width: auto;
  flex-direction: row;
  gap: 0.125rem;
}

.countdown--compact .countdown__value {
  font-size: 1rem;
  font-weight: 600;
}

.countdown--compact .countdown__label {
  font-size: 0.625rem;
  margin-top: 0;
}

.countdown--compact .countdown__separator {
  font-size: 1rem;
  padding-top: 0;
}

/* Large style */
.countdown--large .countdown__unit {
  min-width: 80px;
}

.countdown--large .countdown__value {
  font-size: 4rem;
}

.countdown--large .countdown__label {
  font-size: 0.875rem;
}

.countdown--large .countdown__separator {
  font-size: 3rem;
}

/* With background boxes */
.countdown--boxed .countdown__unit {
  background-color: var(--countdown-bg, var(--color-background-alt));
  border-radius: var(--border-radius);
  padding: 1rem;
}

.countdown--boxed .countdown__separator {
  background: none;
  padding: 0;
}

/* Expired state */
.countdown--expired {
  text-align: center;
}

.countdown__expired-message {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-foreground-muted);
}

/* Section styles */
.countdown-section {
  background-color: var(--countdown-bg, var(--color-background));
  color: var(--countdown-text, var(--color-foreground));
}

.countdown-section__inner {
  text-align: center;
}

.countdown-section__heading {
  margin-bottom: 0.5rem;
}

.countdown-section__subheading {
  margin-bottom: 1.5rem;
  color: var(--color-foreground-muted);
}

.countdown-section .countdown {
  margin-bottom: 1.5rem;
}

/* Product countdown */
.product__countdown {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-sale-bg, #FFF3E0);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.product__countdown-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-sale-text, #E65100);
  margin: 0;
  white-space: nowrap;
}

.product__countdown .countdown {
  gap: 0.25rem;
}

.product__countdown .countdown__value {
  font-size: 1rem;
  color: var(--color-sale-text, #E65100);
}

.product__countdown .countdown__label {
  font-size: 0.625rem;
  color: var(--color-sale-text, #E65100);
  opacity: 0.8;
}

.product__countdown .countdown__separator {
  font-size: 1rem;
  color: var(--color-sale-text, #E65100);
}

/* Mobile responsive */
@media screen and (max-width: 749px) {
  .countdown__value {
    font-size: 1.75rem;
  }

  .countdown__unit {
    min-width: 45px;
  }

  .countdown__separator {
    font-size: 1.5rem;
  }

  .countdown--large .countdown__value {
    font-size: 2.5rem;
  }

  .countdown--large .countdown__unit {
    min-width: 60px;
  }
}

/* Animation for urgency */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.countdown--urgent .countdown__value {
  animation: pulse 1s ease-in-out infinite;
  color: var(--color-error);
}

/* Add urgent class when time is running low (JS) */
```

### Adding Urgency Animation (JavaScript)

```javascript
// Add to countdown.js update method
update() {
  // ... existing code ...

  // Add urgent class when less than 1 hour remaining
  if (diff < 60 * 60 * 1000) {
    this.element.classList.add('countdown--urgent');
  }
}
```

---

## Locales

```json
{
  "sections": {
    "countdown": {
      "days": "Days",
      "hours": "Hours",
      "minutes": "Minutes",
      "seconds": "Seconds",
      "days_short": "d",
      "hours_short": "h",
      "mins_short": "m",
      "secs_short": "s"
    }
  },
  "products": {
    "product": {
      "sale_ends_in": "Sale ends in:"
    }
  }
}
```

---

## Best Practices

1. **Timezone Handling:**
   - Always specify timezone in settings
   - Consider using UTC for consistency
   - For accuracy, use a timezone library like date-fns-tz

2. **Expired State:**
   - Never leave a countdown at negative values
   - Hide or show a message when expired
   - Consider auto-refreshing the page after expiration

3. **Performance:**
   - Use `setInterval` with 1-second updates
   - Clean up intervals when section is removed
   - Use `requestAnimationFrame` for smoother animations

4. **Accessibility:**
   - Use `aria-live="polite"` for screen readers
   - Provide labels for time units
   - Don't rely solely on color for urgency

5. **SEO:**
   - Countdown content is dynamic; ensure fallback content
   - Use structured data for sale dates if applicable

6. **Mobile:**
   - Use compact style for small screens
   - Ensure touch targets are large enough
   - Test different screen widths
