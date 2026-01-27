# Section Schema Reference

Complete guide to Shopify section schemas—the JSON configuration that makes sections customizable in the theme editor.

## Section File Structure

Every section file follows this pattern:

```liquid
{% comment %} HTML/Liquid markup {% endcomment %}
<section class="section-name" style="padding: {{ section.settings.padding_top }}px 0 {{ section.settings.padding_bottom }}px;">
  <div class="container">
    {% if section.settings.heading != blank %}
      <h2>{{ section.settings.heading }}</h2>
    {% endif %}
    
    {% for block in section.blocks %}
      {% case block.type %}
        {% when 'item' %}
          <div {{ block.shopify_attributes }}>
            {{ block.settings.text }}
          </div>
      {% endcase %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section-classname",
  "settings": [],
  "blocks": [],
  "presets": []
}
{% endschema %}
```

## Schema Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Display name in editor |
| `tag` | No | HTML wrapper tag (default: `div`) |
| `class` | No | CSS class on wrapper |
| `settings` | No | Section-level settings array |
| `blocks` | No | Repeatable content blocks |
| `max_blocks` | No | Limit number of blocks |
| `presets` | No | Default configurations for "Add section" |
| `templates` | No | Restrict to specific page types |
| `enabled_on` | No | Where section can be added |
| `disabled_on` | No | Where section cannot be added |

## All Setting Types

### Text Inputs

```json
{
  "type": "text",
  "id": "heading",
  "label": "Heading",
  "default": "Welcome",
  "placeholder": "Enter heading text"
}
```

```json
{
  "type": "textarea",
  "id": "description",
  "label": "Description",
  "default": "Lorem ipsum dolor sit amet"
}
```

```json
{
  "type": "richtext",
  "id": "content",
  "label": "Content",
  "default": "<p>Rich text with <strong>formatting</strong></p>"
}
```

```json
{
  "type": "inline_richtext",
  "id": "inline_text",
  "label": "Inline text",
  "default": "Text with <strong>bold</strong>"
}
```

```json
{
  "type": "html",
  "id": "custom_html",
  "label": "Custom HTML"
}
```

### Number Inputs

```json
{
  "type": "number",
  "id": "items_count",
  "label": "Number of items",
  "default": 4
}
```

```json
{
  "type": "range",
  "id": "padding_top",
  "label": "Top padding",
  "min": 0,
  "max": 100,
  "step": 4,
  "unit": "px",
  "default": 40
}
```

### Selection Inputs

```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout",
  "default": "left",
  "options": [
    { "value": "left", "label": "Image left" },
    { "value": "right", "label": "Image right" },
    { "value": "center", "label": "Centered" }
  ]
}
```

```json
{
  "type": "radio",
  "id": "size",
  "label": "Size",
  "default": "medium",
  "options": [
    { "value": "small", "label": "Small" },
    { "value": "medium", "label": "Medium" },
    { "value": "large", "label": "Large" }
  ]
}
```

```json
{
  "type": "checkbox",
  "id": "show_vendor",
  "label": "Show vendor",
  "default": false
}
```

### Color & Style

```json
{
  "type": "color",
  "id": "text_color",
  "label": "Text color",
  "default": "#000000"
}
```

```json
{
  "type": "color_background",
  "id": "gradient_background",
  "label": "Background gradient",
  "default": "linear-gradient(180deg, #ffffff 0%, #000000 100%)"
}
```

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

```json
{
  "type": "color_scheme_group",
  "id": "color_schemes",
  "label": "Color schemes",
  "definition": [...]
}
```

### Media

```json
{
  "type": "image_picker",
  "id": "image",
  "label": "Image"
}
```

```json
{
  "type": "video",
  "id": "video",
  "label": "Video"
}
```

```json
{
  "type": "video_url",
  "id": "video_url",
  "label": "Video URL",
  "accept": ["youtube", "vimeo"],
  "placeholder": "https://www.youtube.com/watch?v=..."
}
```

### Resource Pickers

```json
{
  "type": "url",
  "id": "button_link",
  "label": "Button link"
}
```

```json
{
  "type": "link_list",
  "id": "menu",
  "label": "Menu",
  "default": "main-menu"
}
```

```json
{
  "type": "product",
  "id": "featured_product",
  "label": "Featured product"
}
```

```json
{
  "type": "product_list",
  "id": "products",
  "label": "Products",
  "limit": 12
}
```

```json
{
  "type": "collection",
  "id": "collection",
  "label": "Collection"
}
```

