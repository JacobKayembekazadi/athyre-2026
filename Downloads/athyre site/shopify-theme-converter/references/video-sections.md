# Video Section Patterns

Video backgrounds, YouTube/Vimeo embeds, self-hosted video, product videos, and lazy loading.

---

## Video Background Hero

```liquid
{%- comment -%}
  sections/video-hero.liquid
  Hero section with video background
{%- endcomment -%}

<section class="video-hero section-{{ section.id }}">
  <div class="video-hero__media">
    {%- comment -%} Video Background {%- endcomment -%}
    {%- if section.settings.video != blank -%}
      <video-background
        class="video-hero__video"
        data-video-background
        data-autoplay="{{ section.settings.autoplay }}"
        data-loop="{{ section.settings.loop }}"
        data-muted="{{ section.settings.muted }}"
      >
        {{ section.settings.video | video_tag:
          autoplay: section.settings.autoplay,
          loop: section.settings.loop,
          muted: section.settings.muted,
          playsinline: true,
          controls: false,
          preload: 'metadata',
          class: 'video-hero__video-element'
        }}
      </video-background>
    {%- elsif section.settings.video_url != blank -%}
      {%- comment -%} External video (YouTube/Vimeo) {%- endcomment -%}
      {% render 'video-embed',
        url: section.settings.video_url,
        background: true,
        autoplay: section.settings.autoplay,
        loop: section.settings.loop
      %}
    {%- endif -%}

    {%- comment -%} Fallback Image {%- endcomment -%}
    {%- if section.settings.fallback_image != blank -%}
      <img
        src="{{ section.settings.fallback_image | image_url: width: 1920 }}"
        alt="{{ section.settings.fallback_image.alt | escape }}"
        class="video-hero__fallback"
        loading="eager"
      >
    {%- endif -%}

    {%- comment -%} Overlay {%- endcomment -%}
    {%- if section.settings.overlay_opacity > 0 -%}
      <div
        class="video-hero__overlay"
        style="--overlay-opacity: {{ section.settings.overlay_opacity | divided_by: 100.0 }};"
      ></div>
    {%- endif -%}
  </div>

  <div class="video-hero__content page-width">
    {%- if section.settings.subheading != blank -%}
      <p class="video-hero__subheading">{{ section.settings.subheading }}</p>
    {%- endif -%}

    {%- if section.settings.heading != blank -%}
      <h1 class="video-hero__heading {{ section.settings.heading_size }}">
        {{ section.settings.heading }}
      </h1>
    {%- endif -%}

    {%- if section.settings.text != blank -%}
      <div class="video-hero__text">
        {{ section.settings.text }}
      </div>
    {%- endif -%}

    {%- if section.settings.button_label != blank -%}
      <a href="{{ section.settings.button_link }}" class="video-hero__button button">
        {{ section.settings.button_label }}
      </a>
    {%- endif -%}

    {%- comment -%} Play/Pause Control {%- endcomment -%}
    {%- unless section.settings.hide_controls -%}
      <button
        type="button"
        class="video-hero__control"
        data-video-control
        aria-label="{{ 'video.pause' | t }}"
      >
        <span class="video-hero__control-pause">{% render 'icon', icon: 'pause' %}</span>
        <span class="video-hero__control-play hidden">{% render 'icon', icon: 'play' %}</span>
      </button>
    {%- endunless -%}
  </div>
</section>

<style>
  .section-{{ section.id }} {
    --video-hero-height: {{ section.settings.height }}vh;
    --video-hero-content-position: {{ section.settings.content_position }};
    --video-hero-text-align: {{ section.settings.text_alignment }};
  }
</style>

{% schema %}
{
  "name": "Video Hero",
  "tag": "section",
  "class": "video-hero-section",
  "settings": [
    {
      "type": "header",
      "content": "Video"
    },
    {
      "type": "video",
      "id": "video",
      "label": "Video",
      "info": "Upload a video file (MP4 recommended)"
    },
    {
      "type": "video_url",
      "id": "video_url",
      "label": "Or YouTube/Vimeo URL",
      "accept": ["youtube", "vimeo"],
      "info": "Used if no video file is uploaded"
    },
    {
      "type": "image_picker",
      "id": "fallback_image",
      "label": "Fallback image",
      "info": "Shown while video loads or on mobile if video is disabled"
    },
    {
      "type": "checkbox",
      "id": "autoplay",
      "label": "Autoplay",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "loop",
      "label": "Loop video",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "muted",
      "label": "Muted",
      "default": true,
      "info": "Required for autoplay"
    },
    {
      "type": "checkbox",
      "id": "hide_controls",
      "label": "Hide play/pause control",
      "default": false
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "height",
      "label": "Section height",
      "min": 50,
      "max": 100,
      "step": 5,
      "default": 80,
      "unit": "vh"
    },
    {
      "type": "range",
      "id": "overlay_opacity",
      "label": "Overlay opacity",
      "min": 0,
      "max": 80,
      "step": 5,
      "default": 30,
      "unit": "%"
    },
    {
      "type": "select",
      "id": "content_position",
      "label": "Content position",
      "options": [
        { "value": "flex-start", "label": "Top" },
        { "value": "center", "label": "Center" },
        { "value": "flex-end", "label": "Bottom" }
      ],
      "default": "center"
    },
    {
      "type": "select",
      "id": "text_alignment",
      "label": "Text alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    {
      "type": "header",
      "content": "Content"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Video Hero"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h1", "label": "Extra large" },
        { "value": "h2", "label": "Large" },
        { "value": "h3", "label": "Medium" }
      ],
      "default": "h1"
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Text"
    },
    {
      "type": "text",
      "id": "button_label",
      "label": "Button label"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button link"
    }
  ],
  "presets": [
    {
      "name": "Video Hero"
    }
  ]
}
{% endschema %}
```

