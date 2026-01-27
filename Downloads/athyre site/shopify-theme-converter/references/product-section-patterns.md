# Product Section Patterns

Complete reference for converting product pages to Shopify.

## Core Product Page Structure

### Main Product Section

```liquid
{%- comment -%}
  Main product section - the heart of any Shopify store
  Handles: product info, variants, add to cart, media gallery
{%- endcomment -%}

<section class="product section-{{ section.id }}" {{ section.shopify_attributes }}>
  <div class="product-container">
    {%- for block in section.blocks -%}
      {%- case block.type -%}

        {%- when '@app' -%}
          {% render block %}

        {%- when 'media_gallery' -%}
          <div class="product-media-wrapper" {{ block.shopify_attributes }}>
            {% render 'product-media-gallery', product: product, variant: product.selected_or_first_available_variant %}
          </div>

        {%- when 'title' -%}
          <h1 class="product-title" {{ block.shopify_attributes }}>
            {{ product.title }}
          </h1>

        {%- when 'price' -%}
          <div class="product-price" {{ block.shopify_attributes }}>
            {% render 'price', product: product, use_variant: true %}
          </div>

        {%- when 'variant_picker' -%}
          <div class="product-variants" {{ block.shopify_attributes }}>
            {% render 'product-variant-picker',
              product: product,
              block: block,
              product_form_id: product_form_id
            %}
          </div>

        {%- when 'quantity_selector' -%}
          <div class="product-quantity" {{ block.shopify_attributes }}>
            {% render 'quantity-selector', form_id: product_form_id %}
          </div>

        {%- when 'buy_buttons' -%}
          <div class="product-buy-buttons" {{ block.shopify_attributes }}>
            {% render 'buy-buttons',
              product: product,
              block: block,
              product_form_id: product_form_id
            %}
          </div>

        {%- when 'description' -%}
          {%- if product.description != blank -%}
            <div class="product-description" {{ block.shopify_attributes }}>
              {{ product.description }}
            </div>
          {%- endif -%}

        {%- when 'collapsible_tab' -%}
          <div class="product-collapsible" {{ block.shopify_attributes }}>
            <details>
              <summary>{{ block.settings.heading }}</summary>
              <div class="collapsible-content">
                {{ block.settings.content }}
              </div>
            </details>
          </div>

        {%- when 'rating' -%}
          {%- if product.metafields.reviews.rating.value != blank -%}
            <div class="product-rating" {{ block.shopify_attributes }}>
              {% render 'product-rating', product: product %}
            </div>
          {%- endif -%}

        {%- when 'sku' -%}
          <div class="product-sku" {{ block.shopify_attributes }}>
            <span class="sku-label">{{ 'products.product.sku' | t }}:</span>
            <span class="sku-value">{{ product.selected_or_first_available_variant.sku }}</span>
          </div>

      {%- endcase -%}
    {%- endfor -%}
  </div>
</section>
```

---

## Product Media Gallery

### Basic Gallery with Thumbnails

```liquid
{%- comment -%}
  snippets/product-media-gallery.liquid
{%- endcomment -%}

{%- liquid
  assign featured_media = product.selected_or_first_available_variant.featured_media | default: product.featured_media
-%}

<div class="product-gallery" data-product-gallery>
  {%- if product.media.size > 1 -%}
    <div class="gallery-thumbnails">
      {%- for media in product.media -%}
        <button
          class="thumbnail{% if media == featured_media %} is-active{% endif %}"
          data-media-id="{{ media.id }}"
          aria-label="{{ 'products.product.media.load_image' | t: index: forloop.index }}"
        >
          {{ media | image_url: width: 100 | image_tag: loading: 'lazy' }}
        </button>
      {%- endfor -%}
    </div>
  {%- endif -%}

  <div class="gallery-main">
    {%- for media in product.media -%}
      <div
        class="gallery-slide{% if media == featured_media %} is-active{% endif %}"
        data-media-id="{{ media.id }}"
        data-media-type="{{ media.media_type }}"
      >
        {%- case media.media_type -%}
          {%- when 'image' -%}
            {{ media | image_url: width: 1200 | image_tag:
              loading: 'lazy',
              widths: '375, 550, 750, 1100',
              sizes: '(min-width: 750px) 50vw, 100vw'
            }}

          {%- when 'video' -%}
            {{ media | video_tag:
              controls: true,
              loop: false,
              muted: false
            }}

          {%- when 'external_video' -%}
            {{ media | external_video_tag }}

          {%- when 'model' -%}
            {{ media | model_viewer_tag }}

        {%- endcase -%}
      </div>
    {%- endfor -%}
  </div>
</div>
```

