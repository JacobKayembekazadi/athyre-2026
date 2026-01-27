# Announcement Bar Section

Complete guide for implementing announcement bars in Shopify themes.

## Basic Announcement Bar

### Section File

```liquid
{% comment %} sections/announcement-bar.liquid {% endcomment %}

{%- if section.settings.show_announcement -%}
  <div
    class="announcement-bar color-{{ section.settings.color_scheme }}"
    id="announcement-bar-{{ section.id }}"
    role="region"
    aria-label="{{ 'sections.announcement.announcement' | t }}"
    {{ section.shopify_attributes }}
  >
    <div class="announcement-bar__inner">
      {%- if section.settings.link != blank -%}
        <a href="{{ section.settings.link }}" class="announcement-bar__link">
      {%- endif -%}

      <p class="announcement-bar__message">
        {{ section.settings.text }}
      </p>

      {%- if section.settings.link != blank -%}
        </a>
      {%- endif -%}

      {%- if section.settings.show_dismiss -%}
        <button
          type="button"
          class="announcement-bar__dismiss"
          aria-label="{{ 'sections.announcement.dismiss' | t }}"
          data-dismiss-announcement="{{ section.id }}"
        >
          {% render 'icon-close' %}
        </button>
      {%- endif -%}
    </div>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Announcement bar",
  "tag": "section",
  "class": "section-announcement-bar",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_announcement",
      "label": "Show announcement",
      "default": true
    },
    {
      "type": "inline_richtext",
      "id": "text",
      "label": "Text",
      "default": "Welcome to our store"
    },
    {
      "type": "url",
      "id": "link",
      "label": "Link"
    },
    {
      "type": "checkbox",
      "id": "show_dismiss",
      "label": "Show dismiss button",
      "default": false
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    }
  ],
  "enabled_on": {
    "groups": ["header"]
  }
}
{% endschema %}
```

---

## Multiple Rotating Announcements

### Section with Blocks

```liquid
{% comment %} sections/announcement-bar-rotating.liquid {% endcomment %}

{%- if section.blocks.size > 0 -%}
  <div
    class="announcement-bar announcement-bar--rotating color-{{ section.settings.color_scheme }}"
    id="announcement-bar-{{ section.id }}"
    role="region"
    aria-label="{{ 'sections.announcement.announcement' | t }}"
    data-autoplay="{{ section.settings.autoplay }}"
    data-speed="{{ section.settings.speed }}"
    {{ section.shopify_attributes }}
  >
    <div class="announcement-bar__slider">
      {%- for block in section.blocks -%}
        <div
          class="announcement-bar__slide {% if forloop.first %}is-active{% endif %}"
          data-slide-index="{{ forloop.index0 }}"
          {{ block.shopify_attributes }}
        >
          {%- if block.settings.link != blank -%}
            <a href="{{ block.settings.link }}" class="announcement-bar__link">
          {%- endif -%}

          <p class="announcement-bar__message">
            {%- if block.settings.icon != 'none' -%}
              {% render 'icon', icon: block.settings.icon %}
            {%- endif -%}
            {{ block.settings.text }}
          </p>

          {%- if block.settings.link != blank -%}
            </a>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>

    {%- if section.blocks.size > 1 and section.settings.show_arrows -%}
      <div class="announcement-bar__controls">
        <button type="button" class="announcement-bar__prev" aria-label="{{ 'sections.announcement.previous' | t }}">
          {% render 'icon-chevron-left' %}
        </button>
        <button type="button" class="announcement-bar__next" aria-label="{{ 'sections.announcement.next' | t }}">
          {% render 'icon-chevron-right' %}
        </button>
      </div>
    {%- endif -%}

    {%- if section.settings.show_dismiss -%}
      <button
        type="button"
        class="announcement-bar__dismiss"
        aria-label="{{ 'sections.announcement.dismiss' | t }}"
        data-dismiss-announcement="{{ section.id }}"
      >
        {% render 'icon-close' %}
      </button>
    {%- endif -%}
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Announcement bar",
  "tag": "section",
  "class": "section-announcement-bar",
  "max_blocks": 5,
  "settings": [
    {
      "type": "checkbox",
      "id": "autoplay",
      "label": "Auto-rotate announcements",
      "default": true
    },
    {
      "type": "range",
      "id": "speed",
      "label": "Change slides every",
      "min": 3,
      "max": 10,
      "step": 1,
      "unit": "s",
      "default": 5
    },
    {
      "type": "checkbox",
      "id": "show_arrows",
      "label": "Show navigation arrows",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "show_dismiss",
      "label": "Show dismiss button",
      "default": false
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    }
  ],
  "blocks": [
    {
      "type": "announcement",
      "name": "Announcement",
      "settings": [
        {
          "type": "inline_richtext",
          "id": "text",
          "label": "Text",
          "default": "Welcome to our store"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Link"
        },
        {
          "type": "select",
          "id": "icon",
          "label": "Icon",
          "default": "none",
          "options": [
            { "value": "none", "label": "None" },
            { "value": "shipping", "label": "Shipping" },
            { "value": "gift", "label": "Gift" },
            { "value": "sale", "label": "Sale" },
            { "value": "info", "label": "Info" }
          ]
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Announcement bar",
      "blocks": [
        {
          "type": "announcement",
          "settings": {
            "text": "Free shipping on orders over $50"
          }
        },
        {
          "type": "announcement",
          "settings": {
            "text": "New arrivals just dropped!"
          }
        }
      ]
    }
  ],
  "enabled_on": {
    "groups": ["header"]
  }
}
{% endschema %}
```

