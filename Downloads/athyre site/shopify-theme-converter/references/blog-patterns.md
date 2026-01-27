# Blog & Article Patterns

Article templates, blog layouts, related posts, author bios, reading time, and table of contents.

---

## Article Template

### Template JSON

```json
{
  "sections": {
    "main": {
      "type": "main-article",
      "settings": {
        "show_author": true,
        "show_date": true,
        "show_reading_time": true,
        "show_featured_image": true,
        "show_social_share": true,
        "show_tags": true
      },
      "blocks": [
        { "type": "featured_image" },
        { "type": "title" },
        { "type": "meta" },
        { "type": "content" },
        { "type": "tags" },
        { "type": "share" }
      ]
    },
    "author": {
      "type": "article-author",
      "settings": {}
    },
    "related": {
      "type": "article-related",
      "settings": {
        "posts_count": 3
      }
    },
    "comments": {
      "type": "article-comments",
      "settings": {}
    }
  },
  "order": ["main", "author", "related", "comments"]
}
```

### Main Article Section

```liquid
{%- comment -%}
  sections/main-article.liquid
  Article content section
{%- endcomment -%}

<article
  class="article"
  itemscope
  itemtype="http://schema.org/BlogPosting"
>
  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'featured_image' -%}
        {%- if article.image -%}
          <div class="article__featured-image" {{ block.shopify_attributes }}>
            <img
              src="{{ article.image | image_url: width: 1200 }}"
              srcset="
                {{ article.image | image_url: width: 600 }} 600w,
                {{ article.image | image_url: width: 900 }} 900w,
                {{ article.image | image_url: width: 1200 }} 1200w
              "
              sizes="(max-width: 768px) 100vw, 800px"
              alt="{{ article.image.alt | escape }}"
              width="{{ article.image.width }}"
              height="{{ article.image.height }}"
              loading="eager"
              itemprop="image"
            >
          </div>
        {%- endif -%}

      {%- when 'title' -%}
        <header class="article__header" {{ block.shopify_attributes }}>
          <h1 class="article__title" itemprop="headline">
            {{ article.title }}
          </h1>
        </header>

      {%- when 'meta' -%}
        <div class="article__meta" {{ block.shopify_attributes }}>
          {%- if section.settings.show_author -%}
            <span class="article__author" itemprop="author">
              {% render 'icon', icon: 'user' %}
              {{ article.author }}
            </span>
          {%- endif -%}

          {%- if section.settings.show_date -%}
            <time
              class="article__date"
              datetime="{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}"
              itemprop="datePublished"
            >
              {% render 'icon', icon: 'calendar' %}
              {{ article.published_at | date: format: 'date' }}
            </time>
          {%- endif -%}

          {%- if section.settings.show_reading_time -%}
            {%- assign words = article.content | strip_html | split: ' ' | size -%}
            {%- assign reading_time = words | divided_by: 200 | plus: 1 -%}
            <span class="article__reading-time">
              {% render 'icon', icon: 'clock' %}
              {{ 'blog.article.reading_time' | t: minutes: reading_time }}
            </span>
          {%- endif -%}
        </div>

      {%- when 'content' -%}
        <div
          class="article__content rte"
          itemprop="articleBody"
          {{ block.shopify_attributes }}
        >
          {{ article.content }}
        </div>

      {%- when 'tags' -%}
        {%- if article.tags.size > 0 and section.settings.show_tags -%}
          <div class="article__tags" {{ block.shopify_attributes }}>
            <span class="article__tags-label">
              {{ 'blog.article.tags' | t }}:
            </span>
            {%- for tag in article.tags -%}
              <a
                href="{{ blog.url }}/tagged/{{ tag | handle }}"
                class="article__tag"
              >
                {{ tag }}
              </a>
            {%- endfor -%}
          </div>
        {%- endif -%}

      {%- when 'share' -%}
        {%- if section.settings.show_social_share -%}
          <div class="article__share" {{ block.shopify_attributes }}>
            {% render 'social-share',
              title: article.title,
              url: article.url,
              image: article.image
            %}
          </div>
        {%- endif -%}

      {%- when 'table_of_contents' -%}
        <div class="article__toc" {{ block.shopify_attributes }}>
          {% render 'table-of-contents' %}
        </div>
    {%- endcase -%}
  {%- endfor -%}

  {%- comment -%} Schema.org markup {%- endcomment -%}
  <meta itemprop="mainEntityOfPage" content="{{ article.url | prepend: shop.url }}">
  <meta itemprop="dateModified" content="{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%z' }}">
  <div itemprop="publisher" itemscope itemtype="http://schema.org/Organization" style="display:none;">
    <meta itemprop="name" content="{{ shop.name }}">
    {%- if shop.brand.logo -%}
      <div itemprop="logo" itemscope itemtype="http://schema.org/ImageObject">
        <meta itemprop="url" content="{{ shop.brand.logo | image_url }}">
      </div>
    {%- endif -%}
  </div>
</article>

{% schema %}
{
  "name": "Article Content",
  "tag": "section",
  "class": "article-section",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_author",
      "label": "Show author",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_date",
      "label": "Show date",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_reading_time",
      "label": "Show reading time",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_tags",
      "label": "Show tags",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_social_share",
      "label": "Show social share buttons",
      "default": true
    }
  ],
  "blocks": [
    {
      "type": "featured_image",
      "name": "Featured image",
      "limit": 1
    },
    {
      "type": "title",
      "name": "Title",
      "limit": 1
    },
    {
      "type": "meta",
      "name": "Article meta",
      "limit": 1
    },
    {
      "type": "content",
      "name": "Content",
      "limit": 1
    },
    {
      "type": "tags",
      "name": "Tags",
      "limit": 1
    },
    {
      "type": "share",
      "name": "Share buttons",
      "limit": 1
    },
    {
      "type": "table_of_contents",
      "name": "Table of contents",
      "limit": 1
    }
  ]
}
{% endschema %}
```

