# Sticky Elements Patterns

Implementation guide for sticky headers, product info panels, sidebars, and scroll-aware behaviors using CSS and Intersection Observer.

## Overview

Sticky elements improve UX by keeping important content visible:
- **Sticky header** - Navigation always accessible
- **Sticky product info** - Add to cart visible on scroll
- **Sticky sidebar** - Filters stay visible while browsing
- **Sticky announcement** - Promotions remain visible

---

## CSS position: sticky

### Basic Usage
```css
.sticky-element {
  position: sticky;
  top: 0; /* Required offset */
  z-index: 10;
}
```

### Requirements for sticky to work:
1. Parent cannot have `overflow: hidden` or `overflow: auto`
2. Must have defined `top`, `bottom`, `left`, or `right`
3. Parent needs sufficient height to scroll within
4. No ancestor with `transform` that creates new stacking context

---

## Sticky Header

### React Input
```jsx
function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className={`header ${isSticky ? 'header--sticky' : ''}`}>
      {/* Header content */}
    </header>
  );
}
```

### Shopify Section
```liquid
{% comment %} sections/header.liquid {% endcomment %}

<style>
  :root {
    --header-height: 80px;
    --header-height-sticky: 64px;
    --announcement-height: {{ section.settings.announcement_height }}px;
  }

  .header-wrapper {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header {
    background: var(--color-background);
    height: var(--header-height);
    transition: height 0.3s ease, box-shadow 0.3s ease;
  }

  .header.is-sticky {
    height: var(--header-height-sticky);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header.is-sticky .header-logo img {
    transform: scale(0.8);
  }

  /* Hide announcement on sticky */
  .header.is-sticky + .announcement-bar {
    transform: translateY(-100%);
    opacity: 0;
  }

  /* Account for header height in body */
  body {
    padding-top: var(--header-height);
  }

  /* Anchor offset for sticky header */
  :target::before {
    content: '';
    display: block;
    height: calc(var(--header-height) + 1rem);
    margin-top: calc(-1 * (var(--header-height) + 1rem));
  }
</style>

<div class="header-wrapper" data-header-wrapper>
  <header class="header" id="header" data-header role="banner">
    <div class="header-container">
      <a href="{{ routes.root_url }}" class="header-logo">
        {%- if section.settings.logo -%}
          {{ section.settings.logo | image_url: width: 200 | image_tag }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>

      <nav class="header-nav" role="navigation">
        {% render 'header-menu', menu: section.settings.menu %}
      </nav>

      <div class="header-actions">
        {% render 'header-icons' %}
      </div>
    </div>
  </header>

  {%- if section.settings.show_announcement -%}
    <div class="announcement-bar">
      {{ section.settings.announcement_text }}
    </div>
  {%- endif -%}
</div>

<script>
  (function() {
    const header = document.querySelector('[data-header]');
    const sentinel = document.createElement('div');

    // Create sentinel element for intersection detection
    sentinel.className = 'header-sentinel';
    sentinel.style.cssText = 'position: absolute; top: 0; left: 0; height: 1px; width: 100%; pointer-events: none;';
    header.parentNode.insertBefore(sentinel, header);

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('is-sticky', !entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      }
    );

    observer.observe(sentinel);
  })();
</script>

{% schema %}
{
  "name": "Header",
  "settings": [
    {
      "type": "image_picker",
      "id": "logo",
      "label": "Logo"
    },
    {
      "type": "link_list",
      "id": "menu",
      "label": "Menu",
      "default": "main-menu"
    },
    {
      "type": "checkbox",
      "id": "enable_sticky",
      "label": "Enable sticky header",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_announcement",
      "label": "Show announcement bar",
      "default": false
    },
    {
      "type": "text",
      "id": "announcement_text",
      "label": "Announcement text"
    }
  ]
}
{% endschema %}
```

