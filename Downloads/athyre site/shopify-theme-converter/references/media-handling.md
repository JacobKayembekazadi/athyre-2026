# Media Handling Patterns

Comprehensive guide for handling videos (YouTube, Vimeo, hosted), 3D models, image galleries, and zoom functionality in Shopify themes.

## Overview

Shopify's media system supports multiple types:
- **Images** - Product photos, lifestyle shots
- **Videos** - Hosted, YouTube, Vimeo
- **3D Models** - GLB/USDZ format via model-viewer
- **External Video** - Embedded from YouTube/Vimeo

---

## Media Object Reference

### Accessing Product Media
```liquid
{%- for media in product.media -%}
  {{ media.media_type }}  {%- comment -%} image, video, external_video, model {%- endcomment -%}
  {{ media.id }}
  {{ media.alt }}
  {{ media.position }}
  {{ media.preview_image }}
{%- endfor -%}
```

### Media Types
| Type | Properties |
|------|------------|
| `image` | `width`, `height`, `src`, `aspect_ratio` |
| `video` | `sources[]`, `duration`, `preview_image` |
| `external_video` | `host`, `external_id` (YouTube/Vimeo ID) |
| `model` | `sources[]`, `preview_image`, `alt` |

---

## Image Gallery with Thumbnails

### React Input
```jsx
function ProductGallery({ media }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="gallery">
      <div className="gallery-main" onClick={() => setZoomed(true)}>
        <img src={media[activeIndex].src} alt={media[activeIndex].alt} />
      </div>
      <div className="gallery-thumbnails">
        {media.map((item, i) => (
          <button key={item.id} onClick={() => setActiveIndex(i)}>
            <img src={item.thumbnail} alt="" />
          </button>
        ))}
      </div>
      {zoomed && <Lightbox media={media} startIndex={activeIndex} onClose={() => setZoomed(false)} />}
    </div>
  );
}
```