---

## Table of Contents

```liquid
{%- comment -%}
  snippets/table-of-contents.liquid
  Auto-generated TOC from article headings
{%- endcomment -%}

<nav class="toc" aria-label="{{ 'blog.article.table_of_contents' | t }}">
  <h2 class="toc__title">
    {{ 'blog.article.table_of_contents' | t | default: 'Table of Contents' }}
  </h2>
  <ol class="toc__list" id="TableOfContents">
    {%- comment -%}
      TOC is generated via JavaScript from h2/h3 headings
    {%- endcomment -%}
  </ol>
</nav>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const article = document.querySelector('.article__content');
    const toc = document.getElementById('TableOfContents');

    if (!article || !toc) return;

    const headings = article.querySelectorAll('h2, h3');

    if (headings.length === 0) {
      toc.closest('.toc').style.display = 'none';
      return;
    }

    let currentH2 = null;

    headings.forEach((heading, index) => {
      // Add ID if not present
      if (!heading.id) {
        heading.id = 'section-' + (index + 1);
      }

      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;

      const li = document.createElement('li');
      li.appendChild(link);

      if (heading.tagName === 'H2') {
        li.classList.add('toc__item--h2');
        toc.appendChild(li);
        currentH2 = li;
      } else if (heading.tagName === 'H3' && currentH2) {
        li.classList.add('toc__item--h3');
        let subList = currentH2.querySelector('ol');
        if (!subList) {
          subList = document.createElement('ol');
          currentH2.appendChild(subList);
        }
        subList.appendChild(li);
      }
    });

    // Smooth scroll
    toc.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, null, this.getAttribute('href'));
        }
      });
    });
  });
</script>
```

---

## Author Bio Section

