# Metafields & Metaobjects Guide

Complete reference for using metafields and metaobjects in Shopify themes.

## What Are Metafields?

Metafields allow you to add custom data to products, collections, customers, orders, and other Shopify resources. They're essential for:
- Extended product information (care instructions, materials, sizing charts)
- Custom content that doesn't fit standard fields
- Structured data for dynamic sections
- Third-party app integrations

---

## Metafield Types

### Standard Types

| Type | Description | Example |
|------|-------------|---------|
| `single_line_text_field` | Plain text, one line | `"100% Cotton"` |
| `multi_line_text_field` | Plain text, multiple lines | Care instructions |
| `rich_text_field` | HTML-like rich text | Formatted descriptions |
| `number_integer` | Whole numbers | `42` |
| `number_decimal` | Decimal numbers | `3.14` |
| `boolean` | True/false | `true` |
| `date` | Date only | `"2024-01-15"` |
| `date_time` | Date and time | `"2024-01-15T10:30:00Z"` |
| `json` | JSON object | `{"key": "value"}` |
| `color` | Hex color code | `"#FF5733"` |
| `url` | URL string | `"https://example.com"` |
| `dimension` | Length/width/height | `{"value": 10, "unit": "cm"}` |
| `volume` | Capacity | `{"value": 500, "unit": "ml"}` |
| `weight` | Mass | `{"value": 1.5, "unit": "kg"}` |
| `rating` | Star rating | `{"value": 4.5, "scale_min": 1, "scale_max": 5}` |
| `money` | Currency amount | `{"amount": "19.99", "currency_code": "USD"}` |

### Reference Types

| Type | Description | Example |
|------|-------------|---------|
| `file_reference` | File (image, video, etc.) | Image picker |
| `product_reference` | Link to product | Related product |
| `variant_reference` | Link to variant | Specific variant |
| `collection_reference` | Link to collection | Featured collection |
| `page_reference` | Link to page | Size guide page |
| `metaobject_reference` | Link to metaobject | Custom structured data |

### List Types

Any type can be a list by adding `list.` prefix:
- `list.single_line_text_field` - Multiple text values
- `list.file_reference` - Multiple images
- `list.product_reference` - Multiple products

---

## Accessing Metafields in Liquid

### Basic Access Pattern

```liquid
{{ product.metafields.namespace.key }}
{{ product.metafields.namespace.key.value }}
```

### Text Fields

```liquid
{%- comment -%} Single line text {%- endcomment -%}
{%- if product.metafields.custom.subtitle -%}
  <p class="product-subtitle">{{ product.metafields.custom.subtitle.value }}</p>
{%- endif -%}

{%- comment -%} Multi-line text {%- endcomment -%}
{%- if product.metafields.custom.care_instructions -%}
  <div class="care-instructions">
    {{ product.metafields.custom.care_instructions.value | newline_to_br }}
  </div>
{%- endif -%}

{%- comment -%} Rich text {%- endcomment -%}
{%- if product.metafields.custom.detailed_description -%}
  <div class="rich-description">
    {{ product.metafields.custom.detailed_description.value }}
  </div>
{%- endif -%}
```

### Number Fields

```liquid
{%- comment -%} Integer {%- endcomment -%}
{%- if product.metafields.custom.warranty_years -%}
  <p>{{ product.metafields.custom.warranty_years.value }} year warranty</p>
{%- endif -%}

{%- comment -%} Decimal with formatting {%- endcomment -%}
{%- if product.metafields.custom.product_weight -%}
  <p>Weight: {{ product.metafields.custom.product_weight.value | round: 2 }} kg</p>
{%- endif -%}
```

### Measurement Fields

```liquid
{%- comment -%} Dimension {%- endcomment -%}
{%- assign dimensions = product.metafields.custom.dimensions.value -%}
{%- if dimensions -%}
  <p>Size: {{ dimensions.value }}{{ dimensions.unit }}</p>
{%- endif -%}

{%- comment -%} Volume {%- endcomment -%}
{%- assign volume = product.metafields.custom.capacity.value -%}
{%- if volume -%}
  <p>Capacity: {{ volume.value }}{{ volume.unit }}</p>
{%- endif -%}

{%- comment -%} Weight {%- endcomment -%}
{%- assign weight = product.metafields.custom.shipping_weight.value -%}
{%- if weight -%}
  <p>Shipping Weight: {{ weight.value }}{{ weight.unit }}</p>
{%- endif -%}
```

### File References (Images)

```liquid
{%- comment -%} Single image {%- endcomment -%}
{%- if product.metafields.custom.size_chart -%}
  <img
    src="{{ product.metafields.custom.size_chart.value | image_url: width: 800 }}"
    alt="Size Chart"
    loading="lazy"
  >
{%- endif -%}

{%- comment -%} Multiple images (gallery) {%- endcomment -%}
{%- if product.metafields.custom.lifestyle_images -%}
  <div class="lifestyle-gallery">
    {%- for image in product.metafields.custom.lifestyle_images.value -%}
      {{ image | image_url: width: 600 | image_tag: loading: 'lazy' }}
    {%- endfor -%}
  </div>
{%- endif -%}
```