### Header with Hide on Scroll
```javascript
// assets/header-scroll.js

class ScrollHeader {
  constructor() {
    this.header = document.querySelector('[data-header]');
    this.lastScrollY = 0;
    this.ticking = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }

  onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => this.update());
      this.ticking = true;
    }
  }

  update() {
    const currentScrollY = window.scrollY;
    const headerHeight = this.header.offsetHeight;

    // Show header when scrolling up, hide when scrolling down
    if (currentScrollY > this.lastScrollY && currentScrollY > headerHeight) {
      // Scrolling down - hide
      this.header.classList.add('is-hidden');
    } else {
      // Scrolling up - show
      this.header.classList.remove('is-hidden');
    }

    // Add sticky class when past threshold
    this.header.classList.toggle('is-sticky', currentScrollY > 10);

    this.lastScrollY = currentScrollY;
    this.ticking = false;
  }
}

new ScrollHeader();
```

```css
/* Hide on scroll styles */
.header {
  transition: transform 0.3s ease, height 0.3s ease;
}

.header.is-hidden {
  transform: translateY(-100%);
}

/* Don't hide when drawer is open */
body.drawer-open .header.is-hidden {
  transform: translateY(0);
}
```

---

## Sticky Product Info

### Implementation
```liquid
{% comment %} Product page with sticky add-to-cart {% endcomment %}

<div class="product-page">
  <div class="product-gallery">
    {% render 'product-gallery', product: product %}
  </div>

  <div class="product-info-wrapper">
    <div class="product-info" data-sticky-info>
      <h1 class="product-title">{{ product.title }}</h1>
      {% render 'price', product: product %}

      {%- form 'product', product, data-product-form: '' -%}
        {% render 'product-variants', product: product %}

        <button type="submit" class="btn btn--primary btn--full">
          {{ 'products.product.add_to_cart' | t }}
        </button>
      {%- endform -%}

      <div class="product-description">
        {{ product.description }}
      </div>
    </div>
  </div>
</div>

<style>
  .product-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .product-info-wrapper {
    /* Create containing block for sticky */
    position: relative;
  }

  .product-info {
    position: sticky;
    top: calc(var(--header-height, 80px) + 2rem);
  }

  @media (max-width: 768px) {
    .product-page {
      grid-template-columns: 1fr;
    }

    .product-info {
      position: static; /* Disable sticky on mobile */
    }
  }
</style>
```

---

## Sticky Sidebar (Collection Filters)

### Implementation
```liquid
{% comment %} Collection page with sticky filters {% endcomment %}

<div class="collection-page">
  <aside class="collection-sidebar" data-sticky-sidebar>
    <div class="sidebar-content">
      <h2 class="sidebar-title">{{ 'collections.filtering.title' | t }}</h2>

      {%- for filter in collection.filters -%}
        {% render 'filter-group', filter: filter %}
      {%- endfor -%}

      <button type="button" class="btn btn--secondary" data-clear-filters>
        {{ 'collections.filtering.clear_all' | t }}
      </button>
    </div>
  </aside>

  <div class="collection-products">
    {% render 'product-grid', collection: collection %}
  </div>
</div>

<style>
  .collection-page {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .collection-sidebar {
    position: sticky;
    top: calc(var(--header-height, 80px) + 1rem);
    max-height: calc(100vh - var(--header-height, 80px) - 2rem);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Custom scrollbar for sidebar */
  .collection-sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .collection-sidebar::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  @media (max-width: 1024px) {
    .collection-page {
      grid-template-columns: 1fr;
    }

    .collection-sidebar {
      position: static;
      max-height: none;
    }
  }
</style>
```

---

## Sticky Table of Contents

