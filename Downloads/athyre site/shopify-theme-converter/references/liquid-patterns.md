# Liquid Patterns Reference

Essential Liquid syntax for converting web components to Shopify sections.

## Output Tags

```liquid
{{ variable }}
{{ product.title }}
{{ section.settings.heading }}
{{ block.settings.text }}
{{ settings.color_primary }}
```

## Logic Tags

### Conditionals

```liquid
{% if section.settings.heading != blank %}
  <h2>{{ section.settings.heading }}</h2>
{% endif %}

{% if section.settings.show_button %}
  <a href="{{ section.settings.button_link }}">
    {{ section.settings.button_text }}
  </a>
{% endif %}

{% if product.available %}
  <button>Add to cart</button>
{% else %}
  <button disabled>Sold out</button>
{% endif %}

{% unless section.settings.hide_title %}
  <h1>{{ section.settings.title }}</h1>
{% endunless %}
```

### Comparisons

```liquid
{% if section.settings.layout == 'left' %}
  {% comment %} Image left layout {% endcomment %}
{% elsif section.settings.layout == 'right' %}
  {% comment %} Image right layout {% endcomment %}
{% else %}
  {% comment %} Default/center layout {% endcomment %}
{% endif %}

{% if section.settings.columns >= 4 %}
  {% comment %} Grid layout {% endcomment %}
{% endif %}
```

### Checking for Content

```liquid
{% comment %} Check if setting has value {% endcomment %}
{% if section.settings.image != blank %}
  {{ section.settings.image | image_url: width: 800 | image_tag }}
{% endif %}

{% comment %} Check if text is empty {% endcomment %}
{% if section.settings.text != blank and section.settings.text != '' %}
  <p>{{ section.settings.text }}</p>
{% endif %}

{% comment %} Check if collection has products {% endcomment %}
{% if section.settings.collection.products.size > 0 %}
  {% comment %} Show products {% endcomment %}
{% endif %}
```

### Case/When

```liquid
{% case section.settings.size %}
  {% when 'small' %}
    <div class="text-sm">{{ content }}</div>
  {% when 'medium' %}
    <div class="text-md">{{ content }}</div>
  {% when 'large' %}
    <div class="text-lg">{{ content }}</div>
{% endcase %}
```

## Loops

### For Loops

```liquid
{% for product in collection.products limit: 4 %}
  <div class="product-card">
    <h3>{{ product.title }}</h3>
    <p>{{ product.price | money }}</p>
  </div>
{% endfor %}

{% for block in section.blocks %}
  <div {{ block.shopify_attributes }}>
    {{ block.settings.content }}
  </div>
{% endfor %}
```

### Loop Variables

```liquid
{% for item in collection.products %}
  {% if forloop.first %}
    <div class="first-item">
  {% endif %}
  
  <div class="item item-{{ forloop.index }}">
    {{ item.title }}
  </div>
  
  {% if forloop.last %}
    </div>
  {% endif %}
{% endfor %}
```

Available loop variables:
- `forloop.index` - Current iteration (1-based)
- `forloop.index0` - Current iteration (0-based)
- `forloop.first` - True if first iteration
- `forloop.last` - True if last iteration
- `forloop.length` - Total iterations

### Range

```liquid
{% for i in (1..section.settings.count) %}
  <div class="item-{{ i }}"></div>
{% endfor %}
```

## Filters

### Text Filters

```liquid
{{ 'hello world' | capitalize }}      {% comment %} Hello world {% endcomment %}
{{ 'hello world' | upcase }}          {% comment %} HELLO WORLD {% endcomment %}
{{ 'HELLO' | downcase }}              {% comment %} hello {% endcomment %}
{{ 'hello' | append: ' world' }}      {% comment %} hello world {% endcomment %}
{{ 'hello world' | replace: 'world', 'there' }}  {% comment %} hello there {% endcomment %}
{{ 'hello world' | truncate: 5 }}     {% comment %} he... {% endcomment %}
{{ 'hello world' | truncatewords: 1 }} {% comment %} hello... {% endcomment %}
{{ '  hello  ' | strip }}             {% comment %} hello {% endcomment %}
{{ 'hello<br>world' | strip_html }}   {% comment %} helloworld {% endcomment %}
{{ 'hello\nworld' | newline_to_br }}  {% comment %} hello<br>world {% endcomment %}
{{ 'hello world' | split: ' ' }}      {% comment %} ['hello', 'world'] {% endcomment %}
{{ 'some-slug' | handleize }}         {% comment %} some-slug {% endcomment %}
{{ text | escape }}                   {% comment %} HTML-escaped text {% endcomment %}
```

### Number Filters

