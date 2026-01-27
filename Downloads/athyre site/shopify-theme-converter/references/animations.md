# Animation Patterns

Implementation guide for scroll-triggered animations, CSS transitions, skeleton loaders, and respecting reduced motion preferences in Shopify themes.

## Overview

Animations enhance UX when used thoughtfully:
- **Scroll reveal** - Elements animate in on scroll
- **Transitions** - Smooth state changes
- **Skeleton loaders** - Loading state placeholders
- **Micro-interactions** - Feedback on user actions

---

## Scroll-Triggered Animations

### React Input
```jsx
function AnimateOnScroll({ children, animation = 'fade-up' }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`animate ${animation} ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}
```

### Shopify Implementation
```liquid
{% comment %} snippets/animate-on-scroll.liquid {% endcomment %}
{%- comment -%}
  Wrapper for scroll-triggered animations

  Parameters:
  - animation: Animation type (fade-up, fade-in, slide-left, slide-right, zoom)
  - delay: Delay in ms (optional)
  - duration: Duration in ms (default: 600)
{%- endcomment -%}

<div
  class="animate animate--{{ animation | default: 'fade-up' }}"
  data-animate
  {% if delay %}style="--animation-delay: {{ delay }}ms"{% endif %}
  {% if duration %}style="--animation-duration: {{ duration }}ms"{% endif %}
>
  {{ content }}
</div>
```

### Animation Styles
```css
/* assets/animations.css */

/* Base animate class */
.animate {
  --animation-delay: 0ms;
  --animation-duration: 600ms;
  --animation-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Initial hidden states */
.animate:not(.is-visible) {
  opacity: 0;
}

.animate--fade-up:not(.is-visible) {
  transform: translateY(30px);
}

.animate--fade-down:not(.is-visible) {
  transform: translateY(-30px);
}

.animate--slide-left:not(.is-visible) {
  transform: translateX(50px);
}

.animate--slide-right:not(.is-visible) {
  transform: translateX(-50px);
}

.animate--zoom:not(.is-visible) {
  transform: scale(0.9);
}

.animate--blur:not(.is-visible) {
  filter: blur(10px);
}

/* Visible state */
.animate.is-visible {
  opacity: 1;
  transform: translate(0) scale(1);
  filter: blur(0);
  transition:
    opacity var(--animation-duration) var(--animation-easing),
    transform var(--animation-duration) var(--animation-easing),
    filter var(--animation-duration) var(--animation-easing);
  transition-delay: var(--animation-delay);
}

/* Stagger children */
.animate-stagger > .animate {
  --animation-delay: calc(var(--stagger-index, 0) * 100ms);
}

.animate-stagger > .animate:nth-child(1) { --stagger-index: 0; }
.animate-stagger > .animate:nth-child(2) { --stagger-index: 1; }
.animate-stagger > .animate:nth-child(3) { --stagger-index: 2; }
.animate-stagger > .animate:nth-child(4) { --stagger-index: 3; }
.animate-stagger > .animate:nth-child(5) { --stagger-index: 4; }
.animate-stagger > .animate:nth-child(6) { --stagger-index: 5; }
.animate-stagger > .animate:nth-child(7) { --stagger-index: 6; }
.animate-stagger > .animate:nth-child(8) { --stagger-index: 7; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate,
  .animate:not(.is-visible) {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
```

### JavaScript Controller
```javascript
// assets/scroll-animations.js

class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('[data-animate]');
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.prefersReducedMotion) {
      this.showAll();
      return;
    }

    this.init();
  }

  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.elements.forEach(el => {
      // Check if already in view (for elements above fold)
      if (this.isInViewport(el)) {
        this.animate(el);
      } else {
        this.observer.observe(el);
      }
    });
  }

  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }

  animate(el) {
    el.classList.add('is-visible');
  }

  showAll() {
    this.elements.forEach(el => el.classList.add('is-visible'));
  }

  disconnect() {
    this.observer?.disconnect();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
});

