# SEO & Structured Data

Implementation guide for JSON-LD schemas, Open Graph tags, meta tags, and canonical URLs in Shopify themes.

## Overview

SEO optimization in Shopify themes includes:
- **Structured data** - JSON-LD for rich snippets
- **Open Graph** - Social media previews
- **Meta tags** - Search engine descriptions
- **Canonical URLs** - Duplicate content handling

---

## JSON-LD Structured Data

### Organization Schema (theme.liquid)
```liquid
{% comment %} snippets/json-ld-organization.liquid {% endcomment %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": {{ shop.name | json }},
  "url": {{ shop.url | json }},
  {%- if settings.social_facebook_link != blank -%}
  "sameAs": [
    {{ settings.social_facebook_link | json }}
    {%- if settings.social_twitter_link != blank -%},{{ settings.social_twitter_link | json }}{%- endif -%}
    {%- if settings.social_instagram_link != blank -%},{{ settings.social_instagram_link | json }}{%- endif -%}
    {%- if settings.social_youtube_link != blank -%},{{ settings.social_youtube_link | json }}{%- endif -%}
    {%- if settings.social_tiktok_link != blank -%},{{ settings.social_tiktok_link | json }}{%- endif -%}
    {%- if settings.social_pinterest_link != blank -%},{{ settings.social_pinterest_link | json }}{%- endif -%}
  ],
  {%- endif -%}
  {%- if settings.logo != blank -%}
  "logo": {
    "@type": "ImageObject",
    "url": {{ settings.logo | image_url: width: 600 | json }},
    "width": {{ settings.logo.width }},
    "height": {{ settings.logo.height }}
  },
  {%- endif -%}
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": {{ settings.contact_phone | default: '' | json }},
    "contactType": "customer service"
  }
}
</script>
```

### Product Schema
```liquid
{% comment %} snippets/json-ld-product.liquid {% endcomment %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 5000 | json }},
  "url": {{ canonical_url | json }},
  {%- if product.featured_image -%}
  "image": [
    {%- for image in product.images limit: 5 -%}
      {{ image | image_url: width: 1200 | json }}{% unless forloop.last %},{% endunless %}
    {%- endfor -%}
  ],
  {%- endif -%}
  "sku": {{ product.selected_or_first_available_variant.sku | json }},
  "mpn": {{ product.selected_or_first_available_variant.barcode | json }},
  "brand": {
    "@type": "Brand",
    "name": {{ product.vendor | json }}
  },
  {%- if product.metafields.reviews.rating.value != blank -%}
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": {{ product.metafields.reviews.rating.value.rating | json }},
    "reviewCount": {{ product.metafields.reviews.rating_count | json }},
    "bestRating": {{ product.metafields.reviews.rating.value.scale_max | json }},
    "worstRating": {{ product.metafields.reviews.rating.value.scale_min | json }}
  },
  {%- endif -%}
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": {{ cart.currency.iso_code | json }},
    "lowPrice": {{ product.price_min | money_without_currency | json }},
    "highPrice": {{ product.price_max | money_without_currency | json }},
    "offerCount": {{ product.variants.size }},
    "offers": [
      {%- for variant in product.variants -%}
      {
        "@type": "Offer",
        "name": {{ variant.title | json }},
        "url": {{ shop.url | append: variant.url | json }},
        "price": {{ variant.price | money_without_currency | json }},
        "priceCurrency": {{ cart.currency.iso_code | json }},
        "availability": "https://schema.org/{% if variant.available %}InStock{% else %}OutOfStock{% endif %}",
        "sku": {{ variant.sku | json }},
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": {{ shop.name | json }}
        }
        {%- if variant.barcode != blank -%}
        ,"gtin": {{ variant.barcode | json }}
        {%- endif -%}
      }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
}
</script>
```

### Collection Schema
```liquid
{% comment %} snippets/json-ld-collection.liquid {% endcomment %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": {{ collection.title | json }},
  "description": {{ collection.description | strip_html | json }},
  "url": {{ canonical_url | json }},
  {%- if collection.image -%}
  "image": {{ collection.image | image_url: width: 1200 | json }},
  {%- endif -%}
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": {{ collection.products_count }},
    "itemListElement": [
      {%- for product in collection.products limit: 10 -%}
      {
        "@type": "ListItem",
        "position": {{ forloop.index }},
        "url": {{ shop.url | append: product.url | json }},
        "name": {{ product.title | json }}
      }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
}
</script>
```

