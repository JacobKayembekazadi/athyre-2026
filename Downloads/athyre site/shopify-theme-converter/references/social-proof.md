# Social Proof Patterns

Patterns for Instagram feeds, UGC galleries, social sharing, press logos, customer photos, purchase notifications, and social follower counts.

---

## Table of Contents

1. [Instagram Feed Section](#instagram-feed-section)
2. [UGC Gallery Section](#ugc-gallery-section)
3. [Social Sharing Buttons](#social-sharing-buttons)
4. [Press Logos / As Seen In](#press-logos--as-seen-in)
5. [Customer Photo Reviews](#customer-photo-reviews)
6. [Real-Time Purchase Notifications](#real-time-purchase-notifications)
7. [Social Follower Counts](#social-follower-counts)

---

## Instagram Feed Section

### Instagram Feed via Third-Party App

Instagram's API requires authentication. Most Shopify stores use apps like Instafeed or Covet.pics. This pattern shows how to integrate with such apps.

```liquid
{% comment %} sections/instagram-feed.liquid {% endcomment %}
{%- style -%}
  #Instagram-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }

  #Instagram-{{ section.id }} .instagram__grid {
    --columns: {{ section.settings.columns_desktop }};
    --gap: {{ section.settings.gap }}px;
  }

  @media (max-width: 768px) {
    #Instagram-{{ section.id }} .instagram__grid {
      --columns: {{ section.settings.columns_mobile }};
    }
  }
{%- endstyle -%}

<section id="Instagram-{{ section.id }}" class="instagram-section">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <div class="instagram__header text-center">
        <h2 class="instagram__title">{{ section.settings.heading }}</h2>
        {%- if section.settings.handle != blank -%}
          <a
            href="https://instagram.com/{{ section.settings.handle }}"
            class="instagram__handle"
            target="_blank"
            rel="noopener"
          >
            @{{ section.settings.handle }}
          </a>
        {%- endif -%}
      </div>
    {%- endif -%}

    {%- comment -%}
      Option 1: App integration placeholder
      Replace this div ID with your app's container
    {%- endcomment -%}
    <div
      id="instafeed-{{ section.id }}"
      class="instagram__grid"
      data-instagram-feed
      data-user-id="{{ section.settings.user_id }}"
      data-access-token="{{ section.settings.access_token }}"
      data-limit="{{ section.settings.limit }}"
    >
      {%- comment -%} App will inject content here {%- endcomment -%}

      {%- comment -%}
        Option 2: Manual images from blocks (fallback)
      {%- endcomment -%}
      {%- if section.blocks.size > 0 -%}
        {%- for block in section.blocks -%}
          <a
            href="{{ block.settings.link | default: '#' }}"
            class="instagram__item"
            target="_blank"
            rel="noopener"
            {{ block.shopify_attributes }}
          >
            {%- if block.settings.image != blank -%}
              <img
                src="{{ block.settings.image | image_url: width: 400 }}"
                alt="{{ block.settings.alt | escape }}"
                width="300"
                height="300"
                loading="lazy"
                class="instagram__image"
              >
            {%- else -%}
              {{ 'image' | placeholder_svg_tag: 'placeholder-svg' }}
            {%- endif -%}
            <div class="instagram__overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </a>
        {%- endfor -%}
      {%- endif -%}
    </div>

    {%- if section.settings.show_cta -%}
      <div class="instagram__cta text-center">
        <a
          href="https://instagram.com/{{ section.settings.handle }}"
          class="button button--secondary"
          target="_blank"
          rel="noopener"
        >
          {{ section.settings.cta_text | default: 'Follow us on Instagram' }}
        </a>
      </div>
    {%- endif -%}
  </div>
</section>

<style>
  .instagram__header {
    margin-bottom: 2rem;
  }

  .instagram__title {
    margin: 0 0 0.5rem;
  }

  .instagram__handle {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .instagram__handle:hover {
    text-decoration: underline;
  }

  .instagram__grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 6), 1fr);
    gap: var(--gap, 8px);
  }

  .instagram__item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    display: block;
  }

  .instagram__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .instagram__item:hover .instagram__image {
    transform: scale(1.05);
  }

  .instagram__overlay {
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

  .instagram__item:hover .instagram__overlay {
    background: rgba(0, 0, 0, 0.4);
    opacity: 1;
  }

  .instagram__cta {
    margin-top: 2rem;
  }
</style>

{% schema %}
{
  "name": "Instagram Feed",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Follow Us"
    },
    {
      "type": "text",
      "id": "handle",
      "label": "Instagram handle",
      "info": "Without @"
    },
    {
      "type": "header",
      "content": "API Settings",
      "info": "For Instagram Basic Display API integration"
    },
    {
      "type": "text",
      "id": "user_id",
      "label": "User ID"
    },
    {
      "type": "text",
      "id": "access_token",
      "label": "Access token",
      "info": "Long-lived access token from Instagram"
    },
    {
      "type": "range",
      "id": "limit",
      "label": "Number of posts",
      "min": 4,
      "max": 12,
      "default": 6
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "columns_desktop",
      "label": "Columns on desktop",
      "min": 3,
      "max": 8,
      "default": 6
    },
    {
      "type": "range",
      "id": "columns_mobile",
      "label": "Columns on mobile",
      "min": 2,
      "max": 4,
      "default": 3
    },
    {
      "type": "range",
      "id": "gap",
      "label": "Gap",
      "min": 0,
      "max": 24,
      "step": 4,
      "default": 8,
      "unit": "px"
    },
    {
      "type": "header",
      "content": "Call to action"
    },
    {
      "type": "checkbox",
      "id": "show_cta",
      "label": "Show follow button",
      "default": true
    },
    {
      "type": "text",
      "id": "cta_text",
      "label": "Button text",
      "default": "Follow us on Instagram"
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
          "type": "url",
          "id": "link",
          "label": "Link",
          "info": "Link to Instagram post"
        },
        {
          "type": "text",
          "id": "alt",
          "label": "Alt text"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Instagram Feed"
    }
  ]
}
{% endschema %}
```

### Instafeed.js Integration (Self-Hosted)

```javascript
// assets/instagram-feed.js
// Note: Instagram Basic Display API tokens expire and need refreshing
class InstagramFeed extends HTMLElement {
  connectedCallback() {
    this.userId = this.dataset.userId;
    this.accessToken = this.dataset.accessToken;
    this.limit = parseInt(this.dataset.limit) || 6;

    if (this.accessToken) {
      this.fetchFeed();
    }
  }

  async fetchFeed() {
    try {
      const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${this.accessToken}&limit=${this.limit}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Instagram API error');

      const data = await response.json();
      this.renderFeed(data.data);
    } catch (error) {
      console.error('Instagram feed error:', error);
      // Keep any fallback content that's already in the container
    }
  }

  renderFeed(posts) {
    // Clear placeholder content
    this.innerHTML = posts.map(post => {
      const imageUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;

      return `
        <a href="${post.permalink}" class="instagram__item" target="_blank" rel="noopener">
          <img
            src="${imageUrl}"
            alt="${this.escapeHtml(post.caption?.substring(0, 100) || 'Instagram post')}"
            width="300"
            height="300"
            loading="lazy"
            class="instagram__image"
          >
          <div class="instagram__overlay">
            ${post.media_type === 'VIDEO' ? this.getVideoIcon() : this.getInstagramIcon()}
          </div>
        </a>
      `;
    }).join('');
  }

  getInstagramIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
    </svg>`;
  }

  getVideoIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('instagram-feed', InstagramFeed);
```

---

## UGC Gallery Section

### User Generated Content Gallery

```liquid
{% comment %} sections/ugc-gallery.liquid {% endcomment %}
{%- style -%}
  #UGC-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<section id="UGC-{{ section.id }}" class="ugc-section">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <div class="ugc__header text-center">
        <h2 class="ugc__title">{{ section.settings.heading }}</h2>
        {%- if section.settings.subheading != blank -%}
          <p class="ugc__subtitle">{{ section.settings.subheading }}</p>
        {%- endif -%}
        {%- if section.settings.hashtag != blank -%}
          <p class="ugc__hashtag">#{{ section.settings.hashtag }}</p>
        {%- endif -%}
      </div>
    {%- endif -%}

    <div class="ugc__grid">
      {%- for block in section.blocks -%}
        <div class="ugc__item" {{ block.shopify_attributes }}>
          <button type="button" class="ugc__trigger" data-ugc-modal="{{ forloop.index0 }}">
            {%- if block.settings.image != blank -%}
              <img
                src="{{ block.settings.image | image_url: width: 600 }}"
                alt="{{ block.settings.alt | default: 'Customer photo' | escape }}"
                width="300"
                height="300"
                loading="lazy"
                class="ugc__image"
              >
            {%- endif -%}

            <div class="ugc__overlay">
              {%- if block.settings.customer_name != blank -%}
                <span class="ugc__customer">@{{ block.settings.customer_name }}</span>
              {%- endif -%}
            </div>
          </button>

          {%- if block.settings.product != blank -%}
            <a href="{{ block.settings.product.url }}" class="ugc__product-link">
              <span class="ugc__product-badge">Shop this look</span>
            </a>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>

    {%- if section.settings.show_submit_cta -%}
      <div class="ugc__cta text-center">
        <p class="ugc__cta-text">{{ section.settings.submit_text }}</p>
        <a href="{{ section.settings.submit_link }}" class="button button--secondary">
          {{ section.settings.submit_button_text | default: 'Share your photo' }}
        </a>
      </div>
    {%- endif -%}
  </div>

  {%- comment -%} UGC Modal {%- endcomment -%}
  <ugc-modal class="ugc-modal" id="ugc-modal">
    <div class="ugc-modal__backdrop" data-close></div>
    <div class="ugc-modal__content">
      <button type="button" class="ugc-modal__close" data-close aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div class="ugc-modal__grid">
        <div class="ugc-modal__image-wrapper">
          <img class="ugc-modal__image" src="" alt="">
        </div>

        <div class="ugc-modal__details">
          <div class="ugc-modal__user">
            <div class="ugc-modal__avatar"></div>
            <span class="ugc-modal__username"></span>
          </div>

          <p class="ugc-modal__caption"></p>

          <div class="ugc-modal__product"></div>
        </div>
      </div>
    </div>
  </ugc-modal>
</section>

<script>
  class UGCModal extends HTMLElement {
    connectedCallback() {
      this.backdrop = this.querySelector('[data-close]');
      this.closeBtns = this.querySelectorAll('[data-close]');
      this.imageEl = this.querySelector('.ugc-modal__image');
      this.usernameEl = this.querySelector('.ugc-modal__username');
      this.captionEl = this.querySelector('.ugc-modal__caption');
      this.productEl = this.querySelector('.ugc-modal__product');

      this.bindEvents();
    }

    bindEvents() {
      this.closeBtns.forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.classList.contains('is-open')) {
          this.close();
        }
      });

      // Open triggers
      document.querySelectorAll('[data-ugc-modal]').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const index = parseInt(trigger.dataset.ugcModal);
          this.open(index);
        });
      });
    }

    open(index) {
      const items = document.querySelectorAll('.ugc__item');
      const item = items[index];
      if (!item) return;

      const block = item;
      const image = block.querySelector('.ugc__image');
      const username = block.querySelector('.ugc__customer')?.textContent || '';
      const productLink = block.querySelector('.ugc__product-link');

      this.imageEl.src = image?.src || '';
      this.imageEl.alt = image?.alt || '';
      this.usernameEl.textContent = username;

      if (productLink) {
        this.productEl.innerHTML = `
          <a href="${productLink.href}" class="button button--small">
            Shop this look
          </a>
        `;
      } else {
        this.productEl.innerHTML = '';
      }

      this.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  customElements.define('ugc-modal', UGCModal);
</script>

<style>
  .ugc__header {
    margin-bottom: 2rem;
  }

  .ugc__title {
    margin: 0 0 0.5rem;
  }

  .ugc__subtitle {
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem;
  }

  .ugc__hashtag {
    color: var(--color-primary);
    font-weight: 600;
    margin: 0;
  }

  .ugc__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .ugc__item {
    position: relative;
  }

  .ugc__trigger {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
  }

  .ugc__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  .ugc__trigger:hover .ugc__image {
    transform: scale(1.05);
  }

  .ugc__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 1rem;
    background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.6));
    opacity: 0;
    transition: opacity 0.3s;
  }

  .ugc__trigger:hover .ugc__overlay {
    opacity: 1;
  }

  .ugc__customer {
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .ugc__product-link {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }

  .ugc__product-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background: white;
    color: var(--color-text);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .ugc__cta {
    margin-top: 2rem;
  }

  .ugc__cta-text {
    margin: 0 0 1rem;
    color: var(--color-text-secondary);
  }

  /* Modal */
  ugc-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  ugc-modal.is-open {
    display: flex;
  }

  .ugc-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
  }

  .ugc-modal__content {
    position: relative;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }

  .ugc-modal__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .ugc-modal__grid {
    display: grid;
    grid-template-columns: 1fr 300px;
  }

  @media (max-width: 768px) {
    .ugc-modal__grid {
      grid-template-columns: 1fr;
    }
  }

  .ugc-modal__image-wrapper {
    aspect-ratio: 1;
    background: var(--color-background-secondary);
  }

  .ugc-modal__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .ugc-modal__details {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .ugc-modal__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .ugc-modal__avatar {
    width: 40px;
    height: 40px;
    background: var(--color-background-secondary);
    border-radius: 50%;
  }

  .ugc-modal__username {
    font-weight: 600;
  }

  .ugc-modal__caption {
    flex: 1;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .ugc-modal__product {
    margin-top: auto;
  }
</style>

{% schema %}
{
  "name": "UGC Gallery",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Our Community"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "See how our customers style their looks"
    },
    {
      "type": "text",
      "id": "hashtag",
      "label": "Hashtag",
      "info": "Without #"
    },
    {
      "type": "header",
      "content": "Submit CTA"
    },
    {
      "type": "checkbox",
      "id": "show_submit_cta",
      "label": "Show submit call to action",
      "default": true
    },
    {
      "type": "text",
      "id": "submit_text",
      "label": "Submit text",
      "default": "Want to be featured? Tag us in your photos!"
    },
    {
      "type": "text",
      "id": "submit_button_text",
      "label": "Button text",
      "default": "Share your photo"
    },
    {
      "type": "url",
      "id": "submit_link",
      "label": "Button link"
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
      "type": "photo",
      "name": "Photo",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        },
        {
          "type": "text",
          "id": "customer_name",
          "label": "Customer username",
          "info": "Without @"
        },
        {
          "type": "textarea",
          "id": "caption",
          "label": "Caption"
        },
        {
          "type": "product",
          "id": "product",
          "label": "Tagged product"
        },
        {
          "type": "text",
          "id": "alt",
          "label": "Image alt text"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "UGC Gallery",
      "blocks": [
        { "type": "photo" },
        { "type": "photo" },
        { "type": "photo" },
        { "type": "photo" }
      ]
    }
  ]
}
{% endschema %}
```

---

## Social Sharing Buttons

### Social Share Snippet

```liquid
{% comment %} snippets/social-share.liquid {% endcomment %}
{% comment %}
  Renders social sharing buttons

  Accepts:
  - share_url: URL to share (default: current URL)
  - share_title: Title to share (default: page title)
  - share_image: Image URL for Pinterest
  - layout: 'horizontal' or 'vertical' (default: horizontal)
  - show_labels: Show button labels (default: false)

  Usage:
  {% render 'social-share', share_title: product.title, share_image: product.featured_image %}
{% endcomment %}

