# Markets & Multi-Currency Reference

## Overview

Shopify Markets enables international selling with:
- Multiple currencies
- Multiple languages
- Market-specific pricing
- Localized domains/subfolders
- Duties and taxes handling

---

## Part 1: Understanding Shopify Markets

### Market Types

| Market Type | Description | Example |
|-------------|-------------|---------|
| Primary Market | Default market (usually domestic) | United States |
| International Markets | Additional selling regions | Europe, Canada, UK |
| Single-Country Market | One country | France |
| Multi-Country Market | Group of countries | European Union |

### Market Configuration (Admin)

1. Settings → Markets
2. Add market
3. Configure:
   - Countries/regions
   - Currency
   - Language
   - Domain/subfolder
   - Pricing adjustments

---

## Part 2: Currency in Liquid

### Current Currency

```liquid
{% comment %} Get current currency {% endcomment %}
{{ cart.currency.iso_code }}     {% comment %} USD, EUR, GBP {% endcomment %}
{{ cart.currency.symbol }}       {% comment %} $, €, £ {% endcomment %}
{{ cart.currency.name }}         {% comment %} United States dollars {% endcomment %}

{% comment %} Format money in current currency {% endcomment %}
{{ product.price | money }}                    {% comment %} $19.99 {% endcomment %}
{{ product.price | money_with_currency }}      {% comment %} $19.99 USD {% endcomment %}
{{ product.price | money_without_currency }}   {% comment %} 19.99 {% endcomment %}
```

### Available Currencies

```liquid
{% comment %} List all enabled currencies {% endcomment %}
{% for currency in localization.available_currencies %}
  <option value="{{ currency.iso_code }}"
    {% if currency.iso_code == localization.country.currency.iso_code %}selected{% endif %}>
    {{ currency.name }} ({{ currency.symbol }})
  </option>
{% endfor %}
```

### Currency Selector

```liquid
{% comment %} snippets/currency-selector.liquid {% endcomment %}

{% form 'localization', id: 'currency-form', class: 'currency-selector' %}
  <label for="currency-select" class="visually-hidden">
    {{ 'localization.currency_label' | t }}
  </label>

  <select
    id="currency-select"
    name="currency_code"
    onchange="this.form.submit()"
  >
    {% for currency in localization.available_currencies %}
      <option value="{{ currency.iso_code }}"
        {% if currency.iso_code == localization.country.currency.iso_code %}selected{% endif %}>
        {{ currency.iso_code }} {{ currency.symbol }}
      </option>
    {% endfor %}
  </select>

  <noscript>
    <button type="submit">{{ 'localization.update' | t }}</button>
  </noscript>
{% endform %}
```

---

## Part 3: Languages in Liquid

### Current Language

```liquid
{{ request.locale.iso_code }}           {% comment %} en, fr, de {% endcomment %}
{{ request.locale.name }}               {% comment %} English {% endcomment %}
{{ request.locale.endonym_name }}       {% comment %} English (native name) {% endcomment %}
{{ request.locale.primary? }}           {% comment %} true/false {% endcomment %}
{{ request.locale.root_url }}           {% comment %} /fr/ or empty {% endcomment %}
```

### Available Languages

```liquid
{% for language in localization.available_languages %}
  <option value="{{ language.iso_code }}"
    {% if language.iso_code == localization.language.iso_code %}selected{% endif %}>
    {{ language.endonym_name }}
  </option>
{% endfor %}
```

### Language Selector

```liquid
{% comment %} snippets/language-selector.liquid {% endcomment %}

{% form 'localization', id: 'language-form', class: 'language-selector' %}
  <label for="language-select" class="visually-hidden">
    {{ 'localization.language_label' | t }}
  </label>

  <select
    id="language-select"
    name="locale_code"
    onchange="this.form.submit()"
  >
    {% for language in localization.available_languages %}
      <option value="{{ language.iso_code }}"
        {% if language.iso_code == localization.language.iso_code %}selected{% endif %}>
        {{ language.endonym_name }}
      </option>
    {% endfor %}
  </select>

  <noscript>
    <button type="submit">{{ 'localization.update' | t }}</button>
  </noscript>
{% endform %}
```

---

## Part 4: Countries & Markets

### Current Country/Market

```liquid
{{ localization.country.iso_code }}      {% comment %} US, CA, GB {% endcomment %}
{{ localization.country.name }}          {% comment %} United States {% endcomment %}
{{ localization.country.currency }}      {% comment %} Currency object {% endcomment %}
{{ localization.market.handle }}         {% comment %} Market handle {% endcomment %}
{{ localization.market.id }}             {% comment %} Market ID {% endcomment %}
```

### Available Countries

```liquid
{% for country in localization.available_countries %}
  <option value="{{ country.iso_code }}"
    {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
    {{ country.name }} ({{ country.currency.iso_code }})
  </option>
{% endfor %}
```

### Country Selector