```liquid
{%- comment -%}
  sections/article-author.liquid
  Author bio section
{%- endcomment -%}

{%- if section.settings.show_author_bio -%}
  {%- comment -%}
    Author info can come from:
    1. Blog metafields (blog.metafields.custom.author_bio)
    2. Section settings
    3. Hardcoded defaults
  {%- endcomment -%}

  {%- assign author_bio = blog.metafields.custom.author_bio.value -%}
  {%- assign author_image = blog.metafields.custom.author_image.value -%}

  <div class="article-author">
    <div class="page-width">
      <div class="article-author__container">
        {%- if author_image != blank -%}
          <div class="article-author__image">
            <img
              src="{{ author_image | image_url: width: 120 }}"
              alt="{{ article.author | escape }}"
              width="80"
              height="80"
              loading="lazy"
            >
          </div>
        {%- elsif section.settings.author_image != blank -%}
          <div class="article-author__image">
            <img
              src="{{ section.settings.author_image | image_url: width: 120 }}"
              alt="{{ article.author | escape }}"
              width="80"
              height="80"
              loading="lazy"
            >
          </div>
        {%- else -%}
          <div class="article-author__avatar">
            {{ article.author | slice: 0 | upcase }}
          </div>
        {%- endif -%}

        <div class="article-author__info">
          <p class="article-author__label">
            {{ 'blog.article.written_by' | t | default: 'Written by' }}
          </p>
          <h3 class="article-author__name">{{ article.author }}</h3>

          {%- if author_bio != blank -%}
            <p class="article-author__bio">{{ author_bio }}</p>
          {%- elsif section.settings.author_bio != blank -%}
            <p class="article-author__bio">{{ section.settings.author_bio }}</p>
          {%- endif -%}

          {%- if section.settings.show_social_links -%}
            <div class="article-author__social">
              {%- if section.settings.author_twitter != blank -%}
                <a href="https://twitter.com/{{ section.settings.author_twitter }}" target="_blank" rel="noopener" aria-label="Twitter">
                  {% render 'icon', icon: 'twitter' %}
                </a>
              {%- endif -%}
              {%- if section.settings.author_linkedin != blank -%}
                <a href="{{ section.settings.author_linkedin }}" target="_blank" rel="noopener" aria-label="LinkedIn">
                  {% render 'icon', icon: 'linkedin' %}
                </a>
              {%- endif -%}
            </div>
          {%- endif -%}
        </div>
      </div>
    </div>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Author Bio",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_author_bio",
      "label": "Show author bio",
      "default": true
    },
    {
      "type": "image_picker",
      "id": "author_image",
      "label": "Default author image"
    },
    {
      "type": "textarea",
      "id": "author_bio",
      "label": "Default author bio"
    },
    {
      "type": "checkbox",
      "id": "show_social_links",
      "label": "Show social links",
      "default": false
    },
    {
      "type": "text",
      "id": "author_twitter",
      "label": "Twitter handle"
    },
    {
      "type": "url",
      "id": "author_linkedin",
      "label": "LinkedIn URL"
    }
  ]
}
{% endschema %}
```

---

## Related Articles Section