### Product References

```liquid
{%- comment -%} Single related product {%- endcomment -%}
{%- assign related = product.metafields.custom.pairs_well_with.value -%}
{%- if related -%}
  <div class="pairs-well-with">
    <h4>Pairs well with</h4>
    {% render 'product-card', product: related %}
  </div>
{%- endif -%}

{%- comment -%} Multiple related products {%- endcomment -%}
{%- assign related_products = product.metafields.custom.related_products.value -%}
{%- if related_products -%}
  <div class="related-products-grid">
    {%- for related in related_products -%}
      {% render 'product-card', product: related %}
    {%- endfor -%}
  </div>
{%- endif -%}
```

### Color Fields

```liquid
{%- assign brand_color = product.metafields.custom.brand_color.value -%}
{%- if brand_color -%}
  <style>
    .product-{{ product.id }} .brand-accent {
      background-color: {{ brand_color }};
    }
  </style>
{%- endif -%}
```

### Rating Fields

```liquid
{%- assign rating = product.metafields.reviews.rating.value -%}
{%- if rating -%}
  <div class="product-rating" aria-label="{{ rating.value }} out of {{ rating.scale_max }} stars">
    {%- for i in (1..rating.scale_max) -%}
      {%- if i <= rating.value -%}
        {% render 'icon-star-filled' %}
      {%- elsif i <= rating.value | plus: 0.5 -%}
        {% render 'icon-star-half' %}
      {%- else -%}
        {% render 'icon-star-empty' %}
      {%- endif -%}
    {%- endfor -%}
    <span class="rating-text">{{ rating.value }}/{{ rating.scale_max }}</span>
  </div>
{%- endif -%}
```

### JSON Fields

```liquid
{%- assign specs = product.metafields.custom.specifications.value -%}
{%- if specs -%}
  <dl class="specifications">
    {%- for spec in specs -%}
      <dt>{{ spec.label }}</dt>
      <dd>{{ spec.value }}</dd>
    {%- endfor -%}
  </dl>
{%- endif -%}
```

---

## Metaobjects

### What Are Metaobjects?

Metaobjects are custom content types you define in Shopify. Unlike metafields (attached to existing resources), metaobjects are standalone entities. Perfect for:
- Team members
- FAQs
- Testimonials
- Store locations
- Custom banners/announcements

### Accessing Metaobjects

```liquid
{%- comment -%} From a metaobject reference field {%- endcomment -%}
{%- assign author = article.metafields.custom.author.value -%}
{%- if author -%}
  <div class="author-card">
    {{ author.photo.value | image_url: width: 100 | image_tag: class: 'author-avatar' }}
    <h4>{{ author.name.value }}</h4>
    <p>{{ author.bio.value }}</p>
  </div>
{%- endif -%}

{%- comment -%} From a list of metaobjects {%- endcomment -%}
{%- assign team_members = shop.metaobjects.team_member.values -%}
{%- if team_members -%}
  <div class="team-grid">
    {%- for member in team_members -%}
      <div class="team-member">
        {{ member.photo.value | image_url: width: 300 | image_tag }}
        <h3>{{ member.name.value }}</h3>
        <p class="role">{{ member.role.value }}</p>
        <p class="bio">{{ member.bio.value }}</p>
      </div>
    {%- endfor -%}
  </div>
{%- endif -%}
```

### Metaobject in Section Settings

```liquid
{% schema %}
{
  "name": "Team section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Meet Our Team"
    },
    {
      "type": "metaobject_list",
      "id": "team_members",
      "label": "Team members",
      "metaobject_type": "team_member"
    }
  ]
}
{% endschema %}
```

```liquid
{%- for member in section.settings.team_members -%}
  <div class="team-card">
    {{ member.photo.value | image_url: width: 400 | image_tag }}
    <h3>{{ member.name.value }}</h3>
  </div>
{%- endfor -%}
```

---

## Common Use Cases

### Product Specifications Table

**Metafield Definition:**
- Namespace: `custom`
- Key: `specifications`
- Type: `json`

**Value Format:**
```json
[
  { "label": "Material", "value": "Stainless Steel" },
  { "label": "Dimensions", "value": "10cm x 5cm x 2cm" },
  { "label": "Weight", "value": "150g" }
]
```

**Liquid:**
```liquid
{%- assign specs = product.metafields.custom.specifications.value -%}
{%- if specs.size > 0 -%}
  <table class="specifications-table">
    <tbody>
      {%- for spec in specs -%}
        <tr>
          <th>{{ spec.label }}</th>
          <td>{{ spec.value }}</td>
        </tr>
      {%- endfor -%}
    </tbody>
  </table>
{%- endif -%}
```

### FAQ Accordion

**Metaobject Definition: `faq_item`**
- `question` (single_line_text_field)
- `answer` (rich_text_field)

**Liquid:**
```liquid
{%- assign faqs = section.settings.faq_items -%}
{%- if faqs.size > 0 -%}
  <div class="faq-accordion">
    {%- for faq in faqs -%}
      <details class="faq-item">
        <summary>{{ faq.question.value }}</summary>
        <div class="faq-answer">
          {{ faq.answer.value }}
        </div>
      </details>
    {%- endfor -%}
  </div>
{%- endif -%}
```

