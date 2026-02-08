# Search & Discovery Reference

## Overview

Shopify provides built-in search capabilities:
- **Predictive Search API** - Autocomplete suggestions
- **Search Results Page** - Full search template
- **Collection Filtering** - Faceted navigation
- **Search Analytics** - Admin insights

---

## Part 1: Predictive Search

### API Endpoint

```
GET /search/suggest.json?q={query}&resources[type]={types}&resources[limit]={limit}
```

### Basic Implementation

```liquid
{% comment %} snippets/predictive-search.liquid {% endcomment %}

<div class="predictive-search" data-predictive-search>
  <form action="{{ routes.search_url }}" method="get" role="search">
    <label for="search-input" class="visually-hidden">
      {{ 'general.search.placeholder' | t }}
    </label>

    <input
      type="search"
      id="search-input"
      name="q"
      placeholder="{{ 'general.search.placeholder' | t }}"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      data-predictive-search-input
      aria-controls="predictive-search-results"
      aria-expanded="false"
      aria-haspopup="listbox"
    >

    <button type="submit" aria-label="{{ 'general.search.submit' | t }}">
      {% render 'icon-search' %}
    </button>
  </form>

  <div
    id="predictive-search-results"
    class="predictive-search__results"
    role="listbox"
    aria-label="{{ 'general.search.results' | t }}"
    hidden
    data-predictive-search-results
  >
    <!-- Results injected via JavaScript -->
  </div>
</div>
```

### JavaScript Implementation

