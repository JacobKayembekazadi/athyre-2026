# Image Lightbox & Gallery Patterns

Patterns for image zoom, lightbox modals, galleries, and 360° product views.

---

## Table of Contents

1. [Lightbox Modal Component](#lightbox-modal-component)
2. [Image Zoom on Hover](#image-zoom-on-hover)
3. [Product Gallery with Thumbnails](#product-gallery-with-thumbnails)
4. [360° Product View](#360-product-view)
5. [Standalone Image Gallery Section](#standalone-image-gallery-section)
6. [Lazy Loading Patterns](#lazy-loading-patterns)

---

## Lightbox Modal Component

### Lightbox Custom Element

```javascript
// assets/lightbox-modal.js
class LightboxModal extends HTMLElement {
  constructor() {
    super();
    this.images = [];
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  connectedCallback() {
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
    this.setAttribute('aria-label', 'Image gallery');

    this.innerHTML = `
      <div class="lightbox__backdrop"></div>
      <div class="lightbox__container">
        <button class="lightbox__close" aria-label="Close gallery">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div class="lightbox__content">
          <img class="lightbox__image" src="" alt="" />
          <div class="lightbox__zoom-hint">Pinch or scroll to zoom</div>
        </div>

        <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <div class="lightbox__counter">
          <span class="lightbox__current">1</span> / <span class="lightbox__total">1</span>
        </div>

        <div class="lightbox__thumbnails"></div>
      </div>
    `;

    this.backdrop = this.querySelector('.lightbox__backdrop');
    this.closeBtn = this.querySelector('.lightbox__close');
    this.prevBtn = this.querySelector('.lightbox__nav--prev');
    this.nextBtn = this.querySelector('.lightbox__nav--next');
    this.content = this.querySelector('.lightbox__content');
    this.image = this.querySelector('.lightbox__image');
    this.currentEl = this.querySelector('.lightbox__current');
    this.totalEl = this.querySelector('.lightbox__total');
    this.thumbnailsContainer = this.querySelector('.lightbox__thumbnails');

    this.bindEvents();
  }

  bindEvents() {
    this.backdrop.addEventListener('click', () => this.close());
    this.closeBtn.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    // Touch swipe
    this.content.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.content.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    // Pinch zoom on mobile
    this.setupPinchZoom();
  }

  handleKeydown(e) {
    if (!this.classList.contains('is-open')) return;

    switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case 'ArrowRight':
        this.next();
        break;
    }
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  setupPinchZoom() {
    let scale = 1;
    let lastScale = 1;

    this.content.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      scale = Math.min(Math.max(1, scale - e.deltaY * 0.01), 4);
      this.image.style.transform = `scale(${scale})`;
    }, { passive: false });

    // Reset zoom on image change
    this.addEventListener('image-change', () => {
      scale = 1;
      this.image.style.transform = 'scale(1)';
    });
  }

  open(images, startIndex = 0) {
    this.images = images;
    this.currentIndex = startIndex;
    this.totalEl.textContent = images.length;

    this.renderThumbnails();
    this.showImage(startIndex);

    this.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    this.closeBtn.focus();

    this.dispatchEvent(new CustomEvent('lightbox-open'));
  }

  close() {
    this.classList.remove('is-open');
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('lightbox-close'));
  }

  showImage(index) {
    if (index < 0 || index >= this.images.length) return;

    this.currentIndex = index;
    const img = this.images[index];

    this.image.src = img.src;
    this.image.alt = img.alt || '';
    this.currentEl.textContent = index + 1;

    // Update nav visibility
    this.prevBtn.style.display = index === 0 ? 'none' : '';
    this.nextBtn.style.display = index === this.images.length - 1 ? 'none' : '';

    // Update thumbnail active state
    this.thumbnailsContainer.querySelectorAll('.lightbox__thumb').forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
    });

    this.dispatchEvent(new CustomEvent('image-change', { detail: { index } }));
  }

  renderThumbnails() {
    if (this.images.length <= 1) {
      this.thumbnailsContainer.style.display = 'none';
      return;
    }

    this.thumbnailsContainer.innerHTML = this.images.map((img, i) => `
      <button class="lightbox__thumb ${i === this.currentIndex ? 'is-active' : ''}"
              data-index="${i}"
              aria-label="View image ${i + 1}">
        <img src="${img.thumb || img.src}" alt="" loading="lazy" />
      </button>
    `).join('');

    this.thumbnailsContainer.querySelectorAll('.lightbox__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this.showImage(parseInt(thumb.dataset.index));
      });
    });
  }

  prev() {
    if (this.currentIndex > 0) {
      this.showImage(this.currentIndex - 1);
    }
  }

  next() {
    if (this.currentIndex < this.images.length - 1) {
      this.showImage(this.currentIndex + 1);
    }
  }
}

customElements.define('lightbox-modal', LightboxModal);
```

### Lightbox Styles

```css
/* assets/lightbox-modal.css */
lightbox-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
}

lightbox-modal.is-open {
  display: flex;
}

.lightbox__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  cursor: pointer;
}

.lightbox__container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox__content {
  position: relative;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lightbox__image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  transition: transform 0.2s ease;
  user-select: none;
  -webkit-user-drag: none;
}

.lightbox__zoom-hint {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.lightbox__content:hover .lightbox__zoom-hint {
  opacity: 1;
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox__nav--prev {
  left: 1rem;
}

.lightbox__nav--next {
  right: 1rem;
}

.lightbox__counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.lightbox__thumbnails {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  max-width: 90vw;
  overflow-x: auto;
}

.lightbox__thumb {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, border-color 0.2s;
}

.lightbox__thumb.is-active,
.lightbox__thumb:hover {
  opacity: 1;
  border-color: white;
}

.lightbox__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .lightbox__nav {
    width: 40px;
    height: 40px;
  }

  .lightbox__thumbnails {
    display: none;
  }

  .lightbox__counter {
    bottom: 1.5rem;
  }
}
```

### Global Lightbox Instance

```liquid
{% comment %} snippets/lightbox-global.liquid {% endcomment %}
{% comment %}
  Include once in theme.liquid before </body>
  Usage: window.lightbox.open(images, startIndex)
{% endcomment %}

<lightbox-modal id="global-lightbox"></lightbox-modal>

<script>
  window.lightbox = document.getElementById('global-lightbox');
</script>
```

---

## Image Zoom on Hover

### Zoom Container Component

```javascript
// assets/image-zoom.js
class ImageZoom extends HTMLElement {
  constructor() {
    super();
    this.zoomLevel = parseFloat(this.dataset.zoom) || 2;
    this.isZoomed = false;
  }

  connectedCallback() {
    this.image = this.querySelector('img');
    if (!this.image) return;

    this.createZoomLens();
    this.bindEvents();
  }

  createZoomLens() {
    this.lens = document.createElement('div');
    this.lens.className = 'image-zoom__lens';
    this.lens.style.display = 'none';
    this.appendChild(this.lens);

    // Create zoomed image container
    this.zoomResult = document.createElement('div');
    this.zoomResult.className = 'image-zoom__result';
    this.zoomResult.style.display = 'none';

    if (this.dataset.resultPosition === 'side') {
      this.zoomResult.classList.add('image-zoom__result--side');
      this.parentElement.appendChild(this.zoomResult);
    } else {
      this.appendChild(this.zoomResult);
    }
  }

  bindEvents() {
    this.addEventListener('mouseenter', () => this.startZoom());
    this.addEventListener('mouseleave', () => this.endZoom());
    this.addEventListener('mousemove', (e) => this.moveZoom(e));

    // Touch support
    this.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startZoom();
    });
    this.addEventListener('touchend', () => this.endZoom());
    this.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.moveZoom(e.touches[0]);
    });

    // Click to toggle on mobile
    if ('ontouchstart' in window) {
      this.addEventListener('click', (e) => {
        e.preventDefault();
        this.isZoomed ? this.endZoom() : this.startZoom();
      });
    }
  }

  startZoom() {
    if (window.innerWidth < 768 && this.dataset.mobileDisabled === 'true') return;

    this.isZoomed = true;
    this.lens.style.display = 'block';
    this.zoomResult.style.display = 'block';

    // Set zoomed background
    this.zoomResult.style.backgroundImage = `url(${this.image.src})`;
    this.zoomResult.style.backgroundSize = `${this.image.width * this.zoomLevel}px ${this.image.height * this.zoomLevel}px`;

    this.classList.add('is-zooming');
  }

  endZoom() {
    this.isZoomed = false;
    this.lens.style.display = 'none';
    this.zoomResult.style.display = 'none';
    this.classList.remove('is-zooming');
  }

  moveZoom(e) {
    if (!this.isZoomed) return;

    const rect = this.image.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp to image bounds
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Calculate percentages
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Position lens
    const lensSize = this.lens.offsetWidth / 2;
    this.lens.style.left = `${x - lensSize}px`;
    this.lens.style.top = `${y - lensSize}px`;

    // Position zoomed background
    this.zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  }
}

customElements.define('image-zoom', ImageZoom);
```

### Zoom Styles

```css
/* assets/image-zoom.css */
image-zoom {
  position: relative;
  display: block;
  overflow: hidden;
  cursor: zoom-in;
}

image-zoom.is-zooming {
  cursor: none;
}

image-zoom img {
  display: block;
  width: 100%;
  height: auto;
}

.image-zoom__lens {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.image-zoom__result {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10;
}

.image-zoom__result--side {
  position: absolute;
  left: calc(100% + 1rem);
  top: 0;
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-border);
  background-color: white;
  z-index: 100;
}

/* Hide zoom on mobile by default */
@media (max-width: 768px) {
  image-zoom[data-mobile-disabled="true"] .image-zoom__lens,
  image-zoom[data-mobile-disabled="true"] .image-zoom__result {
    display: none !important;
  }
}
```

### Zoom Usage in Product Template

```liquid
{% comment %} In product media gallery {% endcomment %}
<image-zoom data-zoom="2.5" data-result-position="side" data-mobile-disabled="true">
  <img
    src="{{ media | image_url: width: 800 }}"
    alt="{{ media.alt | escape }}"
    width="{{ media.width }}"
    height="{{ media.height }}"
    loading="lazy"
  >
</image-zoom>
```

---

## Product Gallery with Thumbnails

### Product Gallery Section

```liquid
{% comment %} sections/product-gallery.liquid {% endcomment %}
{% assign product = section.settings.product | default: product %}

<div class="product-gallery" id="ProductGallery-{{ section.id }}">
  {%- comment -%} Main image display {%- endcomment -%}
  <div class="product-gallery__main">
    <div class="product-gallery__slides" data-slides>
      {%- for media in product.media -%}
        <div
          class="product-gallery__slide {% if forloop.first %}is-active{% endif %}"
          data-media-id="{{ media.id }}"
          data-media-type="{{ media.media_type }}"
          data-index="{{ forloop.index0 }}"
        >
          {%- case media.media_type -%}
            {%- when 'image' -%}
              <image-zoom data-zoom="{{ section.settings.zoom_level }}" {% if section.settings.mobile_zoom == false %}data-mobile-disabled="true"{% endif %}>
                <img
                  src="{{ media | image_url: width: 1200 }}"
                  srcset="
                    {{ media | image_url: width: 600 }} 600w,
                    {{ media | image_url: width: 900 }} 900w,
                    {{ media | image_url: width: 1200 }} 1200w
                  "
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt="{{ media.alt | escape }}"
                  width="{{ media.width }}"
                  height="{{ media.height }}"
                  loading="{% if forloop.first %}eager{% else %}lazy{% endif %}"
                  class="product-gallery__image"
                  data-lightbox-src="{{ media | image_url: width: 2000 }}"
                >
              </image-zoom>

            {%- when 'video', 'external_video' -%}
              <div class="product-gallery__video">
                {{ media | media_tag: autoplay: false, controls: true }}
              </div>

            {%- when 'model' -%}
              <div class="product-gallery__model">
                {{ media | media_tag }}
              </div>
          {%- endcase -%}

          {%- if media.media_type == 'image' and section.settings.lightbox_enabled -%}
            <button
              type="button"
              class="product-gallery__expand"
              aria-label="{{ 'products.media.expand' | t }}"
              data-open-lightbox="{{ forloop.index0 }}"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>

    {%- if product.media.size > 1 -%}
      <button class="product-gallery__nav product-gallery__nav--prev" aria-label="Previous" data-prev>
        {% render 'icon-chevron-left' %}
      </button>
      <button class="product-gallery__nav product-gallery__nav--next" aria-label="Next" data-next>
        {% render 'icon-chevron-right' %}
      </button>
    {%- endif -%}
  </div>

  {%- comment -%} Thumbnails {%- endcomment -%}
  {%- if product.media.size > 1 and section.settings.show_thumbnails -%}
    <div class="product-gallery__thumbnails" data-thumbnails>
      {%- for media in product.media -%}
        <button
          type="button"
          class="product-gallery__thumb {% if forloop.first %}is-active{% endif %}"
          data-thumb-index="{{ forloop.index0 }}"
          aria-label="{{ 'products.media.view' | t: index: forloop.index }}"
        >
          {%- if media.media_type == 'image' -%}
            <img
              src="{{ media | image_url: width: 100 }}"
              alt=""
              width="80"
              height="80"
              loading="lazy"
            >
          {%- elsif media.media_type == 'video' or media.media_type == 'external_video' -%}
            <div class="product-gallery__thumb-video">
              <img
                src="{{ media.preview_image | image_url: width: 100 }}"
                alt=""
                width="80"
                height="80"
                loading="lazy"
              >
              {% render 'icon-play' %}
            </div>
          {%- elsif media.media_type == 'model' -%}
            <div class="product-gallery__thumb-3d">
              <img
                src="{{ media.preview_image | image_url: width: 100 }}"
                alt=""
                width="80"
                height="80"
                loading="lazy"
              >
              {% render 'icon-3d' %}
            </div>
          {%- endif -%}
        </button>
      {%- endfor -%}
    </div>
  {%- endif -%}

  {%- comment -%} Dots for mobile {%- endcomment -%}
  {%- if product.media.size > 1 -%}
    <div class="product-gallery__dots" data-dots>
      {%- for media in product.media -%}
        <button
          class="product-gallery__dot {% if forloop.first %}is-active{% endif %}"
          data-dot-index="{{ forloop.index0 }}"
          aria-label="View image {{ forloop.index }}"
        ></button>
      {%- endfor -%}
    </div>
  {%- endif -%}
</div>

<script>
  class ProductGallery extends HTMLElement {
    constructor() {
      super();
      this.currentIndex = 0;
      this.touchStartX = 0;
    }

    connectedCallback() {
      this.slides = this.querySelector('[data-slides]');
      this.slideItems = this.querySelectorAll('.product-gallery__slide');
      this.thumbs = this.querySelectorAll('[data-thumb-index]');
      this.dots = this.querySelectorAll('[data-dot-index]');
      this.prevBtn = this.querySelector('[data-prev]');
      this.nextBtn = this.querySelector('[data-next]');
      this.lightboxBtns = this.querySelectorAll('[data-open-lightbox]');

      this.bindEvents();
      this.setupVariantChange();
    }

    bindEvents() {
      this.thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          this.goTo(parseInt(thumb.dataset.thumbIndex));
        });
      });

      this.dots.forEach(dot => {
        dot.addEventListener('click', () => {
          this.goTo(parseInt(dot.dataset.dotIndex));
        });
      });

      this.prevBtn?.addEventListener('click', () => this.prev());
      this.nextBtn?.addEventListener('click', () => this.next());

      // Touch swipe
      this.slides.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.slides.addEventListener('touchend', (e) => {
        const diff = this.touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.next() : this.prev();
        }
      }, { passive: true });

      // Lightbox
      this.lightboxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.openLightbox(parseInt(btn.dataset.openLightbox));
        });
      });

      // Keyboard
      this.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }

    setupVariantChange() {
      // Listen for variant change to switch to variant image
      document.addEventListener('variant:change', (e) => {
        if (!e.detail.variant?.featured_media) return;

        const mediaId = e.detail.variant.featured_media.id;
        const slide = this.querySelector(`[data-media-id="${mediaId}"]`);
        if (slide) {
          this.goTo(parseInt(slide.dataset.index));
        }
      });
    }

    goTo(index) {
      if (index < 0 || index >= this.slideItems.length) return;

      this.currentIndex = index;

      // Update slides
      this.slideItems.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
      });

      // Update thumbnails
      this.thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === index);
      });

      // Update dots
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });

      // Scroll thumbnail into view
      const activeThumb = this.thumbs[index];
      activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      // Pause videos in other slides
      this.slideItems.forEach((slide, i) => {
        if (i !== index) {
          const video = slide.querySelector('video');
          video?.pause();
        }
      });
    }

    prev() {
      const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.slideItems.length - 1;
      this.goTo(newIndex);
    }

    next() {
      const newIndex = this.currentIndex < this.slideItems.length - 1 ? this.currentIndex + 1 : 0;
      this.goTo(newIndex);
    }

    openLightbox(startIndex) {
      const images = Array.from(this.slideItems)
        .filter(slide => slide.dataset.mediaType === 'image')
        .map(slide => {
          const img = slide.querySelector('img');
          return {
            src: img.dataset.lightboxSrc || img.src,
            thumb: img.src,
            alt: img.alt
          };
        });

      window.lightbox?.open(images, startIndex);
    }
  }

  customElements.define('product-gallery', ProductGallery);
</script>

{% schema %}
{
  "name": "Product Gallery",
  "settings": [
    {
      "type": "product",
      "id": "product",
      "label": "Product"
    },
    {
      "type": "checkbox",
      "id": "show_thumbnails",
      "label": "Show thumbnails",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "lightbox_enabled",
      "label": "Enable lightbox",
      "default": true
    },
    {
      "type": "range",
      "id": "zoom_level",
      "label": "Zoom level",
      "min": 1.5,
      "max": 4,
      "step": 0.5,
      "default": 2.5
    },
    {
      "type": "checkbox",
      "id": "mobile_zoom",
      "label": "Enable zoom on mobile",
      "default": false
    }
  ],
  "presets": [
    {
      "name": "Product Gallery"
    }
  ]
}
{% endschema %}
```

### Product Gallery Styles

```css
/* assets/product-gallery.css */
.product-gallery {
  position: relative;
}

.product-gallery__main {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.product-gallery__slides {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-gallery__slide {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
}

.product-gallery__slide.is-active {
  display: flex;
}

.product-gallery__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-gallery__expand {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.product-gallery__slide:hover .product-gallery__expand {
  opacity: 1;
}

.product-gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.product-gallery:hover .product-gallery__nav {
  opacity: 1;
}

.product-gallery__nav--prev {
  left: 1rem;
}

.product-gallery__nav--next {
  right: 1rem;
}

/* Thumbnails */
.product-gallery__thumbnails {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.product-gallery__thumb {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, border-color 0.2s;
}

.product-gallery__thumb.is-active,
.product-gallery__thumb:hover {
  opacity: 1;
  border-color: var(--color-primary);
}

.product-gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-gallery__thumb-video,
.product-gallery__thumb-3d {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-gallery__thumb-video svg,
.product-gallery__thumb-3d svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Dots (mobile) */
.product-gallery__dots {
  display: none;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.product-gallery__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--color-border);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.product-gallery__dot.is-active {
  background: var(--color-primary);
  transform: scale(1.25);
}

@media (max-width: 768px) {
  .product-gallery__thumbnails {
    display: none;
  }

  .product-gallery__dots {
    display: flex;
  }

  .product-gallery__nav {
    display: none;
  }

  .product-gallery__expand {
    opacity: 1;
  }
}
```

---

## 360° Product View

### 360 Viewer Component

```javascript
// assets/product-360.js
class Product360Viewer extends HTMLElement {
  constructor() {
    super();
    this.images = [];
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.isLoaded = false;
    this.isDragging = false;
    this.startX = 0;
    this.autoRotate = this.hasAttribute('data-auto-rotate');
    this.autoRotateInterval = null;
  }

  connectedCallback() {
    this.loadImages();
    this.render();
    this.bindEvents();
  }

  loadImages() {
    // Images from data attribute (JSON array of URLs)
    const imageData = this.dataset.images;
    if (imageData) {
      try {
        this.images = JSON.parse(imageData);
        this.totalFrames = this.images.length;
      } catch (e) {
        console.error('Invalid 360 image data:', e);
      }
    }
  }

  render() {
    this.innerHTML = `
      <div class="product-360__container">
        <div class="product-360__loading">
          <div class="product-360__spinner"></div>
          <span>Loading 360° view...</span>
        </div>
        <img class="product-360__image" src="" alt="360° product view" draggable="false" />
        <div class="product-360__hint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16m-8-8l-8 8 8 8"/>
          </svg>
          <span>Drag to rotate</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 12H4m8 8l8-8-8-8"/>
          </svg>
        </div>
      </div>
      <div class="product-360__controls">
        <button type="button" class="product-360__control" data-action="rotate-left" aria-label="Rotate left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        </button>
        <button type="button" class="product-360__control" data-action="toggle-auto" aria-label="Toggle auto-rotate">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="play-icon">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pause-icon" style="display:none">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
        <button type="button" class="product-360__control" data-action="rotate-right" aria-label="Rotate right">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>
    `;

    this.container = this.querySelector('.product-360__container');
    this.loading = this.querySelector('.product-360__loading');
    this.imageEl = this.querySelector('.product-360__image');
    this.hint = this.querySelector('.product-360__hint');
    this.playIcon = this.querySelector('.play-icon');
    this.pauseIcon = this.querySelector('.pause-icon');

    this.preloadImages();
  }

  preloadImages() {
    if (this.images.length === 0) {
      this.loading.innerHTML = '<span>No images available</span>';
      return;
    }

    let loadedCount = 0;
    const preloadedImages = [];

    this.images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        preloadedImages[index] = img;

        // Update loading progress
        const percent = Math.round((loadedCount / this.totalFrames) * 100);
        this.loading.querySelector('span').textContent = `Loading... ${percent}%`;

        if (loadedCount === this.totalFrames) {
          this.onImagesLoaded(preloadedImages);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.error('Failed to load 360 image:', src);
      };
      img.src = src;
    });
  }

  onImagesLoaded(preloadedImages) {
    this.preloadedImages = preloadedImages;
    this.isLoaded = true;
    this.loading.style.display = 'none';
    this.showFrame(0);

    if (this.autoRotate) {
      this.startAutoRotate();
    }

    // Hide hint after interaction
    setTimeout(() => {
      this.hint.classList.add('fade-out');
    }, 3000);
  }

  showFrame(index) {
    if (!this.isLoaded) return;

    this.currentFrame = ((index % this.totalFrames) + this.totalFrames) % this.totalFrames;
    this.imageEl.src = this.images[this.currentFrame];
  }

  bindEvents() {
    // Mouse drag
    this.container.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());

    // Touch drag
    this.container.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: true });
    document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), { passive: true });
    document.addEventListener('touchend', () => this.endDrag());

    // Control buttons
    this.querySelector('[data-action="rotate-left"]')?.addEventListener('click', () => {
      this.showFrame(this.currentFrame - 1);
    });

    this.querySelector('[data-action="rotate-right"]')?.addEventListener('click', () => {
      this.showFrame(this.currentFrame + 1);
    });

    this.querySelector('[data-action="toggle-auto"]')?.addEventListener('click', () => {
      this.toggleAutoRotate();
    });
  }

  startDrag(e) {
    if (!this.isLoaded) return;
    this.isDragging = true;
    this.startX = e.clientX || e.pageX;
    this.stopAutoRotate();
    this.container.style.cursor = 'grabbing';
    this.hint.style.display = 'none';
  }

  onDrag(e) {
    if (!this.isDragging) return;

    const x = e.clientX || e.pageX;
    const diff = x - this.startX;
    const sensitivity = 5; // pixels per frame

    if (Math.abs(diff) > sensitivity) {
      const frameDiff = Math.floor(diff / sensitivity);
      this.showFrame(this.currentFrame - frameDiff);
      this.startX = x;
    }
  }

  endDrag() {
    this.isDragging = false;
    this.container.style.cursor = 'grab';
  }

  startAutoRotate() {
    this.autoRotateInterval = setInterval(() => {
      this.showFrame(this.currentFrame + 1);
    }, 100);

    this.playIcon.style.display = 'none';
    this.pauseIcon.style.display = 'block';
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }

    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
  }

  toggleAutoRotate() {
    if (this.autoRotateInterval) {
      this.stopAutoRotate();
    } else {
      this.startAutoRotate();
    }
  }

  disconnectedCallback() {
    this.stopAutoRotate();
  }
}

customElements.define('product-360-viewer', Product360Viewer);
```

### 360 Viewer Usage

```liquid
{% comment %} snippets/product-360.liquid {% endcomment %}
{% comment %}
  Renders 360° product viewer

  Accepts:
  - product: Product object (required)
  - metafield_namespace: Namespace for 360 images metafield (default: 'custom')
  - metafield_key: Key for 360 images metafield (default: '360_images')

  Usage:
  {% render 'product-360', product: product %}
{% endcomment %}

{%- liquid
  assign namespace = metafield_namespace | default: 'custom'
  assign key = metafield_key | default: '360_images'
  assign images_json = product.metafields[namespace][key].value
-%}

{%- if images_json != blank -%}
  <product-360-viewer
    data-images='{{ images_json | json }}'
    {% if section.settings.auto_rotate %}data-auto-rotate{% endif %}
  >
  </product-360-viewer>

  <style>
    product-360-viewer {
      display: block;
      width: 100%;
    }

    .product-360__container {
      position: relative;
      aspect-ratio: 1;
      background: var(--color-background-secondary);
      cursor: grab;
      user-select: none;
    }

    .product-360__loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .product-360__spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .product-360__image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .product-360__hint {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 0.875rem;
      border-radius: 20px;
      transition: opacity 0.5s;
    }

    .product-360__hint.fade-out {
      opacity: 0;
      pointer-events: none;
    }

    .product-360__controls {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .product-360__control {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }

    .product-360__control:hover {
      background: var(--color-background-secondary);
      border-color: var(--color-primary);
    }
  </style>
{%- endif -%}
```

### 360 Images Metafield Setup

```json
// Metafield definition for 360 images
// Namespace: custom
// Key: 360_images
// Type: json
// Example value:
[
  "https://cdn.shopify.com/your-store/products/product-360-01.jpg",
  "https://cdn.shopify.com/your-store/products/product-360-02.jpg",
  "https://cdn.shopify.com/your-store/products/product-360-03.jpg",
  // ... up to 36 or 72 frames for smooth rotation
  "https://cdn.shopify.com/your-store/products/product-360-36.jpg"
]
```

---

## Standalone Image Gallery Section

### Gallery Section

```liquid
{% comment %} sections/image-gallery.liquid {% endcomment %}
{%- style -%}
  #Gallery-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }

  #Gallery-{{ section.id }} .gallery__grid {
    --columns: {{ section.settings.columns_desktop }};
    --gap: {{ section.settings.gap }}px;
  }

  @media (max-width: 768px) {
    #Gallery-{{ section.id }} .gallery__grid {
      --columns: {{ section.settings.columns_mobile }};
    }
  }
{%- endstyle -%}

<section id="Gallery-{{ section.id }}" class="gallery section">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <div class="gallery__header">
        <h2 class="gallery__title">{{ section.settings.heading }}</h2>
        {%- if section.settings.subheading != blank -%}
          <p class="gallery__subtitle">{{ section.settings.subheading }}</p>
        {%- endif -%}
      </div>
    {%- endif -%}

    <div class="gallery__grid" role="list">
      {%- for block in section.blocks -%}
        <div
          class="gallery__item {% if block.settings.featured %}gallery__item--featured{% endif %}"
          role="listitem"
          {{ block.shopify_attributes }}
        >
          {%- if block.settings.image != blank -%}
            <button
              type="button"
              class="gallery__image-wrapper"
              data-lightbox-trigger="{{ forloop.index0 }}"
              aria-label="View {{ block.settings.caption | default: 'image' | escape }}"
            >
              <img
                src="{{ block.settings.image | image_url: width: 800 }}"
                srcset="
                  {{ block.settings.image | image_url: width: 400 }} 400w,
                  {{ block.settings.image | image_url: width: 600 }} 600w,
                  {{ block.settings.image | image_url: width: 800 }} 800w
                "
                sizes="(min-width: 1024px) {{ 100 | divided_by: section.settings.columns_desktop }}vw, {{ 100 | divided_by: section.settings.columns_mobile }}vw"
                alt="{{ block.settings.image.alt | escape }}"
                width="{{ block.settings.image.width }}"
                height="{{ block.settings.image.height }}"
                loading="lazy"
                class="gallery__image"
              >
              <div class="gallery__overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
              </div>
            </button>

            {%- if block.settings.caption != blank -%}
              <p class="gallery__caption">{{ block.settings.caption }}</p>
            {%- endif -%}
          {%- else -%}
            <div class="gallery__placeholder">
              {{ 'image' | placeholder_svg_tag: 'placeholder-svg' }}
            </div>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

<script>
  (function() {
    const gallery = document.getElementById('Gallery-{{ section.id }}');
    const triggers = gallery.querySelectorAll('[data-lightbox-trigger]');

    const images = [
      {%- for block in section.blocks -%}
        {%- if block.settings.image != blank -%}
          {
            src: '{{ block.settings.image | image_url: width: 2000 }}',
            thumb: '{{ block.settings.image | image_url: width: 100 }}',
            alt: '{{ block.settings.caption | default: block.settings.image.alt | escape }}'
          }{% unless forloop.last %},{% endunless %}
        {%- endif -%}
      {%- endfor -%}
    ];

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const index = parseInt(trigger.dataset.lightboxTrigger);
        window.lightbox?.open(images, index);
      });
    });
  })();
</script>

{% schema %}
{
  "name": "Image Gallery",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Gallery"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading"
    },
    {
      "type": "range",
      "id": "columns_desktop",
      "label": "Columns on desktop",
      "min": 2,
      "max": 6,
      "default": 4
    },
    {
      "type": "range",
      "id": "columns_mobile",
      "label": "Columns on mobile",
      "min": 1,
      "max": 3,
      "default": 2
    },
    {
      "type": "range",
      "id": "gap",
      "label": "Gap between images",
      "min": 0,
      "max": 40,
      "step": 4,
      "default": 16,
      "unit": "px"
    },
    {
      "type": "header",
      "content": "Section padding"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Top padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px"
    }
  ],
  "blocks": [
    {
      "type": "image",
      "name": "Image",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        },
        {
          "type": "text",
          "id": "caption",
          "label": "Caption"
        },
        {
          "type": "checkbox",
          "id": "featured",
          "label": "Make featured (2x size)",
          "default": false
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Image Gallery",
      "blocks": [
        { "type": "image" },
        { "type": "image" },
        { "type": "image" },
        { "type": "image" }
      ]
    }
  ]
}
{% endschema %}
```

### Gallery Section Styles

```css
/* assets/section-gallery.css */
.gallery__header {
  text-align: center;
  margin-bottom: 2rem;
}

.gallery__title {
  margin: 0 0 0.5rem;
}

.gallery__subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: var(--gap, 16px);
}

.gallery__item {
  position: relative;
}

.gallery__item--featured {
  grid-column: span 2;
  grid-row: span 2;
}

.gallery__image-wrapper {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
}

.gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
}

.gallery__image-wrapper:hover .gallery__image {
  transform: scale(1.05);
}

.gallery__image-wrapper:hover .gallery__overlay {
  background: rgba(0, 0, 0, 0.4);
  opacity: 1;
}

.gallery__caption {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.gallery__placeholder {
  aspect-ratio: 1;
  background: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery__placeholder svg {
  width: 50%;
  height: 50%;
  opacity: 0.3;
}

/* Masonry-like layout option */
.gallery__grid--masonry .gallery__item:nth-child(3n+1) {
  grid-row: span 2;
}
```

---

## Lazy Loading Patterns

### Intersection Observer Lazy Load

```javascript
// assets/lazy-load.js
class LazyImage extends HTMLElement {
  connectedCallback() {
    this.img = this.querySelector('img');
    if (!this.img) return;

    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
      this.img.loading = 'lazy';
      this.loadImage();
    } else {
      // Fallback to Intersection Observer
      this.observeImage();
    }
  }

  observeImage() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          observer.unobserve(this);
        }
      });
    }, {
      rootMargin: '100px 0px', // Start loading 100px before visible
      threshold: 0.01
    });

    observer.observe(this);
  }

  loadImage() {
    const dataSrc = this.img.dataset.src;
    const dataSrcset = this.img.dataset.srcset;

    if (dataSrc) {
      this.img.src = dataSrc;
    }
    if (dataSrcset) {
      this.img.srcset = dataSrcset;
    }

    this.img.addEventListener('load', () => {
      this.classList.add('is-loaded');
    });
  }
}

customElements.define('lazy-image', LazyImage);
```

### Lazy Load with Blur-up Effect

```liquid
{% comment %} snippets/lazy-image.liquid {% endcomment %}
{% comment %}
  Renders image with blur-up lazy load effect

  Accepts:
  - image: Image object (required)
  - sizes: Sizes attribute
  - aspect_ratio: Optional fixed aspect ratio
  - class: Additional classes

  Usage:
  {% render 'lazy-image', image: product.featured_image, sizes: '50vw' %}
{% endcomment %}

{%- liquid
  assign width = image.width | default: 600
  assign height = image.height | default: 600
  assign ratio = aspect_ratio | default: image.aspect_ratio
-%}

<lazy-image class="lazy-image {{ class }}" style="{% if ratio %}aspect-ratio: {{ ratio }};{% endif %}">
  {%- comment -%} Low-res placeholder for blur effect {%- endcomment -%}
  <img
    src="{{ image | image_url: width: 20 }}"
    data-src="{{ image | image_url: width: width }}"
    data-srcset="
      {{ image | image_url: width: 400 }} 400w,
      {{ image | image_url: width: 600 }} 600w,
      {{ image | image_url: width: 800 }} 800w,
      {{ image | image_url: width: 1200 }} 1200w
    "
    sizes="{{ sizes | default: '100vw' }}"
    alt="{{ image.alt | escape }}"
    width="{{ width }}"
    height="{{ height }}"
    class="lazy-image__img"
  >
</lazy-image>

<style>
  lazy-image {
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--color-background-secondary);
  }

  .lazy-image__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(20px);
    transform: scale(1.1);
    transition: filter 0.5s ease, transform 0.5s ease;
  }

  lazy-image.is-loaded .lazy-image__img {
    filter: blur(0);
    transform: scale(1);
  }
</style>
```

### Progressive Image Loading

```liquid
{% comment %} snippets/progressive-image.liquid {% endcomment %}
{%- comment -%}
  Loads tiny placeholder first, then medium, then full resolution
{%- endcomment -%}

<progressive-image class="progressive-image">
  <img
    src="{{ image | image_url: width: 50 }}"
    data-medium="{{ image | image_url: width: 600 }}"
    data-full="{{ image | image_url: width: 1200 }}"
    alt="{{ image.alt | escape }}"
    class="progressive-image__img"
  >
</progressive-image>

<script>
  class ProgressiveImage extends HTMLElement {
    connectedCallback() {
      this.img = this.querySelector('img');
      const mediumSrc = this.img.dataset.medium;
      const fullSrc = this.img.dataset.full;

      // Load medium quality first
      const mediumImg = new Image();
      mediumImg.onload = () => {
        this.img.src = mediumSrc;
        this.classList.add('medium-loaded');

        // Then load full quality
        const fullImg = new Image();
        fullImg.onload = () => {
          this.img.src = fullSrc;
          this.classList.add('full-loaded');
        };
        fullImg.src = fullSrc;
      };
      mediumImg.src = mediumSrc;
    }
  }
  customElements.define('progressive-image', ProgressiveImage);
</script>

<style>
  progressive-image {
    display: block;
    position: relative;
  }

  .progressive-image__img {
    width: 100%;
    transition: filter 0.3s ease;
  }

  progressive-image:not(.medium-loaded) .progressive-image__img {
    filter: blur(15px);
  }

  progressive-image.medium-loaded:not(.full-loaded) .progressive-image__img {
    filter: blur(3px);
  }

  progressive-image.full-loaded .progressive-image__img {
    filter: none;
  }
</style>
```

---

## Checklist

When implementing image lightbox and gallery patterns:

- [ ] Include global lightbox component once in theme.liquid
- [ ] Ensure lightbox is keyboard accessible (Escape, arrows)
- [ ] Support touch swipe gestures on mobile
- [ ] Implement proper focus trap in modal
- [ ] Use appropriate image sizes for performance
- [ ] Include alt text for all images
- [ ] Test 360° viewer with varying frame counts
- [ ] Verify zoom works well on both desktop and mobile
- [ ] Lazy load images below the fold
- [ ] Consider blur-up or skeleton loading states
- [ ] Ensure gallery responds to variant changes
- [ ] Test with different aspect ratios and image sizes