### Shopify Section
```liquid
{% comment %} sections/product-gallery.liquid {% endcomment %}

<div class="product-gallery section-{{ section.id }}" data-product-gallery>
  {%- comment -%} Main Media Display {%- endcomment -%}
  <div class="gallery-main" data-gallery-main>
    {%- for media in product.media -%}
      <div
        class="gallery-slide{% if forloop.first %} is-active{% endif %}"
        data-gallery-slide="{{ forloop.index0 }}"
        data-media-id="{{ media.id }}"
        data-media-type="{{ media.media_type }}"
        {% unless forloop.first %}hidden{% endunless %}
      >
        {%- case media.media_type -%}
          {%- when 'image' -%}
            <div class="gallery-image" data-zoom-container>
              {{- media | image_url: width: 1200 | image_tag:
                loading: 'lazy',
                widths: '375, 550, 750, 1100, 1500',
                sizes: '(min-width: 1024px) 50vw, 100vw',
                data-zoom-src: media | image_url: width: 2400,
                data-zoom: ''
              -}}
            </div>

          {%- when 'video' -%}
            <div class="gallery-video">
              {{- media | video_tag:
                image_size: '1200x',
                autoplay: false,
                loop: section.settings.loop_video,
                controls: true,
                muted: false,
                preload: 'metadata'
              -}}
            </div>

          {%- when 'external_video' -%}
            <div class="gallery-external-video" data-external-video>
              {%- if media.host == 'youtube' -%}
                <div
                  class="video-placeholder"
                  data-youtube-id="{{ media.external_id }}"
                  data-video-placeholder
                >
                  {{ media.preview_image | image_url: width: 1200 | image_tag }}
                  <button class="video-play-btn" aria-label="Play video">
                    {% render 'icon', icon: 'play' %}
                  </button>
                </div>
              {%- elsif media.host == 'vimeo' -%}
                <div
                  class="video-placeholder"
                  data-vimeo-id="{{ media.external_id }}"
                  data-video-placeholder
                >
                  {{ media.preview_image | image_url: width: 1200 | image_tag }}
                  <button class="video-play-btn" aria-label="Play video">
                    {% render 'icon', icon: 'play' %}
                  </button>
                </div>
              {%- endif -%}
            </div>

          {%- when 'model' -%}
            <div class="gallery-model" data-model-container>
              {{ media | model_viewer_tag:
                image_size: '1200x',
                reveal: 'interaction',
                toggleable: true,
                ar: true,
                ar-modes: 'webxr scene-viewer quick-look'
              }}
            </div>
        {%- endcase -%}
      </div>
    {%- endfor -%}
  </div>

  {%- comment -%} Thumbnail Navigation {%- endcomment -%}
  {%- if product.media.size > 1 -%}
    <div class="gallery-thumbnails" data-gallery-thumbnails role="tablist">
      {%- for media in product.media -%}
        <button
          class="gallery-thumbnail{% if forloop.first %} is-active{% endif %}"
          data-thumbnail-index="{{ forloop.index0 }}"
          role="tab"
          aria-selected="{% if forloop.first %}true{% else %}false{% endif %}"
          aria-controls="gallery-slide-{{ forloop.index0 }}"
          aria-label="{{ media.alt | default: product.title }} - {{ forloop.index }} of {{ product.media.size }}"
        >
          <div class="thumbnail-image">
            {{ media.preview_image | image_url: width: 150 | image_tag: loading: 'lazy' }}
          </div>
          {%- if media.media_type == 'video' or media.media_type == 'external_video' -%}
            <span class="thumbnail-badge thumbnail-badge--video">
              {% render 'icon', icon: 'play', size: 'small' %}
            </span>
          {%- elsif media.media_type == 'model' -%}
            <span class="thumbnail-badge thumbnail-badge--3d">
              {% render 'icon', icon: '3d', size: 'small' %}
            </span>
          {%- endif -%}
        </button>
      {%- endfor -%}
    </div>
  {%- endif -%}

  {%- comment -%} Lightbox Modal {%- endcomment -%}
  <div class="gallery-lightbox" data-lightbox hidden>
    <div class="lightbox-backdrop" data-lightbox-close></div>
    <div class="lightbox-content">
      <button class="lightbox-close" data-lightbox-close aria-label="Close">
        {% render 'icon', icon: 'close' %}
      </button>
      <button class="lightbox-prev" data-lightbox-prev aria-label="Previous">
        {% render 'icon', icon: 'chevron-left' %}
      </button>
      <div class="lightbox-media" data-lightbox-media></div>
      <button class="lightbox-next" data-lightbox-next aria-label="Next">
        {% render 'icon', icon: 'chevron-right' %}
      </button>
      <div class="lightbox-counter" data-lightbox-counter></div>
    </div>
  </div>
</div>

<style>
  .product-gallery {
    display: grid;
    gap: 1rem;
  }

  .gallery-main {
    position: relative;
    aspect-ratio: 1;
    background: var(--color-background-secondary);
    border-radius: 8px;
    overflow: hidden;
  }

  .gallery-slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-slide[hidden] {
    display: none;
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    cursor: zoom-in;
  }

  .gallery-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .gallery-video video,
  .gallery-external-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .video-placeholder {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
  }

  .video-play-btn:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background: rgba(0, 0, 0, 0.9);
  }

  .gallery-model {
    width: 100%;
    height: 100%;
  }

  .gallery-model model-viewer {
    width: 100%;
    height: 100%;
  }

  /* Thumbnails */
  .gallery-thumbnails {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scrollbar-width: thin;
  }

  .gallery-thumbnail {
    position: relative;
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;
    background: var(--color-background-secondary);
  }

  .gallery-thumbnail:hover,
  .gallery-thumbnail.is-active {
    border-color: var(--color-primary);
  }

  .thumbnail-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-badge {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    color: #fff;
  }

  /* Lightbox */
  .gallery-lightbox {
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-lightbox[hidden] {
    display: none;
  }

  .lightbox-content {
    position: relative;
    width: 100%;
    max-width: 1400px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 3rem;
  }

  .lightbox-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
  }

  .lightbox-prev,
  .lightbox-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }

  .lightbox-prev:hover,
  .lightbox-next:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .lightbox-prev {
    left: 1rem;
  }

  .lightbox-next {
    right: 1rem;
  }

  .lightbox-media {
    max-width: 100%;
    max-height: 100%;
  }

  .lightbox-media img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
  }

  .lightbox-counter {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 0.875rem;
  }
</style>

{% schema %}
{
  "name": "Product gallery",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable_zoom",
      "label": "Enable image zoom",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "loop_video",
      "label": "Loop videos",
      "default": false
    },
    {
      "type": "select",
      "id": "thumbnail_position",
      "label": "Thumbnail position",
      "default": "bottom",
      "options": [
        { "value": "bottom", "label": "Bottom" },
        { "value": "left", "label": "Left" }
      ]
    }
  ]
}
{% endschema %}
```

---

## Video Embedding

