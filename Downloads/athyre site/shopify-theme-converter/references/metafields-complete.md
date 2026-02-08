# Metafields & Metaobjects Complete Reference

## Overview

Metafields and metaobjects are Shopify's custom data system. They're essential for:
- Storing custom product data (ingredients, care instructions, specs)
- Creating reusable content types (team members, testimonials, FAQs)
- Extending any Shopify object (orders, customers, collections)

---

## Metafields vs Metaobjects

| Feature | Metafields | Metaobjects |
|---------|------------|-------------|
| **Attached to** | Products, variants, collections, pages, customers, orders, etc. | Standalone (not attached to anything) |
| **Use case** | Extend existing objects | Create new content types |
| **Example** | Product ingredients | Team member profiles |
| **Access** | `product.metafields.namespace.key` | `shop.metaobjects.type.handle` |

---

## Part 1: Metafields

### Common Metafield Types

| Type | Description | Example |
|------|-------------|---------|
| `single_line_text_field` | Short text | "100% Organic Cotton" |
| `multi_line_text_field` | Long text | Product care instructions |
| `rich_text_field` | HTML-like content | Formatted product description |
| `number_integer` | Whole number | Stock threshold |
| `number_decimal` | Decimal number | Product weight |
| `boolean` | True/false | Is featured |
| `date` | Date only | Release date |
| `date_time` | Date and time | Sale end time |
| `url` | Web URL | External documentation link |
| `color` | Hex color | Brand color |
| `file_reference` | Image/file | Size chart image |
| `product_reference` | Link to product | Related product |
| `collection_reference` | Link to collection | Related collection |
| `page_reference` | Link to page | More info page |
| `metaobject_reference` | Link to metaobject | Author profile |
| `list.*` | Array of any type | Multiple images |
| `json` | Raw JSON | Complex structured data |

### Creating Metafield Definitions

#### Via Shopify Admin
1. Settings → Custom data
2. Select resource (Products, Collections, etc.)
3. Add definition
4. Configure name, namespace, key, type, validation

#### Via Admin API (GraphQL)

```graphql
mutation CreateMetafieldDefinition {
  metafieldDefinitionCreate(definition: {
    name: "Product Ingredients"
    namespace: "custom"
    key: "ingredients"
    type: "multi_line_text_field"
    ownerType: PRODUCT
    description: "List of ingredients for this product"
    validations: [
      { name: "max_length", value: "2000" }
    ]
  }) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
}
```

### Accessing Metafields in Liquid

```liquid
{% comment %} Product metafield {% endcomment %}
{% if product.metafields.custom.ingredients %}
  <div class="product-ingredients">
    <h3>Ingredients</h3>
    <p>{{ product.metafields.custom.ingredients }}</p>
  </div>
{% endif %}

{% comment %} Rich text metafield {% endcomment %}
{% if product.metafields.custom.care_instructions %}
  <div class="care-instructions">
    {{ product.metafields.custom.care_instructions | metafield_tag }}
  </div>
{% endif %}

{% comment %} File/image metafield {% endcomment %}
{% if product.metafields.custom.size_chart %}
  <img
    src="{{ product.metafields.custom.size_chart | image_url: width: 800 }}"
    alt="Size chart for {{ product.title }}"
    loading="lazy"
  >
{% endif %}

{% comment %} List of images {% endcomment %}
{% if product.metafields.custom.gallery %}
  <div class="product-gallery">
    {% for image in product.metafields.custom.gallery.value %}
      <img
        src="{{ image | image_url: width: 400 }}"
        alt="{{ product.title }} gallery image"
        loading="lazy"
      >
    {% endfor %}
  </div>
{% endif %}

{% comment %} Product reference {% endcomment %}
{% if product.metafields.custom.matching_product %}
  {% assign matching = product.metafields.custom.matching_product.value %}
  <div class="matching-product">
    <h4>Complete the look:</h4>
    <a href="{{ matching.url }}">{{ matching.title }}</a>
  </div>
{% endif %}

{% comment %} Boolean metafield {% endcomment %}
{% if product.metafields.custom.is_bestseller %}
  <span class="badge badge--bestseller">Best Seller</span>
{% endif %}

{% comment %} Date metafield {% endcomment %}
{% if product.metafields.custom.release_date %}
  <p>Available from: {{ product.metafields.custom.release_date | date: "%B %d, %Y" }}</p>
{% endif %}
```

### Dynamic Sources in Theme Editor

Connect metafields to section settings without code:

```liquid
{% schema %}
{
  "name": "Product Info",
  "settings": [
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle"
    }
  ]
}
{% endschema %}
```

Merchants can then click "Connect dynamic source" on the subtitle field and select a metafield.

---

## Part 2: Metaobjects

### When to Use Metaobjects

| Content Type | Use Metaobject? | Why |
|--------------|-----------------|-----|
| Team members | ✅ Yes | Standalone, reusable across pages |
| Testimonials | ✅ Yes | Standalone, reusable |
| FAQs | ✅ Yes | Reusable content |
| Store locations | ✅ Yes | Multiple entries, complex data |
| Product specs | ❌ No | Use product metafields |
| Collection badges | ❌ No | Use collection metafields |

