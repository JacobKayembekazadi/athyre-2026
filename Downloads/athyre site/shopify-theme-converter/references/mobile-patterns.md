# Mobile-First Patterns

Implementation patterns for mobile-optimized Shopify themes with touch-friendly interfaces.

---

## Overview

Mobile devices account for the majority of e-commerce traffic. This guide covers touch-friendly components, mobile-specific UX patterns, and responsive design techniques.

---

## Touch-Friendly Hit Targets

### Minimum Target Sizes

```css
/* Base touch target requirements (44px minimum recommended) */
:root {
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
}

/* Apply to interactive elements */
.button,
.link-button,
[role="button"] {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: 0.75rem 1rem;
}

/* Icon buttons need explicit sizing */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target-comfortable);
  height: var(--touch-target-comfortable);
  padding: 0;
}

/* Expand clickable area without changing visual size */
.touch-target-expand {
  position: relative;
}

.touch-target-expand::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  min-width: 100%;
  min-height: 100%;
}

/* Form inputs */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="tel"],
select,
textarea {
  min-height: var(--touch-target-comfortable);
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Checkbox/Radio with larger hit area */
.form-checkbox,
.form-radio {
  display: flex;
  align-items: center;
  min-height: var(--touch-target-min);
  padding: 0.5rem 0;
  cursor: pointer;
}

.form-checkbox input,
.form-radio input {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}
```

### Product Card Touch Optimization

```liquid
{%- comment -%}
  snippets/product-card-mobile.liquid
  Touch-optimized product card
{%- endcomment -%}

<div class="product-card" data-product-id="{{ product.id }}">
  <a href="{{ product.url }}" class="product-card__link" aria-label="{{ product.title }}">
    <div class="product-card__media">
      {{ product.featured_image | image_url: width: 600 | image_tag:
        loading: 'lazy',
        widths: '200, 300, 400, 600',
        sizes: '(min-width: 750px) 25vw, 50vw'
      }}
    </div>
  </a>

  <div class="product-card__info">
    <h3 class="product-card__title">
      <a href="{{ product.url }}">{{ product.title }}</a>
    </h3>
    <div class="product-card__price">
      {{ product.price | money }}
    </div>
  </div>

  {%- comment -%} Touch-friendly action buttons {%- endcomment -%}
  <div class="product-card__actions">
    <button
      type="button"
      class="product-card__quick-add icon-button"
      data-quick-add="{{ product.selected_or_first_available_variant.id }}"
      aria-label="{{ 'products.product.add_to_cart' | t }}"
    >
      {% render 'icon', icon: 'plus' %}
    </button>

    <button
      type="button"
      class="product-card__wishlist icon-button"
      data-wishlist-add="{{ product.id }}"
      aria-label="{{ 'products.product.add_to_wishlist' | t }}"
    >
      {% render 'icon', icon: 'heart' %}
    </button>
  </div>
</div>

<style>
  .product-card__actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .product-card__actions .icon-button {
    flex: 1;
    max-width: 60px;
  }

  @media (hover: hover) {
    .product-card__actions {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .product-card:hover .product-card__actions {
      opacity: 1;
    }
  }

  /* Always visible on touch devices */
  @media (hover: none) {
    .product-card__actions {
      opacity: 1;
    }
  }
</style>
```

---

## Swipe Gestures

### Product Gallery Swipe