---

## Video Embed Snippet

```liquid
{%- comment -%}
  snippets/video-embed.liquid
  YouTube/Vimeo embed with lazy loading

  Usage:
  {% render 'video-embed', url: video_url, aspect_ratio: '16:9' %}
{%- endcomment -%}

{%- liquid
  assign aspect_ratio = aspect_ratio | default: '16:9'
  assign background = background | default: false
  assign autoplay = autoplay | default: false
  assign loop = loop | default: false

  assign video_id = ''
  assign video_type = ''

  if url contains 'youtube.com' or url contains 'youtu.be'
    assign video_type = 'youtube'
    if url contains 'youtu.be'
      assign video_id = url | split: 'youtu.be/' | last | split: '?' | first
    else
      assign video_id = url | split: 'v=' | last | split: '&' | first
    endif
  elsif url contains 'vimeo.com'
    assign video_type = 'vimeo'
    assign video_id = url | split: 'vimeo.com/' | last | split: '?' | first | split: '/' | first
  endif
-%}

{%- if video_id != blank -%}
  <video-embed
    class="video-embed{% if background %} video-embed--background{% endif %}"
    data-video-type="{{ video_type }}"
    data-video-id="{{ video_id }}"
    data-autoplay="{{ autoplay }}"
    data-loop="{{ loop }}"
    data-background="{{ background }}"
    style="--aspect-ratio: {{ aspect_ratio | replace: ':', '/' }};"
  >
    {%- comment -%} Thumbnail for lazy loading {%- endcomment -%}
    {%- unless background -%}
      <div class="video-embed__poster" data-video-poster>
        {%- if video_type == 'youtube' -%}
          <img
            src="https://img.youtube.com/vi/{{ video_id }}/maxresdefault.jpg"
            alt=""
            loading="lazy"
            onerror="this.src='https://img.youtube.com/vi/{{ video_id }}/hqdefault.jpg'"
          >
        {%- elsif video_type == 'vimeo' -%}
          {%- comment -%} Vimeo requires API call for thumbnail {%- endcomment -%}
          <div class="video-embed__placeholder"></div>
        {%- endif -%}

        <button type="button" class="video-embed__play" aria-label="{{ 'video.play' | t }}">
          {% render 'icon', icon: 'play-circle' %}
        </button>
      </div>
    {%- endunless -%}

    <div class="video-embed__container" data-video-container>
      {%- comment -%} Iframe injected via JS {%- endcomment -%}
    </div>
  </video-embed>
{%- endif -%}
```

---

## Video JavaScript