{%- liquid
  assign share_url = share_url | default: request.origin | append: request.path
  assign share_title = share_title | default: page_title
  assign share_image = share_image | image_url: width: 1200
  assign encoded_url = share_url | url_encode
  assign encoded_title = share_title | url_encode
-%}

<div class="social-share {% if layout == 'vertical' %}social-share--vertical{% endif %}">
  {%- if section.settings.share_label != blank or settings.share_label != blank -%}
    <span class="social-share__label">
      {{ section.settings.share_label | default: settings.share_label | default: 'Share:' }}
    </span>
  {%- endif -%}

  <div class="social-share__buttons">
    {%- comment -%} Facebook {%- endcomment -%}
    <a
      href="https://www.facebook.com/sharer/sharer.php?u={{ encoded_url }}"
      class="social-share__button social-share__button--facebook"
      target="_blank"
      rel="noopener"
      aria-label="Share on Facebook"
      title="Share on Facebook"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {%- if show_labels -%}<span>Facebook</span>{%- endif -%}
    </a>

    {%- comment -%} X (Twitter) {%- endcomment -%}
    <a
      href="https://twitter.com/intent/tweet?url={{ encoded_url }}&text={{ encoded_title }}"
      class="social-share__button social-share__button--twitter"
      target="_blank"
      rel="noopener"
      aria-label="Share on X"
      title="Share on X"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      {%- if show_labels -%}<span>X</span>{%- endif -%}
    </a>

    {%- comment -%} Pinterest {%- endcomment -%}
    <a
      href="https://pinterest.com/pin/create/button/?url={{ encoded_url }}&media={{ share_image | url_encode }}&description={{ encoded_title }}"
      class="social-share__button social-share__button--pinterest"
      target="_blank"
      rel="noopener"
      aria-label="Pin on Pinterest"
      title="Pin on Pinterest"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
      </svg>
      {%- if show_labels -%}<span>Pinterest</span>{%- endif -%}
    </a>

    {%- comment -%} Email {%- endcomment -%}
    <a
      href="mailto:?subject={{ encoded_title }}&body={{ share_url }}"
      class="social-share__button social-share__button--email"
      aria-label="Share via Email"
      title="Share via Email"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      {%- if show_labels -%}<span>Email</span>{%- endif -%}
    </a>

    {%- comment -%} Copy Link {%- endcomment -%}
    <button
      type="button"
      class="social-share__button social-share__button--copy"
      data-copy-url="{{ share_url }}"
      aria-label="Copy link"
      title="Copy link"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-link">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-check" style="display: none;">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {%- if show_labels -%}<span>Copy</span>{%- endif -%}
    </button>
  </div>