```liquid
{%- comment -%}
  snippets/product-gallery-swipe.liquid
  Touch-enabled product image gallery
{%- endcomment -%}

<div class="product-gallery" data-product-gallery>
  <div class="product-gallery__viewport" data-gallery-viewport>
    <div class="product-gallery__track" data-gallery-track>
      {%- for media in product.media -%}
        <div
          class="product-gallery__slide"
          data-slide-index="{{ forloop.index0 }}"
          {% unless forloop.first %}inert{% endunless %}
        >
          {%- case media.media_type -%}
            {%- when 'image' -%}
              {{ media | image_url: width: 1200 | image_tag:
                loading: forloop.first | ternary: 'eager', 'lazy',
                widths: '400, 600, 800, 1000, 1200',
                sizes: '(min-width: 750px) 50vw, 100vw',
                class: 'product-gallery__image'
              }}
            {%- when 'video', 'external_video' -%}
              {{ media | media_tag: class: 'product-gallery__video' }}
          {%- endcase -%}
        </div>
      {%- endfor -%}
    </div>
  </div>

  {%- comment -%} Pagination dots {%- endcomment -%}
  <div class="product-gallery__pagination" data-gallery-pagination>
    {%- for media in product.media -%}
      <button
        type="button"
        class="product-gallery__dot{% if forloop.first %} is-active{% endif %}"
        data-slide-to="{{ forloop.index0 }}"
        aria-label="{{ 'products.media.slide' | t: index: forloop.index }}"
        {% if forloop.first %}aria-current="true"{% endif %}
      ></button>
    {%- endfor -%}
  </div>

  {%- comment -%} Arrow navigation (visible on hover/focus) {%- endcomment -%}
  <button
    type="button"
    class="product-gallery__arrow product-gallery__arrow--prev"
    data-gallery-prev
    aria-label="{{ 'products.media.previous' | t }}"
  >
    {% render 'icon', icon: 'chevron-left' %}
  </button>
  <button
    type="button"
    class="product-gallery__arrow product-gallery__arrow--next"
    data-gallery-next
    aria-label="{{ 'products.media.next' | t }}"
  >
    {% render 'icon', icon: 'chevron-right' %}
  </button>
</div>
```

### Gallery JavaScript

```javascript
// assets/product-gallery-swipe.js

class ProductGallerySwipe {
  constructor(element) {
    this.gallery = element;
    this.track = element.querySelector('[data-gallery-track]');
    this.slides = element.querySelectorAll('[data-slide-index]');
    this.dots = element.querySelectorAll('[data-slide-to]');
    this.prevBtn = element.querySelector('[data-gallery-prev]');
    this.nextBtn = element.querySelector('[data-gallery-next]');

    this.currentIndex = 0;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.threshold = 50; // Minimum swipe distance

    this.init();
  }

  init() {
    // Touch events
    this.track.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.track.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.track.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Mouse events for desktop testing
    this.track.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.track.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.track.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.track.addEventListener('mouseleave', this.onMouseUp.bind(this));

    // Navigation
    this.dots.forEach(dot => {
      dot.addEventListener('click', () => this.goToSlide(parseInt(dot.dataset.slideTo)));
    });

    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Keyboard navigation
    this.gallery.addEventListener('keydown', this.onKeydown.bind(this));

    // Update arrow visibility
    this.updateArrows();
  }

  onTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.track.style.transition = 'none';
  }

  onTouchMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.touches[0].clientX;
    const diff = this.currentX - this.startX;

    // Add resistance at edges
    let translateX = -this.currentIndex * 100 + (diff / this.track.offsetWidth) * 100;

    if (this.currentIndex === 0 && diff > 0) {
      translateX = diff / this.track.offsetWidth * 30; // Resistance
    } else if (this.currentIndex === this.slides.length - 1 && diff < 0) {
      translateX = -this.currentIndex * 100 + (diff / this.track.offsetWidth) * 30;
    }

    this.track.style.transform = `translateX(${translateX}%)`;

    // Prevent vertical scroll while swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }

  onTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.track.style.transition = '';

    const diff = this.currentX - this.startX;

    if (Math.abs(diff) > this.threshold) {
      if (diff > 0 && this.currentIndex > 0) {
        this.prev();
      } else if (diff < 0 && this.currentIndex < this.slides.length - 1) {
        this.next();
      } else {
        this.goToSlide(this.currentIndex);
      }
    } else {
      this.goToSlide(this.currentIndex);
    }
  }

  onMouseDown(e) {
    this.startX = e.clientX;
    this.isDragging = true;
    this.track.style.transition = 'none';
    this.track.style.cursor = 'grabbing';
  }

  onMouseMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.clientX;
    const diff = this.currentX - this.startX;
    let translateX = -this.currentIndex * 100 + (diff / this.track.offsetWidth) * 100;

    this.track.style.transform = `translateX(${translateX}%)`;
  }

  onMouseUp() {
    if (!this.isDragging) return;

    this.track.style.cursor = '';
    this.onTouchEnd();
  }

  onKeydown(e) {
    if (e.key === 'ArrowLeft') {
      this.prev();
    } else if (e.key === 'ArrowRight') {
      this.next();
    }
  }

  goToSlide(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.slides.length - 1));
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.currentIndex);
      dot.setAttribute('aria-current', i === this.currentIndex ? 'true' : 'false');
    });

    // Update slide inert state for accessibility
    this.slides.forEach((slide, i) => {
      if (i === this.currentIndex) {
        slide.removeAttribute('inert');
      } else {
        slide.setAttribute('inert', '');
      }
    });

    this.updateArrows();

    // Dispatch event for variant sync
    this.gallery.dispatchEvent(new CustomEvent('gallery:change', {
      detail: { index: this.currentIndex }
    }));
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  updateArrows() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;
    }
  }
}

// Initialize
document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
  new ProductGallerySwipe(gallery);
});
```