```liquid
{%- comment -%}
  sections/article-related.liquid
  Related articles based on tags
{%- endcomment -%}

{%- assign related_posts = '' | split: '' -%}
{%- assign current_tags = article.tags -%}

{%- comment -%} Find articles with matching tags {%- endcomment -%}
{%- for post in blog.articles -%}
  {%- if post.id != article.id -%}
    {%- for tag in post.tags -%}
      {%- if current_tags contains tag -%}
        {%- unless related_posts contains post -%}
          {%- assign related_posts = related_posts | push: post -%}
        {%- endunless -%}
        {%- break -%}
      {%- endif -%}
    {%- endfor -%}
  {%- endif -%}

  {%- if related_posts.size >= section.settings.posts_count -%}
    {%- break -%}
  {%- endif -%}
{%- endfor -%}

{%- comment -%} Fallback to recent posts if not enough matches {%- endcomment -%}
{%- if related_posts.size < section.settings.posts_count -%}
  {%- for post in blog.articles -%}
    {%- if post.id != article.id -%}
      {%- unless related_posts contains post -%}
        {%- assign related_posts = related_posts | push: post -%}
      {%- endunless -%}
    {%- endif -%}

    {%- if related_posts.size >= section.settings.posts_count -%}
      {%- break -%}
    {%- endif -%}
  {%- endfor -%}
{%- endif -%}

{%- if related_posts.size > 0 -%}
  <section class="related-articles">
    <div class="page-width">
      <h2 class="related-articles__title">
        {{ section.settings.title | default: 'Related Articles' }}
      </h2>

      <div class="related-articles__grid">
        {%- for post in related_posts limit: section.settings.posts_count -%}
          {% render 'article-card', article: post %}
        {%- endfor -%}
      </div>
    </div>
  </section>
{%- endif -%}

{% schema %}
{
  "name": "Related Articles",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Related Articles"
    },
    {
      "type": "range",
      "id": "posts_count",
      "label": "Number of posts",
      "min": 2,
      "max": 6,
      "default": 3
    }
  ]
}
{% endschema %}
```

---

## Article Card Snippet

```liquid
{%- comment -%}
  snippets/article-card.liquid
  Card component for article listings

  Usage:
  {% render 'article-card', article: article, show_excerpt: true %}
{%- endcomment -%}

{%- assign show_excerpt = show_excerpt | default: true -%}
{%- assign show_date = show_date | default: true -%}
{%- assign show_author = show_author | default: false -%}

<article class="article-card">
  {%- if article.image -%}
    <a href="{{ article.url }}" class="article-card__image">
      <img
        src="{{ article.image | image_url: width: 600 }}"
        srcset="
          {{ article.image | image_url: width: 400 }} 400w,
          {{ article.image | image_url: width: 600 }} 600w
        "
        sizes="(max-width: 768px) 100vw, 400px"
        alt="{{ article.image.alt | escape }}"
        width="{{ article.image.width }}"
        height="{{ article.image.height }}"
        loading="lazy"
      >
    </a>
  {%- endif -%}

  <div class="article-card__content">
    {%- if article.tags.size > 0 -%}
      <div class="article-card__tags">
        {%- for tag in article.tags limit: 2 -%}
          <a href="{{ blog.url }}/tagged/{{ tag | handle }}" class="article-card__tag">
            {{ tag }}
          </a>
        {%- endfor -%}
      </div>
    {%- endif -%}

    <h3 class="article-card__title">
      <a href="{{ article.url }}">{{ article.title }}</a>
    </h3>

    {%- if show_excerpt and article.excerpt_or_content != blank -%}
      <p class="article-card__excerpt">
        {{ article.excerpt_or_content | strip_html | truncatewords: 20 }}
      </p>
    {%- endif -%}

    <div class="article-card__meta">
      {%- if show_date -%}
        <time datetime="{{ article.published_at | date: '%Y-%m-%d' }}">
          {{ article.published_at | date: format: 'abbreviated_date' }}
        </time>
      {%- endif -%}

      {%- if show_author -%}
        <span class="article-card__author">{{ article.author }}</span>
      {%- endif -%}
    </div>
  </div>
</article>
```

---

## Blog Grid Section