</div>

<script>
  document.querySelectorAll('[data-copy-url]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.copyUrl;
      try {
        await navigator.clipboard.writeText(url);
        btn.querySelector('.icon-link').style.display = 'none';
        btn.querySelector('.icon-check').style.display = 'block';
        setTimeout(() => {
          btn.querySelector('.icon-link').style.display = 'block';
          btn.querySelector('.icon-check').style.display = 'none';
        }, 2000);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    });
  });
</script>

<style>
  .social-share {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .social-share--vertical {
    flex-direction: column;
    align-items: flex-start;
  }

  .social-share__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .social-share__buttons {
    display: flex;
    gap: 0.5rem;
  }

  .social-share--vertical .social-share__buttons {
    flex-direction: column;
  }

  .social-share__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    background: var(--color-background);
    color: var(--color-text);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .social-share__button span {
    display: none;
  }

  .social-share__button:hover {
    border-color: currentColor;
  }

  .social-share__button--facebook:hover {
    color: #1877f2;
    background: rgba(24, 119, 242, 0.1);
  }

  .social-share__button--twitter:hover {
    color: #000;
    background: rgba(0, 0, 0, 0.05);
  }

  .social-share__button--pinterest:hover {
    color: #e60023;
    background: rgba(230, 0, 35, 0.1);
  }

  .social-share__button--email:hover {
    color: var(--color-primary);
    background: rgba(var(--color-primary-rgb), 0.1);
  }

  .social-share__button--copy:hover {
    color: var(--color-success, #22c55e);
    background: rgba(34, 197, 94, 0.1);
  }
</style>
```

### Native Share API (Mobile)

```liquid
{% comment %} snippets/native-share.liquid {% endcomment %}
<share-button class="native-share" data-url="{{ share_url }}" data-title="{{ share_title }}">
  <button type="button" class="button button--secondary">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
    Share
  </button>
</share-button>

<script>
  class ShareButton extends HTMLElement {
    connectedCallback() {
      const button = this.querySelector('button');
      const canShare = navigator.share && navigator.canShare;

      if (!canShare) {
        // Hide native share if not supported
        this.style.display = 'none';
        return;
      }

      button.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: this.dataset.title,
            url: this.dataset.url
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      });
    }
  }
  customElements.define('share-button', ShareButton);