### Gallery CSS

```css
.product-gallery {
  position: relative;
  overflow: hidden;
}

.product-gallery__viewport {
  overflow: hidden;
}

.product-gallery__track {
  display: flex;
  transition: transform 0.3s ease-out;
  cursor: grab;
}

.product-gallery__slide {
  flex: 0 0 100%;
  width: 100%;
}

.product-gallery__image {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* Pagination */
.product-gallery__pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.product-gallery__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-gallery__dot.is-active {
  background: var(--color-foreground);
  transform: scale(1.2);
}

/* Expand touch target for dots */
.product-gallery__dot::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
}

/* Arrow navigation */
.product-gallery__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
}

.product-gallery__arrow--prev {
  left: 1rem;
}

.product-gallery__arrow--next {
  right: 1rem;
}

.product-gallery__arrow:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Show arrows on hover (desktop) */
@media (hover: hover) {
  .product-gallery:hover .product-gallery__arrow:not(:disabled) {
    opacity: 1;
  }
}

/* Hide arrows on mobile, rely on swipe */
@media (hover: none) {
  .product-gallery__arrow {
    display: none;
  }
}
```

---

## Bottom Navigation

### Mobile Bottom Nav

```liquid
{%- comment -%}
  snippets/mobile-bottom-nav.liquid
  Fixed bottom navigation for mobile
{%- endcomment -%}

<nav class="mobile-bottom-nav" aria-label="{{ 'layout.navigation.mobile' | t }}">
  <a href="/" class="mobile-bottom-nav__item{% if template.name == 'index' %} is-active{% endif %}">
    {% render 'icon', icon: 'home' %}
    <span>{{ 'layout.navigation.home' | t }}</span>
  </a>

  <a href="/collections/all" class="mobile-bottom-nav__item{% if template.name == 'collection' %} is-active{% endif %}">
    {% render 'icon', icon: 'grid' %}
    <span>{{ 'layout.navigation.shop' | t }}</span>
  </a>

  <button
    type="button"
    class="mobile-bottom-nav__item"
    data-search-toggle
    aria-expanded="false"
    aria-controls="search-modal"
  >
    {% render 'icon', icon: 'search' %}
    <span>{{ 'layout.navigation.search' | t }}</span>
  </button>

  <a href="/account" class="mobile-bottom-nav__item{% if template.directory == 'customers' %} is-active{% endif %}">
    {% render 'icon', icon: 'user' %}
    <span>{{ 'layout.navigation.account' | t }}</span>
  </a>

  <button
    type="button"
    class="mobile-bottom-nav__item mobile-bottom-nav__cart"
    data-cart-toggle
    aria-expanded="false"
    aria-controls="cart-drawer"
  >
    {% render 'icon', icon: 'cart' %}
    <span>{{ 'layout.navigation.cart' | t }}</span>
    <span class="mobile-bottom-nav__badge{% if cart.item_count == 0 %} hidden{% endif %}" data-cart-count>
      {{ cart.item_count }}
    </span>
  </button>
</nav>
```

### Bottom Nav CSS

