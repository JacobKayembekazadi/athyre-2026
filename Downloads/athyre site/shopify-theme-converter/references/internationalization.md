# Internationalization (i18n)

Complete guide for building multi-language Shopify themes.

## Locales Structure

### Directory Layout

```
locales/
├── en.default.json     # Default language (required)
├── fr.json             # French
├── de.json             # German
├── es.json             # Spanish
└── en.default.schema.json  # Schema translations
```

### Locale File Structure

```json
// locales/en.default.json
{
  "general": {
    "accessibility": {
      "skip_to_content": "Skip to content",
      "close": "Close"
    },
    "social": {
      "share": "Share",
      "share_on_facebook": "Share on Facebook",
      "share_on_twitter": "Share on Twitter"
    }
  },

  "products": {
    "product": {
      "add_to_cart": "Add to cart",
      "sold_out": "Sold out",
      "unavailable": "Unavailable",
      "quantity": {
        "label": "Quantity",
        "increase": "Increase quantity",
        "decrease": "Decrease quantity"
      },
      "price": {
        "regular_price": "Regular price",
        "sale_price": "Sale price",
        "from_price_html": "From {{ price }}"
      }
    }
  },

  "collections": {
    "general": {
      "items_with_count": {
        "one": "{{ count }} product",
        "other": "{{ count }} products"
      },
      "no_matches": "No products found"
    },
    "filter": {
      "title": "Filter",
      "clear_all": "Clear all",
      "from": "From",
      "to": "To"
    },
    "sorting": {
      "title": "Sort by",
      "featured": "Featured",
      "best_selling": "Best selling",
      "alphabetically_az": "Alphabetically, A-Z",
      "alphabetically_za": "Alphabetically, Z-A",
      "price_low_high": "Price, low to high",
      "price_high_low": "Price, high to low",
      "date_old_new": "Date, old to new",
      "date_new_old": "Date, new to old"
    }
  },

  "sections": {
    "cart": {
      "title": "Your cart",
      "empty": "Your cart is empty",
      "continue_shopping": "Continue shopping",
      "subtotal": "Subtotal",
      "checkout": "Check out",
      "remove": "Remove",
      "note": "Order note"
    },
    "header": {
      "menu": "Menu",
      "cart_count": {
        "one": "{{ count }} item",
        "other": "{{ count }} items"
      }
    },
    "footer": {
      "payment_methods": "Payment methods"
    }
  },

  "customer": {
    "account": {
      "title": "Account",
      "orders": "Order history",
      "addresses": "Addresses",
      "logout": "Log out"
    },
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign in",
      "forgot_password": "Forgot your password?"
    },
    "register": {
      "title": "Create account",
      "first_name": "First name",
      "last_name": "Last name",
      "email": "Email",
      "password": "Password",
      "submit": "Create"
    },
    "order": {
      "title": "Order {{ name }}",
      "date": "Order date",
      "payment_status": "Payment status",
      "fulfillment_status": "Fulfillment status"
    }
  }
}
```

---

## Using Translations

### Basic Translation

```liquid
{%- comment -%} Simple translation {%- endcomment -%}
<button>{{ 'products.product.add_to_cart' | t }}</button>

{%- comment -%} With variables {%- endcomment -%}
<p>{{ 'products.product.price.from_price_html' | t: price: product.price | money }}</p>

{%- comment -%} Pluralization {%- endcomment -%}
<span>{{ 'collections.general.items_with_count' | t: count: collection.products_count }}</span>
```

### Fallback Handling

```liquid
{%- comment -%} Translation with default fallback {%- endcomment -%}
{{ 'custom.missing_key' | t | default: 'Default text' }}

{%- comment -%} Check if translation exists {%- endcomment -%}
{%- assign translation = 'custom.key' | t -%}
{%- if translation contains 'translation missing' -%}
  {%- comment -%} Use fallback {%- endcomment -%}
  Default text
{%- else -%}
  {{ translation }}
{%- endif -%}
```

### Dynamic Keys

```liquid
{%- comment -%} Build translation key dynamically {%- endcomment -%}
{%- assign status_key = 'customer.order.status.' | append: order.fulfillment_status -%}
<span>{{ status_key | t }}</span>
```