### Article/Blog Post Schema
```liquid
{% comment %} snippets/json-ld-article.liquid {% endcomment %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {{ article.title | json }},
  "description": {{ article.excerpt | default: article.content | strip_html | truncate: 160 | json }},
  "url": {{ canonical_url | json }},
  "datePublished": {{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' | json }},
  "dateModified": {{ article.updated_at | default: article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' | json }},
  {%- if article.image -%}
  "image": {
    "@type": "ImageObject",
    "url": {{ article.image | image_url: width: 1200 | json }},
    "width": 1200,
    "height": {{ 1200 | divided_by: article.image.aspect_ratio | round }}
  },
  {%- endif -%}
  "author": {
    "@type": "Person",
    "name": {{ article.author | json }}
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ shop.name | json }}
    {%- if settings.logo != blank -%}
    ,"logo": {
      "@type": "ImageObject",
      "url": {{ settings.logo | image_url: width: 600 | json }}
    }
    {%- endif -%}
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": {{ canonical_url | json }}
  }
  {%- if article.tags.size > 0 -%}
  ,"keywords": {{ article.tags | join: ', ' | json }}
  {%- endif -%}
}
</script>
```

### Breadcrumb Schema
```liquid
{% comment %} snippets/json-ld-breadcrumb.liquid {% endcomment %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": {{ 'general.breadcrumbs.home' | t | json }},
      "item": {{ shop.url | json }}
    }
    {%- if template.name == 'product' -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ collection.title | default: 'Products' | json }},
      "item": {{ collection.url | default: routes.all_products_collection_url | prepend: shop.url | json }}
    }
    ,{
      "@type": "ListItem",
      "position": 3,
      "name": {{ product.title | json }},
      "item": {{ canonical_url | json }}
    }
    {%- elsif template.name == 'collection' -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ collection.title | json }},
      "item": {{ canonical_url | json }}
    }
    {%- elsif template.name == 'article' -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ blog.title | json }},
      "item": {{ blog.url | prepend: shop.url | json }}
    }
    ,{
      "@type": "ListItem",
      "position": 3,
      "name": {{ article.title | json }},
      "item": {{ canonical_url | json }}
    }
    {%- endif -%}
  ]
}
</script>
```

### FAQ Schema
```liquid
{% comment %} For FAQ sections {% endcomment %}

{%- if section.blocks.size > 0 -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {%- for block in section.blocks -%}
    {%- if block.type == 'question' -%}
    {
      "@type": "Question",
      "name": {{ block.settings.question | json }},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": {{ block.settings.answer | strip_html | json }}
      }
    }{% unless forloop.last %},{% endunless %}
    {%- endif -%}
    {%- endfor -%}
  ]
}
</script>
{%- endif -%}
```

---

## Open Graph & Social Meta Tags

