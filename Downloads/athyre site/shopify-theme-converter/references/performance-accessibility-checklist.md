# Performance & Accessibility Checklist

## Shopify Theme Store Requirements

Themes must meet these minimums:
- **Lighthouse Performance:** 60+ (desktop & mobile)
- **Lighthouse Accessibility:** 90+ (desktop & mobile)

Tested on: Home, Product, and Collection pages

---

## Part 1: Performance Checklist

### Critical Rendering Path

- [ ] **Defer non-critical CSS**
  ```liquid
  {% comment %} Preload critical CSS {% endcomment %}
  <link rel="preload" href="{{ 'critical.css' | asset_url }}" as="style">
  <link rel="stylesheet" href="{{ 'critical.css' | asset_url }}">

  {% comment %} Defer non-critical CSS {% endcomment %}
  <link rel="preload" href="{{ 'non-critical.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="{{ 'non-critical.css' | asset_url }}"></noscript>
  ```

- [ ] **Defer non-critical JavaScript**
  ```liquid
  {% comment %} Defer scripts {% endcomment %}
  <script src="{{ 'theme.js' | asset_url }}" defer></script>

  {% comment %} Or async for independent scripts {% endcomment %}
  <script src="{{ 'analytics.js' | asset_url }}" async></script>
  ```

- [ ] **Inline critical CSS** (above-the-fold styles)
  ```liquid
  <style>
    /* Critical styles for header, hero, etc. */
  </style>
  ```

### Images

- [ ] **Use responsive images**
  ```liquid
  {{ image | image_url: width: 800 | image_tag:
    loading: 'lazy',
    widths: '200, 400, 600, 800, 1000, 1200',
    sizes: '(max-width: 600px) 100vw, 50vw'
  }}
  ```

- [ ] **Lazy load below-the-fold images**
  ```liquid
  {% comment %} First image eager, rest lazy {% endcomment %}
  {% for image in product.images %}
    {{ image | image_url: width: 800 | image_tag:
      loading: forloop.first | ternary: 'eager', 'lazy'
    }}
  {% endfor %}
  ```

- [ ] **Specify image dimensions** (prevents layout shift)
  ```liquid
  {{ image | image_url: width: 800 | image_tag:
    width: image.width,
    height: image.height
  }}
  ```

- [ ] **Use WebP format** (Shopify auto-converts)
  ```liquid
  {% comment %} Shopify CDN serves WebP to supporting browsers {% endcomment %}
  {{ image | image_url: width: 800 }}
  ```

- [ ] **Preload hero/LCP image**
  ```liquid
  {% comment %} In theme.liquid <head> {% endcomment %}
  {% if template == 'index' %}
    {% assign hero_image = section.settings.image %}
    {% if hero_image %}
      <link rel="preload" as="image" href="{{ hero_image | image_url: width: 1920 }}">
    {% endif %}
  {% endif %}
  ```

### Fonts

- [ ] **Preload critical fonts**
  ```liquid
  <link rel="preload" href="{{ 'font.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>
  ```

- [ ] **Use font-display: swap**
  ```css
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap;
  }
  ```

- [ ] **Subset fonts** (remove unused characters)

- [ ] **Prefer system fonts** where possible
  ```css
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  ```

### Third-Party Scripts

- [ ] **Audit third-party scripts**
  - Remove unused apps/integrations
  - Defer non-critical scripts
  - Use facade patterns for heavy embeds

- [ ] **Facade pattern for videos**
  ```liquid
  {% comment %} Don't load YouTube iframe until clicked {% endcomment %}
  <div class="video-facade" data-video-id="{{ section.settings.video_id }}">
    <img src="https://img.youtube.com/vi/{{ section.settings.video_id }}/maxresdefault.jpg"
         alt="Play video"
         loading="lazy">
    <button class="play-button" aria-label="Play video">▶</button>
  </div>
  ```

- [ ] **Load chat widgets on interaction**
  ```javascript
  // Don't load chat until user scrolls or clicks
  const loadChat = () => {
    // Load chat script
  };
  window.addEventListener('scroll', loadChat, { once: true });
  document.querySelector('[data-open-chat]')?.addEventListener('click', loadChat, { once: true });
  ```

### JavaScript Optimization