---

## Schema Translations

### Schema Locale File

```json
// locales/en.default.schema.json
{
  "sections": {
    "header": {
      "name": "Header",
      "settings": {
        "logo": {
          "label": "Logo image"
        },
        "menu": {
          "label": "Menu",
          "info": "Select a menu to display in the header"
        }
      }
    },
    "hero": {
      "name": "Hero banner",
      "settings": {
        "image": {
          "label": "Background image"
        },
        "heading": {
          "label": "Heading",
          "default": "Welcome to our store"
        },
        "button_text": {
          "label": "Button text",
          "default": "Shop now"
        }
      },
      "blocks": {
        "slide": {
          "name": "Slide"
        }
      }
    }
  },
  "settings_schema": {
    "colors": {
      "name": "Colors",
      "settings": {
        "primary": {
          "label": "Primary color"
        },
        "secondary": {
          "label": "Secondary color"
        }
      }
    }
  }
}
```

### Using Schema Translations

```liquid
{% schema %}
{
  "name": "t:sections.hero.name",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "t:sections.hero.settings.image.label"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.hero.settings.heading.label",
      "default": "t:sections.hero.settings.heading.default"
    }
  ]
}
{% endschema %}
```

---

## Currency & Money

### Formatting Money

```liquid
{%- comment -%} Basic money format {%- endcomment -%}
{{ product.price | money }}

{%- comment -%} With currency code {%- endcomment -%}
{{ product.price | money_with_currency }}

{%- comment -%} Without trailing zeros {%- endcomment -%}
{{ product.price | money_without_trailing_zeros }}

{%- comment -%} Without currency symbol {%- endcomment -%}
{{ product.price | money_without_currency }}
```

### Multi-Currency Support

```liquid
{%- comment -%} Check active currency {%- endcomment -%}
{%- if cart.currency.iso_code != shop.currency -%}
  <p class="currency-notice">
    {{ 'general.currency.prices_in' | t: currency: cart.currency.iso_code }}
  </p>
{%- endif -%}

{%- comment -%} Currency selector {%- endcomment -%}
{%- form 'currency' -%}
  <select name="currency_code" onchange="this.form.submit()">
    {%- for currency in shop.enabled_currencies -%}
      <option value="{{ currency.iso_code }}"
        {% if currency.iso_code == cart.currency.iso_code %}selected{% endif %}>
        {{ currency.iso_code }} {{ currency.symbol }}
      </option>
    {%- endfor -%}
  </select>
{%- endform -%}
```

---

## Date & Time

### Date Formatting

```liquid
{%- comment -%} Article date {%- endcomment -%}
{{ article.published_at | date: format: 'abbreviated_date' }}

{%- comment -%} Order date {%- endcomment -%}
{{ order.created_at | date: '%B %d, %Y' }}

{%- comment -%} Custom format {%- endcomment -%}
{{ product.created_at | date: '%d/%m/%Y' }}
```

### Time Zones

```liquid
{%- comment -%} Time in shop's timezone {%- endcomment -%}
{{ 'now' | date: '%Y-%m-%d %H:%M' }}
```

---

## RTL (Right-to-Left) Support

### Detecting RTL Languages

```liquid
{%- comment -%} In theme.liquid {%- endcomment -%}
{%- liquid
  assign rtl_languages = 'ar,he,fa,ur' | split: ','
  assign is_rtl = false
  if rtl_languages contains request.locale.iso_code
    assign is_rtl = true
  endif
-%}

<html lang="{{ request.locale.iso_code }}" {% if is_rtl %}dir="rtl"{% endif %}>
```

### RTL CSS

```css
/* Base styles work for LTR */
.sidebar {
  margin-left: 0;
  margin-right: 2rem;
}

/* RTL overrides */
[dir="rtl"] .sidebar {
  margin-left: 2rem;
  margin-right: 0;
}

/* Or use logical properties */
.sidebar {
  margin-inline-start: 0;
  margin-inline-end: 2rem;
}
```

---

## Language Selector

### Language/Country Selector