### Base Meta Tags (theme.liquid head)
```liquid
{% comment %} snippets/meta-tags.liquid {% endcomment %}

{%- comment -%} Basic SEO {%- endcomment -%}
<meta name="description" content="{{ page_description | escape }}">

{%- comment -%} Canonical URL {%- endcomment -%}
<link rel="canonical" href="{{ canonical_url }}">

{%- comment -%} Open Graph {%- endcomment -%}
<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:title" content="{{ page_title }}">
<meta property="og:description" content="{{ page_description | escape }}">
<meta property="og:type" content="{% if template.name == 'product' %}product{% elsif template.name == 'article' %}article{% else %}website{% endif %}">
<meta property="og:locale" content="{{ request.locale.iso_code | replace: '-', '_' }}">

{%- comment -%} OG Image {%- endcomment -%}
{%- if template.name == 'product' and product.featured_image -%}
  <meta property="og:image" content="{{ product.featured_image | image_url: width: 1200, height: 630, crop: 'center' }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{{ product.featured_image.alt | escape }}">
{%- elsif template.name == 'article' and article.image -%}
  <meta property="og:image" content="{{ article.image | image_url: width: 1200, height: 630, crop: 'center' }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
{%- elsif template.name == 'collection' and collection.image -%}
  <meta property="og:image" content="{{ collection.image | image_url: width: 1200, height: 630, crop: 'center' }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
{%- elsif settings.share_image -%}
  <meta property="og:image" content="{{ settings.share_image | image_url: width: 1200, height: 630, crop: 'center' }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
{%- endif -%}

{%- comment -%} Product-specific OG {%- endcomment -%}
{%- if template.name == 'product' -%}
  <meta property="product:price:amount" content="{{ product.price | money_without_currency }}">
  <meta property="product:price:currency" content="{{ cart.currency.iso_code }}">
  <meta property="product:availability" content="{% if product.available %}in stock{% else %}out of stock{% endif %}">
{%- endif -%}

{%- comment -%} Twitter Card {%- endcomment -%}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ page_title }}">
<meta name="twitter:description" content="{{ page_description | escape }}">
{%- if settings.social_twitter_link != blank -%}
  <meta name="twitter:site" content="@{{ settings.social_twitter_link | split: 'twitter.com/' | last | split: '/' | first }}">
{%- endif -%}

{%- comment -%} Article-specific meta {%- endcomment -%}
{%- if template.name == 'article' -%}
  <meta property="article:published_time" content="{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}">
  <meta property="article:modified_time" content="{{ article.updated_at | default: article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}">
  <meta property="article:author" content="{{ article.author }}">
  {%- for tag in article.tags -%}
    <meta property="article:tag" content="{{ tag }}">
  {%- endfor -%}
{%- endif -%}
```

---

## Canonical URLs

### Handling Pagination
```liquid
{%- comment -%} Proper canonical for paginated pages {%- endcomment -%}

{%- if current_page > 1 -%}
  <link rel="canonical" href="{{ canonical_url }}?page={{ current_page }}">
{%- else -%}
  <link rel="canonical" href="{{ canonical_url }}">
{%- endif -%}

{%- comment -%} Pagination rel links {%- endcomment -%}
{%- if paginate.previous -%}
  <link rel="prev" href="{{ paginate.previous.url }}">
{%- endif -%}
{%- if paginate.next -%}
  <link rel="next" href="{{ paginate.next.url }}">
{%- endif -%}
```

### Handling Variants
```liquid
{%- comment -%} Canonical for product variants {%- endcomment -%}

{%- comment -%} Always point to base product URL {%- endcomment -%}
<link rel="canonical" href="{{ shop.url }}{{ product.url }}">

{%- comment -%} Alternatively, if variants should be indexed separately {%- endcomment -%}
{%- if product.selected_variant -%}
  <link rel="canonical" href="{{ shop.url }}{{ product.url }}?variant={{ product.selected_variant.id }}">
{%- else -%}
  <link rel="canonical" href="{{ shop.url }}{{ product.url }}">
{%- endif -%}
```

### Handling Filters
```liquid
{%- comment -%} Collection pages with filters {%- endcomment -%}

{%- comment -%} Point to collection without filters {%- endcomment -%}
<link rel="canonical" href="{{ shop.url }}{{ collection.url }}">

{%- comment -%} For filtered pages, add noindex {%- endcomment -%}
{%- if current_tags.size > 0 or collection.filters.size > 0 -%}
  <meta name="robots" content="noindex, follow">
{%- endif -%}
```

---

## Sitemap & Robots

### robots.txt.liquid
```liquid
# Shopify Robots.txt
# Automatically generated

User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /*/checkouts
Disallow: /carts
Disallow: /account
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /search
Disallow: /apple-app-site-association
Disallow: /.well-known

{%- comment -%} Allow specific search pages if needed {%- endcomment -%}
Allow: /search?q=*

Sitemap: {{ shop.url }}/sitemap.xml

{%- comment -%} Custom additions from settings {%- endcomment -%}
{{ settings.robots_txt_additions }}
```

---

## Page Title Patterns