```liquid
{% comment %} snippets/country-selector.liquid {% endcomment %}

{% form 'localization', id: 'country-form', class: 'country-selector' %}
  <label for="country-select">
    {{ 'localization.country_label' | t }}
  </label>

  <select
    id="country-select"
    name="country_code"
    onchange="this.form.submit()"
  >
    {% for country in localization.available_countries %}
      <option value="{{ country.iso_code }}"
        {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
        {{ country.name }} ({{ country.currency.symbol }})
      </option>
    {% endfor %}
  </select>
{% endform %}
```

---

## Part 5: Combined Localization Selector

### Complete Footer Selector

```liquid
{% comment %} sections/footer-localization.liquid {% endcomment %}

<div class="localization-selectors">
  {% form 'localization', id: 'localization-form', class: 'localization-form' %}

    {% comment %} Country/Currency Selector {% endcomment %}
    {% if localization.available_countries.size > 1 %}
      <div class="localization-selector localization-selector--country">
        <label for="country-select">
          {% render 'icon-globe' %}
          {{ 'localization.country_label' | t }}
        </label>
        <select id="country-select" name="country_code">
          {% for country in localization.available_countries %}
            <option value="{{ country.iso_code }}"
              {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
              {{ country.name }} ({{ country.currency.iso_code }} {{ country.currency.symbol }})
            </option>
          {% endfor %}
        </select>
      </div>
    {% endif %}

    {% comment %} Language Selector {% endcomment %}
    {% if localization.available_languages.size > 1 %}
      <div class="localization-selector localization-selector--language">
        <label for="language-select">
          {% render 'icon-language' %}
          {{ 'localization.language_label' | t }}
        </label>
        <select id="language-select" name="locale_code">
          {% for language in localization.available_languages %}
            <option value="{{ language.iso_code }}"
              {% if language.iso_code == localization.language.iso_code %}selected{% endif %}>
              {{ language.endonym_name }}
            </option>
          {% endfor %}
        </select>
      </div>
    {% endif %}

    <button type="submit" class="btn btn--secondary">
      {{ 'localization.update' | t }}
    </button>

  {% endform %}
</div>

<script>
  // Auto-submit on change (enhanced UX)
  document.querySelectorAll('#localization-form select').forEach(select => {
    select.addEventListener('change', () => {
      document.getElementById('localization-form').submit();
    });
  });
</script>
```

---

## Part 6: Market-Specific Pricing

### Price Adjustments in Liquid

```liquid
{% comment %} Check if price is different from compare-at {% endcomment %}
{% if product.price < product.compare_at_price %}
  <span class="price price--sale">{{ product.price | money }}</span>
  <span class="price price--compare">{{ product.compare_at_price | money }}</span>
{% else %}
  <span class="price">{{ product.price | money }}</span>
{% endif %}

{% comment %} Handle multiple variants {% endcomment %}
{% if product.price_varies %}
  {{ 'products.product.from' | t }}
  {{ product.price_min | money }}
{% else %}
  {{ product.price | money }}
{% endif %}
```

### Variant Pricing with Market Data

```liquid
{% comment %} Ensure variant prices reflect current market {% endcomment %}
{% for variant in product.variants %}
  <option
    value="{{ variant.id }}"
    data-price="{{ variant.price }}"
    data-compare-price="{{ variant.compare_at_price | default: '' }}"
    {% unless variant.available %}disabled{% endunless %}
  >
    {{ variant.title }} - {{ variant.price | money }}
  </option>
{% endfor %}
```

---

## Part 7: Hreflang Tags for SEO

### Automatic Hreflang

Shopify automatically generates hreflang tags when Markets is configured. However, you can customize:

```liquid
{% comment %} In theme.liquid <head> {% endcomment %}

{% comment %} Shopify handles this automatically, but for reference: {% endcomment %}
{% for language in localization.available_languages %}
  {% for country in localization.available_countries %}
    <link
      rel="alternate"
      hreflang="{{ language.iso_code }}-{{ country.iso_code }}"
      href="{{ shop.url }}{{ language.root_url }}{{ request.path }}"
    >
  {% endfor %}
{% endfor %}

{% comment %} Default/fallback {% endcomment %}
<link rel="alternate" hreflang="x-default" href="{{ canonical_url }}">
```

---

## Part 8: Geolocation Recommendations

### Display Country Recommendation

```liquid
{% comment %} Show recommendation banner when visitor country differs {% endcomment %}
{% if localization.country.iso_code != request.country %}
  {% assign suggested_country = localization.available_countries | where: 'iso_code', request.country | first %}
  {% if suggested_country %}
    <div class="country-recommendation" data-country-banner>
      <p>
        {{ 'localization.country_recommendation' | t: country: suggested_country.name }}
      </p>
      {% form 'localization' %}
        <input type="hidden" name="country_code" value="{{ request.country }}">
        <button type="submit" class="btn btn--primary">
          {{ 'localization.switch_country' | t: country: suggested_country.name }}
        </button>
      {% endform %}
      <button type="button" data-dismiss-banner class="btn btn--secondary">
        {{ 'localization.stay_country' | t: country: localization.country.name }}
      </button>
    </div>
  {% endif %}
{% endif %}
```