```liquid
{% comment %} Article page with sticky ToC {% endcomment %}

<article class="article-page">
  <aside class="article-toc" data-sticky-toc>
    <nav aria-label="Table of contents">
      <h2 class="toc-title">{{ 'blogs.article.toc' | t }}</h2>
      <ul class="toc-list" data-toc-list>
        {%- comment -%} Generated via JavaScript {%- endcomment -%}
      </ul>
    </nav>
  </aside>

  <div class="article-content" data-article-content>
    {{ article.content }}
  </div>
</article>

<script>
  (function() {
    const content = document.querySelector('[data-article-content]');
    const tocList = document.querySelector('[data-toc-list]');

    if (!content || !tocList) return;

    const headings = content.querySelectorAll('h2, h3');

    // Generate TOC
    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = `toc-item toc-item--${heading.tagName.toLowerCase()}`;

      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = heading.textContent;
      link.className = 'toc-link';

      li.appendChild(link);
      tocList.appendChild(li);
    });

    // Highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const link = tocList.querySelector(`[href="#${entry.target.id}"]`);
          if (entry.isIntersecting) {
            tocList.querySelectorAll('.toc-link').forEach(l => l.classList.remove('is-active'));
            link?.classList.add('is-active');
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    );

    headings.forEach(heading => observer.observe(heading));
  })();
</script>

<style>
  .article-page {
    display: grid;
    grid-template-columns: 1fr 250px;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .article-toc {
    order: 2;
    position: sticky;
    top: calc(var(--header-height, 80px) + 2rem);
    align-self: start;
  }

  .toc-title {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    color: var(--color-text-muted);
  }

  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid var(--color-border);
  }

  .toc-item {
    margin: 0;
  }

  .toc-item--h3 {
    padding-left: 1rem;
  }

  .toc-link {
    display: block;
    padding: 0.5rem 1rem;
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    border-left: 2px solid transparent;
    margin-left: -2px;
    transition: color 0.2s, border-color 0.2s;
  }

  .toc-link:hover {
    color: var(--color-text);
  }

  .toc-link.is-active {
    color: var(--color-primary);
    border-left-color: var(--color-primary);
  }

  .article-content {
    order: 1;
  }

  @media (max-width: 1024px) {
    .article-page {
      grid-template-columns: 1fr;
    }

    .article-toc {
      display: none; /* Hide on mobile or convert to dropdown */
    }
  }
</style>
```

---

## Intersection Observer Utilities

### JavaScript Helper
```javascript
// assets/sticky-observer.js

/**
 * Creates a sticky behavior with callbacks
 */
function createStickyObserver(element, options = {}) {
  const {
    offset = 0,
    onStick = () => {},
    onUnstick = () => {}
  } = options;

  // Create sentinel
  const sentinel = document.createElement('div');
  sentinel.className = 'sticky-sentinel';
  sentinel.style.cssText = `
    position: absolute;
    top: ${offset}px;
    left: 0;
    height: 1px;
    width: 100%;
    pointer-events: none;
  `;

  element.style.position = 'relative';
  element.insertBefore(sentinel, element.firstChild);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        onUnstick(element);
        element.classList.remove('is-sticky');
      } else {
        onStick(element);
        element.classList.add('is-sticky');
      }
    },
    {
      threshold: 0,
      rootMargin: `${-offset}px 0px 0px 0px`
    }
  );

  observer.observe(sentinel);

  return {
    disconnect: () => {
      observer.disconnect();
      sentinel.remove();
    }
  };
}

// Usage
createStickyObserver(document.querySelector('[data-header]'), {
  offset: 0,
  onStick: (el) => console.log('Header is now sticky'),
  onUnstick: (el) => console.log('Header is no longer sticky')
});
```

### Scroll Progress Indicator
```liquid
{% comment %} Scroll progress bar {% endcomment %}

<div class="scroll-progress" data-scroll-progress></div>

<style>
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--color-primary);
    z-index: 101;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s ease-out;
  }
</style>

<script>
  (function() {
    const progress = document.querySelector('[data-scroll-progress]');
    if (!progress) return;

    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / scrollHeight;
      progress.style.transform = `scaleX(${scrollProgress})`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  })();
</script>
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Sticky not working | Parent has `overflow: hidden` | Remove overflow or use different container |
| Jumps when sticky activates | Height change on stick | Use `min-height` or fixed height |
| Z-index conflicts | Multiple sticky elements | Manage z-index hierarchy carefully |
| Mobile keyboard issues | Sticky on input focus | Disable sticky during input focus |
| Performance issues | Too many sticky elements | Use `will-change: transform` sparingly |

---

## Accessibility Considerations

- Sticky content should not obscure important interactive elements
- Skip links should account for sticky header offset
- Focus management when sticky elements change
- Announce sticky state changes to screen readers if significant
- Ensure sticky elements don't trap keyboard focus

---

## Testing Checklist

- [ ] Works in all browsers (Safari needs `-webkit-sticky`)
- [ ] Doesn't break with different content lengths
- [ ] Handles window resize gracefully
- [ ] Mobile behavior is appropriate
- [ ] Performance is smooth during scroll
- [ ] No layout shifts when sticky activates
