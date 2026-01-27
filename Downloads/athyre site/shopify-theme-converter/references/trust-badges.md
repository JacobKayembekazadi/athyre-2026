# Trust Badges Section

Complete guide for implementing trust badges, payment icons, and security seals in Shopify themes.

## Payment Icons (Dynamic)

### Using Shop Enabled Payment Types

```liquid
{% comment %} snippets/payment-icons.liquid {% endcomment %}

{%- comment -%}
  Renders payment icons based on shop's enabled payment methods
  Accepts:
  - class: Additional CSS classes (optional)
  - show_label: Show "We Accept" label (optional, default: false)
{%- endcomment -%}

{%- liquid
  assign show_label = show_label | default: false
-%}

{%- if shop.enabled_payment_types.size > 0 -%}
  <div class="payment-icons {{ class }}">
    {%- if show_label -%}
      <span class="payment-icons__label">{{ 'sections.footer.payment_methods' | t }}</span>
    {%- endif -%}
    <ul class="payment-icons__list" role="list">
      {%- for type in shop.enabled_payment_types -%}
        <li class="payment-icons__item">
          {{ type | payment_type_svg_tag: class: 'payment-icon' }}
        </li>
      {%- endfor -%}
    </ul>
  </div>
{%- endif -%}
```

### CSS for Payment Icons

```css
/* assets/payment-icons.css */

.payment-icons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.payment-icons__label {
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
  margin-right: 0.5rem;
}

.payment-icons__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.payment-icons__item {
  display: flex;
}

.payment-icon {
  height: 24px;
  width: auto;
}

/* Larger variant */
.payment-icons--large .payment-icon {
  height: 32px;
}

/* Dark background variant */
.payment-icons--dark .payment-icon {
  filter: brightness(0) invert(1);
}
```

---

## Trust Badges Section

### Full Section with Blocks

```liquid
{% comment %} sections/trust-badges.liquid {% endcomment %}

{%- style -%}
  #shopify-section-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<div class="trust-badges color-{{ section.settings.color_scheme }}">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <h2 class="trust-badges__heading visually-hidden">{{ section.settings.heading }}</h2>
    {%- endif -%}

    <div class="trust-badges__grid trust-badges__grid--{{ section.settings.layout }}">
      {%- for block in section.blocks -%}
        <div class="trust-badge" {{ block.shopify_attributes }}>
          {%- case block.type -%}
            {%- when 'icon_badge' -%}
              <div class="trust-badge__icon">
                {%- if block.settings.custom_icon != blank -%}
                  {{ block.settings.custom_icon | image_url: width: 64 | image_tag }}
                {%- else -%}
                  {% render 'icon', icon: block.settings.icon %}
                {%- endif -%}
              </div>
              {%- if block.settings.title != blank -%}
                <h3 class="trust-badge__title">{{ block.settings.title }}</h3>
              {%- endif -%}
              {%- if block.settings.text != blank -%}
                <p class="trust-badge__text">{{ block.settings.text }}</p>
              {%- endif -%}

            {%- when 'image_badge' -%}
              <div class="trust-badge__image">
                {%- if block.settings.image != blank -%}
                  {{ block.settings.image | image_url: width: 200 | image_tag: loading: 'lazy' }}
                {%- else -%}
                  {{ 'image' | placeholder_svg_tag: 'placeholder-svg' }}
                {%- endif -%}
              </div>
              {%- if block.settings.title != blank -%}
                <h3 class="trust-badge__title">{{ block.settings.title }}</h3>
              {%- endif -%}

            {%- when 'payment_icons' -%}
              <div class="trust-badge__payment">
                {% render 'payment-icons', show_label: block.settings.show_label %}
              </div>
              {%- if block.settings.secure_text != blank -%}
                <p class="trust-badge__secure">
                  {% render 'icon-lock' %}
                  {{ block.settings.secure_text }}
                </p>
              {%- endif -%}

          {%- endcase -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Trust badges",
  "tag": "section",
  "class": "section-trust-badges",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading (screen reader)",
      "default": "Why shop with us"
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Layout",
      "default": "row",
      "options": [
        { "value": "row", "label": "Horizontal row" },
        { "value": "grid", "label": "Grid" },
        { "value": "stacked", "label": "Stacked" }
      ]
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Top padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 20
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 20
    }
  ],
  "blocks": [
    {
      "type": "icon_badge",
      "name": "Icon badge",
      "settings": [
        {
          "type": "select",
          "id": "icon",
          "label": "Icon",
          "default": "shipping",
          "options": [
            { "value": "shipping", "label": "Shipping truck" },
            { "value": "return", "label": "Return arrow" },
            { "value": "secure", "label": "Lock/Shield" },
            { "value": "support", "label": "Customer support" },
            { "value": "guarantee", "label": "Guarantee badge" },
            { "value": "quality", "label": "Quality check" },
            { "value": "gift", "label": "Gift" },
            { "value": "clock", "label": "Clock" },
            { "value": "star", "label": "Star" },
            { "value": "heart", "label": "Heart" }
          ]
        },
        {
          "type": "image_picker",
          "id": "custom_icon",
          "label": "Custom icon",
          "info": "Overrides selected icon if set"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title",
          "default": "Free Shipping"
        },
        {
          "type": "text",
          "id": "text",
          "label": "Description",
          "default": "On orders over $50"
        }
      ]
    },
    {
      "type": "image_badge",
      "name": "Image badge",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Badge image",
          "info": "Recommended: 100x100px or larger"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Link"
        }
      ]
    },
    {
      "type": "payment_icons",
      "name": "Payment methods",
      "limit": 1,
      "settings": [
        {
          "type": "checkbox",
          "id": "show_label",
          "label": "Show 'We Accept' label",
          "default": true
        },
        {
          "type": "text",
          "id": "secure_text",
          "label": "Secure payment text",
          "default": "Secure checkout"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Trust badges",
      "blocks": [
        {
          "type": "icon_badge",
          "settings": {
            "icon": "shipping",
            "title": "Free Shipping",
            "text": "On orders over $50"
          }
        },
        {
          "type": "icon_badge",
          "settings": {
            "icon": "return",
            "title": "Easy Returns",
            "text": "30-day return policy"
          }
        },
        {
          "type": "icon_badge",
          "settings": {
            "icon": "secure",
            "title": "Secure Payment",
            "text": "SSL encrypted checkout"
          }
        },
        {
          "type": "icon_badge",
          "settings": {
            "icon": "support",
            "title": "24/7 Support",
            "text": "Contact us anytime"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## Icon Snippet

```liquid
{% comment %} snippets/icon.liquid {% endcomment %}