---

## Dismissible with localStorage Persistence

### JavaScript for Dismiss Functionality

```javascript
// assets/announcement-bar.js

class AnnouncementBar {
  constructor(container) {
    this.container = container;
    this.sectionId = container.id;
    this.dismissBtn = container.querySelector('[data-dismiss-announcement]');
    this.storageKey = `announcement-dismissed-${this.sectionId}`;

    this.init();
  }

  init() {
    // Check if already dismissed
    if (this.isDismissed()) {
      this.hide();
      return;
    }

    // Bind dismiss button
    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', () => this.dismiss());
    }
  }

  isDismissed() {
    const dismissed = localStorage.getItem(this.storageKey);
    if (!dismissed) return false;

    // Check expiration (optional - dismiss for 24 hours)
    const { timestamp, version } = JSON.parse(dismissed);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Also check version to allow re-showing after content change
    const currentVersion = this.container.dataset.version || '1';

    return (now - timestamp < twentyFourHours) && (version === currentVersion);
  }

  dismiss() {
    const version = this.container.dataset.version || '1';
    localStorage.setItem(this.storageKey, JSON.stringify({
      timestamp: Date.now(),
      version: version
    }));
    this.hide();
  }

  hide() {
    this.container.style.display = 'none';
    document.documentElement.style.setProperty('--announcement-bar-height', '0px');
  }
}

// Initialize all announcement bars
document.querySelectorAll('.announcement-bar').forEach(bar => {
  new AnnouncementBar(bar);
});
```

### Add Version Tracking to Section

```liquid
<div
  class="announcement-bar"
  id="announcement-bar-{{ section.id }}"
  data-version="{{ section.settings.text | md5 | truncate: 8, '' }}"
  ...
>
```

---

## With Countdown Timer Integration

### Section with Optional Countdown

```liquid
{% comment %} sections/announcement-bar-countdown.liquid {% endcomment %}

{%- if section.settings.show_announcement -%}
  <div
    class="announcement-bar color-{{ section.settings.color_scheme }}"
    id="announcement-bar-{{ section.id }}"
    {{ section.shopify_attributes }}
  >
    <div class="announcement-bar__inner">
      <p class="announcement-bar__message">
        {{ section.settings.text }}

        {%- if section.settings.show_countdown and section.settings.end_date != blank -%}
          <span
            class="announcement-bar__countdown"
            data-countdown
            data-end-date="{{ section.settings.end_date }}"
            data-end-time="{{ section.settings.end_time }}"
            data-timezone="{{ section.settings.timezone }}"
          >
            <span data-countdown-days>00</span>d
            <span data-countdown-hours>00</span>h
            <span data-countdown-minutes>00</span>m
            <span data-countdown-seconds>00</span>s
          </span>
        {%- endif -%}
      </p>

      {%- if section.settings.link != blank -%}
        <a href="{{ section.settings.link }}" class="announcement-bar__cta button button--small">
          {{ section.settings.link_text | default: 'Shop Now' }}
        </a>
      {%- endif -%}
    </div>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Announcement bar",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_announcement",
      "label": "Show announcement",
      "default": true
    },
    {
      "type": "inline_richtext",
      "id": "text",
      "label": "Text",
      "default": "Sale ends in"
    },
    {
      "type": "header",
      "content": "Countdown"
    },
    {
      "type": "checkbox",
      "id": "show_countdown",
      "label": "Show countdown timer",
      "default": false
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
      "info": "Format: HH:MM (24-hour, e.g., 23:59)",
      "default": "23:59"
    },
    {
      "type": "select",
      "id": "timezone",
      "label": "Timezone",
      "default": "America/New_York",
      "options": [
        { "value": "America/New_York", "label": "Eastern Time" },
        { "value": "America/Chicago", "label": "Central Time" },
        { "value": "America/Denver", "label": "Mountain Time" },
        { "value": "America/Los_Angeles", "label": "Pacific Time" },
        { "value": "UTC", "label": "UTC" }
      ]
    },
    {
      "type": "header",
      "content": "Button"
    },
    {
      "type": "url",
      "id": "link",
      "label": "Link"
    },
    {
      "type": "text",
      "id": "link_text",
      "label": "Link text",
      "default": "Shop Now"
    },
    {
      "type": "header",
      "content": "Style"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    }
  ],
  "enabled_on": {
    "groups": ["header"]
  }
}
{% endschema %}
```