### YouTube Embed
```liquid
{% comment %} snippets/video-youtube.liquid {% endcomment %}
{%- comment -%}
  Lazy-loaded YouTube embed
  Parameters:
  - video_id: YouTube video ID
  - title: Video title for accessibility
  - autoplay: Boolean
{%- endcomment -%}

<div class="video-wrapper video-wrapper--youtube" data-youtube-wrapper>
  <div
    class="video-placeholder"
    data-video-id="{{ video_id }}"
    data-video-placeholder
  >
    <img
      src="https://img.youtube.com/vi/{{ video_id }}/maxresdefault.jpg"
      alt="{{ title }}"
      loading="lazy"
      onerror="this.src='https://img.youtube.com/vi/{{ video_id }}/hqdefault.jpg'"
    >
    <button type="button" class="video-play-btn" aria-label="Play {{ title }}">
      <svg viewBox="0 0 68 48" width="68" height="48">
        <path class="video-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/>
        <path d="M 45,24 27,14 27,34" fill="#fff"/>
      </svg>
    </button>
  </div>
</div>

<script>
  document.querySelectorAll('[data-video-placeholder]').forEach(placeholder => {
    placeholder.addEventListener('click', function() {
      const videoId = this.dataset.videoId;
      const autoplay = '{{ autoplay }}' === 'true' ? 1 : 1; // Always autoplay on click

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay}&rel=0&modestbranding=1`;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('title', '{{ title | escape }}');

      this.parentNode.replaceChild(iframe, this);
    });
  });
</script>

<style>
  .video-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 */
    background: #000;
  }

  .video-wrapper iframe,
  .video-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .video-placeholder {
    cursor: pointer;
  }

  .video-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .video-play-btn:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
</style>
```

### Vimeo Embed
```liquid
{% comment %} snippets/video-vimeo.liquid {% endcomment %}

<div class="video-wrapper video-wrapper--vimeo" data-vimeo-wrapper>
  <div
    class="video-placeholder"
    data-vimeo-id="{{ video_id }}"
    data-video-placeholder
  >
    <img
      src=""
      alt="{{ title }}"
      loading="lazy"
      data-vimeo-thumbnail
    >
    <button type="button" class="video-play-btn" aria-label="Play {{ title }}">
      {% render 'icon', icon: 'play' %}
    </button>
  </div>
</div>

<script>
  // Fetch Vimeo thumbnail
  (function() {
    const thumbnail = document.querySelector('[data-vimeo-thumbnail]');
    const vimeoId = '{{ video_id }}';

    fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`)
      .then(res => res.json())
      .then(data => {
        thumbnail.src = data[0].thumbnail_large;
      })
      .catch(() => {
        thumbnail.src = 'data:image/svg+xml,...'; // Fallback placeholder
      });
  })();

  document.querySelectorAll('[data-vimeo-id]').forEach(placeholder => {
    placeholder.addEventListener('click', function() {
      const vimeoId = this.dataset.vimeoId;

      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1`;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
      iframe.setAttribute('title', '{{ title | escape }}');

      this.parentNode.replaceChild(iframe, this);
    });
  });
</script>
```

---

## 3D Model Viewer

### Implementation
```liquid
{% comment %} snippets/model-viewer.liquid {% endcomment %}
{%- comment -%}
  3D Model viewer with AR support
  Uses Google's model-viewer component
{%- endcomment -%}

{%- comment -%} Load model-viewer script once {%- endcomment -%}
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<div class="model-viewer-wrapper">
  <model-viewer
    src="{{ model.sources[0].url }}"
    ios-src="{{ model.sources[1].url | default: '' }}"
    alt="{{ model.alt | default: product.title }}"
    poster="{{ model.preview_image | image_url: width: 800 }}"
    camera-controls
    auto-rotate
    ar
    ar-modes="webxr scene-viewer quick-look"
    shadow-intensity="1"
    environment-image="neutral"
    exposure="1"
    loading="lazy"
    reveal="interaction"
  >
    <button slot="ar-button" class="model-ar-button">
      {% render 'icon', icon: 'ar' %}
      {{ 'products.product.view_in_ar' | t }}
    </button>

    <div class="model-poster">
      {% render 'loading-spinner', size: 'large' %}
    </div>
  </model-viewer>

  <div class="model-controls">
    <button type="button" class="model-control" data-model-reset title="Reset view">
      {% render 'icon', icon: 'reset' %}
    </button>
    <button type="button" class="model-control" data-model-fullscreen title="Fullscreen">
      {% render 'icon', icon: 'fullscreen' %}
    </button>
  </div>
</div>

