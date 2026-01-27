# Collection Patterns

Complete reference for converting collection/catalog pages to Shopify.

## Collection Page Structure

### Main Collection Section

```liquid
{%- comment -%}
  sections/main-collection.liquid
{%- endcomment -%}

{%- liquid
  assign products_per_page = section.settings.products_per_page | default: 16
  assign columns = section.settings.columns | default: 4
-%}

<section class="collection section-{{ section.id }}" {{ section.shopify_attributes }}>
  <div class="collection-container">

    {%- paginate collection.products by products_per_page -%}

      {%- comment -%} Collection Header {%- endcomment -%}
      <header class="collection-header">
        <h1 class="collection-title">{{ collection.title }}</h1>

        {%- if collection.description != blank and section.settings.show_description -%}
          <div class="collection-description">
            {{ collection.description }}
          </div>
        {%- endif -%}

        <p class="collection-count">
          {{ 'collections.general.items_with_count' | t: count: collection.products_count }}
        </p>
      </header>

      {%- comment -%} Toolbar: Filters + Sort {%- endcomment -%}
      {%- if section.settings.enable_filtering or section.settings.enable_sorting -%}
        <div class="collection-toolbar">
          {%- if section.settings.enable_filtering -%}
            {% render 'collection-filters', collection: collection %}
          {%- endif -%}

          {%- if section.settings.enable_sorting -%}
            {% render 'collection-sort', collection: collection %}
          {%- endif -%}
        </div>
      {%- endif -%}

      {%- comment -%} Active Filters {%- endcomment -%}
      {%- if section.settings.enable_filtering -%}
        {% render 'active-filters' %}
      {%- endif -%}

      {%- comment -%} Product Grid {%- endcomment -%}
      <div
        class="product-grid"
        id="product-grid"
        style="--columns: {{ columns }}"
        data-collection-products
      >
        {%- if collection.products.size > 0 -%}
          {%- for product in collection.products -%}
            {% render 'product-card',
              product: product,
              show_vendor: section.settings.show_vendor,
              show_rating: section.settings.show_rating,
              image_ratio: section.settings.image_ratio
            %}
          {%- endfor -%}
        {%- else -%}
          <div class="collection-empty">
            <p>{{ 'collections.general.no_matches' | t }}</p>
            {%- if collection.current_vendor or collection.current_type or collection.filters.size > 0 -%}
              <a href="{{ collection.url }}" class="btn btn--secondary">
                {{ 'collections.general.clear_all' | t }}
              </a>
            {%- endif -%}
          </div>
        {%- endif -%}
      </div>

      {%- comment -%} Pagination {%- endcomment -%}
      {%- if paginate.pages > 1 -%}
        {% render 'pagination', paginate: paginate %}
      {%- endif -%}

    {%- endpaginate -%}

  </div>
</section>

{% style %}
  .section-{{ section.id }} .product-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: {{ section.settings.grid_gap }}px;
  }

  @media (max-width: 990px) {
    .section-{{ section.id }} .product-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 749px) {
    .section-{{ section.id }} .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "Product grid",
  "tag": "section",
  "class": "section-collection",
  "settings": [
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "products_per_page",
      "label": "Products per page",
      "min": 8,
      "max": 48,
      "step": 4,
      "default": 16
    },
    {
      "type": "range",
      "id": "columns",
      "label": "Columns",
      "min": 2,
      "max": 6,
      "step": 1,
      "default": 4
    },
    {
      "type": "range",
      "id": "grid_gap",
      "label": "Grid gap",
      "min": 8,
      "max": 48,
      "step": 4,
      "unit": "px",
      "default": 24
    },
    {
      "type": "header",
      "content": "Product card"
    },
    {
      "type": "select",
      "id": "image_ratio",
      "label": "Image ratio",
      "default": "adapt",
      "options": [
        { "value": "adapt", "label": "Adapt to image" },
        { "value": "square", "label": "Square (1:1)" },
        { "value": "portrait", "label": "Portrait (2:3)" },
        { "value": "landscape", "label": "Landscape (3:2)" }
      ]
    },
    {
      "type": "checkbox",
      "id": "show_vendor",
      "label": "Show vendor",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "show_rating",
      "label": "Show rating",
      "default": false
    },
    {
      "type": "header",
      "content": "Collection info"
    },
    {
      "type": "checkbox",
      "id": "show_description",
      "label": "Show collection description",
      "default": true
    },
    {
      "type": "header",
      "content": "Filtering and sorting"
    },
    {
      "type": "checkbox",
      "id": "enable_filtering",
      "label": "Enable filtering",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "enable_sorting",
      "label": "Enable sorting",
      "default": true
    },
    {
      "type": "select",
      "id": "filter_style",
      "label": "Filter style",
      "default": "sidebar",
      "options": [
        { "value": "sidebar", "label": "Sidebar" },
        { "value": "drawer", "label": "Drawer" },
        { "value": "horizontal", "label": "Horizontal" }
      ]
    }
  ],
  "templates": ["collection"]
}
{% endschema %}
```