---

## Variant Picker

### Dropdown Style

```liquid
{%- comment -%}
  snippets/product-variant-picker.liquid - Dropdown version
{%- endcomment -%}

{%- unless product.has_only_default_variant -%}
  <variant-selects
    class="variant-picker"
    data-section="{{ section.id }}"
    data-url="{{ product.url }}"
    {{ block.shopify_attributes }}
  >
    {%- for option in product.options_with_values -%}
      <div class="variant-picker-option">
        <label for="Option-{{ section.id }}-{{ forloop.index0 }}">
          {{ option.name }}
        </label>
        <select
          id="Option-{{ section.id }}-{{ forloop.index0 }}"
          name="options[{{ option.name | escape }}]"
          form="{{ product_form_id }}"
        >
          {%- for value in option.values -%}
            <option
              value="{{ value | escape }}"
              {% if option.selected_value == value %}selected{% endif %}
            >
              {{ value }}
            </option>
          {%- endfor -%}
        </select>
      </div>
    {%- endfor -%}

    <script type="application/json">
      {{ product.variants | json }}
    </script>
  </variant-selects>
{%- endunless -%}
```

### Swatch/Button Style

```liquid
{%- comment -%}
  snippets/product-variant-picker.liquid - Swatch version
{%- endcomment -%}

{%- unless product.has_only_default_variant -%}
  <variant-radios
    class="variant-picker variant-picker--buttons"
    data-section="{{ section.id }}"
    data-url="{{ product.url }}"
  >
    {%- for option in product.options_with_values -%}
      <fieldset class="variant-picker-option">
        <legend>{{ option.name }}</legend>

        {%- for value in option.values -%}
          {%- liquid
            assign option_disabled = true
            for variant in product.variants
              if variant[option.position] == value and variant.available
                assign option_disabled = false
                break
              endif
            endfor
          -%}

          <input
            type="radio"
            id="Option-{{ section.id }}-{{ forloop.index0 }}-{{ value | handle }}"
            name="options[{{ option.name | escape }}]"
            value="{{ value | escape }}"
            form="{{ product_form_id }}"
            {% if option.selected_value == value %}checked{% endif %}
            {% if option_disabled %}disabled{% endif %}
          >
          <label for="Option-{{ section.id }}-{{ forloop.index0 }}-{{ value | handle }}">
            {%- if option.name == 'Color' -%}
              <span
                class="color-swatch"
                style="background-color: {{ value | handle }}"
              ></span>
              <span class="visually-hidden">{{ value }}</span>
            {%- else -%}
              {{ value }}
            {%- endif -%}
          </label>
        {%- endfor -%}
      </fieldset>
    {%- endfor -%}

    <script type="application/json">
      {{ product.variants | json }}
    </script>
  </variant-radios>
{%- endunless -%}
```

---

## Buy Buttons

### Add to Cart + Dynamic Checkout

```liquid
{%- comment -%}
  snippets/buy-buttons.liquid
{%- endcomment -%}

{%- liquid
  assign current_variant = product.selected_or_first_available_variant
  assign product_form_id = 'product-form-' | append: section.id
-%}

<div class="buy-buttons">
  {%- form 'product', product,
    id: product_form_id,
    class: 'product-form',
    novalidate: 'novalidate',
    data-type: 'add-to-cart-form'
  -%}

    <input type="hidden" name="id" value="{{ current_variant.id }}">

    <button
      type="submit"
      name="add"
      class="btn btn--primary btn--add-to-cart"
      {% if current_variant.available == false %}disabled{% endif %}
    >
      <span class="btn-text">
        {%- if current_variant.available -%}
          {{ 'products.product.add_to_cart' | t }}
        {%- else -%}
          {{ 'products.product.sold_out' | t }}
        {%- endif -%}
      </span>
      <span class="btn-loading" hidden>
        {% render 'loading-spinner' %}
      </span>
    </button>

    {%- if block.settings.show_dynamic_checkout -%}
      {{ form | payment_button }}
    {%- endif -%}

  {%- endform -%}
</div>
```

---

## Price Display

### Full Price Snippet