```liquid
{{ 4.5 | ceil }}           {% comment %} 5 {% endcomment %}
{{ 4.5 | floor }}          {% comment %} 4 {% endcomment %}
{{ 4.5 | round }}          {% comment %} 5 {% endcomment %}
{{ 4 | plus: 2 }}          {% comment %} 6 {% endcomment %}
{{ 4 | minus: 2 }}         {% comment %} 2 {% endcomment %}
{{ 4 | times: 2 }}         {% comment %} 8 {% endcomment %}
{{ 4 | divided_by: 2 }}    {% comment %} 2 {% endcomment %}
{{ 5 | modulo: 2 }}        {% comment %} 1 {% endcomment %}
```

### Money Filters

```liquid
{{ product.price | money }}                    {% comment %} $10.00 {% endcomment %}
{{ product.price | money_with_currency }}      {% comment %} $10.00 USD {% endcomment %}
{{ product.price | money_without_currency }}   {% comment %} 10.00 {% endcomment %}
{{ product.price | money_without_trailing_zeros }} {% comment %} $10 {% endcomment %}
```

### Array Filters

```liquid
{{ collection.products | size }}        {% comment %} Number of items {% endcomment %}
{{ collection.products | first }}       {% comment %} First item {% endcomment %}
{{ collection.products | last }}        {% comment %} Last item {% endcomment %}
{{ array | join: ', ' }}                {% comment %} Comma-separated string {% endcomment %}
{{ array | sort: 'title' }}             {% comment %} Sort by property {% endcomment %}
{{ array | reverse }}                   {% comment %} Reverse order {% endcomment %}
{{ array | uniq }}                      {% comment %} Remove duplicates {% endcomment %}
{{ array | where: 'available', true }}  {% comment %} Filter by property {% endcomment %}
{{ array | map: 'title' }}              {% comment %} Extract property values {% endcomment %}
{{ array | concat: other_array }}       {% comment %} Combine arrays {% endcomment %}
```

### Image Filters

```liquid
{% comment %} Modern approach (recommended) {% endcomment %}
{{ section.settings.image | image_url: width: 800 | image_tag: class: 'hero-image', loading: 'lazy' }}

{% comment %} With srcset for responsive images {% endcomment %}
{{
  section.settings.image | image_url: width: 1600 | image_tag:
    srcset: section.settings.image | image_url: width: 400 | append: ' 400w,' |
            append: section.settings.image | image_url: width: 800 | append: ' 800w,' |
            append: section.settings.image | image_url: width: 1600 | append: ' 1600w',
    sizes: '(max-width: 768px) 100vw, 50vw',
    loading: 'lazy',
    class: 'responsive-image'
}}

{% comment %} Just get URL {% endcomment %}
{{ section.settings.image | image_url: width: 800 }}

{% comment %} Background image style {% endcomment %}
style="background-image: url('{{ section.settings.image | image_url: width: 1920 }}')"
```

### URL Filters

```liquid
{{ 'base.css' | asset_url }}                  {% comment %} Asset URL {% endcomment %}
{{ 'base.css' | asset_url | stylesheet_tag }} {% comment %} <link> tag {% endcomment %}
{{ 'theme.js' | asset_url | script_tag }}     {% comment %} <script> tag {% endcomment %}
{{ product | url }}                           {% comment %} Product URL {% endcomment %}
{{ collection | url }}                        {% comment %} Collection URL {% endcomment %}
{{ page | url }}                              {% comment %} Page URL {% endcomment %}
{{ '/search' | url }}                         {% comment %} Relative URL {% endcomment %}
```

### Date Filters

```liquid
{{ article.published_at | date: '%B %d, %Y' }}  {% comment %} January 15, 2024 {% endcomment %}
{{ 'now' | date: '%Y' }}                        {% comment %} Current year {% endcomment %}
```

### Translation Filter

```liquid
{{ 'products.add_to_cart' | t }}
{{ 'general.greeting' | t: name: customer.first_name }}
```

### Default Filter

```liquid
{{ section.settings.heading | default: 'Default Heading' }}
{{ product.featured_image | default: settings.placeholder_image }}
```

## Variables

### Assign

```liquid
{% assign button_text = section.settings.button_text | default: 'Learn more' %}
{% assign columns = section.settings.columns | default: 3 %}
{% assign grid_class = 'grid-cols-' | append: columns %}
```

### Capture

```liquid
{% capture hero_classes %}
  hero
  {% if section.settings.full_width %}hero--full{% endif %}
  {% if section.settings.dark_mode %}hero--dark{% endif %}
{% endcapture %}

<section class="{{ hero_classes | strip | strip_newlines }}">
```

## Snippets

### Render (Modern)