```json
{
  "type": "collection_list",
  "id": "collections",
  "label": "Collections",
  "limit": 6
}
```

```json
{
  "type": "blog",
  "id": "blog",
  "label": "Blog"
}
```

```json
{
  "type": "page",
  "id": "page",
  "label": "Page"
}
```

```json
{
  "type": "article",
  "id": "article",
  "label": "Article"
}
```

### Typography

```json
{
  "type": "font_picker",
  "id": "heading_font",
  "label": "Heading font",
  "default": "helvetica_n4"
}
```

### Layout Helpers

```json
{
  "type": "header",
  "content": "Layout settings"
}
```

```json
{
  "type": "paragraph",
  "content": "Configure the appearance of this section."
}
```

## Blocks (Repeatable Content)

Blocks allow users to add, remove, and reorder items. Access via `section.blocks`:

```json
{
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        {
          "type": "textarea",
          "id": "quote",
          "label": "Quote"
        },
        {
          "type": "text",
          "id": "author",
          "label": "Author name"
        },
        {
          "type": "image_picker",
          "id": "avatar",
          "label": "Author photo"
        }
      ]
    },
    {
      "type": "stat",
      "name": "Statistic",
      "settings": [
        {
          "type": "text",
          "id": "value",
          "label": "Value",
          "default": "100+"
        },
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Customers"
        }
      ]
    }
  ],
  "max_blocks": 6
}
```

Loop through blocks:

```liquid
{% for block in section.blocks %}
  <div class="block block--{{ block.type }}" {{ block.shopify_attributes }}>
    {% case block.type %}
      {% when 'testimonial' %}
        <blockquote>{{ block.settings.quote }}</blockquote>
        <cite>{{ block.settings.author }}</cite>
      {% when 'stat' %}
        <div class="stat-value">{{ block.settings.value }}</div>
        <div class="stat-label">{{ block.settings.label }}</div>
    {% endcase %}
  </div>
{% endfor %}
```

**Important:** Always include `{{ block.shopify_attributes }}` for editor functionality.

## Presets

Presets make sections available in "Add section" and define defaults:

```json
{
  "presets": [
    {
      "name": "Testimonials",
      "settings": {
        "heading": "What our customers say"
      },
      "blocks": [
        {
          "type": "testimonial",
          "settings": {
            "quote": "Amazing product!",
            "author": "Jane Doe"
          }
        },
        {
          "type": "testimonial",
          "settings": {
            "quote": "Highly recommend.",
            "author": "John Smith"
          }
        }
      ]
    }
  ]
}
```

**Note:** Header and footer sections typically omit presets since they're placed via section groups.

## Template Restrictions

Limit where sections can appear:

```json
{
  "enabled_on": {
    "templates": ["index", "page"],
    "groups": ["header", "footer"]
  }
}
```

```json
{
  "disabled_on": {
    "templates": ["password"],
    "groups": ["header"]
  }
}
```

Valid templates: `index`, `product`, `collection`, `page`, `blog`, `article`, `cart`, `search`, `404`, `password`, `customers/*`

Valid groups: `header`, `footer`, `aside`

## Common Settings Patterns

### Standard Spacing
```json
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
```

### Visibility Toggle
```json
{
  "type": "checkbox",
  "id": "show_on_mobile",
  "label": "Show on mobile",
  "default": true
},
{
  "type": "checkbox",
  "id": "show_on_desktop",
  "label": "Show on desktop",
  "default": true
}
```

### Container Width
```json
{
  "type": "select",
  "id": "container_width",
  "label": "Container width",
  "default": "contained",
  "options": [
    { "value": "full", "label": "Full width" },
    { "value": "contained", "label": "Contained" },
    { "value": "narrow", "label": "Narrow" }
  ]
}
```

### Button Settings Group
```json
{
  "type": "header",
  "content": "Button"
},
{
  "type": "text",
  "id": "button_text",
  "label": "Button text",
  "default": "Learn more"
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
    { "value": "link", "label": "Link" }
  ]
}
```

### Background Options
```json
{
  "type": "header",
  "content": "Background"
},
{
  "type": "color",
  "id": "background_color",
  "label": "Background color",
  "default": "#ffffff"
},
{
  "type": "image_picker",
  "id": "background_image",
  "label": "Background image"
},
{
  "type": "range",
  "id": "background_opacity",
  "label": "Background overlay opacity",
  "min": 0,
  "max": 100,
  "step": 5,
  "unit": "%",
  "default": 0
}
```