```css
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom); /* iPhone notch */
  z-index: 100;
}

@media screen and (max-width: 749px) {
  .mobile-bottom-nav {
    display: flex;
  }

  /* Add padding to body to prevent content hiding behind nav */
  body {
    padding-bottom: calc(60px + env(safe-area-inset-bottom));
  }
}

.mobile-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  min-height: 60px;
  color: var(--color-foreground-muted);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mobile-bottom-nav__item svg {
  width: 24px;
  height: 24px;
}

.mobile-bottom-nav__item span {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mobile-bottom-nav__item.is-active,
.mobile-bottom-nav__item:active {
  color: var(--color-primary);
}

/* Cart badge */
.mobile-bottom-nav__cart {
  position: relative;
}

.mobile-bottom-nav__badge {
  position: absolute;
  top: 0.25rem;
  right: 50%;
  transform: translateX(100%);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 9px;
  padding: 0 0.25rem;
}

.mobile-bottom-nav__badge.hidden {
  display: none;
}
```

---

## Sticky Add to Cart Bar

### Product Page Sticky Bar

```liquid
{%- comment -%}
  snippets/sticky-add-to-cart.liquid
  Appears on scroll for mobile product pages
{%- endcomment -%}

<div class="sticky-atc hidden" data-sticky-atc aria-hidden="true">
  <div class="sticky-atc__inner page-width">
    <div class="sticky-atc__product">
      <img
        src="{{ product.featured_image | image_url: width: 80 }}"
        alt=""
        width="40"
        height="40"
        class="sticky-atc__image"
      >
      <div class="sticky-atc__info">
        <span class="sticky-atc__title">{{ product.title | truncate: 30 }}</span>
        <span class="sticky-atc__price" data-sticky-price>
          {{ product.selected_or_first_available_variant.price | money }}
        </span>
      </div>
    </div>

    <button
      type="button"
      class="sticky-atc__button button button--primary"
      data-sticky-atc-button
      {% unless product.available %}disabled{% endunless %}
    >
      {%- if product.available -%}
        {{ 'products.product.add_to_cart' | t }}
      {%- else -%}
        {{ 'products.product.sold_out' | t }}
      {%- endif -%}
    </button>
  </div>
</div>

<script>
  class StickyAddToCart {
    constructor() {
      this.stickyBar = document.querySelector('[data-sticky-atc]');
      this.mainButton = document.querySelector('[data-add-to-cart]');

      if (!this.stickyBar || !this.mainButton) return;

      this.init();
    }

    init() {
      // Show/hide based on main button visibility
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const shouldShow = !entry.isIntersecting && window.scrollY > 200;
            this.stickyBar.classList.toggle('hidden', !shouldShow);
            this.stickyBar.setAttribute('aria-hidden', !shouldShow);
          });
        },
        { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
      );

      this.observer.observe(this.mainButton);

      // Click handler - scroll to main form or trigger add to cart
      const stickyButton = this.stickyBar.querySelector('[data-sticky-atc-button]');
      stickyButton.addEventListener('click', () => {
        // If simple product, add directly
        if (document.querySelectorAll('[name="id"]').length === 1) {
          this.mainButton.click();
        } else {
          // Scroll to variant selector
          this.mainButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => new StickyAddToCart());
</script>
```

### Sticky Bar CSS

```css
.sticky-atc {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding: 0.75rem 0;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  z-index: 99;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.sticky-atc.hidden {
  transform: translateY(100%);
}

.sticky-atc__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sticky-atc__product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.sticky-atc__image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.sticky-atc__info {
  flex: 1;
  min-width: 0;
}

.sticky-atc__title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-atc__price {
  font-size: 0.875rem;
  font-weight: 600;
}

.sticky-atc__button {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
}

/* When bottom nav is present */
@media screen and (max-width: 749px) {
  .has-bottom-nav .sticky-atc {
    bottom: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: 0.75rem;
  }
}

/* Hide on desktop */
@media screen and (min-width: 750px) {
  .sticky-atc {
    display: none;
  }
}
```

---

## Mobile Filter Drawer

### Filter Drawer Component