```liquid
{%- comment -%}
  sections/main-blog.liquid
  Blog listing page
{%- endcomment -%}

{%- paginate blog.articles by section.settings.posts_per_page -%}
  <div class="blog-page">
    <div class="page-width">
      <header class="blog-page__header">
        <h1 class="blog-page__title">{{ blog.title }}</h1>

        {%- if current_tags -%}
          <p class="blog-page__current-tag">
            {{ 'blog.grid.tagged' | t }}: {{ current_tags | join: ', ' }}
            <a href="{{ blog.url }}" class="blog-page__clear-tag">
              {{ 'blog.grid.clear' | t | default: 'Clear' }}
            </a>
          </p>
        {%- endif -%}
      </header>

      {%- if section.settings.show_tag_filter and blog.all_tags.size > 0 -%}
        <nav class="blog-tags" aria-label="{{ 'blog.grid.filter_by_tag' | t }}">
          <ul class="blog-tags__list">
            <li>
              <a
                href="{{ blog.url }}"
                class="blog-tags__item{% unless current_tags %} is-active{% endunless %}"
              >
                {{ 'blog.grid.all' | t | default: 'All' }}
              </a>
            </li>
            {%- for tag in blog.all_tags -%}
              <li>
                <a
                  href="{{ blog.url }}/tagged/{{ tag | handle }}"
                  class="blog-tags__item{% if current_tags contains tag %} is-active{% endif %}"
                >
                  {{ tag }}
                </a>
              </li>
            {%- endfor -%}
          </ul>
        </nav>
      {%- endif -%}

      {%- if blog.articles.size > 0 -%}
        <div class="blog-grid blog-grid--{{ section.settings.layout }}">
          {%- for article in blog.articles -%}
            {% render 'article-card',
              article: article,
              show_excerpt: section.settings.show_excerpt,
              show_date: section.settings.show_date,
              show_author: section.settings.show_author
            %}
          {%- endfor -%}
        </div>

        {%- if paginate.pages > 1 -%}
          {% render 'pagination', paginate: paginate %}
        {%- endif -%}
      {%- else -%}
        <p class="blog-page__empty">
          {{ 'blog.grid.no_articles' | t | default: 'No articles found' }}
        </p>
      {%- endif -%}
    </div>
  </div>
{%- endpaginate -%}

{% schema %}
{
  "name": "Blog Grid",
  "settings": [
    {
      "type": "range",
      "id": "posts_per_page",
      "label": "Posts per page",
      "min": 3,
      "max": 24,
      "step": 3,
      "default": 9
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Layout",
      "options": [
        { "value": "grid", "label": "Grid" },
        { "value": "list", "label": "List" },
        { "value": "featured", "label": "Featured + Grid" }
      ],
      "default": "grid"
    },
    {
      "type": "checkbox",
      "id": "show_tag_filter",
      "label": "Show tag filter",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_excerpt",
      "label": "Show excerpt",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_date",
      "label": "Show date",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_author",
      "label": "Show author",
      "default": false
    }
  ]
}
{% endschema %}
```

---

## Social Share Snippet