```javascript
/**
 * Video Background Controller
 */
class VideoBackground extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('video');
    this.control = document.querySelector('[data-video-control]');
    this.isPlaying = this.dataset.autoplay === 'true';
  }

  connectedCallback() {
    if (!this.video) return;

    // Intersection Observer for performance
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playIfAutoplay();
          } else {
            this.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    this.observer.observe(this);

    // Control button
    this.control?.addEventListener('click', () => this.togglePlayPause());

    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pause();
      this.showFallback();
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  playIfAutoplay() {
    if (this.dataset.autoplay === 'true' && !this.isPlaying) {
      this.play();
    }
  }

  play() {
    this.video.play().then(() => {
      this.isPlaying = true;
      this.updateControl();
    }).catch(() => {
      this.showFallback();
    });
  }

  pause() {
    this.video.pause();
    this.isPlaying = false;
    this.updateControl();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateControl() {
    if (!this.control) return;

    const pauseIcon = this.control.querySelector('.video-hero__control-pause');
    const playIcon = this.control.querySelector('.video-hero__control-play');

    pauseIcon?.classList.toggle('hidden', !this.isPlaying);
    playIcon?.classList.toggle('hidden', this.isPlaying);

    this.control.setAttribute(
      'aria-label',
      this.isPlaying ? 'Pause video' : 'Play video'
    );
  }

  showFallback() {
    const fallback = this.closest('.video-hero')?.querySelector('.video-hero__fallback');
    if (fallback) {
      fallback.style.display = 'block';
      this.style.display = 'none';
    }
  }
}

customElements.define('video-background', VideoBackground);

/**
 * Video Embed Controller (YouTube/Vimeo)
 */
class VideoEmbed extends HTMLElement {
  constructor() {
    super();
    this.videoType = this.dataset.videoType;
    this.videoId = this.dataset.videoId;
    this.autoplay = this.dataset.autoplay === 'true';
    this.loop = this.dataset.loop === 'true';
    this.background = this.dataset.background === 'true';

    this.poster = this.querySelector('[data-video-poster]');
    this.container = this.querySelector('[data-video-container]');
    this.playButton = this.querySelector('.video-embed__play');
    this.loaded = false;
  }

  connectedCallback() {
    if (this.background) {
      // Load immediately for backgrounds
      this.loadVideo();
    } else {
      // Click to load for regular embeds
      this.playButton?.addEventListener('click', () => this.loadVideo());
    }

    // Keyboard support
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.loaded) {
        this.loadVideo();
      }
    });
  }

  loadVideo() {
    if (this.loaded) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');

    if (this.videoType === 'youtube') {
      const params = new URLSearchParams({
        autoplay: this.autoplay || this.background ? 1 : 0,
        loop: this.loop ? 1 : 0,
        mute: this.background ? 1 : 0,
        controls: this.background ? 0 : 1,
        modestbranding: 1,
        rel: 0,
        playlist: this.loop ? this.videoId : ''
      });
      iframe.src = `https://www.youtube.com/embed/${this.videoId}?${params}`;
    } else if (this.videoType === 'vimeo') {
      const params = new URLSearchParams({
        autoplay: this.autoplay || this.background ? 1 : 0,
        loop: this.loop ? 1 : 0,
        muted: this.background ? 1 : 0,
        background: this.background ? 1 : 0,
        title: 0,
        byline: 0,
        portrait: 0
      });
      iframe.src = `https://player.vimeo.com/video/${this.videoId}?${params}`;
    }

    this.container.appendChild(iframe);
    this.poster?.classList.add('hidden');
    this.loaded = true;
  }
}

customElements.define('video-embed', VideoEmbed);
```

---

## Product Video Section

```liquid
{%- comment -%}
  snippets/product-video.liquid
  Video for product media gallery

  Usage:
  {% render 'product-video', media: media %}
{%- endcomment -%}

<div class="product-video" data-product-video>
  {%- case media.media_type -%}
    {%- when 'video' -%}
      {%- comment -%} Shopify-hosted video {%- endcomment -%}
      <div class="product-video__wrapper">
        {{ media | video_tag:
          controls: true,
          playsinline: true,
          preload: 'metadata',
          class: 'product-video__element'
        }}
      </div>

    {%- when 'external_video' -%}
      {%- comment -%} YouTube/Vimeo {%- endcomment -%}
      {% render 'video-embed',
        url: media.external_id | external_video_url,
        aspect_ratio: '16:9'
      %}
  {%- endcase -%}
</div>
```

---

## Video Section (Standalone)

```liquid
{%- comment -%}
  sections/video-section.liquid
  Standalone video section
{%- endcomment -%}

<section class="video-section section-{{ section.id }}">
  <div class="page-width">
    {%- if section.settings.heading != blank -%}
      <h2 class="video-section__heading {{ section.settings.heading_size }}">
        {{ section.settings.heading }}
      </h2>
    {%- endif -%}

    {%- if section.settings.text != blank -%}
      <div class="video-section__text">
        {{ section.settings.text }}
      </div>
    {%- endif -%}

    <div class="video-section__container">
      {%- if section.settings.video != blank -%}
        <div class="video-section__player">
          {{ section.settings.video | video_tag:
            controls: true,
            playsinline: true,
            preload: 'metadata'
          }}
        </div>
      {%- elsif section.settings.video_url != blank -%}
        {% render 'video-embed',
          url: section.settings.video_url,
          aspect_ratio: '16:9'
        %}
      {%- endif -%}

      {%- if section.settings.cover_image != blank and section.settings.video_url == blank -%}
        <div class="video-section__cover" data-video-cover>
          <img
            src="{{ section.settings.cover_image | image_url: width: 1200 }}"
            alt="{{ section.settings.cover_image.alt | escape }}"
            loading="lazy"
          >
          <button type="button" class="video-section__play" data-play-video>
            {% render 'icon', icon: 'play-circle' %}
            <span class="visually-hidden">{{ 'video.play' | t }}</span>
          </button>
        </div>
      {%- endif -%}
    </div>

    {%- if section.settings.caption != blank -%}
      <p class="video-section__caption">{{ section.settings.caption }}</p>
    {%- endif -%}
  </div>