```liquid
{%- comment -%}
  snippets/mobile-filter-drawer.liquid
  Full-screen filter interface for mobile
{%- endcomment -%}

<div
  class="filter-drawer"
  id="filter-drawer"
  data-filter-drawer
  aria-hidden="true"
  role="dialog"
  aria-modal="true"
  aria-label="{{ 'collections.filter.title' | t }}"
>
  <div class="filter-drawer__header">
    <h2 class="filter-drawer__title">{{ 'collections.filter.title' | t }}</h2>
    <button
      type="button"
      class="filter-drawer__close"
      data-filter-close
      aria-label="{{ 'accessibility.close' | t }}"
    >
      {% render 'icon', icon: 'close' %}
    </button>
  </div>

  <div class="filter-drawer__content">
    {%- comment -%} Sort option {%- endcomment -%}
    <div class="filter-drawer__group">
      <button
        type="button"
        class="filter-drawer__group-toggle"
        aria-expanded="true"
        aria-controls="filter-sort"
      >
        <span>{{ 'collections.sorting.title' | t }}</span>
        {% render 'icon', icon: 'chevron-down' %}
      </button>
      <div id="filter-sort" class="filter-drawer__group-content">
        {%- for option in collection.sort_options -%}
          <label class="filter-drawer__option">
            <input
              type="radio"
              name="sort_by"
              value="{{ option.value }}"
              {% if collection.sort_by == option.value %}checked{% endif %}
              data-filter-input
            >
            <span>{{ option.name }}</span>
          </label>
        {%- endfor -%}
      </div>
    </div>

    {%- comment -%} Filter groups {%- endcomment -%}
    {%- for filter in collection.filters -%}
      <div class="filter-drawer__group">
        <button
          type="button"
          class="filter-drawer__group-toggle"
          aria-expanded="false"
          aria-controls="filter-{{ filter.param_name | handle }}"
        >
          <span>{{ filter.label }}</span>
          {%- if filter.active_values.size > 0 -%}
            <span class="filter-drawer__active-count">{{ filter.active_values.size }}</span>
          {%- endif -%}
          {% render 'icon', icon: 'chevron-down' %}
        </button>

        <div id="filter-{{ filter.param_name | handle }}" class="filter-drawer__group-content" hidden>
          {%- case filter.type -%}
            {%- when 'list' -%}
              {%- for value in filter.values -%}
                <label class="filter-drawer__option">
                  <input
                    type="checkbox"
                    name="{{ value.param_name }}"
                    value="{{ value.value }}"
                    {% if value.active %}checked{% endif %}
                    {% if value.count == 0 and value.active == false %}disabled{% endif %}
                    data-filter-input
                  >
                  <span>{{ value.label }}</span>
                  <span class="filter-drawer__count">({{ value.count }})</span>
                </label>
              {%- endfor -%}

            {%- when 'price_range' -%}
              <div class="filter-drawer__price-range">
                <div class="filter-drawer__price-inputs">
                  <div class="filter-drawer__price-field">
                    <label for="filter-price-min">{{ 'collections.filter.from' | t }}</label>
                    <input
                      type="number"
                      id="filter-price-min"
                      name="{{ filter.min_value.param_name }}"
                      value="{{ filter.min_value.value | money_without_currency }}"
                      min="0"
                      max="{{ filter.range_max | money_without_currency }}"
                      data-filter-input
                    >
                  </div>
                  <div class="filter-drawer__price-field">
                    <label for="filter-price-max">{{ 'collections.filter.to' | t }}</label>
                    <input
                      type="number"
                      id="filter-price-max"
                      name="{{ filter.max_value.param_name }}"
                      value="{{ filter.max_value.value | money_without_currency }}"
                      min="0"
                      max="{{ filter.range_max | money_without_currency }}"
                      data-filter-input
                    >
                  </div>
                </div>
              </div>
          {%- endcase -%}
        </div>
      </div>
    {%- endfor -%}
  </div>

  <div class="filter-drawer__footer">
    <button
      type="button"
      class="filter-drawer__clear button button--secondary"
      data-filter-clear
    >
      {{ 'collections.filter.clear_all' | t }}
    </button>
    <button
      type="button"
      class="filter-drawer__apply button button--primary"
      data-filter-apply
    >
      {{ 'collections.filter.apply' | t }}
      <span data-filter-result-count></span>
    </button>
  </div>
</div>

{%- comment -%} Trigger button {%- endcomment -%}
<button
  type="button"
  class="filter-trigger"
  data-filter-trigger
  aria-controls="filter-drawer"
  aria-expanded="false"
>
  {% render 'icon', icon: 'filter' %}
  <span>{{ 'collections.filter.title' | t }}</span>
  {%- assign active_filter_count = 0 -%}
  {%- for filter in collection.filters -%}
    {%- assign active_filter_count = active_filter_count | plus: filter.active_values.size -%}
  {%- endfor -%}
  {%- if active_filter_count > 0 -%}
    <span class="filter-trigger__count">{{ active_filter_count }}</span>
  {%- endif -%}
</button>
```