```liquid
{%- comment -%}
  snippets/social-share.liquid
  Social sharing buttons

  Usage:
  {% render 'social-share', title: article.title, url: article.url, image: article.image %}
{%- endcomment -%}

{%- assign share_url = url | prepend: shop.url -%}
{%- assign encoded_url = share_url | url_encode -%}
{%- assign encoded_title = title | url_encode -%}

<div class="social-share">
  <span class="social-share__label">
    {{ 'blog.article.share' | t | default: 'Share' }}:
  </span>

  <div class="social-share__buttons">
    {%- comment -%} Facebook {%- endcomment -%}
    <a
      href="https://www.facebook.com/sharer/sharer.php?u={{ encoded_url }}"
      class="social-share__button social-share__button--facebook"
      target="_blank"
      rel="noopener"
      aria-label="{{ 'blog.article.share_facebook' | t }}"
    >
      {% render 'icon', icon: 'facebook' %}
    </a>

    {%- comment -%} Twitter/X {%- endcomment -%}
    <a
      href="https://twitter.com/intent/tweet?text={{ encoded_title }}&url={{ encoded_url }}"
      class="social-share__button social-share__button--twitter"
      target="_blank"
      rel="noopener"
      aria-label="{{ 'blog.article.share_twitter' | t }}"
    >
      {% render 'icon', icon: 'twitter' %}
    </a>

    {%- comment -%} LinkedIn {%- endcomment -%}
    <a
      href="https://www.linkedin.com/shareArticle?mini=true&url={{ encoded_url }}&title={{ encoded_title }}"
      class="social-share__button social-share__button--linkedin"
      target="_blank"
      rel="noopener"
      aria-label="{{ 'blog.article.share_linkedin' | t }}"
    >
      {% render 'icon', icon: 'linkedin' %}
    </a>

    {%- comment -%} Pinterest (needs image) {%- endcomment -%}
    {%- if image -%}
      {%- assign encoded_image = image | image_url: width: 1200 | prepend: 'https:' | url_encode -%}
      <a
        href="https://pinterest.com/pin/create/button/?url={{ encoded_url }}&media={{ encoded_image }}&description={{ encoded_title }}"
        class="social-share__button social-share__button--pinterest"
        target="_blank"
        rel="noopener"
        aria-label="{{ 'blog.article.share_pinterest' | t }}"
      >
        {% render 'icon', icon: 'pinterest' %}
      </a>
    {%- endif -%}

    {%- comment -%} Email {%- endcomment -%}
    <a
      href="mailto:?subject={{ encoded_title }}&body={{ 'blog.article.email_body' | t }}%20{{ share_url }}"
      class="social-share__button social-share__button--email"
      aria-label="{{ 'blog.article.share_email' | t }}"
    >
      {% render 'icon', icon: 'email' %}
    </a>

    {%- comment -%} Copy Link {%- endcomment -%}
    <button
      type="button"
      class="social-share__button social-share__button--copy"
      data-copy-link="{{ share_url }}"
      aria-label="{{ 'blog.article.copy_link' | t }}"
    >
      {% render 'icon', icon: 'link' %}
    </button>
  </div>
</div>

<script>
  document.querySelectorAll('[data-copy-link]').forEach(button => {
    button.addEventListener('click', function() {
      const url = this.dataset.copyLink;
      navigator.clipboard.writeText(url).then(() => {
        this.classList.add('is-copied');
        setTimeout(() => this.classList.remove('is-copied'), 2000);
      });
    });
  });
</script>
```

---

## Blog Sidebar