---

## Product Card

### Full-Featured Product Card

```liquid
{%- comment -%}
  snippets/product-card.liquid

  Accepts:
  - product: {Object} Product object
  - show_vendor: {Boolean} Show vendor name
  - show_rating: {Boolean} Show product rating
  - image_ratio: {String} Image aspect ratio
  - lazy_load: {Boolean} Lazy load image (default true)
{%- endcomment -%}

{%- liquid
  assign first_variant = product.selected_or_first_available_variant
  assign featured_image = product.featured_media
  assign lazy_load = lazy_load | default: true
-%}

<article class="product-card{% unless product.available %} product-card--sold-out{% endunless %}">
  <div class="product-card-media">
    <a href="{{ product.url }}" class="product-card-link" aria-label="{{ product.title }}">
      {%- if featured_image != blank -%}
        {%- liquid
          case image_ratio
            when 'square'
              assign aspect_ratio = 1
            when 'portrait'
              assign aspect_ratio = 0.67
            when 'landscape'
              assign aspect_ratio = 1.5
            else
              assign aspect_ratio = featured_image.aspect_ratio
          endcase
        -%}

        <div class="product-card-image" style="--aspect-ratio: {{ aspect_ratio }}">
          {{ featured_image | image_url: width: 600 | image_tag:
            loading: lazy_load | ternary: 'lazy', 'eager',
            widths: '165, 360, 533, 720',
            sizes: '(min-width: 1200px) 267px, (min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw',
            alt: featured_image.alt | default: product.title
          }}

          {%- if product.media.size > 1 and section.settings.show_secondary_image -%}
            <div class="product-card-image--secondary">
              {{ product.media[1] | image_url: width: 600 | image_tag: loading: 'lazy' }}
            </div>
          {%- endif -%}
        </div>
      {%- else -%}
        <div class="product-card-placeholder">
          {{ 'product-1' | placeholder_svg_tag }}
        </div>
      {%- endif -%}
    </a>

    {%- comment -%} Badges {%- endcomment -%}
    <div class="product-card-badges">
      {%- if product.compare_at_price > product.price -%}
        {%- liquid
          assign savings = product.compare_at_price | minus: product.price
          assign savings_percent = savings | times: 100.0 | divided_by: product.compare_at_price | round
        -%}
        <span class="badge badge--sale">{{ savings_percent }}% off</span>
      {%- endif -%}

      {%- unless product.available -%}
        <span class="badge badge--sold-out">{{ 'products.product.sold_out' | t }}</span>
      {%- endunless -%}
    </div>

    {%- comment -%} Quick Add Button {%- endcomment -%}
    {%- if product.available -%}
      <div class="product-card-actions">
        {%- if product.has_only_default_variant -%}
          <quick-add-button data-variant-id="{{ first_variant.id }}">
            <button type="button" class="btn btn--quick-add" aria-label="{{ 'products.product.add_to_cart' | t }}">
              {% render 'icon-plus' %}
            </button>
          </quick-add-button>
        {%- else -%}
          <a href="{{ product.url }}" class="btn btn--quick-add" aria-label="{{ 'products.product.choose_options' | t }}">
            {% render 'icon-options' %}
          </a>
        {%- endif -%}
      </div>
    {%- endif -%}
  </div>

  <div class="product-card-info">
    {%- if show_vendor and product.vendor -%}
      <p class="product-card-vendor">{{ product.vendor }}</p>
    {%- endif -%}

    <h3 class="product-card-title">
      <a href="{{ product.url }}">{{ product.title }}</a>
    </h3>

    {%- if show_rating and product.metafields.reviews.rating.value != blank -%}
      <div class="product-card-rating">
        {% render 'product-rating', product: product %}
      </div>
    {%- endif -%}

    <div class="product-card-price">
      {% render 'price', product: product, use_variant: false %}
    </div>

    {%- if product.options.size > 1 or product.variants.size > 1 -%}
      {%- unless product.has_only_default_variant -%}
        <ul class="product-card-swatches">
          {%- for option in product.options_with_values -%}
            {%- if option.name == 'Color' or option.name == 'Colour' -%}
              {%- for value in option.values limit: 5 -%}
                <li>
                  <span
                    class="color-swatch"
                    style="background-color: {{ value | handle }}"
                    title="{{ value }}"
                  ></span>
                </li>
              {%- endfor -%}
              {%- if option.values.size > 5 -%}
                <li class="swatch-more">+{{ option.values.size | minus: 5 }}</li>
              {%- endif -%}
            {%- endif -%}
          {%- endfor -%}
        </ul>
      {%- endunless -%}
    {%- endif -%}
  </div>
</article>
```