{%- comment -%}
  Renders an icon by name
  Accepts:
  - icon: Icon name (required)
  - size: Icon size in pixels (optional, default: 24)
  - class: Additional CSS classes (optional)
{%- endcomment -%}

{%- liquid
  assign size = size | default: 24
-%}

{%- case icon -%}
  {%- when 'shipping' -%}
    <svg class="icon icon-shipping {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>

  {%- when 'return' -%}
    <svg class="icon icon-return {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>

  {%- when 'secure', 'lock' -%}
    <svg class="icon icon-secure {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>

  {%- when 'shield' -%}
    <svg class="icon icon-shield {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <polyline points="9 12 11 14 15 10"></polyline>
    </svg>

  {%- when 'support' -%}
    <svg class="icon icon-support {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.479m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"></path>
    </svg>

  {%- when 'guarantee' -%}
    <svg class="icon icon-guarantee {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m9 12 2 2 4-4"></path>
    </svg>

  {%- when 'quality' -%}
    <svg class="icon icon-quality {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>

  {%- when 'gift' -%}
    <svg class="icon icon-gift {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>

  {%- when 'clock' -%}
    <svg class="icon icon-clock {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>

  {%- when 'star' -%}
    <svg class="icon icon-star {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>

  {%- when 'heart' -%}
    <svg class="icon icon-heart {{ class }}" width="{{ size }}" height="{{ size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>

{%- endcase -%}
```

---

## Product Page Trust Badges

### Compact Badge Strip for PDP

```liquid
{% comment %} snippets/product-trust-badges.liquid {% endcomment %}

<div class="product-trust-badges">
  <div class="product-trust-badge">
    {% render 'icon', icon: 'shipping', size: 20 %}
    <span>{{ 'products.product.free_shipping_badge' | t }}</span>
  </div>
  <div class="product-trust-badge">
    {% render 'icon', icon: 'return', size: 20 %}
    <span>{{ 'products.product.returns_badge' | t }}</span>
  </div>
  <div class="product-trust-badge">
    {% render 'icon', icon: 'secure', size: 20 %}
    <span>{{ 'products.product.secure_badge' | t }}</span>
  </div>