### JavaScript for Banner

```javascript
// Store dismissal preference
document.querySelector('[data-dismiss-banner]')?.addEventListener('click', (e) => {
  const banner = e.target.closest('[data-country-banner]');
  banner.hidden = true;
  localStorage.setItem('country-banner-dismissed', 'true');
});

// Check if already dismissed
if (localStorage.getItem('country-banner-dismissed')) {
  document.querySelector('[data-country-banner]')?.setAttribute('hidden', '');
}
```

---

## Part 9: Translation Files

### Structure

```
locales/
├── en.default.json       # Primary language
├── fr.json               # French
├── de.json               # German
├── es.json               # Spanish
└── en.default.schema.json # Theme editor translations
```

### Using Translations

```liquid
{% comment %} Basic translation {% endcomment %}
{{ 'general.search' | t }}

{% comment %} Translation with variable {% endcomment %}
{{ 'cart.items_count' | t: count: cart.item_count }}

{% comment %} Pluralization {% endcomment %}
{{ 'products.count' | t: count: collection.products_count }}

{% comment %} Fallback {% endcomment %}
{{ 'custom.new_key' | t | default: 'Default text' }}
```

### Translation File Example

```json
{
  "general": {
    "search": "Search",
    "menu": "Menu",
    "close": "Close"
  },
  "cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty",
    "items_count": {
      "one": "{{ count }} item",
      "other": "{{ count }} items"
    },
    "checkout": "Checkout"
  },
  "localization": {
    "country_label": "Country/Region",
    "language_label": "Language",
    "currency_label": "Currency",
    "update": "Update",
    "country_recommendation": "It looks like you're in {{ country }}. Would you like to shop there?",
    "switch_country": "Shop in {{ country }}",
    "stay_country": "Stay in {{ country }}"
  },
  "products": {
    "count": {
      "one": "{{ count }} product",
      "other": "{{ count }} products"
    },
    "product": {
      "from": "From",
      "add_to_cart": "Add to cart",
      "sold_out": "Sold out"
    }
  }
}
```

---

## Part 10: Conversion Checklist

### When Source Site Has International Features

| Source Feature | Shopify Solution | Complexity |
|----------------|------------------|------------|
| Currency switcher | Localization form + Markets | Low |
| Language switcher | Localization form + translations | Medium |
| Geolocation redirect | Markets auto-detect or banner | Low |
| Market-specific pricing | Markets price adjustments | Admin config |
| Translated content | Locale JSON files | Medium-High |
| Multi-domain | Markets + domain config | Admin config |
| Tax/duty display | Markets + duty settings | Admin config |

### What to Document for Client

```markdown
## International Selling Setup

### Enabled Markets
| Market | Countries | Currency | Languages |
|--------|-----------|----------|-----------|
| United States (Primary) | US | USD | English |
| Canada | CA | CAD | English, French |
| Europe | DE, FR, IT, ES | EUR | English, German, French |
| United Kingdom | GB | GBP | English |

### Required Translations
The following locale files need translation:
- `locales/fr.json` - French
- `locales/de.json` - German

### Pricing Adjustments
- Europe: +10% (covers VAT)
- Canada: -5% (promotional)
- UK: +15% (covers VAT + shipping)

### URL Structure
- US (primary): https://store.com/
- Canada: https://store.com/en-ca/ and https://store.com/fr-ca/
- Europe: https://store.com/en-eu/
- UK: https://store.com/en-gb/

### To Complete After Theme Upload
1. Configure Markets in Settings → Markets
2. Enable multi-currency in Settings → Payments → Shopify Payments
3. Upload translations to locale files
4. Test checkout in each market
```

---

## Part 11: Common Patterns

### Show Shipping Notice by Market

```liquid
{% case localization.country.iso_code %}
  {% when 'US' %}
    <p class="shipping-notice">Free shipping on orders over $50</p>
  {% when 'CA' %}
    <p class="shipping-notice">Free shipping on orders over $75 CAD</p>
  {% when 'GB' %}
    <p class="shipping-notice">Free UK delivery on orders over £40</p>
  {% else %}
    <p class="shipping-notice">International shipping available</p>
{% endcase %}
```

### Market-Specific Content Section

```liquid
{% comment %} Show different content per market {% endcomment %}
{% if localization.market.handle == 'europe' %}
  <div class="eu-notice">
    <p>EU customers: VAT included in all prices</p>
  </div>
{% endif %}

{% if localization.country.iso_code == 'CA' %}
  <div class="ca-notice">
    <p>Canadian orders ship from our Toronto warehouse</p>
  </div>
{% endif %}
```

### Currency-Aware Product Schema (SEO)

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "offers": {
    "@type": "Offer",
    "price": {{ product.price | divided_by: 100.0 | json }},
    "priceCurrency": {{ cart.currency.iso_code | json }},
    "availability": "{% if product.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}"
  }
}
</script>
```