```liquid
{%- comment -%}
  snippets/price.liquid

  Accepts:
  - product: {Object} Product object
  - use_variant: {Boolean} Use selected variant price
  - show_badges: {Boolean} Show sale/sold out badges
{%- endcomment -%}

{%- liquid
  if use_variant
    assign target = product.selected_or_first_available_variant
  else
    assign target = product
  endif

  assign compare_at_price = target.compare_at_price
  assign price = target.price
  assign available = target.available

  assign money_price = price | money

  if settings.currency_code_enabled
    assign money_price = price | money_with_currency
  endif

  if target == product and product.price_varies
    assign money_price = 'products.product.price.from_price_html' | t: price: money_price
  endif
-%}

<div class="price{% if compare_at_price > price %} price--on-sale{% endif %}{% unless available %} price--sold-out{% endunless %}">
  <div class="price-container">
    {%- if compare_at_price > price -%}
      <span class="price-compare">
        <span class="visually-hidden">{{ 'products.product.price.regular_price' | t }}</span>
        <s>{{ compare_at_price | money }}</s>
      </span>
    {%- endif -%}

    <span class="price-regular">
      <span class="visually-hidden">{{ 'products.product.price.regular_price' | t }}</span>
      {{ money_price }}
    </span>

    {%- if product.quantity_price_breaks_configured? -%}
      <span class="price-volume">
        {{ 'products.product.volume_pricing.title' | t }}
      </span>
    {%- endif -%}
  </div>

  {%- if show_badges -%}
    {%- if compare_at_price > price -%}
      {%- liquid
        assign savings = compare_at_price | minus: price
        if settings.sale_badge_type == 'percentage'
          assign savings = savings | times: 100.0 | divided_by: compare_at_price | round
          assign badge_text = savings | append: '% ' | append: 'products.product.on_sale' | t
        else
          assign badge_text = 'products.product.on_sale' | t
        endif
      -%}
      <span class="badge badge--sale">{{ badge_text }}</span>
    {%- endif -%}

    {%- unless available -%}
      <span class="badge badge--sold-out">{{ 'products.product.sold_out' | t }}</span>
    {%- endunless -%}
  {%- endif -%}
</div>

{%- if target.unit_price_measurement -%}
  <div class="unit-price">
    <span class="visually-hidden">{{ 'products.product.price.unit_price' | t }}</span>
    {{ target.unit_price | money }}
    <span class="unit-price-separator">/</span>
    {%- if target.unit_price_measurement.reference_value != 1 -%}
      {{ target.unit_price_measurement.reference_value }}
    {%- endif -%}
    {{ target.unit_price_measurement.reference_unit }}
  </div>
{%- endif -%}
```

---

## Product Form Schema

### Complete Block-based Schema