</div>
```

### CSS for Product Trust Badges

```css
.product-trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.product-trust-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-foreground-muted);
}

.product-trust-badge svg {
  flex-shrink: 0;
  color: var(--color-primary);
}

@media screen and (max-width: 749px) {
  .product-trust-badges {
    flex-direction: column;
    gap: 0.75rem;
  }
}
```

---

## CSS for Trust Badges Section

```css
/* assets/trust-badges.css */

.trust-badges {
  background-color: var(--color-background);
}

.trust-badges__heading {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Row layout */
.trust-badges__grid--row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.trust-badges__grid--row .trust-badge {
  flex: 0 1 auto;
  text-align: center;
}

/* Grid layout */
.trust-badges__grid--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* Stacked layout */
.trust-badges__grid--stacked {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.trust-badges__grid--stacked .trust-badge {
  flex-direction: row;
  text-align: left;
}

/* Individual badge */
.trust-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.trust-badge__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--color-primary);
}

.trust-badge__icon svg {
  width: 32px;
  height: 32px;
}

.trust-badge__icon img {
  max-width: 100%;
  height: auto;
}

.trust-badge__image {
  max-width: 100px;
}

.trust-badge__image img {
  max-width: 100%;
  height: auto;
}

.trust-badge__title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
}

.trust-badge__text {
  font-size: 0.8125rem;
  color: var(--color-foreground-muted);
  margin: 0;
}

.trust-badge__payment {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.trust-badge__secure {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-foreground-muted);
  margin: 0;
}

.trust-badge__secure svg {
  width: 14px;
  height: 14px;
}

/* With background */
.trust-badges--with-bg .trust-badge {
  background-color: var(--color-background-alt);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}

/* Bordered variant */
.trust-badges--bordered .trust-badge {
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}

/* Mobile responsive */
@media screen and (max-width: 749px) {
  .trust-badges__grid--row {
    gap: 1rem;
  }

  .trust-badge__icon {
    width: 40px;
    height: 40px;
  }

  .trust-badge__icon svg {
    width: 24px;
    height: 24px;
  }

  .trust-badge__title {
    font-size: 0.875rem;
  }

  .trust-badge__text {
    font-size: 0.75rem;
  }
}
```

---

## Cart/Checkout Trust Badges

### Below Cart Totals

```liquid
{% comment %} In cart section, below totals {% endcomment %}

<div class="cart__trust">
  <div class="cart__trust-badges">
    <div class="cart__trust-badge">
      {% render 'icon', icon: 'shield', size: 20 %}
      <span>{{ 'cart.secure_checkout' | t }}</span>
    </div>
    <div class="cart__trust-badge">
      {% render 'icon', icon: 'return', size: 20 %}
      <span>{{ 'cart.easy_returns' | t }}</span>
    </div>
  </div>
  <div class="cart__payment-icons">
    {% render 'payment-icons' %}
  </div>
</div>
```

```css
.cart__trust {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.cart__trust-badges {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.cart__trust-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-foreground-muted);
}

.cart__trust-badge svg {
  color: var(--color-success);
}

.cart__payment-icons {
  display: flex;
  justify-content: center;
}
```

---

## Locales

```json
{
  "sections": {
    "footer": {
      "payment_methods": "We accept"
    }
  },
  "products": {
    "product": {
      "free_shipping_badge": "Free shipping over $50",
      "returns_badge": "30-day returns",
      "secure_badge": "Secure checkout"
    }
  },
  "cart": {
    "secure_checkout": "Secure checkout",
    "easy_returns": "30-day returns"
  }
}
```

---

## Best Practices

1. **Dynamic Payment Icons:** Always use `shop.enabled_payment_types` for accurate icons
2. **Performance:** Use inline SVG for icons instead of image files
3. **Accessibility:** Include `aria-hidden="true"` on decorative icons
4. **Mobile:** Stack badges vertically on small screens
5. **Placement:** Show trust badges near CTAs (add to cart, checkout)
6. **Authenticity:** Only display badges for policies you actually have
7. **Consistency:** Use the same badge style throughout the site