```liquid
{%- comment -%}
  snippets/blog-sidebar.liquid
  Optional sidebar for blog pages
{%- endcomment -%}

<aside class="blog-sidebar">
  {%- comment -%} Search {%- endcomment -%}
  <div class="blog-sidebar__widget">
    <h3 class="blog-sidebar__title">{{ 'blog.sidebar.search' | t | default: 'Search' }}</h3>
    <form action="{{ routes.search_url }}" method="get" class="blog-sidebar__search">
      <input type="hidden" name="type" value="article">
      <input
        type="search"
        name="q"
        placeholder="{{ 'blog.sidebar.search_placeholder' | t | default: 'Search articles...' }}"
        class="blog-sidebar__search-input"
      >
      <button type="submit" class="blog-sidebar__search-button">
        {% render 'icon', icon: 'search' %}
      </button>
    </form>
  </div>

  {%- comment -%} Categories/Tags {%- endcomment -%}
  {%- if blog.all_tags.size > 0 -%}
    <div class="blog-sidebar__widget">
      <h3 class="blog-sidebar__title">{{ 'blog.sidebar.categories' | t | default: 'Categories' }}</h3>
      <ul class="blog-sidebar__tags">
        {%- for tag in blog.all_tags -%}
          <li>
            <a href="{{ blog.url }}/tagged/{{ tag | handle }}">
              {{ tag }}
              <span class="blog-sidebar__tag-count">
                ({{ blog.articles | where: 'tags', tag | size }})
              </span>
            </a>
          </li>
        {%- endfor -%}
      </ul>
    </div>
  {%- endif -%}

  {%- comment -%} Recent Posts {%- endcomment -%}
  <div class="blog-sidebar__widget">
    <h3 class="blog-sidebar__title">{{ 'blog.sidebar.recent' | t | default: 'Recent Posts' }}</h3>
    <ul class="blog-sidebar__recent">
      {%- for post in blog.articles limit: 5 -%}
        <li class="blog-sidebar__recent-item">
          {%- if post.image -%}
            <a href="{{ post.url }}" class="blog-sidebar__recent-image">
              <img
                src="{{ post.image | image_url: width: 100 }}"
                alt="{{ post.image.alt | escape }}"
                width="60"
                height="60"
                loading="lazy"
              >
            </a>
          {%- endif -%}
          <div class="blog-sidebar__recent-info">
            <a href="{{ post.url }}" class="blog-sidebar__recent-title">
              {{ post.title | truncate: 40 }}
            </a>
            <time class="blog-sidebar__recent-date">
              {{ post.published_at | date: format: 'abbreviated_date' }}
            </time>
          </div>
        </li>
      {%- endfor -%}
    </ul>
  </div>

  {%- comment -%} Newsletter {%- endcomment -%}
  <div class="blog-sidebar__widget blog-sidebar__widget--newsletter">
    <h3 class="blog-sidebar__title">{{ 'blog.sidebar.newsletter' | t | default: 'Subscribe' }}</h3>
    <p class="blog-sidebar__newsletter-text">
      {{ 'blog.sidebar.newsletter_text' | t | default: 'Get the latest posts in your inbox.' }}
    </p>
    {%- form 'customer', class: 'blog-sidebar__newsletter-form' -%}
      <input type="hidden" name="contact[tags]" value="newsletter,blog">
      <input
        type="email"
        name="contact[email]"
        placeholder="{{ 'blog.sidebar.email_placeholder' | t | default: 'Your email' }}"
        required
      >
      <button type="submit" class="button">
        {{ 'blog.sidebar.subscribe' | t | default: 'Subscribe' }}
      </button>
    {%- endform -%}
  </div>
</aside>
```

---

## CSS Styles

