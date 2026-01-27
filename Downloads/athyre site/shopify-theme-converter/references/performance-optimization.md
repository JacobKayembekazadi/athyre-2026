# Performance Optimization

Guide for building fast Shopify themes.

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 200ms | WebPageTest |
| Total Page Weight | < 2MB | DevTools |

---

## Image Optimization

### Responsive Images

```liquid
{%- comment -%} Always provide multiple sizes {%- endcomment -%}
{{ image | image_url: width: 1500 | image_tag:
  widths: '165, 360, 535, 750, 1000, 1500',
  sizes: '(min-width: 1200px) 500px, (min-width: 750px) 50vw, 100vw',
  loading: 'lazy'
}}
```

### Lazy Loading

```liquid
{%- comment -%} Eager load above-the-fold images {%- endcomment -%}
{%- if forloop.first -%}
  {{ image | image_url: width: 1500 | image_tag:
    loading: 'eager',
    fetchpriority: 'high'
  }}
{%- else -%}
  {{ image | image_url: width: 1500 | image_tag:
    loading: 'lazy'
  }}
{%- endif -%}
```

### Preload Critical Images

```liquid
{%- comment -%} In theme.liquid head {%- endcomment -%}
{%- if template == 'index' -%}
  {%- assign hero_image = sections['hero'].settings.image -%}
  {%- if hero_image -%}
    <link
      rel="preload"
      as="image"
      href="{{ hero_image | image_url: width: 1500 }}"
      imagesrcset="{{ hero_image | image_url: width: 750 }} 750w, {{ hero_image | image_url: width: 1500 }} 1500w"
      imagesizes="100vw"
    >
  {%- endif -%}
{%- endif -%}
```

### Image Aspect Ratios (Prevent CLS)

```liquid
{%- comment -%} Reserve space for images before they load {%- endcomment -%}
{%- liquid
  assign aspect_ratio = image.aspect_ratio | default: 1
  assign padding_bottom = 1 | divided_by: aspect_ratio | times: 100
-%}

<div class="image-wrapper" style="padding-bottom: {{ padding_bottom }}%">
  {{ image | image_url: width: 600 | image_tag: loading: 'lazy' }}
</div>
```

```css
.image-wrapper {
  position: relative;
  overflow: hidden;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## CSS Optimization

### Critical CSS

```liquid
{%- comment -%} Inline critical CSS in head {%- endcomment -%}
<style>
  /* Only above-the-fold styles */
  body { margin: 0; font-family: system-ui, sans-serif; }
  .header { position: sticky; top: 0; }
  .hero { min-height: 60vh; }
</style>

{%- comment -%} Defer non-critical CSS {%- endcomment -%}
<link rel="preload" href="{{ 'base.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{{ 'base.css' | asset_url }}"></noscript>
```

### Conditional CSS Loading

```liquid
{%- comment -%} Only load CSS when section is present {%- endcomment -%}
{%- if section.settings.enable_slider -%}
  {{ 'component-slider.css' | asset_url | stylesheet_tag }}
{%- endif -%}

{%- comment -%} Page-specific CSS {%- endcomment -%}
{%- case template.name -%}
  {%- when 'product' -%}
    {{ 'template-product.css' | asset_url | stylesheet_tag }}
  {%- when 'collection' -%}
    {{ 'template-collection.css' | asset_url | stylesheet_tag }}
{%- endcase -%}
```

### Minimize Render-Blocking

```liquid
{%- comment -%} Print styles shouldn't block render {%- endcomment -%}
<link rel="stylesheet" href="{{ 'print.css' | asset_url }}" media="print">
```

---

## JavaScript Optimization

### Defer Non-Critical JS

```liquid
{%- comment -%} All custom JS should be deferred {%- endcomment -%}
<script src="{{ 'theme.js' | asset_url }}" defer></script>

{%- comment -%} Component-specific JS loaded when needed {%- endcomment -%}
{%- if section.type == 'slideshow' -%}
  <script src="{{ 'component-slideshow.js' | asset_url }}" defer></script>
{%- endif -%}
```

### Lazy Load Components

```javascript
// Load heavy components on interaction
document.querySelector('[data-search-trigger]')?.addEventListener('click', async () => {
  const { PredictiveSearch } = await import('./predictive-search.js');
  new PredictiveSearch();
}, { once: true });

// Load on scroll into view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      import('./heavy-component.js');
      observer.disconnect();
    }
  });
});

document.querySelectorAll('[data-lazy-component]').forEach(el => {
  observer.observe(el);
});
```

### Minimize JavaScript

```liquid
{%- comment -%} Don't load JS if not needed {%- endcomment -%}
{%- if product.has_only_default_variant -%}
  {%- comment -%} Skip variant JS {%- endcomment -%}
{%- else -%}
  <script src="{{ 'variant-selects.js' | asset_url }}" defer></script>
{%- endif -%}
```

---

## Font Optimization

### Font Display Swap

```liquid
{%- comment -%} In settings_schema.json {%- endcomment -%}
{%- comment -%} Use system fonts when possible {%- endcomment -%}

{%- comment -%} Custom fonts with display swap {%- endcomment -%}
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('{{ "custom-font.woff2" | asset_url }}') format('woff2');
    font-display: swap;
    font-weight: 400;
  }