</script>
```

---

## Press Logos / As Seen In

### Press Logos Section

```liquid
{% comment %} sections/press-logos.liquid {% endcomment %}
{%- style -%}
  #Press-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
    background: {{ section.settings.background_color }};
  }
{%- endstyle -%}

<section id="Press-{{ section.id }}" class="press-section">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <p class="press__heading text-center">{{ section.settings.heading }}</p>
    {%- endif -%}

    <div class="press__logos {% if section.settings.grayscale %}press__logos--grayscale{% endif %}">
      {%- for block in section.blocks -%}
        <div class="press__logo" {{ block.shopify_attributes }}>
          {%- if block.settings.link != blank -%}
            <a href="{{ block.settings.link }}" target="_blank" rel="noopener">
          {%- endif -%}

          {%- if block.settings.logo != blank -%}
            <img
              src="{{ block.settings.logo | image_url: height: 80 }}"
              alt="{{ block.settings.alt | default: block.settings.logo.alt | escape }}"
              height="40"
              loading="lazy"
              class="press__logo-image"
            >
          {%- else -%}
            {{ 'logo' | placeholder_svg_tag: 'placeholder-svg' }}
          {%- endif -%}

          {%- if block.settings.link != blank -%}
            </a>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

<style>
  .press__heading {
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-secondary);
    margin: 0 0 2rem;
  }

  .press__logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2rem 3rem;
  }

  .press__logo {
    max-width: 120px;
  }

  .press__logo a {
    display: block;
  }

  .press__logo-image {
    width: auto;
    height: 40px;
    max-width: 100%;
    object-fit: contain;
    transition: opacity 0.2s;
  }

  .press__logos--grayscale .press__logo-image {
    filter: grayscale(100%);
    opacity: 0.6;
  }

  .press__logos--grayscale .press__logo:hover .press__logo-image {
    filter: grayscale(0);
    opacity: 1;
  }

  @media (max-width: 768px) {
    .press__logos {
      gap: 1.5rem 2rem;
    }

    .press__logo {
      max-width: 100px;
    }

    .press__logo-image {
      height: 30px;
    }
  }