// Re-init on section load (Theme Editor)
document.addEventListener('shopify:section:load', () => {
  new ScrollAnimations();
});
```

---

## CSS Transitions

### Button Transitions
```css
/* Smooth button interactions */
.btn {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Loading state */
.btn.is-loading {
  position: relative;
  pointer-events: none;
}

.btn.is-loading .btn-text {
  opacity: 0;
}

.btn.is-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

### Card Hover Effects
```css
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

/* Image zoom on hover */
.product-card-image {
  overflow: hidden;
}

.product-card-image img {
  transition: transform 0.4s ease;
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

/* Secondary image reveal */
.product-card-image--secondary {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-card-image--secondary {
  opacity: 1;
}
```

### Accordion Transitions
```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.accordion.is-open .accordion-content {
  grid-template-rows: 1fr;
}

.accordion-inner {
  overflow: hidden;
}
```

### Drawer Transitions
```css
.drawer {
  visibility: hidden;
  transition: visibility 0s 0.3s; /* Delay visibility until animation done */
}

.drawer.is-open {
  visibility: visible;
  transition-delay: 0s;
}

.drawer-backdrop {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drawer.is-open .drawer-backdrop {
  opacity: 1;
}

.drawer-content {
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer.is-open .drawer-content {
  transform: translateX(0);
}
```

---

## Skeleton Loaders

### Implementation
```liquid
{% comment %} snippets/skeleton-product-card.liquid {% endcomment %}

<div class="skeleton skeleton-product-card" aria-hidden="true">
  <div class="skeleton-image"></div>
  <div class="skeleton-content">
    <div class="skeleton-line skeleton-line--title"></div>
    <div class="skeleton-line skeleton-line--price"></div>
  </div>
</div>

<style>
  .skeleton {
    --skeleton-bg: #e5e5e5;
    --skeleton-highlight: #f5f5f5;
  }

  .skeleton-image,
  .skeleton-line {
    background: linear-gradient(
      90deg,
      var(--skeleton-bg) 25%,
      var(--skeleton-highlight) 50%,
      var(--skeleton-bg) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .skeleton-image {
    aspect-ratio: 1;
    width: 100%;
  }

  .skeleton-content {
    padding: 1rem 0;
  }

  .skeleton-line {
    height: 1rem;
    margin-bottom: 0.5rem;
  }

  .skeleton-line--title {
    width: 80%;
  }

  .skeleton-line--price {
    width: 40%;
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-image,
    .skeleton-line {
      animation: none;
      background: var(--skeleton-bg);
    }
  }
</style>
```

### Collection Grid Skeleton
```liquid
{% comment %} Shown while AJAX loading {% endcomment %}

<div class="product-grid skeleton-grid" data-skeleton-grid hidden>
  {%- for i in (1..8) -%}
    {% render 'skeleton-product-card' %}
  {%- endfor -%}
</div>
```

### JavaScript Usage
```javascript
class ProductLoader {
  constructor() {
    this.grid = document.querySelector('[data-product-grid]');
    this.skeleton = document.querySelector('[data-skeleton-grid]');
  }

  async load(url) {
    // Show skeleton
    this.grid.hidden = true;
    this.skeleton.hidden = false;

    try {
      const response = await fetch(url);
      const html = await response.text();

      // Parse and extract products
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newProducts = doc.querySelector('[data-product-grid]').innerHTML;

      // Update grid
      this.grid.innerHTML = newProducts;

      // Hide skeleton, show grid
      this.skeleton.hidden = true;
      this.grid.hidden = false;

      // Trigger scroll animations on new elements
      document.dispatchEvent(new CustomEvent('products:loaded'));

    } catch (error) {
      console.error('Load error:', error);
      this.skeleton.hidden = true;
      this.grid.hidden = false;
    }
  }
}
```

---

## Micro-Interactions

### Add to Cart Animation
```css
.add-to-cart-btn {
  position: relative;
  overflow: hidden;
}

.add-to-cart-btn.is-added::before {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Cart icon bounce */
.cart-count.is-updated {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
```

### Heart/Wishlist Animation
```css
.wishlist-btn {
  transition: transform 0.2s ease;
}

.wishlist-btn:active {
  transform: scale(0.85);
}

.wishlist-btn.is-active .wishlist-icon {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.wishlist-icon--filled {
  fill: #e53e3e;
  stroke: #e53e3e;
}
```

### Quantity Input Animation
```css
.quantity-value {
  transition: transform 0.15s ease;
}

.quantity-value.is-increasing {
  animation: slideUp 0.15s ease;
}

.quantity-value.is-decreasing {
  animation: slideDown 0.15s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Form Validation Animation
```css
.field-input.is-invalid {
  animation: shake 0.4s ease;
  border-color: var(--color-error);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.field-error {
  animation: fadeSlideIn 0.3s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Page Transitions

### View Transitions API (Modern)
```javascript
// Enable view transitions for navigation
if (document.startViewTransition) {
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const href = link.href;

      document.startViewTransition(async () => {
        const response = await fetch(href);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Update content
        document.title = doc.title;
        document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
        window.history.pushState({}, '', href);
      });
    });
  });
}
```

```css
/* View transition styles */
::view-transition-old(root) {
  animation: fade-out 0.2s ease;
}

::view-transition-new(root) {
  animation: fade-in 0.2s ease;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

---

## Reduced Motion Handling

### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### JavaScript Check
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function handleMotionPreference() {
  if (prefersReducedMotion.matches) {
    // Disable animations
    document.documentElement.classList.add('reduce-motion');
  } else {
    document.documentElement.classList.remove('reduce-motion');
  }
}

prefersReducedMotion.addEventListener('change', handleMotionPreference);
handleMotionPreference();
```

### User Toggle Option
```liquid
{% comment %} Settings for motion preference {% endcomment %}

<button type="button" class="motion-toggle" data-motion-toggle>
  <span class="motion-toggle-text">
    {{ 'accessibility.reduce_motion' | t }}
  </span>
  <span class="motion-toggle-switch"></span>
</button>

<script>
  const toggle = document.querySelector('[data-motion-toggle]');
  const isReduced = localStorage.getItem('reduce-motion') === 'true';

  if (isReduced) {
    document.documentElement.classList.add('reduce-motion');
    toggle.classList.add('is-active');
  }

  toggle.addEventListener('click', () => {
    const newValue = !document.documentElement.classList.contains('reduce-motion');
    document.documentElement.classList.toggle('reduce-motion', newValue);
    toggle.classList.toggle('is-active', newValue);
    localStorage.setItem('reduce-motion', newValue);
  });
</script>
```

---

## Performance Tips

| Technique | Benefit |
|-----------|---------|
| `will-change` | GPU acceleration (use sparingly) |
| `transform` over `top/left` | Avoids layout recalc |
| `opacity` | Cheap to animate |
| `contain: layout` | Limits repaints |
| `IntersectionObserver` | Efficient scroll detection |
| Throttle scroll handlers | Reduces CPU usage |

### Animation Budget
```css
/* Only animate transform and opacity for best performance */
.performant-animation {
  will-change: transform, opacity;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Promote to own layer for complex animations */
.complex-animation {
  transform: translateZ(0); /* Creates new layer */
}
```

---

## Testing Checklist

- [ ] Animations don't cause layout shifts
- [ ] Reduced motion is respected
- [ ] Works on low-end devices
- [ ] No animation on page load (above fold)
- [ ] Animation doesn't block interaction
- [ ] Smooth at 60fps
- [ ] Works with Theme Editor preview