</section>

{% schema %}
{
  "name": "Video",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h2", "label": "Large" },
        { "value": "h3", "label": "Medium" },
        { "value": "h4", "label": "Small" }
      ],
      "default": "h2"
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Text"
    },
    {
      "type": "header",
      "content": "Video"
    },
    {
      "type": "video",
      "id": "video",
      "label": "Video file"
    },
    {
      "type": "video_url",
      "id": "video_url",
      "label": "Or YouTube/Vimeo URL",
      "accept": ["youtube", "vimeo"]
    },
    {
      "type": "image_picker",
      "id": "cover_image",
      "label": "Cover image",
      "info": "Shown before video plays (for uploaded videos)"
    },
    {
      "type": "text",
      "id": "caption",
      "label": "Caption"
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
  "presets": [
    {
      "name": "Video"
    }
  ]
}
{% endschema %}
```

---

## CSS Styles

```css
/* Video Hero */
.video-hero {
  position: relative;
  height: var(--video-hero-height, 80vh);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
}

.video-hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.video-hero__video,
.video-hero__video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-hero__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--overlay-opacity, 0.3));
}

.video-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: var(--video-hero-content-position, center);
  align-items: center;
  text-align: var(--video-hero-text-align, center);
  height: 100%;
  padding: 3rem 1rem;
}

.video-hero__subheading {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.video-hero__heading {
  margin: 0 0 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.video-hero__text {
  max-width: 600px;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.video-hero__button {
  --button-background: white;
  --button-color: black;
}

.video-hero__control {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}

.video-hero__control:hover {
  background: rgba(255, 255, 255, 0.3);
}

.video-hero__control svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Video Embed */
.video-embed {
  position: relative;
  aspect-ratio: var(--aspect-ratio, 16/9);
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.video-embed--background {
  position: absolute;
  inset: 0;
  aspect-ratio: auto;
  border-radius: 0;
}

.video-embed__poster {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.video-embed__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-embed__placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-background-alt);
}

.video-embed__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-embed__play:hover {
  background: var(--color-primary);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-embed__play svg {
  width: 2.5rem;
  height: 2.5rem;
  margin-left: 4px;
}

.video-embed__container {
  position: absolute;
  inset: 0;
}

.video-embed__container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.video-embed--background .video-embed__container iframe {
  width: 100vw;
  height: 100vh;
  min-width: 177.77vh; /* 16:9 aspect ratio */
  min-height: 56.25vw;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Video Section */
.video-section {
  padding: var(--section-padding-top, 40px) 0 var(--section-padding-bottom, 40px);
}

.video-section__heading {
  text-align: center;
  margin-bottom: 1rem;
}

.video-section__text {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: var(--color-foreground-muted);
}

.video-section__container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.video-section__player video {
  width: 100%;
  border-radius: var(--border-radius);
}

.video-section__cover {
  position: relative;
  aspect-ratio: 16/9;
  cursor: pointer;
}

.video-section__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.video-section__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-section__play:hover {
  background: var(--color-primary);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-section__play svg {
  width: 2.5rem;
  height: 2.5rem;
}

.video-section__caption {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

/* Product Video */
.product-video {
  aspect-ratio: 16/9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--color-background-alt);
}

.product-video__wrapper {
  width: 100%;
  height: 100%;
}

.product-video__element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .video-hero__video-element {
    display: none;
  }

  .video-hero__fallback {
    display: block !important;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .video-hero {
    height: 70vh;
    min-height: 350px;
  }

  .video-hero__heading {
    font-size: 2rem;
  }

  .video-hero__control {
    bottom: 1rem;
    right: 1rem;
  }
}
```

---

## Locales

```json
{
  "video": {
    "play": "Play video",
    "pause": "Pause video"
  }
}
```

---

## Accessibility Notes

1. **Autoplay videos must be muted** - Browser policy requires muted autoplay
2. **Provide pause controls** - Users must be able to stop motion
3. **Honor prefers-reduced-motion** - Disable autoplay for users who prefer less motion
4. **Fallback images** - Always provide a static image fallback
5. **Focus management** - Ensure play button is keyboard accessible