</style>

{% schema %}
{
  "name": "Press Logos",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "As Seen In"
    },
    {
      "type": "checkbox",
      "id": "grayscale",
      "label": "Grayscale logos",
      "info": "Display logos in grayscale, color on hover",
      "default": true
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Background color",
      "default": "transparent"
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
      "type": "logo",
      "name": "Logo",
      "settings": [
        {
          "type": "image_picker",
          "id": "logo",
          "label": "Logo"
        },
        {
          "type": "text",
          "id": "alt",
          "label": "Alt text"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Link",
          "info": "Link to press article (optional)"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Press Logos",
      "blocks": [
        { "type": "logo" },
        { "type": "logo" },
        { "type": "logo" },
        { "type": "logo" },
        { "type": "logo" }
      ]
    }
  ]
}
{% endschema %}
```

---

## Customer Photo Reviews

### Photo Reviews Integration

```liquid
{% comment %} snippets/photo-reviews.liquid {% endcomment %}
{% comment %}
  Display customer photo reviews
  Works with review apps that support metafields or API

  Accepts:
  - product: Product object
  - limit: Number of photos to show

  Usage:
  {% render 'photo-reviews', product: product, limit: 6 %}
{% endcomment %}

{%- liquid
  assign review_photos = product.metafields.reviews.photos.value
  assign limit = limit | default: 6
-%}