### Countdown JavaScript

```javascript
// assets/countdown.js

class CountdownTimer {
  constructor(element) {
    this.element = element;
    this.endDate = element.dataset.endDate;
    this.endTime = element.dataset.endTime || '23:59';
    this.timezone = element.dataset.timezone || 'UTC';

    this.daysEl = element.querySelector('[data-countdown-days]');
    this.hoursEl = element.querySelector('[data-countdown-hours]');
    this.minutesEl = element.querySelector('[data-countdown-minutes]');
    this.secondsEl = element.querySelector('[data-countdown-seconds]');

    if (this.endDate) {
      this.targetDate = this.parseDate();
      this.start();
    }
  }

  parseDate() {
    const dateTimeString = `${this.endDate}T${this.endTime}:00`;
    return new Date(dateTimeString);
  }

  start() {
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
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

    this.daysEl.textContent = String(days).padStart(2, '0');
    this.hoursEl.textContent = String(hours).padStart(2, '0');
    this.minutesEl.textContent = String(minutes).padStart(2, '0');
    this.secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  handleExpired() {
    clearInterval(this.interval);
    // Option 1: Hide the announcement
    this.element.closest('.announcement-bar').style.display = 'none';

    // Option 2: Show "Sale Ended" message
    // this.element.innerHTML = '<span>Sale has ended</span>';
  }
}

// Initialize
document.querySelectorAll('[data-countdown]').forEach(el => {
  new CountdownTimer(el);
});
```

---

## Mobile-Responsive Styles

```css
/* assets/announcement-bar.css */

.announcement-bar {
  --announcement-padding: 0.75rem 1rem;
  --announcement-font-size: 0.875rem;

  position: relative;
  padding: var(--announcement-padding);
  text-align: center;
  font-size: var(--announcement-font-size);
  line-height: 1.4;
}

.announcement-bar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: var(--page-width);
  margin: 0 auto;
}

.announcement-bar__message {
  margin: 0;
}

.announcement-bar__link {
  color: inherit;
  text-decoration: none;
}

.announcement-bar__link:hover {
  text-decoration: underline;
}

.announcement-bar__dismiss {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: inherit;
  opacity: 0.7;
}

.announcement-bar__dismiss:hover {
  opacity: 1;
}

/* Rotating styles */
.announcement-bar--rotating .announcement-bar__slider {
  position: relative;
  overflow: hidden;
}

.announcement-bar--rotating .announcement-bar__slide {
  display: none;
}

.announcement-bar--rotating .announcement-bar__slide.is-active {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.announcement-bar__controls {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.announcement-bar__prev,
.announcement-bar__next {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: inherit;
  opacity: 0.7;
}

.announcement-bar__prev:hover,
.announcement-bar__next:hover {
  opacity: 1;
}

/* Countdown styles */
.announcement-bar__countdown {
  display: inline-flex;
  gap: 0.25rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Mobile responsive */
@media screen and (max-width: 749px) {
  .announcement-bar {
    --announcement-padding: 0.5rem 2.5rem;
    --announcement-font-size: 0.75rem;
  }

  .announcement-bar__inner {
    flex-direction: column;
    gap: 0.5rem;
  }

  .announcement-bar__controls {
    display: none;
  }

  .announcement-bar__countdown {
    display: flex;
    justify-content: center;
    margin-left: 0;
    margin-top: 0.25rem;
  }
}

/* When dismiss button is shown, add padding */
.announcement-bar:has(.announcement-bar__dismiss) {
  padding-right: 2.5rem;
}

.announcement-bar:has(.announcement-bar__controls) {
  padding-left: 3rem;
}
```

---

## CSS Variable for Layout Offset

When the announcement bar is sticky or fixed, other elements may need to account for its height:

```liquid
{% comment %} In theme.liquid or header group {% endcomment %}

<style>
  :root {
    --announcement-bar-height: {% if section.settings.show_announcement %}{{ section.settings.height | default: 40 }}px{% else %}0px{% endif %};
  }
</style>
```

```css
/* Use in header or other sticky elements */
.header {
  top: var(--announcement-bar-height, 0);
}

/* Account for total header offset */
.main-content {
  margin-top: calc(var(--announcement-bar-height, 0) + var(--header-height, 60px));
}
```

---

## Locales

```json
{
  "sections": {
    "announcement": {
      "announcement": "Announcement",
      "dismiss": "Dismiss announcement",
      "previous": "Previous announcement",
      "next": "Next announcement"
    }
  }
}
```

---

## Best Practices

1. **Accessibility:** Always include `role="region"` and `aria-label`
2. **Dismissible:** Use localStorage, not cookies, for persistence
3. **Version tracking:** Reset dismiss state when content changes
4. **Mobile:** Keep messages short; stack on mobile if needed
5. **Performance:** Use CSS animations, not JavaScript, for transitions
6. **Countdown:** Always handle the "expired" state gracefully