### Size Chart

**Metafield Definition:**
- Namespace: `custom`
- Key: `size_chart`
- Type: `file_reference`

**Liquid:**
```liquid
{%- if product.metafields.custom.size_chart -%}
  <button type="button" class="btn btn--link" data-size-chart-trigger>
    {% render 'icon-ruler' %}
    Size Guide
  </button>

  <div class="size-chart-modal" id="size-chart-modal" hidden>
    <div class="size-chart-content">
      <button type="button" class="modal-close" aria-label="Close">×</button>
      {{ product.metafields.custom.size_chart.value | image_url: width: 1000 | image_tag }}
    </div>
  </div>
{%- endif -%}
```

### Video Content

**Metafield Definition:**
- Namespace: `custom`
- Key: `product_video`
- Type: `file_reference`

**Liquid:**
```liquid
{%- assign video = product.metafields.custom.product_video.value -%}
{%- if video -%}
  <div class="product-video">
    {%- if video.media_type == 'video' -%}
      {{ video | video_tag: controls: true, loop: false, muted: false }}
    {%- elsif video.media_type == 'external_video' -%}
      {{ video | external_video_tag }}
    {%- endif -%}
  </div>
{%- endif -%}
```

### Store Locator

**Metaobject Definition: `store_location`**
- `name` (single_line_text_field)
- `address` (multi_line_text_field)
- `phone` (single_line_text_field)
- `hours` (multi_line_text_field)
- `image` (file_reference)
- `latitude` (number_decimal)
- `longitude` (number_decimal)

**Liquid:**
```liquid
{%- assign stores = shop.metaobjects.store_location.values -%}
<div class="store-locator">
  <div class="store-list">
    {%- for store in stores -%}
      <div class="store-card" data-lat="{{ store.latitude.value }}" data-lng="{{ store.longitude.value }}">
        {%- if store.image.value -%}
          {{ store.image.value | image_url: width: 400 | image_tag }}
        {%- endif -%}
        <h3>{{ store.name.value }}</h3>
        <address>{{ store.address.value | newline_to_br }}</address>
        <p class="phone"><a href="tel:{{ store.phone.value }}">{{ store.phone.value }}</a></p>
        <div class="hours">{{ store.hours.value | newline_to_br }}</div>
      </div>
    {%- endfor -%}
  </div>
  <div class="store-map" id="store-map"></div>
</div>
```

---

## Converting React Data to Metafields

### Before (React)

```jsx
const productData = {
  specs: [
    { label: 'Material', value: 'Oak Wood' },
    { label: 'Finish', value: 'Matte' }
  ],
  careInstructions: 'Wipe with damp cloth...',
  relatedProducts: ['product-1', 'product-2'],
  sizeChart: '/images/size-chart.png'
};
```

### After (Shopify)

**Metafield Definitions:**

| Key | Type | Description |
|-----|------|-------------|
| `custom.specifications` | `json` | Spec key-value pairs |
| `custom.care_instructions` | `multi_line_text_field` | Care text |
| `custom.related_products` | `list.product_reference` | Related products |
| `custom.size_chart` | `file_reference` | Size chart image |

**Document in deployment:**

```markdown
## Metafield Setup Required

### Product Metafields

1. **Specifications** (JSON)
   - Namespace: `custom`
   - Key: `specifications`
   - Format: `[{"label": "...", "value": "..."}]`

2. **Care Instructions** (Multi-line text)
   - Namespace: `custom`
   - Key: `care_instructions`

3. **Related Products** (Product list)
   - Namespace: `custom`
   - Key: `related_products`

4. **Size Chart** (File)
   - Namespace: `custom`
   - Key: `size_chart`
```

---

## Schema Settings for Metafields

### Dynamic Sources in Settings

```json
{% schema %}
{
  "name": "Product metafield",
  "settings": [
    {
      "type": "text",
      "id": "metafield_namespace",
      "label": "Metafield namespace",
      "default": "custom"
    },
    {
      "type": "text",
      "id": "metafield_key",
      "label": "Metafield key",
      "default": "subtitle"
    }
  ]
}
{% endschema %}
```

```liquid
{%- assign metafield = product.metafields[section.settings.metafield_namespace][section.settings.metafield_key] -%}
{%- if metafield -%}
  <p>{{ metafield.value }}</p>
{%- endif -%}
```

---

## Best Practices

1. **Namespace Convention:** Use `custom` for store-specific fields, or create descriptive namespaces like `shipping`, `dimensions`, `content`

2. **Check for Existence:** Always use `{% if %}` before accessing metafields

3. **Access `.value`:** Most metafield types require `.value` to get the actual content

4. **Performance:** Metafields are loaded with the parent object; no extra API calls needed

5. **Fallbacks:** Provide default content when metafields are empty

```liquid
{{ product.metafields.custom.subtitle.value | default: product.vendor }}
```

6. **Documentation:** Always document required metafields in deployment package