```liquid
{%- comment -%} snippets/page-title.liquid {% endcomment -%}

{%- case template.name -%}
  {%- when 'index' -%}
    {{ shop.name }}{% if settings.home_title_suffix %} | {{ settings.home_title_suffix }}{% endif %}

  {%- when 'product' -%}
    {{ product.title }} | {{ shop.name }}

  {%- when 'collection' -%}
    {%- if current_tags -%}
      {{ current_tags.first }} - {{ collection.title }} | {{ shop.name }}
    {%- else -%}
      {{ collection.title }} | {{ shop.name }}
    {%- endif -%}

  {%- when 'blog' -%}
    {{ blog.title }} | {{ shop.name }}

  {%- when 'article' -%}
    {{ article.title }} | {{ blog.title }} | {{ shop.name }}

  {%- when 'page' -%}
    {{ page.title }} | {{ shop.name }}

  {%- when 'search' -%}
    {{ 'general.search.title' | t }} | {{ shop.name }}

  {%- when 'cart' -%}
    {{ 'cart.general.title' | t }} | {{ shop.name }}

  {%- else -%}
    {{ page_title }} | {{ shop.name }}
{%- endcase -%}
```

---

## Performance SEO

### Preload Critical Resources
```liquid
{%- comment -%} In theme.liquid head {%- endcomment -%}

{%- comment -%} Preload LCP image {%- endcomment -%}
{%- if template.name == 'index' and section.settings.hero_image -%}
  <link rel="preload" as="image" href="{{ section.settings.hero_image | image_url: width: 1500 }}" fetchpriority="high">
{%- endif -%}

{%- comment -%} Preload fonts {%- endcomment -%}
{%- if settings.type_header_font != blank -%}
  <link rel="preload" href="{{ settings.type_header_font | font_url }}" as="font" type="font/woff2" crossorigin>
{%- endif -%}

{%- comment -%} DNS prefetch for external resources {%- endcomment -%}
<link rel="dns-prefetch" href="https://cdn.shopify.com">
<link rel="dns-prefetch" href="https://fonts.shopifycdn.com">
{%- if settings.enable_analytics -%}
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
{%- endif -%}

{%- comment -%} Preconnect for critical origins {%- endcomment -%}
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
```

### Image Alt Text Best Practices
```liquid
{%- comment -%} Product images {%- endcomment -%}
{{ image | image_url: width: 800 | image_tag:
  alt: image.alt | default: product.title,
  loading: 'lazy'
}}

{%- comment -%} Decorative images {%- endcomment -%}
{{ image | image_url: width: 800 | image_tag:
  alt: '',
  role: 'presentation',
  loading: 'lazy'
}}

{%- comment -%} Informative images with detailed alt {%- endcomment -%}
{{ product.featured_image | image_url: width: 800 | image_tag:
  alt: product.title | append: ' - ' | append: product.featured_image.alt | default: product.title
}}
```

---

## Testing & Validation

### Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Debugging in Liquid
```liquid
{%- if request.design_mode -%}
  <script>
    console.group('SEO Debug');
    console.log('Page Title:', document.title);
    console.log('Meta Description:', document.querySelector('meta[name="description"]')?.content);
    console.log('Canonical:', document.querySelector('link[rel="canonical"]')?.href);
    console.log('OG Image:', document.querySelector('meta[property="og:image"]')?.content);

    // Log JSON-LD
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script, i) => {
      console.log(`JSON-LD ${i + 1}:`, JSON.parse(script.textContent));
    });
    console.groupEnd();
  </script>
{%- endif -%}
```

---

## Checklist

### Per Page Type
| Page | Title | Description | Canonical | OG | JSON-LD |
|------|-------|-------------|-----------|----|---------|
| Home | ✓ | ✓ | ✓ | ✓ | Organization |
| Product | ✓ | ✓ | ✓ | ✓ | Product, Breadcrumb |
| Collection | ✓ | ✓ | ✓ | ✓ | CollectionPage, Breadcrumb |
| Article | ✓ | ✓ | ✓ | ✓ | BlogPosting, Breadcrumb |
| Page | ✓ | ✓ | ✓ | ✓ | WebPage |
| Search | ✓ | noindex | ✓ | ✓ | - |
| Cart | ✓ | noindex | ✓ | - | - |