```liquid
{%- comment -%} Combined language/country selector {%- endcomment -%}
<div class="localization-wrapper">
  {%- form 'localization', id: 'localization-form' -%}

    {%- comment -%} Language selector {%- endcomment -%}
    {%- if localization.available_languages.size > 1 -%}
      <div class="language-selector">
        <label for="language-select">{{ 'general.language.label' | t }}</label>
        <select id="language-select" name="locale_code">
          {%- for language in localization.available_languages -%}
            <option value="{{ language.iso_code }}"
              {% if language.iso_code == localization.language.iso_code %}selected{% endif %}>
              {{ language.endonym_name | capitalize }}
            </option>
          {%- endfor -%}
        </select>
      </div>
    {%- endif -%}

    {%- comment -%} Country selector {%- endcomment -%}
    {%- if localization.available_countries.size > 1 -%}
      <div class="country-selector">
        <label for="country-select">{{ 'general.country.label' | t }}</label>
        <select id="country-select" name="country_code">
          {%- for country in localization.available_countries -%}
            <option value="{{ country.iso_code }}"
              {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
              {{ country.name }} ({{ country.currency.iso_code }} {{ country.currency.symbol }})
            </option>
          {%- endfor -%}
        </select>
      </div>
    {%- endif -%}

    <button type="submit">{{ 'general.localization.update' | t }}</button>
  {%- endform -%}
</div>
```

### AJAX Language Switching

```javascript
class LocalizationForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.selects = this.querySelectorAll('select');

    this.selects.forEach(select => {
      select.addEventListener('change', () => this.submit());
    });
  }

  submit() {
    this.form.submit();
  }
}

customElements.define('localization-form', LocalizationForm);
```

---

## SEO for Multi-Language

### Hreflang Tags

```liquid
{%- comment -%} In theme.liquid head {%- endcomment -%}
{%- for language in localization.available_languages -%}
  <link
    rel="alternate"
    hreflang="{{ language.iso_code }}"
    href="{{ canonical_url | replace: request.locale.iso_code, language.iso_code }}"
  >
{%- endfor -%}

{%- comment -%} x-default for language selector page {%- endcomment -%}
<link rel="alternate" hreflang="x-default" href="{{ canonical_url }}">
```

### Language-Specific Metadata

```liquid
<html lang="{{ request.locale.iso_code }}">
<head>
  <title>{{ page_title }}{% if page_title != shop.name %} | {{ shop.name }}{% endif %}</title>
  <meta name="description" content="{{ page_description | escape }}">
</head>
```

---

## Best Practices

### 1. Key Naming Convention

```json
{
  "namespace": {
    "component": {
      "element": "Text",
      "element_with_variable": "Text with {{ variable }}"
    }
  }
}
```

### 2. Avoid HTML in Translations

```json
// Bad
{ "message": "Click <a href='/'>here</a>" }

// Good
{ "message": "Click {{ link }} for more" }
```

```liquid
{{ 'namespace.message' | t: link: '<a href="/">' | append: 'here' | append: '</a>' }}
```

### 3. Use Pluralization

```json
{
  "items": {
    "one": "{{ count }} item",
    "other": "{{ count }} items"
  }
}
```

### 4. Keep Translations Organized

```
locales/
├── en.default.json          # Structured by feature
├── en.default.schema.json   # Theme editor translations
├── fr.json                  # Same structure as default
└── fr.schema.json           # French schema translations
```

### 5. Test All Languages

```bash
# Checklist for each language:
- [ ] All strings translated
- [ ] Variables render correctly
- [ ] Pluralization works
- [ ] Date formats correct
- [ ] Currency displays properly
- [ ] Text doesn't break layout
- [ ] RTL languages display correctly
```

---

## Common Translation Keys

### Required Keys

```json
{
  "general": {
    "accessibility": {},
    "pagination": {},
    "social": {}
  },
  "products": {
    "product": {}
  },
  "collections": {
    "general": {},
    "filter": {},
    "sorting": {}
  },
  "sections": {
    "cart": {},
    "header": {},
    "footer": {}
  },
  "customer": {
    "account": {},
    "login": {},
    "register": {},
    "orders": {},
    "addresses": {}
  },
  "templates": {
    "404": {},
    "search": {}
  }
}
```