---

## Collection Filters

### Storefront Filtering API

```liquid
{%- comment -%}
  snippets/collection-filters.liquid

  Uses Shopify's Storefront Filtering API
{%- endcomment -%}

{%- liquid
  assign filter_count = 0
  for filter in collection.filters
    assign filter_count = filter_count | plus: filter.active_values.size
  endfor
-%}

<facet-filters-form class="collection-filters" data-section="{{ section.id }}">
  <form id="FiltersForm">

    {%- for filter in collection.filters -%}
      <details
        class="filter-group"
        {% if filter.active_values.size > 0 %}open{% endif %}
      >
        <summary class="filter-group-header">
          <span>{{ filter.label }}</span>
          {%- if filter.active_values.size > 0 -%}
            <span class="filter-count">{{ filter.active_values.size }}</span>
          {%- endif -%}
        </summary>

        <div class="filter-group-content">
          {%- case filter.type -%}

            {%- when 'list' -%}
              <ul class="filter-list">
                {%- for value in filter.values -%}
                  <li class="filter-item">
                    <label class="filter-checkbox">
                      <input
                        type="checkbox"
                        name="{{ value.param_name }}"
                        value="{{ value.value }}"
                        {% if value.active %}checked{% endif %}
                        {% if value.count == 0 and value.active == false %}disabled{% endif %}
                      >
                      <span class="filter-label">
                        {%- if filter.param_name == 'filter.v.option.color' -%}
                          <span class="color-swatch" style="background-color: {{ value.value | handle }}"></span>
                        {%- endif -%}
                        {{ value.label }}
                      </span>
                      <span class="filter-count">({{ value.count }})</span>
                    </label>
                  </li>
                {%- endfor -%}
              </ul>

            {%- when 'price_range' -%}
              <div class="filter-price-range">
                <div class="filter-price-inputs">
                  <div class="filter-price-field">
                    <label for="Filter-{{ filter.param_name }}-GTE">{{ 'collections.filter.from' | t }}</label>
                    <span class="filter-price-currency">{{ cart.currency.symbol }}</span>
                    <input
                      type="number"
                      id="Filter-{{ filter.param_name }}-GTE"
                      name="{{ filter.min_value.param_name }}"
                      value="{{ filter.min_value.value | money_without_currency | replace: ',', '' }}"
                      min="0"
                      max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                      placeholder="0"
                    >
                  </div>
                  <div class="filter-price-field">
                    <label for="Filter-{{ filter.param_name }}-LTE">{{ 'collections.filter.to' | t }}</label>
                    <span class="filter-price-currency">{{ cart.currency.symbol }}</span>
                    <input
                      type="number"
                      id="Filter-{{ filter.param_name }}-LTE"
                      name="{{ filter.max_value.param_name }}"
                      value="{{ filter.max_value.value | money_without_currency | replace: ',', '' }}"
                      min="0"
                      max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                      placeholder="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                    >
                  </div>
                </div>
              </div>

          {%- endcase -%}
        </div>
      </details>
    {%- endfor -%}

    <noscript>
      <button type="submit" class="btn">{{ 'collections.filter.apply' | t }}</button>
    </noscript>

  </form>
</facet-filters-form>
```

### Active Filters Display