<style>
  .model-viewer-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: var(--color-background-secondary);
    border-radius: 8px;
    overflow: hidden;
  }

  model-viewer {
    width: 100%;
    height: 100%;
  }

  .model-poster {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--color-background-secondary);
  }

  .model-ar-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.25rem;
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    border: none;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .model-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .model-control {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: background 0.2s;
  }

  .model-control:hover {
    background: #fff;
  }
</style>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const modelViewer = document.querySelector('model-viewer');

    // Reset camera
    document.querySelector('[data-model-reset]')?.addEventListener('click', () => {
      modelViewer.resetTurntableRotation();
      modelViewer.jumpCameraToGoal();
    });

    // Fullscreen toggle
    document.querySelector('[data-model-fullscreen]')?.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        modelViewer.requestFullscreen();
      }
    });
  });
</script>
```

---

## Image Zoom

### Hover Zoom Implementation
```liquid
{% comment %} snippets/image-zoom.liquid {% endcomment %}

<div class="zoom-container" data-zoom-container>
  <img
    src="{{ image | image_url: width: 800 }}"
    alt="{{ image.alt }}"
    class="zoom-image"
    data-zoom-image
    data-zoom-src="{{ image | image_url: width: 2400 }}"
  >
  <div class="zoom-lens" data-zoom-lens hidden></div>
  <div class="zoom-result" data-zoom-result hidden></div>
</div>

<script>
class ImageZoom {
  constructor(container) {
    this.container = container;
    this.image = container.querySelector('[data-zoom-image]');
    this.lens = container.querySelector('[data-zoom-lens]');
    this.result = container.querySelector('[data-zoom-result]');

    this.zoomLevel = 2.5;
    this.highResSrc = this.image.dataset.zoomSrc;
    this.highResLoaded = false;

    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('mouseenter', () => this.activate());
    this.container.addEventListener('mouseleave', () => this.deactivate());
    this.container.addEventListener('mousemove', (e) => this.moveLens(e));

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.activate();
    });
    this.container.addEventListener('touchend', () => this.deactivate());
    this.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.moveLens(e.touches[0]);
    });
  }

  activate() {
    // Preload high-res image
    if (!this.highResLoaded) {
      const img = new Image();
      img.src = this.highResSrc;
      img.onload = () => {
        this.highResLoaded = true;
        this.result.style.backgroundImage = `url(${this.highResSrc})`;
      };
    }

    this.lens.hidden = false;
    this.result.hidden = false;
    this.result.style.backgroundSize = `${this.image.offsetWidth * this.zoomLevel}px ${this.image.offsetHeight * this.zoomLevel}px`;
  }

  deactivate() {
    this.lens.hidden = true;
    this.result.hidden = true;
  }

  moveLens(e) {
    const rect = this.container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Constrain to container
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Position lens
    const lensX = x - this.lens.offsetWidth / 2;
    const lensY = y - this.lens.offsetHeight / 2;
    this.lens.style.left = `${lensX}px`;
    this.lens.style.top = `${lensY}px`;

    // Calculate background position
    const bgX = -x * this.zoomLevel + this.result.offsetWidth / 2;
    const bgY = -y * this.zoomLevel + this.result.offsetHeight / 2;
    this.result.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }
}

document.querySelectorAll('[data-zoom-container]').forEach(container => {
  new ImageZoom(container);
});
</script>