```json
{% schema %}
{
  "name": "Product information",
  "tag": "section",
  "class": "section-product",
  "blocks": [
    {
      "type": "@app"
    },
    {
      "type": "media_gallery",
      "name": "Media gallery",
      "limit": 1,
      "settings": [
        {
          "type": "checkbox",
          "id": "enable_zoom",
          "label": "Enable zoom on hover",
          "default": true
        },
        {
          "type": "checkbox",
          "id": "enable_video_looping",
          "label": "Enable video looping",
          "default": false
        },
        {
          "type": "select",
          "id": "thumbnail_position",
          "label": "Thumbnail position",
          "default": "left",
          "options": [
            { "value": "left", "label": "Left" },
            { "value": "bottom", "label": "Bottom" }
          ]
        }
      ]
    },
    {
      "type": "title",
      "name": "Title",
      "limit": 1
    },
    {
      "type": "price",
      "name": "Price",
      "limit": 1,
      "settings": [
        {
          "type": "checkbox",
          "id": "show_badges",
          "label": "Show sale/sold out badges",
          "default": true
        }
      ]
    },
    {
      "type": "variant_picker",
      "name": "Variant picker",
      "limit": 1,
      "settings": [
        {
          "type": "select",
          "id": "picker_type",
          "label": "Type",
          "default": "button",
          "options": [
            { "value": "button", "label": "Buttons" },
            { "value": "dropdown", "label": "Dropdown" }
          ]
        },
        {
          "type": "checkbox",
          "id": "show_unavailable_as_disabled",
          "label": "Show unavailable variants as disabled",
          "default": true
        }
      ]
    },
    {
      "type": "quantity_selector",
      "name": "Quantity selector",
      "limit": 1
    },
    {
      "type": "buy_buttons",
      "name": "Buy buttons",
      "limit": 1,
      "settings": [
        {
          "type": "checkbox",
          "id": "show_dynamic_checkout",
          "label": "Show dynamic checkout buttons",
          "info": "Using the payment methods available on your store, customers see their preferred option, like PayPal or Apple Pay.",
          "default": true
        },
        {
          "type": "checkbox",
          "id": "show_gift_card_recipient",
          "label": "Show gift card recipient form",
          "info": "Only applies to gift card products",
          "default": true
        }
      ]
    },
    {
      "type": "description",
      "name": "Description",
      "limit": 1
    },
    {
      "type": "sku",
      "name": "SKU",
      "limit": 1
    },
    {
      "type": "rating",
      "name": "Product rating",
      "limit": 1,
      "settings": [
        {
          "type": "paragraph",
          "content": "To display a rating, add a product rating app."
        }
      ]
    },
    {
      "type": "collapsible_tab",
      "name": "Collapsible tab",
      "settings": [
        {
          "type": "text",
          "id": "heading",
          "label": "Heading",
          "default": "Shipping & Returns"
        },
        {
          "type": "richtext",
          "id": "content",
          "label": "Content"
        },
        {
          "type": "page",
          "id": "page",
          "label": "Content from page"
        }
      ]
    },
    {
      "type": "custom_liquid",
      "name": "Custom Liquid",
      "settings": [
        {
          "type": "liquid",
          "id": "custom_liquid",
          "label": "Custom Liquid"
        }
      ]
    }
  ],
  "settings": [
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "select",
      "id": "media_position",
      "label": "Media position",
      "default": "left",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "right", "label": "Right" }
      ]
    },
    {
      "type": "range",
      "id": "media_width",
      "label": "Media width",
      "min": 40,
      "max": 60,
      "step": 5,
      "unit": "%",
      "default": 50
    },
    {
      "type": "checkbox",
      "id": "sticky_info",
      "label": "Make product info sticky on scroll",
      "default": false
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
      "default": 36
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 36
    }
  ],
  "presets": [
    {
      "name": "Product information",
      "blocks": [
        { "type": "media_gallery" },
        { "type": "title" },
        { "type": "price" },
        { "type": "variant_picker" },
        { "type": "quantity_selector" },
        { "type": "buy_buttons" },
        { "type": "description" }
      ]
    }
  ],
  "templates": ["product"]
}
{% endschema %}
```

---

## Related Products

### Complementary Products Section

```liquid
<section class="related-products section-{{ section.id }}">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <h2>{{ section.settings.heading }}</h2>
    {%- endif -%}

    {%- case section.settings.product_source -%}
      {%- when 'complementary' -%}
        {%- assign complementary = product.metafields.shopify--discovery--product_recommendation.complementary_products.value -%}
        {%- if complementary != blank -%}
          <div class="product-grid" style="--columns: {{ section.settings.columns }}">
            {%- for product in complementary limit: section.settings.products_to_show -%}
              {% render 'product-card', product: product %}
            {%- endfor -%}
          </div>
        {%- endif -%}

      {%- when 'recommendations' -%}
        <product-recommendations
          data-url="{{ routes.product_recommendations_url }}?section_id={{ section.id }}&product_id={{ product.id }}&limit={{ section.settings.products_to_show }}"
        >
          {%- if recommendations.performed and recommendations.products_count > 0 -%}
            <div class="product-grid" style="--columns: {{ section.settings.columns }}">
              {%- for product in recommendations.products -%}
                {% render 'product-card', product: product %}
              {%- endfor -%}
            </div>
          {%- endif -%}
        </product-recommendations>

      {%- when 'collection' -%}
        {%- if section.settings.collection != blank -%}
          <div class="product-grid" style="--columns: {{ section.settings.columns }}">
            {%- for product in section.settings.collection.products limit: section.settings.products_to_show -%}
              {% render 'product-card', product: product %}
            {%- endfor -%}
          </div>
        {%- endif -%}
    {%- endcase -%}
  </div>
</section>
```

---

## Conversion Reference: React to Shopify

| React Pattern | Shopify Equivalent |
|---------------|-------------------|
| `product.images.map()` | `{% for media in product.media %}` |
| `product.variants.find()` | `product.selected_or_first_available_variant` |
| `useState` for variant | `variant-selects` web component + URL params |
| `onClick` add to cart | Form submission + AJAX fetch |
| `product.price` | `{{ product.price \| money }}` |
| Image zoom library | Native `image_url` with srcset |
| Video player component | `{{ media \| video_tag }}` |
| 3D model viewer | `{{ media \| model_viewer_tag }}` |