```javascript
class PredictiveSearch {
  constructor(container) {
    this.container = container;
    this.input = container.querySelector('[data-predictive-search-input]');
    this.results = container.querySelector('[data-predictive-search-results]');
    this.abortController = null;

    this.bindEvents();
  }

  bindEvents() {
    this.input.addEventListener('input', this.debounce(this.onInput.bind(this), 300));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    document.addEventListener('click', this.onClickOutside.bind(this));
    this.input.addEventListener('keydown', this.onKeydown.bind(this));
  }

  async onInput() {
    const query = this.input.value.trim();

    if (query.length < 2) {
      this.close();
      return;
    }

    // Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const response = await fetch(
        `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,article,page&resources[limit]=4`,
        { signal: this.abortController.signal }
      );

      const data = await response.json();
      this.renderResults(data, query);
      this.open();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    }
  }

  renderResults(data, query) {
    const resources = data.resources.results;
    let html = '';

    // Products
    if (resources.products?.length) {
      html += `
        <div class="predictive-search__section">
          <h3 class="predictive-search__heading">Products</h3>
          <ul class="predictive-search__list" role="group">
            ${resources.products.map(product => `
              <li role="option">
                <a href="${product.url}" class="predictive-search__item predictive-search__item--product">
                  ${product.featured_image?.url ? `
                    <img src="${product.featured_image.url}&width=100" alt="${product.title}" loading="lazy">
                  ` : ''}
                  <div class="predictive-search__item-content">
                    <span class="predictive-search__item-title">${this.highlightQuery(product.title, query)}</span>
                    <span class="predictive-search__item-price">${this.formatMoney(product.price)}</span>
                  </div>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Collections
    if (resources.collections?.length) {
      html += `
        <div class="predictive-search__section">
          <h3 class="predictive-search__heading">Collections</h3>
          <ul class="predictive-search__list" role="group">
            ${resources.collections.map(collection => `
              <li role="option">
                <a href="${collection.url}" class="predictive-search__item">
                  <span>${this.highlightQuery(collection.title, query)}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Articles
    if (resources.articles?.length) {
      html += `
        <div class="predictive-search__section">
          <h3 class="predictive-search__heading">Articles</h3>
          <ul class="predictive-search__list" role="group">
            ${resources.articles.map(article => `
              <li role="option">
                <a href="${article.url}" class="predictive-search__item">
                  <span>${this.highlightQuery(article.title, query)}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Pages
    if (resources.pages?.length) {
      html += `
        <div class="predictive-search__section">
          <h3 class="predictive-search__heading">Pages</h3>
          <ul class="predictive-search__list" role="group">
            ${resources.pages.map(page => `
              <li role="option">
                <a href="${page.url}" class="predictive-search__item">
                  <span>${this.highlightQuery(page.title, query)}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // View all results link
    if (html) {
      html += `
        <a href="/search?q=${encodeURIComponent(query)}" class="predictive-search__view-all">
          View all results for "${query}"
        </a>
      `;
    } else {
      html = `
        <div class="predictive-search__no-results">
          <p>No results found for "${query}"</p>
        </div>
      `;
    }

    this.results.innerHTML = html;
  }

  highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  open() {
    this.results.hidden = false;
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.results.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
  }

  onFocus() {
    if (this.input.value.length >= 2 && this.results.innerHTML) {
      this.open();
    }
  }

  onClickOutside(event) {
    if (!this.container.contains(event.target)) {
      this.close();
    }
  }

  onKeydown(event) {
    const items = this.results.querySelectorAll('a');
    const currentIndex = Array.from(items).indexOf(document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        } else if (currentIndex === -1 && items.length > 0) {
          items[0].focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        } else if (currentIndex === 0) {
          this.input.focus();
        }
        break;
      case 'Escape':
        this.close();
        this.input.focus();
        break;
    }
  }

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
}

// Initialize
document.querySelectorAll('[data-predictive-search]').forEach(container => {
  new PredictiveSearch(container);
});
```

### CSS Styles

```css
.predictive-search {
  position: relative;
}

.predictive-search__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow-y: auto;
  z-index: 100;
}

.predictive-search__section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.predictive-search__heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.predictive-search__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.predictive-search__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  text-decoration: none;
  color: inherit;
  border-radius: 4px;
}

.predictive-search__item:hover,
.predictive-search__item:focus {
  background: var(--color-background-alt);
}

.predictive-search__item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.predictive-search__item mark {
  background: var(--color-accent);
  color: inherit;
}

.predictive-search__view-all {
  display: block;
  padding: 1rem;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
}

.predictive-search__no-results {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}
```

---

## Part 2: Search Results Page

### Template Structure

```liquid
{% comment %} templates/search.json {% endcomment %}
{
  "sections": {
    "main": {
      "type": "main-search",
      "settings": {
        "products_per_page": 12,
        "show_filters": true
      }
    }
  },
  "order": ["main"]
}
```

### Search Results Section

```liquid
{% comment %} sections/main-search.liquid {% endcomment %}

{%- paginate search.results by section.settings.products_per_page -%}
<section class="search-page">
  <div class="container">
    <header class="search-page__header">
      <h1>
        {%- if search.performed -%}
          {{ 'templates.search.results_with_count' | t: terms: search.terms, count: search.results_count }}
        {%- else -%}
          {{ 'templates.search.title' | t }}
        {%- endif -%}
      </h1>

      {% comment %} Search form {% endcomment %}
      <form action="{{ routes.search_url }}" method="get" role="search" class="search-page__form">
        <input
          type="search"
          name="q"
          value="{{ search.terms | escape }}"
          placeholder="{{ 'templates.search.placeholder' | t }}"
        >
        <button type="submit">{{ 'templates.search.search' | t }}</button>
      </form>
    </header>

    {%- if search.performed -%}
      {%- if search.results_count > 0 -%}

        {% comment %} Filter by type {% endcomment %}
        {% if section.settings.show_type_filter %}
          <div class="search-page__filters">
            <a href="{{ routes.search_url }}?q={{ search.terms | url_encode }}"
               class="{% if search.types == nil %}active{% endif %}">
              All
            </a>
            <a href="{{ routes.search_url }}?q={{ search.terms | url_encode }}&type=product"
               class="{% if search.types contains 'product' %}active{% endif %}">
              Products
            </a>
            <a href="{{ routes.search_url }}?q={{ search.terms | url_encode }}&type=article"
               class="{% if search.types contains 'article' %}active{% endif %}">
              Articles
            </a>
            <a href="{{ routes.search_url }}?q={{ search.terms | url_encode }}&type=page"
               class="{% if search.types contains 'page' %}active{% endif %}">
              Pages
            </a>
          </div>
        {% endif %}

        {% comment %} Results grid {% endcomment %}
        <div class="search-page__results">
          {%- for item in search.results -%}
            {%- case item.object_type -%}
              {%- when 'product' -%}
                {% render 'product-card', product: item %}

              {%- when 'article' -%}
                <article class="search-result search-result--article">
                  {%- if item.image -%}
                    <a href="{{ item.url }}">
                      {{ item.image | image_url: width: 400 | image_tag: loading: 'lazy' }}
                    </a>
                  {%- endif -%}
                  <div class="search-result__content">
                    <span class="search-result__type">Article</span>
                    <h2><a href="{{ item.url }}">{{ item.title }}</a></h2>
                    <p>{{ item.excerpt | strip_html | truncate: 150 }}</p>
                  </div>
                </article>

              {%- when 'page' -%}
                <article class="search-result search-result--page">
                  <div class="search-result__content">
                    <span class="search-result__type">Page</span>
                    <h2><a href="{{ item.url }}">{{ item.title }}</a></h2>
                    <p>{{ item.content | strip_html | truncate: 150 }}</p>
                  </div>
                </article>

            {%- endcase -%}
          {%- endfor -%}
        </div>

        {% comment %} Pagination {% endcomment %}
        {% render 'pagination', paginate: paginate %}

      {%- else -%}
        <div class="search-page__no-results">
          <p>{{ 'templates.search.no_results' | t: terms: search.terms }}</p>
          <h2>{{ 'templates.search.suggestions' | t }}</h2>
          <ul>
            <li>{{ 'templates.search.suggestion_1' | t }}</li>
            <li>{{ 'templates.search.suggestion_2' | t }}</li>
            <li>{{ 'templates.search.suggestion_3' | t }}</li>
          </ul>
        </div>
      {%- endif -%}
    {%- endif -%}
  </div>
</section>
{%- endpaginate -%}

{% schema %}
{
  "name": "Search Results",
  "settings": [
    {
      "type": "range",
      "id": "products_per_page",
      "label": "Results per page",
      "min": 8,
      "max": 24,
      "step": 4,
      "default": 12
    },
    {
      "type": "checkbox",
      "id": "show_type_filter",
      "label": "Show result type filter",
      "default": true
    }
  ]
}
{% endschema %}
```

---

## Part 3: Collection Filtering

### Filter UI

```liquid
{% comment %} snippets/collection-filters.liquid {% endcomment %}

<form id="collection-filters" class="collection-filters">
  {%- for filter in collection.filters -%}
    <details class="filter" {% if filter.active_values.size > 0 %}open{% endif %}>
      <summary class="filter__header">
        {{ filter.label }}
        {%- if filter.active_values.size > 0 -%}
          <span class="filter__count">{{ filter.active_values.size }}</span>
        {%- endif -%}
      </summary>

      <div class="filter__content">
        {%- case filter.type -%}

          {%- when 'list' -%}
            <ul class="filter__list">
              {%- for value in filter.values -%}
                <li>
                  <label class="filter__option">
                    <input
                      type="checkbox"
                      name="{{ value.param_name }}"
                      value="{{ value.value }}"
                      {% if value.active %}checked{% endif %}
                      {% if value.count == 0 and value.active == false %}disabled{% endif %}
                    >
                    <span class="filter__label">
                      {%- if filter.param_name == 'filter.v.option.color' -%}
                        <span class="filter__swatch" style="background-color: {{ value.value | downcase }}"></span>
                      {%- endif -%}
                      {{ value.label }}
                    </span>
                    <span class="filter__count">({{ value.count }})</span>
                  </label>
                </li>
              {%- endfor -%}
            </ul>

          {%- when 'price_range' -%}
            <div class="filter__price-range">
              <div class="filter__price-inputs">
                <div class="filter__price-field">
                  <label for="filter-price-min">{{ 'collections.filtering.from' | t }}</label>
                  <input
                    type="number"
                    id="filter-price-min"
                    name="{{ filter.min_value.param_name }}"
                    value="{{ filter.min_value.value | money_without_currency | replace: ',', '' }}"
                    min="0"
                    max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                    placeholder="0"
                  >
                </div>
                <div class="filter__price-field">
                  <label for="filter-price-max">{{ 'collections.filtering.to' | t }}</label>
                  <input
                    type="number"
                    id="filter-price-max"
                    name="{{ filter.max_value.param_name }}"
                    value="{{ filter.max_value.value | money_without_currency | replace: ',', '' }}"
                    min="0"
                    max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
                    placeholder="{{ filter.range_max | money_without_currency }}"
                  >
                </div>
              </div>
            </div>

        {%- endcase -%}
      </div>
    </details>
  {%- endfor -%}

  <button type="submit" class="filter__apply">
    {{ 'collections.filtering.apply' | t }}
  </button>
</form>

{% comment %} Active filters {% endcomment %}
{%- if collection.filters | map: 'active_values' | sum: 'size' > 0 -%}
  <div class="active-filters">
    <span>{{ 'collections.filtering.active_filters' | t }}:</span>
    {%- for filter in collection.filters -%}
      {%- for value in filter.active_values -%}
        <a href="{{ value.url_to_remove }}" class="active-filter">
          {{ filter.label }}: {{ value.label }}
          <span aria-hidden="true">×</span>
        </a>
      {%- endfor -%}
    {%- endfor %}
    <a href="{{ collection.url }}" class="active-filters__clear">
      {{ 'collections.filtering.clear_all' | t }}
    </a>
  </div>
{%- endif -%}
```

### Sort Options

```liquid
{% comment %} snippets/collection-sort.liquid {% endcomment %}

<div class="collection-sort">
  <label for="sort-by">{{ 'collections.sorting.sort_by' | t }}</label>
  <select id="sort-by" data-sort-select>
    {%- for option in collection.sort_options -%}
      <option value="{{ option.value }}" {% if collection.sort_by == option.value %}selected{% endif %}>
        {{ option.name }}
      </option>
    {%- endfor -%}
  </select>
</div>

<script>
  document.querySelector('[data-sort-select]')?.addEventListener('change', (e) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', e.target.value);
    window.location.href = url.toString();
  });
</script>
```

### JavaScript Filter Handler

```javascript
class CollectionFilters {
  constructor() {
    this.form = document.getElementById('collection-filters');
    this.productsContainer = document.querySelector('[data-products-container]');

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('change', this.debounce(this.onFilterChange.bind(this), 500));
    this.form.addEventListener('submit', this.onFilterSubmit.bind(this));
  }

  async onFilterChange(event) {
    // Auto-submit on change (optional)
    await this.applyFilters();
  }

  onFilterSubmit(event) {
    event.preventDefault();
    this.applyFilters();
  }

  async applyFilters() {
    const formData = new FormData(this.form);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value) params.append(key, value);
    }

    // Keep sort order
    const currentUrl = new URL(window.location.href);
    const sortBy = currentUrl.searchParams.get('sort_by');
    if (sortBy) params.set('sort_by', sortBy);

    // Update URL without reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);

    // Fetch filtered products
    await this.fetchProducts(newUrl);
  }

  async fetchProducts(url) {
    this.productsContainer.classList.add('loading');

    try {
      const response = await fetch(`${url}&sections=main-collection-products`);
      const data = await response.json();

      const parser = new DOMParser();
      const doc = parser.parseFromString(data['main-collection-products'], 'text/html');
      const newProducts = doc.querySelector('[data-products-container]');

      this.productsContainer.innerHTML = newProducts.innerHTML;
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      this.productsContainer.classList.remove('loading');
    }
  }

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
}

new CollectionFilters();
```

---

## Part 4: Search Object Reference

### Search Object Properties

```liquid
{{ search.performed }}           {% comment %} Boolean: was search performed? {% endcomment %}
{{ search.terms }}               {% comment %} Search query string {% endcomment %}
{{ search.results }}             {% comment %} Array of results {% endcomment %}
{{ search.results_count }}       {% comment %} Total number of results {% endcomment %}
{{ search.types }}               {% comment %} Array of result types {% endcomment %}
```

### Search Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Search query | `?q=shirt` |
| `type` | Filter by type | `?type=product` |
| `options[prefix]` | Search type | `?options[prefix]=last` |
| `sort_by` | Sort results | `?sort_by=relevance` |

---

## Part 5: Conversion Checklist

### When Source Site Has Search

| Source Feature | Shopify Solution | Complexity |
|----------------|------------------|------------|
| Basic search | Built-in search | Low |
| Autocomplete | Predictive Search API | Medium |
| Instant results | Section Rendering API | Medium |
| Faceted filters | Collection filters | Medium |
| Search analytics | Shopify Admin | Built-in |
| Algolia/Elasticsearch | Algolia app | High |

### Documentation for Client

```markdown
## Search Functionality

### Included Features
- ✅ Site-wide search (products, collections, articles, pages)
- ✅ Predictive search with autocomplete
- ✅ Search results page with pagination
- ✅ Collection filtering (by price, availability, options)
- ✅ Sort options (price, date, best selling)

### Search Capabilities
- Typo tolerance (1 character difference)
- Partial word matching
- Multi-word search
- Relevance ranking

### Limitations vs. Source Site
- No fuzzy search beyond 1 character
- No synonym matching (without app)
- No custom ranking rules (without app)
- Limited to 10 predictive results

### Recommended Apps (for advanced search)
- Algolia (advanced search + recommendations)
- Searchanise (visual search, merchandising)
- Boost Commerce (filtering + search)
```