### Filter Drawer CSS

```css
.filter-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: var(--color-background);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.filter-drawer[aria-hidden="false"] {
  transform: translateX(0);
}

.filter-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.filter-drawer__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.filter-drawer__close {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}

.filter-drawer__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Filter groups */
.filter-drawer__group {
  border-bottom: 1px solid var(--color-border);
}

.filter-drawer__group-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 56px;
}

.filter-drawer__group-toggle[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.filter-drawer__active-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
  margin-left: auto;
  margin-right: 0.5rem;
}

.filter-drawer__group-content {
  padding: 0 1rem 1rem;
}

.filter-drawer__group-content[hidden] {
  display: none;
}

/* Filter options */
.filter-drawer__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  cursor: pointer;
  min-height: 48px;
}

.filter-drawer__option input {
  width: 1.25rem;
  height: 1.25rem;
}

.filter-drawer__count {
  margin-left: auto;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
}

/* Price range */
.filter-drawer__price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-drawer__price-field label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.filter-drawer__price-field input {
  width: 100%;
}

/* Footer */
.filter-drawer__footer {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.filter-drawer__clear {
  flex: 1;
}

.filter-drawer__apply {
  flex: 2;
}

/* Trigger button */
.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  min-height: 48px;
}

.filter-trigger__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

/* Overlay */
.filter-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.filter-drawer-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}

/* Desktop: show as sidebar instead of drawer */
@media screen and (min-width: 990px) {
  .filter-drawer {
    position: static;
    transform: none;
    max-width: none;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
  }

  .filter-drawer__footer {
    display: none;
  }

  .filter-trigger {
    display: none;
  }
}
```

---

## Best Practices

### 1. Prevent iOS Zoom on Input Focus

```css
/* Minimum 16px font prevents iOS auto-zoom */
input, select, textarea {
  font-size: 16px;
}

/* Or disable zoom entirely (not recommended) */
/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"> */
```

### 2. Safe Area Insets

```css
/* Account for notches and home indicators */
.fixed-bottom-element {
  padding-bottom: env(safe-area-inset-bottom);
}

.fixed-top-element {
  padding-top: env(safe-area-inset-top);
}

/* Full-bleed elements */
.full-width {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 3. Detect Touch Devices

```css
/* CSS-only hover detection */
@media (hover: hover) {
  /* Desktop hover styles */
  .card:hover { ... }
}

@media (hover: none) {
  /* Touch device alternatives */
  .card:active { ... }
}
```

```javascript
// JavaScript detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
  document.body.classList.add('touch-device');
}
```

### 4. Prevent Overscroll/Bounce

```css
/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}

/* Prevent overscroll on scrollable elements */
.scrollable-container {
  overscroll-behavior: contain;
}
```

### 5. Responsive Images

```liquid
{{ image | image_url: width: 800 | image_tag:
  loading: 'lazy',
  widths: '200, 400, 600, 800',
  sizes: '(min-width: 750px) 400px, 100vw'
}}
```

---

## Accessibility Notes

1. **Touch targets**: Minimum 44x44px (iOS) or 48x48px (Material Design)
2. **Focus states**: Visible focus indicators for keyboard navigation
3. **Screen readers**: Proper ARIA labels and live regions
4. **Reduced motion**: Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