```liquid
{%- comment -%}
  snippets/active-filters.liquid
{%- endcomment -%}

{%- liquid
  assign active_filters = false
  for filter in collection.filters
    if filter.active_values.size > 0 or filter.min_value.value or filter.max_value.value
      assign active_filters = true
      break
    endif
  endfor
-%}

{%- if active_filters -%}
  <div class="active-filters">
    {%- for filter in collection.filters -%}
      {%- for value in filter.active_values -%}
        <a href="{{ value.url_to_remove }}" class="active-filter-tag">
          {{ filter.label }}: {{ value.label }}
          {% render 'icon-close' %}
        </a>
      {%- endfor -%}

      {%- if filter.min_value.value or filter.max_value.value -%}
        <a href="{{ filter.url_to_remove }}" class="active-filter-tag">
          {%- if filter.min_value.value and filter.max_value.value -%}
            {{ filter.min_value.value | money }} - {{ filter.max_value.value | money }}
          {%- elsif filter.min_value.value -%}
            {{ 'collections.filter.from' | t }} {{ filter.min_value.value | money }}
          {%- else -%}
            {{ 'collections.filter.up_to' | t }} {{ filter.max_value.value | money }}
          {%- endif -%}
          {% render 'icon-close' %}
        </a>
      {%- endif -%}
    {%- endfor -%}

    <a href="{{ collection.url }}?sort_by={{ collection.sort_by }}" class="active-filter-clear">
      {{ 'collections.filter.clear_all' | t }}
    </a>
  </div>
{%- endif -%}
```

---

## Collection Sorting

### Sort Dropdown

```liquid
{%- comment -%}
  snippets/collection-sort.liquid
{%- endcomment -%}

{%- liquid
  assign sort_by = collection.sort_by | default: collection.default_sort_by
  assign sort_options = collection.sort_options
-%}

<div class="collection-sort">
  <label for="SortBy">{{ 'collections.sorting.title' | t }}</label>
  <select id="SortBy" data-sort-select>
    {%- for option in sort_options -%}
      <option
        value="{{ option.value }}"
        {% if sort_by == option.value %}selected{% endif %}
      >
        {{ option.name }}
      </option>
    {%- endfor -%}
  </select>
</div>

<script>
  document.querySelector('[data-sort-select]')?.addEventListener('change', function(e) {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', e.target.value);
    window.location.href = url.toString();
  });
</script>
```

---

## Pagination

### Numbered Pagination

```liquid
{%- comment -%}
  snippets/pagination.liquid
{%- endcomment -%}

{%- if paginate.pages > 1 -%}
  <nav class="pagination" role="navigation" aria-label="{{ 'general.pagination.label' | t }}">
    <ul class="pagination-list">

      {%- comment -%} Previous {%- endcomment -%}
      {%- if paginate.previous -%}
        <li>
          <a href="{{ paginate.previous.url }}" class="pagination-link pagination-prev" aria-label="{{ 'general.pagination.previous' | t }}">
            {% render 'icon-chevron-left' %}
          </a>
        </li>
      {%- endif -%}

      {%- comment -%} Page Numbers {%- endcomment -%}
      {%- for part in paginate.parts -%}
        {%- if part.is_link -%}
          <li>
            <a href="{{ part.url }}" class="pagination-link">{{ part.title }}</a>
          </li>
        {%- elsif part.title == paginate.current_page -%}
          <li>
            <span class="pagination-link is-current" aria-current="page">{{ part.title }}</span>
          </li>
        {%- else -%}
          <li>
            <span class="pagination-ellipsis">{{ part.title }}</span>
          </li>
        {%- endif -%}
      {%- endfor -%}

      {%- comment -%} Next {%- endcomment -%}
      {%- if paginate.next -%}
        <li>
          <a href="{{ paginate.next.url }}" class="pagination-link pagination-next" aria-label="{{ 'general.pagination.next' | t }}">
            {% render 'icon-chevron-right' %}
          </a>
        </li>
      {%- endif -%}

    </ul>
  </nav>
{%- endif -%}
```

### Load More / Infinite Scroll

```liquid
{%- if paginate.next -%}
  <div class="load-more-container" data-load-more>
    <a
      href="{{ paginate.next.url }}"
      class="btn btn--secondary btn--load-more"
      data-load-more-button
    >
      {{ 'collections.general.load_more' | t }}
    </a>
  </div>
{%- endif -%}
```

```javascript
// assets/load-more.js

class LoadMore {
  constructor(container) {
    this.container = container;
    this.button = container.querySelector('[data-load-more-button]');
    this.productGrid = document.querySelector('[data-collection-products]');

    if (this.button) {
      this.button.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMore();
      });
    }
  }

  async loadMore() {
    const url = this.button.href;
    this.button.classList.add('is-loading');

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Get new products
      const newProducts = doc.querySelectorAll('[data-collection-products] > *');
      newProducts.forEach(product => {
        this.productGrid.appendChild(product.cloneNode(true));
      });

      // Update button with next page URL
      const nextButton = doc.querySelector('[data-load-more-button]');
      if (nextButton) {
        this.button.href = nextButton.href;
      } else {
        this.container.remove();
      }

    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      this.button.classList.remove('is-loading');
    }
  }
}

document.querySelectorAll('[data-load-more]').forEach(el => new LoadMore(el));
```