```css
/* Article Layout */
.article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.article__featured-image {
  margin-bottom: 2rem;
}

.article__featured-image img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-lg);
}

.article__header {
  margin-bottom: 1.5rem;
}

.article__title {
  font-size: 2.5rem;
  line-height: 1.2;
  margin: 0;
}

.article__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
}

.article__meta > * {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article__meta svg {
  width: 1rem;
  height: 1rem;
}

.article__content {
  font-size: 1.125rem;
  line-height: 1.8;
}

.article__content h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  scroll-margin-top: 2rem;
}

.article__content h3 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 2rem;
}

.article__content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  margin: 2rem 0;
}

.article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.article__tags-label {
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
}

.article__tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius-full);
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--color-foreground);
}

.article__tag:hover {
  background: var(--color-primary-background);
  color: var(--color-primary);
}

.article__share {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

/* Table of Contents */
.toc {
  background: var(--color-background-alt);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
}

.toc__title {
  font-size: 1rem;
  margin: 0 0 1rem;
}

.toc__list {
  margin: 0;
  padding-left: 1.25rem;
}

.toc__list ol {
  padding-left: 1.25rem;
  margin-top: 0.5rem;
}

.toc__list li {
  margin-bottom: 0.5rem;
}

.toc__list a {
  color: var(--color-foreground-muted);
  text-decoration: none;
  font-size: 0.9375rem;
}

.toc__list a:hover {
  color: var(--color-primary);
}

/* Author Bio */
.article-author {
  padding: 3rem 0;
  background: var(--color-background-alt);
}

.article-author__container {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.article-author__image img,
.article-author__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

.article-author__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 2rem;
  font-weight: 600;
}

.article-author__label {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  margin-bottom: 0.25rem;
}

.article-author__name {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.article-author__bio {
  color: var(--color-foreground-muted);
  margin: 0;
}

.article-author__social {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.article-author__social a {
  color: var(--color-foreground-muted);
}

.article-author__social a:hover {
  color: var(--color-primary);
}

/* Related Articles */
.related-articles {
  padding: 3rem 0;
}

.related-articles__title {
  text-align: center;
  margin-bottom: 2rem;
}

.related-articles__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .related-articles__grid {
    grid-template-columns: 1fr;
  }
}

/* Article Card */
.article-card {
  display: flex;
  flex-direction: column;
}

.article-card__image {
  display: block;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.article-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-card__image img {
  transform: scale(1.05);
}

.article-card__tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.article-card__tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  text-decoration: none;
}

.article-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  line-height: 1.3;
}

.article-card__title a {
  text-decoration: none;
  color: var(--color-foreground);
}

.article-card__title a:hover {
  color: var(--color-primary);
}

.article-card__excerpt {
  color: var(--color-foreground-muted);
  font-size: 0.9375rem;
  margin: 0 0 1rem;
  flex: 1;
}

.article-card__meta {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

/* Blog Page */
.blog-page__header {
  text-align: center;
  margin-bottom: 2rem;
}

.blog-page__current-tag {
  color: var(--color-foreground-muted);
}

.blog-page__clear-tag {
  margin-left: 0.5rem;
}

/* Blog Tags */
.blog-tags {
  margin-bottom: 2rem;
}

.blog-tags__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.blog-tags__item {
  padding: 0.5rem 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius-full);
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--color-foreground);
  transition: all 0.2s ease;
}

.blog-tags__item:hover,
.blog-tags__item.is-active {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}

/* Blog Grid */
.blog-grid {
  display: grid;
  gap: 2rem;
}

.blog-grid--grid {
  grid-template-columns: repeat(3, 1fr);
}

.blog-grid--list {
  grid-template-columns: 1fr;
}

.blog-grid--list .article-card {
  flex-direction: row;
  gap: 1.5rem;
}

.blog-grid--list .article-card__image {
  width: 300px;
  flex-shrink: 0;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .blog-grid--grid {
    grid-template-columns: 1fr;
  }

  .blog-grid--list .article-card {
    flex-direction: column;
  }

  .blog-grid--list .article-card__image {
    width: 100%;
  }
}

/* Social Share */
.social-share {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.social-share__label {
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
}

.social-share__buttons {
  display: flex;
  gap: 0.5rem;
}

.social-share__button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-alt);
  border: none;
  border-radius: 50%;
  color: var(--color-foreground);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-share__button:hover {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}

.social-share__button.is-copied {
  background: var(--color-success);
  color: white;
}

.social-share__button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile */
@media (max-width: 768px) {
  .article__title {
    font-size: 1.75rem;
  }

  .article__content {
    font-size: 1rem;
  }

  .article-author__container {
    flex-direction: column;
    text-align: center;
  }
}
```

---

## Locales

```json
{
  "blog": {
    "article": {
      "reading_time": "{{ minutes }} min read",
      "tags": "Tags",
      "share": "Share",
      "share_facebook": "Share on Facebook",
      "share_twitter": "Share on Twitter",
      "share_linkedin": "Share on LinkedIn",
      "share_pinterest": "Pin it",
      "share_email": "Share via email",
      "copy_link": "Copy link",
      "email_body": "Check out this article:",
      "written_by": "Written by",
      "table_of_contents": "Table of Contents"
    },
    "grid": {
      "all": "All",
      "tagged": "Tagged",
      "clear": "Clear",
      "filter_by_tag": "Filter by tag",
      "no_articles": "No articles found"
    },
    "sidebar": {
      "search": "Search",
      "search_placeholder": "Search articles...",
      "categories": "Categories",
      "recent": "Recent Posts",
      "newsletter": "Newsletter",
      "newsletter_text": "Get the latest posts delivered to your inbox.",
      "email_placeholder": "Your email",
      "subscribe": "Subscribe"
    }
  }
}
```