### Creating Metaobject Definitions

#### Via Admin API (GraphQL)

```graphql
mutation CreateMetaobjectDefinition {
  metaobjectDefinitionCreate(definition: {
    name: "Team Member"
    type: "team_member"
    fieldDefinitions: [
      {
        name: "Name"
        key: "name"
        type: "single_line_text_field"
        required: true
        validations: [{ name: "max_length", value: "100" }]
      },
      {
        name: "Role"
        key: "role"
        type: "single_line_text_field"
        required: true
      },
      {
        name: "Bio"
        key: "bio"
        type: "multi_line_text_field"
      },
      {
        name: "Photo"
        key: "photo"
        type: "file_reference"
        validations: [{ name: "file_type_options", value: "[\"Image\"]" }]
      },
      {
        name: "LinkedIn"
        key: "linkedin"
        type: "url"
      },
      {
        name: "Email"
        key: "email"
        type: "single_line_text_field"
        validations: [{ name: "regex", value: "^[^@]+@[^@]+\\.[^@]+$" }]
      }
    ],
    access: {
      storefront: PRIVATE
    }
  }) {
    metaobjectDefinition {
      id
      type
    }
    userErrors {
      field
      message
    }
  }
}
```

### Accessing Metaobjects in Liquid

```liquid
{% comment %} Single metaobject by handle {% endcomment %}
{% assign ceo = shop.metaobjects.team_member['john-smith'] %}
{% if ceo %}
  <div class="team-member">
    <img src="{{ ceo.photo.value | image_url: width: 300 }}" alt="{{ ceo.name }}">
    <h3>{{ ceo.name.value }}</h3>
    <p class="role">{{ ceo.role.value }}</p>
    <p class="bio">{{ ceo.bio.value }}</p>
  </div>
{% endif %}

{% comment %} All metaobjects of a type {% endcomment %}
{% assign team_members = shop.metaobjects.team_member.values %}
<div class="team-grid">
  {% for member in team_members %}
    <div class="team-member">
      {% if member.photo.value %}
        <img
          src="{{ member.photo.value | image_url: width: 400 }}"
          alt="{{ member.name.value }}"
        >
      {% endif %}
      <h3>{{ member.name.value }}</h3>
      <p>{{ member.role.value }}</p>
    </div>
  {% endfor %}
</div>

{% comment %} Metaobject reference from product {% endcomment %}
{% assign designer = product.metafields.custom.designer.value %}
{% if designer %}
  <div class="designer-info">
    <h4>Designed by {{ designer.name.value }}</h4>
    <p>{{ designer.bio.value }}</p>
  </div>
{% endif %}
```

### Using Metaobjects in Sections

```liquid
{% comment %} sections/team-grid.liquid {% endcomment %}

<section class="team-grid">
  <div class="container">
    {% if section.settings.title != blank %}
      <h2>{{ section.settings.title }}</h2>
    {% endif %}

    <div class="team-grid__members">
      {% for block in section.blocks %}
        {% if block.type == 'team_member' %}
          {% assign member = block.settings.member %}
          {% if member %}
            <div class="team-member" {{ block.shopify_attributes }}>
              {% if member.photo.value %}
                <img
                  src="{{ member.photo.value | image_url: width: 400, height: 400, crop: 'center' }}"
                  alt="{{ member.name.value }}"
                  loading="lazy"
                >
              {% endif %}
              <h3>{{ member.name.value }}</h3>
              <p class="role">{{ member.role.value }}</p>
              {% if section.settings.show_bio %}
                <p class="bio">{{ member.bio.value }}</p>
              {% endif %}
              {% if member.linkedin.value %}
                <a href="{{ member.linkedin.value }}" class="linkedin-link" target="_blank" rel="noopener">
                  {% render 'icon-linkedin' %}
                </a>
              {% endif %}
            </div>
          {% endif %}
        {% endif %}
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Team Grid",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Meet Our Team"
    },
    {
      "type": "checkbox",
      "id": "show_bio",
      "label": "Show bios",
      "default": true
    }
  ],
  "blocks": [
    {
      "type": "team_member",
      "name": "Team Member",
      "settings": [
        {
          "type": "metaobject",
          "id": "member",
          "label": "Team Member",
          "metaobject_type": "team_member"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Team Grid"
    }
  ]
}
{% endschema %}
```

---

## Part 3: Common Patterns

### Product Specifications Table