---

## AJAX Filtering

### Facet Filters JavaScript

```javascript
// assets/facet-filters.js

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.debouncedOnSubmit = this.debounce(this.onSubmit.bind(this), 500);

    this.form.addEventListener('input', this.debouncedOnSubmit);
  }

  async onSubmit(event) {
    const formData = new FormData(this.form);
    const searchParams = new URLSearchParams(formData);

    // Preserve sort order
    const currentUrl = new URL(window.location.href);
    const sortBy = currentUrl.searchParams.get('sort_by');
    if (sortBy) searchParams.set('sort_by', sortBy);

    this.renderPage(searchParams.toString());
  }

  async renderPage(searchParams) {
    const sectionId = this.dataset.section;
    const url = `${window.location.pathname}?section_id=${sectionId}&${searchParams}`;

    document.body.classList.add('is-filtering');

    try {
      const response = await fetch(url);
      const html = await response.text();

      this.renderFilters(html);
      this.renderProductGrid(html);
      this.renderProductCount(html);
      this.updateUrl(searchParams);

    } catch (error) {
      console.error('Error filtering:', error);
    } finally {
      document.body.classList.remove('is-filtering');
    }
  }

  renderFilters(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newFilters = parsed.querySelector('.collection-filters');
    if (newFilters) {
      this.innerHTML = newFilters.innerHTML;
    }
  }

  renderProductGrid(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newGrid = parsed.querySelector('[data-collection-products]');
    const currentGrid = document.querySelector('[data-collection-products]');
    if (newGrid && currentGrid) {
      currentGrid.innerHTML = newGrid.innerHTML;
    }
  }

  renderProductCount(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newCount = parsed.querySelector('.collection-count');
    const currentCount = document.querySelector('.collection-count');
    if (newCount && currentCount) {
      currentCount.innerHTML = newCount.innerHTML;
    }
  }

  updateUrl(searchParams) {
    const url = `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`;
    history.pushState({}, '', url);
  }

  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }
}

customElements.define('facet-filters-form', FacetFiltersForm);
```

---

## Collection List Page

### All Collections Grid

```liquid
{%- comment -%}
  templates/list-collections.liquid or sections/main-list-collections.liquid
{%- endcomment -%}

<section class="collections-list section-{{ section.id }}">
  <div class="container">
    <h1>{{ 'collections.general.title' | t }}</h1>

    <div class="collections-grid" style="--columns: {{ section.settings.columns }}">
      {%- case section.settings.display_type -%}

        {%- when 'all' -%}
          {%- for collection in collections -%}
            {% render 'collection-card', collection: collection %}
          {%- endfor -%}

        {%- when 'selected' -%}
          {%- for block in section.blocks -%}
            {%- if block.settings.collection != blank -%}
              {% render 'collection-card',
                collection: block.settings.collection,
                block: block
              %}
            {%- endif -%}
          {%- endfor -%}

      {%- endcase -%}
    </div>
  </div>
</section>
```

### Collection Card Snippet

```liquid
{%- comment -%}
  snippets/collection-card.liquid
{%- endcomment -%}

<article class="collection-card">
  <a href="{{ collection.url }}" class="collection-card-link">
    <div class="collection-card-image">
      {%- if collection.featured_image -%}
        {{ collection.featured_image | image_url: width: 600 | image_tag: loading: 'lazy' }}
      {%- elsif collection.products.first.featured_image -%}
        {{ collection.products.first.featured_image | image_url: width: 600 | image_tag: loading: 'lazy' }}
      {%- else -%}
        {{ 'collection-1' | placeholder_svg_tag }}
      {%- endif -%}
    </div>

    <div class="collection-card-info">
      <h3 class="collection-card-title">{{ collection.title }}</h3>
      <p class="collection-card-count">{{ collection.products_count }} {{ 'collections.general.products' | t }}</p>
    </div>
  </a>
</article>
```

---

## Conversion Reference: React to Shopify

| React Pattern | Shopify Equivalent |
|---------------|-------------------|
| `products.map()` | `{% for product in collection.products %}` |
| State-based filtering | URL params + Storefront Filtering API |
| Client-side pagination | `{% paginate %}` + AJAX or native |
| Filter components | `collection.filters` object |
| Sort state | `collection.sort_by` + URL param |
| Product count | `collection.products_count` |
| React Query cache | Section rendering + browser cache |
| Infinite scroll | Load more pattern with fetch |
