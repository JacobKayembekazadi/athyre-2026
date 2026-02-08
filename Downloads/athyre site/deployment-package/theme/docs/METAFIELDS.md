# Athyre Theme Metafields Documentation

## Product Metafields

| Namespace | Key | Type | Description | Usage |
|-----------|-----|------|-------------|-------|
| `athyre` | `materials` | `list.single_line_text` | Product materials/fabrics | Product page specifications |
| `athyre` | `care_instructions` | `multi_line_text` | Care/washing instructions | Product page accordion |
| `athyre` | `sustainability` | `rating` | Sustainability score (1-5) | Product badge/filter |
| `athyre` | `size_guide` | `file_reference` | Size chart image | Product page modal |
| `athyre` | `video_url` | `url` | Product video URL | Product gallery |
| `athyre` | `badge` | `single_line_text` | Custom badge text (e.g., "New", "Bestseller") | Product card overlay |

## Collection Metafields

| Namespace | Key | Type | Description | Usage |
|-----------|-----|------|-------------|-------|
| `athyre` | `banner_video` | `file_reference` | Collection banner video | Collection hero |
| `athyre` | `featured_products` | `list.product_reference` | Manually featured products | Collection featured slider |
| `athyre` | `filter_order` | `json` | Custom filter ordering | Collection filters sidebar |

## Page Metafields

| Namespace | Key | Type | Description | Usage |
|-----------|-----|------|-------------|-------|
| `athyre` | `hero_image` | `file_reference` | Page hero background | Page hero section |
| `athyre` | `sidebar_content` | `rich_text` | Sidebar content block | Page template |

## Global Shop Metafields

| Namespace | Key | Type | Description | Usage |
|-----------|-----|------|-------------|-------|
| `athyre` | `announcement_bar` | `single_line_text` | Global announcement text | Header announcement |
| `athyre` | `popup_image` | `file_reference` | Newsletter popup image | Site-wide popup |
| `athyre` | `popup_delay` | `number_integer` | Popup delay in ms | Newsletter popup timing |

## Variant Metafields

| Namespace | Key | Type | Description | Usage |
|-----------|-----|------|-------------|-------|
| `athyre` | `swatch_image` | `file_reference` | Custom swatch image | Variant picker |
| `athyre` | `low_stock_threshold` | `number_integer` | Low stock warning level | Product page urgency |

---

## Usage in Liquid

### Accessing Product Metafields
```liquid
{%- if product.metafields.athyre.materials -%}
  <div class="product-materials">
    <h4>Materials</h4>
    <ul>
      {%- for material in product.metafields.athyre.materials.value -%}
        <li>{{ material }}</li>
      {%- endfor -%}
    </ul>
  </div>
{%- endif -%}
```

### Accessing Collection Metafields
```liquid
{%- assign banner_video = collection.metafields.athyre.banner_video -%}
{%- if banner_video -%}
  <video autoplay muted loop playsinline>
    <source src="{{ banner_video | file_url }}" type="video/mp4">
  </video>
{%- endif -%}
```

### Accessing Shop Metafields
```liquid
{%- assign announcement = shop.metafields.athyre.announcement_bar -%}
{%- if announcement -%}
  <div class="announcement-bar">{{ announcement }}</div>
{%- endif -%}
```

---

## Metafield Definitions (Shopify Admin)

To enable these metafields in the Shopify Admin:

1. Go to **Settings > Custom data**
2. Select the resource type (Products, Collections, etc.)
3. Click **Add definition**
4. Use the namespace `athyre` and the keys listed above

This ensures merchants can edit metafield values directly in the Shopify Admin product/collection editors.

---

## Theme Blocks Using Metafields

| Section | Block Type | Metafield Used |
|---------|------------|----------------|
| Product Page | Materials | `athyre.materials` |
| Product Page | Care Instructions | `athyre.care_instructions` |
| Product Page | Size Guide | `athyre.size_guide` |
| Collection Hero | Video Background | `athyre.banner_video` |
| Product Card | Badge | `athyre.badge` |
| Variant Picker | Custom Swatch | `athyre.swatch_image` |