- [ ] **Code splitting** (load only what's needed)
  ```javascript
  // Load cart JS only when needed
  document.querySelector('[data-cart-trigger]')?.addEventListener('click', async () => {
    const { CartDrawer } = await import('./cart-drawer.js');
    new CartDrawer();
  });
  ```

- [ ] **Remove unused JavaScript**
  - No jQuery if not needed
  - Remove console.logs
  - Tree-shake imports

- [ ] **Debounce/throttle event handlers**
  ```javascript
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  window.addEventListener('resize', debounce(handleResize, 250));
  ```

### Cumulative Layout Shift (CLS)

- [ ] **Reserve space for dynamic content**
  ```css
  .product-image-container {
    aspect-ratio: 1 / 1;
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  ```

- [ ] **Set dimensions on images and videos**

- [ ] **Avoid inserting content above existing content**

- [ ] **Use transform for animations** (not top/left/width/height)

---

## Part 2: Accessibility Checklist

### Semantic HTML

- [ ] **Use correct heading hierarchy**
  ```html
  <h1>Page Title</h1>           <!-- One per page -->
  <h2>Section Title</h2>
  <h3>Subsection</h3>
  <h2>Another Section</h2>      <!-- Can go back to h2 -->
  ```

- [ ] **Use semantic elements**
  ```html
  <header>...</header>
  <nav>...</nav>
  <main>...</main>
  <article>...</article>
  <aside>...</aside>
  <footer>...</footer>
  <section aria-label="...">...</section>
  ```

- [ ] **Use lists for list content**
  ```html
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
  ```

- [ ] **Use buttons for actions, links for navigation**
  ```html
  <button type="button">Add to Cart</button>  <!-- Action -->
  <a href="/products">View Products</a>       <!-- Navigation -->
  ```

### Skip Links

- [ ] **Add skip link to main content**
  ```liquid
  {% comment %} First element in body {% endcomment %}
  <a href="#main-content" class="skip-to-content">
    {{ 'accessibility.skip_to_content' | t }}
  </a>

  {% comment %} On main element {% endcomment %}
  <main id="main-content" tabindex="-1">
    ...
  </main>
  ```

  ```css
  .skip-to-content {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .skip-to-content:focus {
    position: fixed;
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    padding: 1rem;
    background: var(--color-background);
    z-index: 9999;
  }
  ```

### Images

- [ ] **All images have alt text**
  ```liquid
  {{ image | image_url: width: 400 | image_tag:
    alt: image.alt | default: product.title
  }}
  ```

- [ ] **Decorative images have empty alt**
  ```liquid
  {{ decorative_image | image_url: width: 100 | image_tag: alt: '' }}
  ```

- [ ] **Complex images have extended descriptions**
  ```html
  <figure>
    <img src="chart.png" alt="Sales chart showing 40% growth">
    <figcaption>Quarterly sales increased from $1M to $1.4M</figcaption>
  </figure>
  ```

### Color & Contrast

- [ ] **Minimum contrast ratio 4.5:1** (normal text)
- [ ] **Minimum contrast ratio 3:1** (large text, UI components)
- [ ] **Don't rely on color alone**
  ```html
  <!-- Bad: color only -->
  <span class="error">Invalid email</span>

  <!-- Good: color + icon + text -->
  <span class="error" role="alert">
    <svg aria-hidden="true">...</svg>
    Error: Invalid email format
  </span>
  ```

### Forms

- [ ] **All inputs have labels**
  ```html
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>
  ```

- [ ] **Required fields indicated**
  ```html
  <label for="email">
    Email <span aria-hidden="true">*</span>
    <span class="visually-hidden">required</span>
  </label>
  ```

- [ ] **Error messages associated with inputs**
  ```html
  <input type="email" id="email" aria-describedby="email-error" aria-invalid="true">
  <span id="email-error" class="error">Please enter a valid email</span>
  ```

- [ ] **Group related fields**
  ```html
  <fieldset>
    <legend>Shipping Address</legend>
    <!-- Address fields -->
  </fieldset>
  ```

### Interactive Elements

- [ ] **Focus visible on all interactive elements**
  ```css
  :focus {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  :focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
  ```

- [ ] **Touch targets minimum 44x44px**
  ```css
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
  ```

- [ ] **Keyboard accessible**
  ```javascript
  // Handle Enter and Space for custom controls
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  });
  ```

### ARIA

- [ ] **Use ARIA only when necessary**
  ```html
  <!-- Don't: unnecessary ARIA -->
  <button role="button">Click me</button>

  <!-- Do: native element is sufficient -->
  <button>Click me</button>
  ```

- [ ] **Icon-only buttons have labels**
  ```html
  <button aria-label="Close menu">
    <svg aria-hidden="true">...</svg>
  </button>
  ```

- [ ] **Live regions for dynamic content**
  ```html
  <div aria-live="polite" aria-atomic="true" class="cart-notification">
    <!-- Cart update messages appear here -->
  </div>
  ```

- [ ] **Modal focus trapping**
  ```javascript
  // Trap focus in modal
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
  ```

### Media

- [ ] **Videos have captions**
- [ ] **Audio has transcripts**
- [ ] **No auto-playing media with sound**
  ```html
  <video autoplay muted playsinline>
    <!-- Autoplay only with muted -->
  </video>
  ```

---

## Part 3: Testing Tools

### Automated Testing

| Tool | What It Tests |
|------|--------------|
| Lighthouse | Performance, Accessibility, SEO, Best Practices |
| WAVE | Accessibility |
| axe DevTools | Accessibility |
| PageSpeed Insights | Core Web Vitals |
| WebPageTest | Loading performance |

### Manual Testing

- [ ] Navigate with keyboard only (Tab, Enter, Space, Escape, Arrow keys)
- [ ] Use screen reader (VoiceOver, NVDA, JAWS)
- [ ] Test with browser zoom at 200%
- [ ] Test with slow network (DevTools throttling)
- [ ] Test on real mobile devices

### Shopify CLI Testing

```bash
# Run theme check for issues
shopify theme check

# Preview theme with debug info
shopify theme dev --live-reload=full
```

---

## Part 4: Common Issues & Fixes

### Performance Issues

| Issue | Fix |
|-------|-----|
| Large images | Use responsive images with srcset |
| Render-blocking CSS | Defer non-critical CSS |
| Unused JavaScript | Code splitting, tree shaking |
| No lazy loading | Add `loading="lazy"` to images |
| Layout shift | Reserve space, set dimensions |
| Slow fonts | Preload, font-display: swap |
| Heavy third-party scripts | Defer, facade patterns |

### Accessibility Issues

| Issue | Fix |
|-------|-----|
| Missing skip link | Add skip-to-content link |
| Heading hierarchy broken | Fix h1→h2→h3 order |
| Missing alt text | Add descriptive alt to images |
| Low contrast | Increase contrast to 4.5:1+ |
| Focus not visible | Add :focus-visible styles |
| Small touch targets | Min 44x44px |
| ARIA misuse | Use semantic HTML first |
| Missing form labels | Add label elements |
| Keyboard trap | Ensure Escape closes modals |
| Auto-playing audio | Remove or mute by default |

---

## Part 5: Liquid Performance Tips

### Avoid Expensive Loops

```liquid
{% comment %} BAD: Nested loops {% endcomment %}
{% for product in collection.products %}
  {% for variant in product.variants %}
    {% for option in variant.options %}
      ...
    {% endfor %}
  {% endfor %}
{% endfor %}

{% comment %} BETTER: Limit loops, use pagination {% endcomment %}
{% paginate collection.products by 12 %}
  {% for product in collection.products %}
    ...
  {% endfor %}
{% endpaginate %}
```

### Use `limit` Where Possible

```liquid
{% comment %} Only get what you need {% endcomment %}
{% for article in blog.articles limit: 3 %}
  ...
{% endfor %}
```

### Cache Repeated Calculations

```liquid
{% comment %} Assign once, use many times {% endcomment %}
{% assign formatted_price = product.price | money %}
{{ formatted_price }}
```

### Use Section Rendering API

```javascript
// Refresh only the section that changed
async function refreshCartSection() {
  const response = await fetch('/?sections=cart-drawer');
  const data = await response.json();
  document.querySelector('[data-cart-drawer]').innerHTML = data['cart-drawer'];
}
```

---

## Part 6: Pre-Launch Checklist

### Performance

- [ ] Lighthouse Performance 60+ on all key pages
- [ ] LCP under 2.5 seconds
- [ ] FID under 100ms
- [ ] CLS under 0.1
- [ ] All images lazy loaded (except hero)
- [ ] Critical CSS inlined
- [ ] JavaScript deferred

### Accessibility

- [ ] Lighthouse Accessibility 90+ on all key pages
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Skip link present
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Contrast ratios meet WCAG AA

### Run Final Checks

```bash
# Theme check
shopify theme check --fail-level=error

# Build and measure
shopify theme package
```