{%- if review_photos != blank and review_photos.size > 0 -%}
  <div class="photo-reviews">
    <h3 class="photo-reviews__title">
      {{ 'products.reviews.customer_photos' | t | default: 'Customer Photos' }}
    </h3>

    <div class="photo-reviews__grid">
      {%- for photo in review_photos limit: limit -%}
        <button
          type="button"
          class="photo-reviews__item"
          data-photo-review="{{ forloop.index0 }}"
        >
          <img
            src="{{ photo.image | image_url: width: 200 }}"
            alt="Customer photo {{ forloop.index }}"
            width="150"
            height="150"
            loading="lazy"
          >
          {%- if photo.rating -%}
            <div class="photo-reviews__rating">
              {% render 'star-rating', rating: photo.rating %}
            </div>
          {%- endif -%}
        </button>
      {%- endfor -%}
    </div>

    {%- if review_photos.size > limit -%}
      <button type="button" class="photo-reviews__show-all link">
        {{ 'products.reviews.see_all_photos' | t | default: 'See all photos' }}
        ({{ review_photos.size }})
      </button>
    {%- endif -%}
  </div>
{%- endif -%}

<style>
  .photo-reviews {
    margin: 2rem 0;
  }

  .photo-reviews__title {
    font-size: 1rem;
    margin: 0 0 1rem;
  }

  .photo-reviews__grid {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .photo-reviews__item {
    flex-shrink: 0;
    position: relative;
    width: 100px;
    height: 100px;
    padding: 0;
    border: none;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
  }

  .photo-reviews__item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  .photo-reviews__item:hover img {
    transform: scale(1.05);
  }

  .photo-reviews__rating {
    position: absolute;
    bottom: 4px;
    left: 4px;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
  }

  .photo-reviews__show-all {
    display: block;
    margin-top: 1rem;
  }
</style>
```

### Star Rating Snippet

```liquid
{% comment %} snippets/star-rating.liquid {% endcomment %}
{% comment %}
  Renders star rating

  Accepts:
  - rating: Rating value (0-5)
  - show_count: Show rating count
  - count: Number of reviews

  Usage:
  {% render 'star-rating', rating: 4.5, show_count: true, count: 128 %}
{% endcomment %}

{%- liquid
  assign rating = rating | default: 0 | times: 1.0
  assign full_stars = rating | floor
  assign half_star = rating | minus: full_stars | at_least: 0.25 | at_most: 0.75
  assign empty_stars = 5 | minus: full_stars
  if half_star > 0
    assign empty_stars = empty_stars | minus: 1
  endif
-%}

<div class="star-rating" role="img" aria-label="{{ rating }} out of 5 stars">
  {%- for i in (1..full_stars) -%}
    <svg class="star star--full" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  {%- endfor -%}

  {%- if half_star > 0 -%}
    <svg class="star star--half" width="16" height="16" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="half-{{ section.id }}-{{ forloop.index }}">
          <stop offset="50%" stop-color="currentColor"/>
          <stop offset="50%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-{{ section.id }}-{{ forloop.index }})" stroke="currentColor" stroke-width="1"/>
    </svg>
  {%- endif -%}

  {%- for i in (1..empty_stars) -%}
    <svg class="star star--empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  {%- endfor -%}

  {%- if show_count and count -%}
    <span class="star-rating__count">({{ count }})</span>
  {%- endif -%}
</div>

<style>
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    color: #fbbf24;
  }

  .star--empty {
    color: var(--color-border);
  }

  .star-rating__count {
    margin-left: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
</style>
```

---

## Real-Time Purchase Notifications

### Sales Pop Notification

```liquid
{% comment %} snippets/sales-pop.liquid {% endcomment %}
{% comment %}
  Displays real-time purchase notifications
  Note: Real data requires app integration. This shows simulated notifications.

  Usage:
  {% render 'sales-pop' %}
{% endcomment %}

{%- if settings.sales_pop_enabled -%}
  <sales-pop
    class="sales-pop"
    data-interval="{{ settings.sales_pop_interval | default: 5000 }}"
    data-duration="{{ settings.sales_pop_duration | default: 4000 }}"
    data-position="{{ settings.sales_pop_position | default: 'bottom-left' }}"
  >
    <div class="sales-pop__inner">
      <button type="button" class="sales-pop__close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div class="sales-pop__image"></div>

      <div class="sales-pop__content">
        <p class="sales-pop__message">
          <strong class="sales-pop__name"></strong>
          <span>{{ 'general.sales_pop.purchased' | t | default: 'just purchased' }}</span>
        </p>
        <p class="sales-pop__product"></p>
        <p class="sales-pop__time"></p>
      </div>
    </div>
  </sales-pop>

  <script>
    class SalesPop extends HTMLElement {
      constructor() {
        super();
        this.interval = parseInt(this.dataset.interval) || 5000;
        this.duration = parseInt(this.dataset.duration) || 4000;
        this.position = this.dataset.position || 'bottom-left';
        this.isEnabled = true;
        this.currentIndex = 0;

        // Sample data - replace with real API data
        this.purchases = {{ shop.products | slice: 0, 10 | json }};
        this.names = ['Sarah', 'Mike', 'Emma', 'James', 'Lisa', 'David', 'Amy', 'John', 'Rachel', 'Tom'];
        this.locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Toronto', 'London', 'Sydney'];
        this.times = ['just now', '2 minutes ago', '5 minutes ago', '10 minutes ago', '15 minutes ago'];
      }

      connectedCallback() {
        this.closeBtn = this.querySelector('.sales-pop__close');
        this.imageEl = this.querySelector('.sales-pop__image');
        this.nameEl = this.querySelector('.sales-pop__name');
        this.productEl = this.querySelector('.sales-pop__product');
        this.timeEl = this.querySelector('.sales-pop__time');

        this.closeBtn.addEventListener('click', () => this.disable());

        // Set position
        this.classList.add(`sales-pop--${this.position}`);

        // Start showing notifications
        this.scheduleNext();
      }

      scheduleNext() {
        if (!this.isEnabled) return;

        setTimeout(() => {
          this.show();
        }, this.interval + Math.random() * 3000);
      }

      show() {
        if (!this.isEnabled || this.purchases.length === 0) return;

        // Get random data
        const product = this.purchases[this.currentIndex % this.purchases.length];
        const name = this.names[Math.floor(Math.random() * this.names.length)];
        const location = this.locations[Math.floor(Math.random() * this.locations.length)];
        const time = this.times[Math.floor(Math.random() * this.times.length)];

        // Update content
        this.imageEl.innerHTML = product.featured_image
          ? `<img src="${this.getImageUrl(product.featured_image.src, 80)}" alt="" width="60" height="60">`
          : '';
        this.nameEl.textContent = `${name} from ${location}`;
        this.productEl.textContent = product.title;
        this.timeEl.textContent = time;

        // Show notification
        this.classList.add('is-visible');

        // Hide after duration
        setTimeout(() => {
          this.hide();
        }, this.duration);

        this.currentIndex++;
      }

      hide() {
        this.classList.remove('is-visible');
        this.scheduleNext();
      }

      disable() {
        this.isEnabled = false;
        this.classList.remove('is-visible');
        sessionStorage.setItem('sales-pop-disabled', 'true');
      }

      getImageUrl(url, size) {
        if (!url) return '';
        return url.replace(/(_\d+x\d+)?(\.[a-zA-Z]+)(\?.*)?$/, `_${size}x$2`);
      }
    }

    // Don't show if disabled this session
    if (!sessionStorage.getItem('sales-pop-disabled')) {
      customElements.define('sales-pop', SalesPop);
    }
  </script>

  <style>
    sales-pop {
      position: fixed;
      z-index: 999;
      max-width: 320px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    }

    sales-pop.is-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    sales-pop.sales-pop--bottom-left {
      bottom: 1rem;
      left: 1rem;
    }

    sales-pop.sales-pop--bottom-right {
      bottom: 1rem;
      right: 1rem;
    }

    sales-pop.sales-pop--top-left {
      top: 1rem;
      left: 1rem;
    }

    sales-pop.sales-pop--top-right {
      top: 1rem;
      right: 1rem;
    }

    .sales-pop__inner {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .sales-pop__close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .sales-pop__close:hover {
      opacity: 1;
    }

    .sales-pop__image {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      background: var(--color-background-secondary);
    }

    .sales-pop__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sales-pop__content {
      flex: 1;
      min-width: 0;
      padding-right: 1rem;
    }

    .sales-pop__message {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin: 0 0 0.25rem;
    }

    .sales-pop__name {
      color: var(--color-text);
    }

    .sales-pop__product {
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0 0 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sales-pop__time {
      font-size: 0.625rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    @media (max-width: 480px) {
      sales-pop {
        left: 0.5rem;
        right: 0.5rem;
        max-width: none;
      }
    }
  </style>
{%- endif -%}
```

---

## Social Follower Counts

### Social Stats Section

```liquid
{% comment %} sections/social-stats.liquid {% endcomment %}
<section class="social-stats" id="SocialStats-{{ section.id }}">
  <div class="container">
    {%- if section.settings.heading != blank -%}
      <h2 class="social-stats__title text-center">{{ section.settings.heading }}</h2>
    {%- endif -%}

    <div class="social-stats__grid">
      {%- for block in section.blocks -%}
        <a
          href="{{ block.settings.url }}"
          class="social-stats__item"
          target="_blank"
          rel="noopener"
          {{ block.shopify_attributes }}
        >
          <div class="social-stats__icon social-stats__icon--{{ block.settings.platform }}">
            {%- case block.settings.platform -%}
              {%- when 'instagram' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>

              {%- when 'facebook' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>

              {%- when 'twitter' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>

              {%- when 'tiktok' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>

              {%- when 'youtube' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>

              {%- when 'pinterest' -%}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
            {%- endcase -%}
          </div>

          <div class="social-stats__count">
            {{ block.settings.count }}
          </div>

          <div class="social-stats__label">
            {{ block.settings.label | default: 'Followers' }}
          </div>
        </a>
      {%- endfor -%}
    </div>
  </div>
</section>

<style>
  .social-stats {
    padding: 3rem 0;
  }

  .social-stats__title {
    margin: 0 0 2rem;
  }

  .social-stats__grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .social-stats__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--color-text);
    transition: transform 0.2s;
  }

  .social-stats__item:hover {
    transform: translateY(-4px);
  }

  .social-stats__icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-background-secondary);
    transition: background 0.2s, color 0.2s;
  }

  .social-stats__item:hover .social-stats__icon--instagram {
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    color: white;
  }

  .social-stats__item:hover .social-stats__icon--facebook {
    background: #1877f2;
    color: white;
  }

  .social-stats__item:hover .social-stats__icon--twitter {
    background: #000;
    color: white;
  }

  .social-stats__item:hover .social-stats__icon--tiktok {
    background: #000;
    color: white;
  }

  .social-stats__item:hover .social-stats__icon--youtube {
    background: #ff0000;
    color: white;
  }

  .social-stats__item:hover .social-stats__icon--pinterest {
    background: #e60023;
    color: white;
  }

  .social-stats__count {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .social-stats__label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
</style>

{% schema %}
{
  "name": "Social Stats",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Join Our Community"
    }
  ],
  "blocks": [
    {
      "type": "platform",
      "name": "Platform",
      "settings": [
        {
          "type": "select",
          "id": "platform",
          "label": "Platform",
          "options": [
            { "value": "instagram", "label": "Instagram" },
            { "value": "facebook", "label": "Facebook" },
            { "value": "twitter", "label": "X (Twitter)" },
            { "value": "tiktok", "label": "TikTok" },
            { "value": "youtube", "label": "YouTube" },
            { "value": "pinterest", "label": "Pinterest" }
          ],
          "default": "instagram"
        },
        {
          "type": "text",
          "id": "count",
          "label": "Follower count",
          "default": "50K+"
        },
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Followers"
        },
        {
          "type": "url",
          "id": "url",
          "label": "Profile URL"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Social Stats",
      "blocks": [
        { "type": "platform", "settings": { "platform": "instagram", "count": "125K+" } },
        { "type": "platform", "settings": { "platform": "facebook", "count": "89K+" } },
        { "type": "platform", "settings": { "platform": "tiktok", "count": "250K+" } }
      ]
    }
  ]
}
{% endschema %}
```

---

## Checklist

When implementing social proof patterns:

- [ ] Use lazy loading for Instagram/UGC images
- [ ] Handle API errors gracefully (show fallback content)
- [ ] Include proper aria-labels for accessibility
- [ ] Test social share URLs with each platform
- [ ] Verify Instagram API token hasn't expired
- [ ] Ensure sales pop can be dismissed
- [ ] Store dismissal state in sessionStorage
- [ ] Test UGC modal on mobile devices
- [ ] Verify star ratings render correctly
- [ ] Check press logos look good in grayscale
- [ ] Test copy-to-clipboard fallback
- [ ] Consider native share API for mobile
- [ ] Validate follower count formatting
- [ ] Ensure external links open in new tabs