```liquid
{% comment %} Assumes metafields: specs_material, specs_dimensions, specs_weight, specs_origin {% endcomment %}

{% assign has_specs = false %}
{% if product.metafields.specs.material or product.metafields.specs.dimensions or product.metafields.specs.weight or product.metafields.specs.origin %}
  {% assign has_specs = true %}
{% endif %}

{% if has_specs %}
  <table class="product-specs">
    <caption>Product Specifications</caption>
    <tbody>
      {% if product.metafields.specs.material %}
        <tr>
          <th scope="row">Material</th>
          <td>{{ product.metafields.specs.material }}</td>
        </tr>
      {% endif %}
      {% if product.metafields.specs.dimensions %}
        <tr>
          <th scope="row">Dimensions</th>
          <td>{{ product.metafields.specs.dimensions }}</td>
        </tr>
      {% endif %}
      {% if product.metafields.specs.weight %}
        <tr>
          <th scope="row">Weight</th>
          <td>{{ product.metafields.specs.weight }}g</td>
        </tr>
      {% endif %}
      {% if product.metafields.specs.origin %}
        <tr>
          <th scope="row">Origin</th>
          <td>{{ product.metafields.specs.origin }}</td>
        </tr>
      {% endif %}
    </tbody>
  </table>
{% endif %}
```

### FAQ Section with Metaobjects

```liquid
{% comment %} Metaobject type: faq with fields: question, answer, category {% endcomment %}

{% assign faqs = shop.metaobjects.faq.values %}

<div class="faq-section" itemscope itemtype="https://schema.org/FAQPage">
  {% for faq in faqs %}
    <details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <summary itemprop="name">{{ faq.question.value }}</summary>
      <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <div itemprop="text">{{ faq.answer.value }}</div>
      </div>
    </details>
  {% endfor %}
</div>
```

### Store Locator with Metaobjects

```liquid
{% comment %} Metaobject type: store_location with fields: name, address, phone, hours, lat, lng, image {% endcomment %}

{% assign locations = shop.metaobjects.store_location.values %}

<div class="store-locator">
  <div class="store-list">
    {% for location in locations %}
      <div class="store-card" data-lat="{{ location.lat.value }}" data-lng="{{ location.lng.value }}">
        {% if location.image.value %}
          <img src="{{ location.image.value | image_url: width: 400 }}" alt="{{ location.name.value }}">
        {% endif %}
        <h3>{{ location.name.value }}</h3>
        <address>{{ location.address.value }}</address>
        <p class="phone">{{ location.phone.value }}</p>
        <p class="hours">{{ location.hours.value }}</p>
      </div>
    {% endfor %}
  </div>
  <div id="store-map"></div>
</div>
```

---

## Part 4: Migration Checklist

When converting source site data to Shopify metafields:

### Step 1: Audit Source Data

| Source Data | Location | Shopify Mapping |
|-------------|----------|-----------------|
| Product ingredients | Product component props | Product metafield: `custom.ingredients` |
| Care instructions | CMS | Product metafield: `custom.care_instructions` |
| Size chart | Image file | Product metafield: `custom.size_chart` (file) |
| Team members | JSON file/CMS | Metaobject: `team_member` |
| Testimonials | CMS | Metaobject: `testimonial` |
| Store locations | Database | Metaobject: `store_location` |

### Step 2: Create Definitions Document

```json
{
  "metafield_definitions": [
    {
      "name": "Ingredients",
      "namespace": "custom",
      "key": "ingredients",
      "type": "multi_line_text_field",
      "owner_type": "PRODUCT"
    },
    {
      "name": "Care Instructions",
      "namespace": "custom",
      "key": "care_instructions",
      "type": "rich_text_field",
      "owner_type": "PRODUCT"
    }
  ],
  "metaobject_definitions": [
    {
      "name": "Team Member",
      "type": "team_member",
      "fields": [
        { "key": "name", "type": "single_line_text_field", "required": true },
        { "key": "role", "type": "single_line_text_field", "required": true },
        { "key": "bio", "type": "multi_line_text_field" },
        { "key": "photo", "type": "file_reference" }
      ]
    }
  ]
}
```

### Step 3: Data Migration

1. Export source data to CSV/JSON
2. Create metafield/metaobject definitions in Shopify
3. Import data via:
   - Shopify Admin (manual for small datasets)
   - Matrixify app (bulk import)
   - Admin API (programmatic)

### Step 4: Update Sections

Replace hardcoded content with metafield references:

```liquid
{% comment %} Before: Hardcoded {% endcomment %}
<p>100% Organic Cotton</p>

{% comment %} After: Dynamic {% endcomment %}
{% if product.metafields.custom.material %}
  <p>{{ product.metafields.custom.material }}</p>
{% endif %}
```

---

## Best Practices

### Naming Conventions

- **Namespace:** Use `custom` for merchant-managed data
- **Keys:** Use snake_case (`care_instructions`, not `careInstructions`)
- **Metaobject types:** Use snake_case (`team_member`, `store_location`)

### Validation

Always add validation rules:
- Max length for text fields
- File type restrictions for images
- Regex for emails, URLs

### Performance

- Don't create excessive metafields
- Use appropriate types (don't store JSON when structured types exist)
- Lazy load metaobject-heavy sections

### Fallbacks

Always provide fallbacks for missing data:

```liquid
{% if product.metafields.custom.subtitle %}
  <p class="subtitle">{{ product.metafields.custom.subtitle }}</p>
{% else %}
  <p class="subtitle">{{ product.vendor }}</p>
{% endif %}
```