```liquid
{% render 'icon', icon: 'cart', size: 24 %}
{% render 'product-card', product: product, show_vendor: true %}
{% render 'button', text: section.settings.button_text, url: section.settings.button_link %}
```

Snippet file (`snippets/icon.liquid`):
```liquid
{% comment %}
  Renders an icon
  
  Accepts:
  - icon: {String} Icon name
  - size: {Number} Icon size in pixels (default: 20)
{% endcomment %}

{% assign icon_size = size | default: 20 %}

<svg width="{{ icon_size }}" height="{{ icon_size }}" class="icon icon-{{ icon }}">
  <use href="#icon-{{ icon }}"></use>
</svg>
```

### Include (Legacy - avoid)

```liquid
{% comment %} Deprecated, use render instead {% endcomment %}
{% include 'snippet-name' %}
```

## Common Patterns

### Responsive Image with Placeholder

```liquid
{% if section.settings.image != blank %}
  {{
    section.settings.image | image_url: width: 1200 | image_tag:
      class: 'section-image',
      loading: 'lazy',
      alt: section.settings.image.alt | default: section.settings.heading
  }}
{% else %}
  {{ 'image' | placeholder_svg_tag: 'placeholder-image' }}
{% endif %}
```

### Dynamic CSS from Settings

```liquid
{% style %}
  .section-{{ section.id }} {
    --section-padding-top: {{ section.settings.padding_top }}px;
    --section-padding-bottom: {{ section.settings.padding_bottom }}px;
    --section-bg-color: {{ section.settings.background_color }};
    --section-text-color: {{ section.settings.text_color }};
    padding-top: var(--section-padding-top);
    padding-bottom: var(--section-padding-bottom);
    background-color: var(--section-bg-color);
    color: var(--section-text-color);
  }
{% endstyle %}

<section class="section-{{ section.id }}">
```

### Conditional Class Building

```liquid
{% liquid
  assign section_classes = 'section'
  
  if section.settings.full_width
    assign section_classes = section_classes | append: ' section--full-width'
  endif
  
  if section.settings.layout == 'centered'
    assign section_classes = section_classes | append: ' section--centered'
  endif
%}

<section class="{{ section_classes }}">
```

### Grid from Settings

```liquid
{% assign grid_cols = section.settings.columns | default: 3 %}

<div class="grid" style="--grid-cols: {{ grid_cols }}">
  {% for block in section.blocks %}
    <div class="grid-item" {{ block.shopify_attributes }}>
      {{ block.settings.content }}
    </div>
  {% endfor %}
</div>

{% style %}
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols), 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
{% endstyle %}
```

### Visibility Classes

```liquid
{% liquid
  assign visibility_class = ''
  
  unless section.settings.show_on_mobile
    assign visibility_class = visibility_class | append: ' hide-mobile'
  endunless
  
  unless section.settings.show_on_desktop
    assign visibility_class = visibility_class | append: ' hide-desktop'
  endunless
%}

<section class="section{{ visibility_class }}">
```

## Global Objects

Access anywhere in theme:

- `shop` - Store info (`shop.name`, `shop.email`, `shop.currency`)
- `settings` - Theme settings from `settings_schema.json`
- `request` - Request info (`request.locale`, `request.page_type`)
- `routes` - URL routes (`routes.cart_url`, `routes.account_url`)
- `cart` - Cart object (`cart.item_count`, `cart.total_price`)
- `customer` - Logged-in customer (`customer.first_name`, `customer.email`)
- `collections` - All collections
- `pages` - All pages
- `blogs` - All blogs
- `linklists` - Navigation menus

## Forms

### Newsletter

```liquid
{% form 'customer', class: 'newsletter-form' %}
  <input type="email" name="contact[email]" placeholder="Email" required>
  <button type="submit">Subscribe</button>
{% endform %}
```

### Contact

```liquid
{% form 'contact', class: 'contact-form' %}
  <input type="text" name="contact[name]" placeholder="Name" required>
  <input type="email" name="contact[email]" placeholder="Email" required>
  <textarea name="contact[body]" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
{% endform %}
```

### Add to Cart

```liquid
{% form 'product', product, class: 'product-form' %}
  <select name="id">
    {% for variant in product.variants %}
      <option value="{{ variant.id }}" {% unless variant.available %}disabled{% endunless %}>
        {{ variant.title }} - {{ variant.price | money }}
      </option>
    {% endfor %}
  </select>
  
  <input type="number" name="quantity" value="1" min="1">
  
  <button type="submit" {% unless product.available %}disabled{% endunless %}>
    {% if product.available %}Add to cart{% else %}Sold out{% endif %}
  </button>
{% endform %}
```