<style>
  .zoom-container {
    position: relative;
    overflow: hidden;
    cursor: crosshair;
  }

  .zoom-image {
    display: block;
    width: 100%;
    height: auto;
  }

  .zoom-lens {
    position: absolute;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid var(--color-primary);
    border-radius: 50%;
    pointer-events: none;
  }

  .zoom-result {
    position: absolute;
    top: 0;
    left: calc(100% + 1rem);
    width: 400px;
    height: 400px;
    background-color: #fff;
    background-repeat: no-repeat;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  @media (max-width: 1024px) {
    .zoom-result {
      display: none;
    }
  }
</style>
```

---

## Gallery JavaScript Controller

```javascript
// assets/product-gallery.js

class ProductGallery {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll('[data-gallery-slide]');
    this.thumbnails = container.querySelectorAll('[data-thumbnail-index]');
    this.lightbox = container.querySelector('[data-lightbox]');
    this.activeIndex = 0;

    this.bindEvents();
    this.initVideoPlayers();
  }

  bindEvents() {
    // Thumbnail clicks
    this.thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.goTo(index));
    });

    // Lightbox triggers
    this.container.querySelectorAll('[data-zoom]').forEach(img => {
      img.addEventListener('click', () => this.openLightbox());
    });

    // Lightbox controls
    this.lightbox?.querySelector('[data-lightbox-close]')
      ?.addEventListener('click', () => this.closeLightbox());
    this.lightbox?.querySelector('[data-lightbox-prev]')
      ?.addEventListener('click', () => this.prevSlide());
    this.lightbox?.querySelector('[data-lightbox-next]')
      ?.addEventListener('click', () => this.nextSlide());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.lightbox && !this.lightbox.hidden) {
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.prevSlide();
        if (e.key === 'ArrowRight') this.nextSlide();
      }
    });

    // Variant change - update gallery
    document.addEventListener('variant:changed', (e) => {
      this.handleVariantChange(e.detail);
    });
  }

  goTo(index) {
    if (index === this.activeIndex) return;

    // Pause current video if playing
    this.pauseMedia(this.slides[this.activeIndex]);

    // Hide current slide
    this.slides[this.activeIndex].hidden = true;
    this.slides[this.activeIndex].classList.remove('is-active');
    this.thumbnails[this.activeIndex]?.classList.remove('is-active');
    this.thumbnails[this.activeIndex]?.setAttribute('aria-selected', 'false');

    // Show new slide
    this.activeIndex = index;
    this.slides[index].hidden = false;
    this.slides[index].classList.add('is-active');
    this.thumbnails[index]?.classList.add('is-active');
    this.thumbnails[index]?.setAttribute('aria-selected', 'true');

    // Scroll thumbnail into view
    this.thumbnails[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  prevSlide() {
    const newIndex = this.activeIndex === 0 ? this.slides.length - 1 : this.activeIndex - 1;
    this.goTo(newIndex);
    this.updateLightbox();
  }

  nextSlide() {
    const newIndex = this.activeIndex === this.slides.length - 1 ? 0 : this.activeIndex + 1;
    this.goTo(newIndex);
    this.updateLightbox();
  }

  openLightbox() {
    if (!this.lightbox) return;
    this.lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    this.updateLightbox();
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  updateLightbox() {
    const media = this.lightbox?.querySelector('[data-lightbox-media]');
    const counter = this.lightbox?.querySelector('[data-lightbox-counter]');
    const slide = this.slides[this.activeIndex];

    if (media && slide) {
      const img = slide.querySelector('img');
      if (img) {
        media.innerHTML = `<img src="${img.dataset.zoomSrc || img.src}" alt="${img.alt}">`;
      }
    }

    if (counter) {
      counter.textContent = `${this.activeIndex + 1} / ${this.slides.length}`;
    }
  }

  pauseMedia(slide) {
    const video = slide.querySelector('video');
    video?.pause();

    // Pause YouTube/Vimeo by removing iframe
    const iframe = slide.querySelector('iframe');
    if (iframe) {
      const placeholder = document.createElement('div');
      placeholder.className = 'video-placeholder';
      // Restore placeholder
    }
  }

  initVideoPlayers() {
    // Initialize video placeholders
    this.container.querySelectorAll('[data-video-placeholder]').forEach(placeholder => {
      placeholder.addEventListener('click', () => this.playVideo(placeholder));
    });
  }

  playVideo(placeholder) {
    const youtubeId = placeholder.dataset.youtubeId;
    const vimeoId = placeholder.dataset.vimeoId;

    let iframe;
    if (youtubeId) {
      iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
      iframe.allow = 'autoplay; fullscreen';
    } else if (vimeoId) {
      iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
      iframe.allow = 'autoplay; fullscreen';
    }

    if (iframe) {
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      placeholder.parentNode.replaceChild(iframe, placeholder);
    }
  }

  handleVariantChange(variant) {
    if (!variant || !variant.featured_media) return;

    // Find slide with matching media ID
    const targetIndex = Array.from(this.slides).findIndex(slide =>
      slide.dataset.mediaId == variant.featured_media.id
    );

    if (targetIndex >= 0) {
      this.goTo(targetIndex);
    }
  }
}

// Initialize all galleries
document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
  new ProductGallery(gallery);
});
```

---

## Performance Considerations

| Optimization | Implementation |
|--------------|----------------|
| Lazy loading | `loading="lazy"` on all images |
| Responsive images | `srcset` and `sizes` attributes |
| Video placeholders | Don't load iframes until clicked |
| 3D model reveal | `reveal="interaction"` attribute |
| High-res preload | Load zoom images on hover |
| WebP format | Shopify CDN auto-serves WebP |

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Video controls are keyboard accessible
- [ ] Lightbox can be closed with Escape
- [ ] Thumbnails have ARIA labels
- [ ] Focus trapped in lightbox
- [ ] Reduced motion respected for auto-rotate