</style>
```

### Preload Critical Fonts

```liquid
{%- comment -%} Only preload fonts used above the fold {%- endcomment -%}
<link
  rel="preload"
  href="{{ settings.type_header_font | font_url }}"
  as="font"
  type="font/woff2"
  crossorigin
>
```

### System Font Stack

```css
/* Fast, no network request */
body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    sans-serif;
}
```

---

## Liquid Optimization

### Minimize Liquid Processing

```liquid
{%- comment -%} Bad: Multiple calls to same object {%- endcomment -%}
{{ product.title }}
{{ product.title | upcase }}
{{ product.title | size }}

{%- comment -%} Good: Assign once, reuse {%- endcomment -%}
{%- assign product_title = product.title -%}
{{ product_title }}
{{ product_title | upcase }}
{{ product_title | size }}
```

### Avoid Nested Loops

```liquid
{%- comment -%} Bad: O(n²) complexity {%- endcomment -%}
{%- for product in collection.products -%}
  {%- for variant in product.variants -%}
    ...
  {%- endfor -%}
{%- endfor -%}

{%- comment -%} Better: Limit inner loop {%- endcomment -%}
{%- for product in collection.products -%}
  {%- for variant in product.variants limit: 3 -%}
    ...
  {%- endfor -%}
{%- endfor -%}
```

### Paginate Large Collections

```liquid
{%- comment -%} Always paginate products {%- endcomment -%}
{%- paginate collection.products by 12 -%}
  {%- for product in collection.products -%}
    {% render 'product-card', product: product %}
  {%- endfor -%}

  {% render 'pagination', paginate: paginate %}
{%- endpaginate -%}
```

### Caching with Capture

```liquid
{%- comment -%} Cache complex logic {%- endcomment -%}
{%- capture product_badges -%}
  {%- if product.compare_at_price > product.price -%}
    <span class="badge badge--sale">Sale</span>
  {%- endif -%}
  {%- unless product.available -%}
    <span class="badge badge--sold-out">Sold out</span>
  {%- endunless -%}
{%- endcapture -%}

{%- comment -%} Use captured content multiple times {%- endcomment -%}
{{ product_badges }}
```

---

## Third-Party Scripts

### Defer Analytics

```liquid
{%- comment -%} Load analytics after page is interactive {%- endcomment -%}
<script>
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Load analytics after 2 seconds
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
      document.head.appendChild(script);
    }, 2000);
  });
</script>
```

### Lazy Load Chat Widgets

```liquid
{%- comment -%} Load chat on user interaction {%- endcomment -%}
<script>
  let chatLoaded = false;

  function loadChat() {
    if (chatLoaded) return;
    chatLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://chat-widget.example.com/embed.js';
    document.body.appendChild(script);
  }

  // Load on scroll or after delay
  window.addEventListener('scroll', loadChat, { once: true });
  setTimeout(loadChat, 5000);
</script>
```

### Facade Pattern for Embeds

```liquid
{%- comment -%} YouTube facade - load video on click {%- endcomment -%}
<lite-youtube videoid="{{ section.settings.video_id }}">
  <button type="button" class="video-play-btn">
    <span class="visually-hidden">Play video</span>
  </button>
</lite-youtube>
```

```javascript
class LiteYouTube extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', () => this.loadVideo(), { once: true });
  }

  loadVideo() {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${this.getAttribute('videoid')}?autoplay=1`;
    iframe.allow = 'autoplay; encrypted-media';
    this.appendChild(iframe);
  }
}
customElements.define('lite-youtube', LiteYouTube);
```

---

## Caching Strategies

### Browser Caching Headers

Shopify CDN handles this automatically for:
- Theme assets (CSS, JS, images)
- Product images
- Static files

### Section Rendering Caching

```javascript
// Use section rendering API for AJAX updates
async function updateCart() {
  const response = await fetch('/?sections=cart-drawer,cart-icon');
  const data = await response.json();

  // Cached section HTML
  document.querySelector('#cart-drawer').innerHTML = data['cart-drawer'];
}
```

---

## Monitoring Performance

### Built-in Tools

```liquid
{%- comment -%} Check Liquid render time {%- endcomment -%}
{%- comment -%} Use Shopify Theme Inspector for Chrome {%- endcomment -%}
```

### Performance Budget

Create a performance budget file:

```json
{
  "resourceSizes": [
    { "resourceType": "document", "budget": 50 },
    { "resourceType": "script", "budget": 200 },
    { "resourceType": "stylesheet", "budget": 100 },
    { "resourceType": "image", "budget": 500 },
    { "resourceType": "font", "budget": 100 }
  ],
  "timings": [
    { "metric": "first-contentful-paint", "budget": 1500 },
    { "metric": "largest-contentful-paint", "budget": 2500 },
    { "metric": "cumulative-layout-shift", "budget": 0.1 }
  ]
}
```

---

## Quick Wins Checklist

- [ ] Lazy load all images below the fold
- [ ] Preload hero image
- [ ] Defer all JavaScript
- [ ] Use font-display: swap
- [ ] Paginate collections (max 24 per page)
- [ ] Minimize third-party scripts
- [ ] Use responsive images with srcset
- [ ] Reserve space for images (prevent CLS)
- [ ] Inline critical CSS
- [ ] Remove unused CSS/JS
