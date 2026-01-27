# Predictive Search Patterns

Implementation guide for autocomplete search with real-time suggestions in Shopify themes.

## Overview

Predictive search provides instant results as users type, improving:
- **Discoverability** - Surface products before search submit
- **Navigation** - Quick access to categories/pages
- **Conversion** - Reduce search abandonment

Shopify provides the `/search/suggest.json` endpoint for predictive results.

---

## Search API Reference

### Endpoint
```
GET /search/suggest.json?q={query}&resources[type]={types}&resources[limit]={limit}
```

### Parameters
| Parameter | Description | Default |
|-----------|-------------|---------|
| `q` | Search query (URL encoded) | Required |
| `resources[type]` | Comma-separated: `product,collection,article,page,query` | All types |
| `resources[limit]` | Results per type (1-10) | 4 |
| `resources[options][unavailable_products]` | `show`, `hide`, `last` | `last` |
| `resources[options][fields]` | Product fields: `title,product_type,variants.title,vendor,tag` | All |

### Example Request
```
/search/suggest.json?q=shirt&resources[type]=product,collection&resources[limit]=6
```

### Response Structure
```json
{
  "resources": {
    "results": {
      "products": [
        {
          "id": 123,
          "title": "Blue Shirt",
          "handle": "blue-shirt",
          "url": "/products/blue-shirt",
          "image": "//cdn.shopify.com/...",
          "price": "2999",
          "compare_at_price": "3999",
          "available": true,
          "vendor": "Brand",
          "product_type": "Shirts"
        }
      ],
      "collections": [...],
      "articles": [...],
      "pages": [...],
      "queries": [...]
    }
  }
}
```

---

## React Input
```jsx
function PredictiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef();

  useEffect(() => {
    const debounced = debounce(async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      const data = await fetchSuggestions(query);
      setResults(data);
      setLoading(false);
    }, 300);

    debounced();
    return debounced.cancel;
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(i => Math.min(i + 1, totalResults - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      navigateToResult(selectedIndex);
    }
  };

  return (
    <div className="predictive-search">
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
      />
      {results && <SearchResults results={results} selectedIndex={selectedIndex} />}
    </div>
  );
}
```

---

## Shopify Implementation

### Search Form Section
```liquid
{% comment %} sections/predictive-search.liquid {% endcomment %}

<div class="search-modal" id="search-modal" data-search-modal hidden>
  <div class="search-modal-backdrop" data-search-close></div>

  <div class="search-modal-content">
    <form action="{{ routes.search_url }}" method="get" class="search-form" role="search">
      <div class="search-input-wrapper">
        <label for="search-input" class="visually-hidden">
          {{ 'general.search.placeholder' | t }}
        </label>

        <input
          type="search"
          id="search-input"
          name="q"
          class="search-input"
          placeholder="{{ 'general.search.placeholder' | t }}"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-controls="predictive-search-results"
          aria-owns="predictive-search-results"
          aria-expanded="false"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          data-search-input
        >

        {%- comment -%} Hidden inputs for search configuration {%- endcomment -%}
        <input type="hidden" name="type" value="{{ section.settings.search_type }}">
        <input type="hidden" name="options[prefix]" value="last">

        <button type="button" class="search-clear" data-search-clear hidden aria-label="Clear search">
          {% render 'icon', icon: 'close' %}
        </button>
      </div>

      <button type="submit" class="search-submit" aria-label="Submit search">
        {% render 'icon', icon: 'search' %}
      </button>

      <button type="button" class="search-close" data-search-close aria-label="Close search">
        {% render 'icon', icon: 'close' %}
      </button>
    </form>

    <div
      id="predictive-search-results"
      class="predictive-search-results"
      role="listbox"
      aria-label="Search suggestions"
      data-search-results
      hidden
    >
      <div class="predictive-search-loading" data-search-loading hidden>
        {% render 'loading-spinner', size: 'medium' %}
      </div>

      <div class="predictive-search-content" data-search-content>
        {%- comment -%} Results injected via JavaScript {%- endcomment -%}
      </div>
    </div>

    {%- if section.settings.show_popular_searches -%}
      <div class="search-popular" data-search-popular>
        <h3 class="search-popular-title">{{ 'general.search.popular' | t }}</h3>
        <ul class="search-popular-list">
          {%- for term in section.settings.popular_searches -%}
            <li>
              <a href="{{ routes.search_url }}?q={{ term | url_encode }}" class="search-popular-link">
                {{ term }}
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}
  </div>
</div>

{% schema %}
{
  "name": "Predictive search",
  "settings": [
    {
      "type": "select",
      "id": "search_type",
      "label": "Search type",
      "default": "product",
      "options": [
        { "value": "product", "label": "Products only" },
        { "value": "product,article,page", "label": "Products, articles, and pages" }
      ]
    },
    {
      "type": "range",
      "id": "results_limit",
      "label": "Results per category",
      "min": 2,
      "max": 10,
      "default": 4
    },
    {
      "type": "checkbox",
      "id": "show_vendor",
      "label": "Show product vendor",
      "default": false
    },
    {
      "type": "checkbox",
      "id": "show_price",
      "label": "Show product price",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_popular_searches",
      "label": "Show popular searches",
      "default": true
    },
    {
      "type": "textarea",
      "id": "popular_searches",
      "label": "Popular search terms",
      "info": "One term per line",
      "default": "New arrivals\nBest sellers\nSale"
    }
  ]
}
{% endschema %}
```

### Results Template
```liquid
{% comment %} snippets/predictive-search-results.liquid {% endcomment %}
{%- comment -%}
  Template for predictive search results
  Rendered via JavaScript after API response
{%- endcomment -%}

{%- if predictive_search.performed -%}
  {%- if predictive_search.resources.products.size > 0
      or predictive_search.resources.collections.size > 0
      or predictive_search.resources.articles.size > 0
      or predictive_search.resources.pages.size > 0 -%}

    {%- comment -%} Query suggestions {%- endcomment -%}
    {%- if predictive_search.resources.queries.size > 0 -%}
      <div class="predictive-search-group">
        <h4 class="predictive-search-group-title">
          {{ 'general.search.suggestions' | t }}
        </h4>
        <ul class="predictive-search-queries" role="group">
          {%- for query in predictive_search.resources.queries -%}
            <li role="option" id="search-option-query-{{ forloop.index }}">
              <a href="{{ query.url }}" class="predictive-search-link" tabindex="-1">
                {% render 'icon', icon: 'search' %}
                <span>{{ query.styled_text }}</span>
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}

    {%- comment -%} Products {%- endcomment -%}
    {%- if predictive_search.resources.products.size > 0 -%}
      <div class="predictive-search-group">
        <h4 class="predictive-search-group-title">
          {{ 'general.search.products' | t }}
        </h4>
        <ul class="predictive-search-products" role="group">
          {%- for product in predictive_search.resources.products -%}
            <li role="option" id="search-option-product-{{ forloop.index }}">
              <a href="{{ product.url }}" class="predictive-search-product" tabindex="-1">
                {%- if product.featured_image -%}
                  <div class="predictive-search-product-image">
                    {{ product.featured_image | image_url: width: 100 | image_tag: loading: 'lazy' }}
                  </div>
                {%- endif -%}
                <div class="predictive-search-product-info">
                  <span class="predictive-search-product-title">{{ product.title }}</span>
                  {%- if settings.predictive_search_show_vendor and product.vendor -%}
                    <span class="predictive-search-product-vendor">{{ product.vendor }}</span>
                  {%- endif -%}
                  {%- if settings.predictive_search_show_price -%}
                    <span class="predictive-search-product-price">
                      {{ product.price | money }}
                      {%- if product.compare_at_price > product.price -%}
                        <s>{{ product.compare_at_price | money }}</s>
                      {%- endif -%}
                    </span>
                  {%- endif -%}
                </div>
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}

    {%- comment -%} Collections {%- endcomment -%}
    {%- if predictive_search.resources.collections.size > 0 -%}
      <div class="predictive-search-group">
        <h4 class="predictive-search-group-title">
          {{ 'general.search.collections' | t }}
        </h4>
        <ul class="predictive-search-collections" role="group">
          {%- for collection in predictive_search.resources.collections -%}
            <li role="option" id="search-option-collection-{{ forloop.index }}">
              <a href="{{ collection.url }}" class="predictive-search-link" tabindex="-1">
                {% render 'icon', icon: 'collection' %}
                <span>{{ collection.title }}</span>
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}

    {%- comment -%} Articles {%- endcomment -%}
    {%- if predictive_search.resources.articles.size > 0 -%}
      <div class="predictive-search-group">
        <h4 class="predictive-search-group-title">
          {{ 'general.search.articles' | t }}
        </h4>
        <ul class="predictive-search-articles" role="group">
          {%- for article in predictive_search.resources.articles -%}
            <li role="option" id="search-option-article-{{ forloop.index }}">
              <a href="{{ article.url }}" class="predictive-search-article" tabindex="-1">
                {%- if article.image -%}
                  <div class="predictive-search-article-image">
                    {{ article.image | image_url: width: 100 | image_tag: loading: 'lazy' }}
                  </div>
                {%- endif -%}
                <div class="predictive-search-article-info">
                  <span class="predictive-search-article-title">{{ article.title }}</span>
                  <span class="predictive-search-article-date">
                    {{ article.published_at | date: format: 'abbreviated_date' }}
                  </span>
                </div>
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}

    {%- comment -%} Pages {%- endcomment -%}
    {%- if predictive_search.resources.pages.size > 0 -%}
      <div class="predictive-search-group">
        <h4 class="predictive-search-group-title">
          {{ 'general.search.pages' | t }}
        </h4>
        <ul class="predictive-search-pages" role="group">
          {%- for page in predictive_search.resources.pages -%}
            <li role="option" id="search-option-page-{{ forloop.index }}">
              <a href="{{ page.url }}" class="predictive-search-link" tabindex="-1">
                {% render 'icon', icon: 'page' %}
                <span>{{ page.title }}</span>
              </a>
            </li>
          {%- endfor -%}
        </ul>
      </div>
    {%- endif -%}

    {%- comment -%} View all link {%- endcomment -%}
    <div class="predictive-search-footer">
      <button type="submit" class="predictive-search-view-all">
        {{ 'general.search.view_all' | t: terms: predictive_search.terms }}
        {% render 'icon', icon: 'arrow-right' %}
      </button>
    </div>

  {%- else -%}
    <div class="predictive-search-empty">
      <p>{{ 'general.search.no_results' | t: terms: predictive_search.terms }}</p>
    </div>
  {%- endif -%}
{%- endif -%}
```

---

## JavaScript Controller

```javascript
// assets/predictive-search.js

class PredictiveSearch {
  constructor() {
    this.modal = document.querySelector('[data-search-modal]');
    this.input = document.querySelector('[data-search-input]');
    this.results = document.querySelector('[data-search-results]');
    this.content = document.querySelector('[data-search-content]');
    this.loading = document.querySelector('[data-search-loading]');
    this.clearBtn = document.querySelector('[data-search-clear]');
    this.popular = document.querySelector('[data-search-popular]');

    this.selectedIndex = -1;
    this.allOptions = [];
    this.abortController = null;
    this.debounceTimer = null;

    this.config = {
      resourceTypes: 'product,collection,article,page,query',
      limit: 4,
      minChars: 2,
      debounceMs: 300
    };

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.querySelectorAll('[data-search-toggle]').forEach(el => {
      el.addEventListener('click', () => this.open());
    });

    // Close triggers
    document.querySelectorAll('[data-search-close]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.hidden) {
        this.close();
      }
    });

    // Input events
    if (this.input) {
      this.input.addEventListener('input', (e) => this.onInput(e));
      this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
      this.input.addEventListener('focus', () => this.onFocus());
    }

    // Clear button
    this.clearBtn?.addEventListener('click', () => this.clear());
  }

  open() {
    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus input after animation
    setTimeout(() => {
      this.input?.focus();
    }, 100);
  }

  close() {
    this.modal.hidden = true;
    document.body.style.overflow = '';
    this.clear();
  }

  clear() {
    if (this.input) {
      this.input.value = '';
      this.input.setAttribute('aria-expanded', 'false');
    }
    this.results.hidden = true;
    this.clearBtn.hidden = true;
    if (this.popular) this.popular.hidden = false;
    this.selectedIndex = -1;
    this.allOptions = [];
  }

  onInput(event) {
    const query = event.target.value.trim();

    // Show/hide clear button
    this.clearBtn.hidden = query.length === 0;

    // Debounce search
    clearTimeout(this.debounceTimer);

    if (query.length < this.config.minChars) {
      this.results.hidden = true;
      if (this.popular) this.popular.hidden = false;
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.config.debounceMs);
  }

  onFocus() {
    const query = this.input.value.trim();
    if (query.length >= this.config.minChars && this.content.innerHTML) {
      this.results.hidden = false;
    }
  }

  onKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigate(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigate(-1);
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          event.preventDefault();
          this.selectOption();
        }
        break;
    }
  }

  navigate(direction) {
    const maxIndex = this.allOptions.length - 1;

    // Remove current selection
    if (this.selectedIndex >= 0) {
      this.allOptions[this.selectedIndex]?.classList.remove('is-selected');
    }

    // Calculate new index
    this.selectedIndex += direction;
    if (this.selectedIndex < -1) this.selectedIndex = maxIndex;
    if (this.selectedIndex > maxIndex) this.selectedIndex = -1;

    // Apply new selection
    if (this.selectedIndex >= 0) {
      const option = this.allOptions[this.selectedIndex];
      option.classList.add('is-selected');
      option.scrollIntoView({ block: 'nearest' });

      // Update ARIA
      this.input.setAttribute('aria-activedescendant', option.id);
    } else {
      this.input.removeAttribute('aria-activedescendant');
    }
  }

  selectOption() {
    const option = this.allOptions[this.selectedIndex];
    const link = option?.querySelector('a');
    if (link) {
      window.location.href = link.href;
    }
  }

  async search(query) {
    // Abort previous request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    // Show loading
    this.results.hidden = false;
    this.loading.hidden = false;
    if (this.popular) this.popular.hidden = true;
    this.input.setAttribute('aria-expanded', 'true');

    try {
      const url = this.buildUrl(query);

      const response = await fetch(url, {
        signal: this.abortController.signal,
        headers: {
          'Accept': 'text/html'
        }
      });

      if (!response.ok) throw new Error('Search failed');

      const html = await response.text();
      this.renderResults(html);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        this.content.innerHTML = `
          <div class="predictive-search-error">
            <p>Sorry, something went wrong. Please try again.</p>
          </div>
        `;
      }
    } finally {
      this.loading.hidden = true;
    }
  }

  buildUrl(query) {
    const params = new URLSearchParams({
      q: query,
      'resources[type]': this.config.resourceTypes,
      'resources[limit]': this.config.limit,
      'resources[options][unavailable_products]': 'last',
      section_id: 'predictive-search'
    });

    return `/search/suggest?${params.toString()}`;
  }

  renderResults(html) {
    // Parse HTML and extract section content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.predictive-search-content') || doc.body;

    this.content.innerHTML = content.innerHTML;

    // Update options list for keyboard nav
    this.allOptions = Array.from(this.content.querySelectorAll('[role="option"]'));
    this.selectedIndex = -1;

    // Analytics event
    this.trackSearch();
  }

  trackSearch() {
    // Dispatch event for analytics
    document.dispatchEvent(new CustomEvent('search:performed', {
      detail: {
        query: this.input.value,
        resultsCount: this.allOptions.length
      }
    }));
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new PredictiveSearch();
});
```

---

## CSS Styles

```css
/* assets/predictive-search.css */

/* Modal Overlay */
.search-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-out;
}

.search-modal[hidden] {
  display: none;
}

.search-modal-backdrop {
  position: absolute;
  inset: 0;
}

.search-modal-content {
  position: relative;
  background: var(--color-background);
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  margin: 10vh auto 0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Search Form */
.search-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: none;
  font-size: 1.125rem;
  background: transparent;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-clear {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
}

.search-submit,
.search-close {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.search-submit:hover,
.search-close:hover {
  background: var(--color-background-secondary);
}

/* Results Container */
.predictive-search-results {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.predictive-search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.predictive-search-content {
  padding: 0.5rem 0;
}

/* Result Groups */
.predictive-search-group {
  padding: 0.5rem 1rem;
}

.predictive-search-group + .predictive-search-group {
  border-top: 1px solid var(--color-border);
}

.predictive-search-group-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: 0.5rem 0;
  margin: 0;
}

/* Query Suggestions */
.predictive-search-queries {
  list-style: none;
  margin: 0;
  padding: 0;
}

.predictive-search-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 6px;
  transition: background 0.15s;
}

.predictive-search-link:hover,
[role="option"].is-selected .predictive-search-link {
  background: var(--color-background-secondary);
}

.predictive-search-link svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
}

/* Product Results */
.predictive-search-products {
  list-style: none;
  margin: 0;
  padding: 0;
}

.predictive-search-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 6px;
  transition: background 0.15s;
}

.predictive-search-product:hover,
[role="option"].is-selected .predictive-search-product {
  background: var(--color-background-secondary);
}

.predictive-search-product-image {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.predictive-search-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.predictive-search-product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.predictive-search-product-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.predictive-search-product-vendor {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.predictive-search-product-price {
  font-size: 0.875rem;
  font-weight: 500;
}

.predictive-search-product-price s {
  color: var(--color-text-muted);
  margin-left: 0.5rem;
}

/* Article Results */
.predictive-search-articles {
  list-style: none;
  margin: 0;
  padding: 0;
}

.predictive-search-article {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 6px;
  transition: background 0.15s;
}

.predictive-search-article:hover,
[role="option"].is-selected .predictive-search-article {
  background: var(--color-background-secondary);
}

.predictive-search-article-image {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.predictive-search-article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.predictive-search-article-title {
  font-weight: 500;
}

.predictive-search-article-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Collection & Page Results */
.predictive-search-collections,
.predictive-search-pages {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Empty & Error States */
.predictive-search-empty,
.predictive-search-error {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

/* Footer / View All */
.predictive-search-footer {
  padding: 0.5rem 1rem 1rem;
  border-top: 1px solid var(--color-border);
}

.predictive-search-view-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.predictive-search-view-all:hover {
  opacity: 0.9;
}

/* Popular Searches */
.search-popular {
  padding: 1.5rem;
}

.search-popular-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
}

.search-popular-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-popular-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--color-background-secondary);
  color: var(--color-text);
  text-decoration: none;
  border-radius: 999px;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.search-popular-link:hover {
  background: var(--color-border);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .search-modal-content {
    margin: 0;
    max-height: 100%;
    border-radius: 0;
  }

  .search-input {
    font-size: 1rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .search-modal,
  .search-modal-content {
    animation: none;
  }
}
```

---

## Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| ARIA combobox | `role="combobox"`, `aria-controls`, `aria-expanded` |
| Live region | `aria-live="polite"` for results count |
| Keyboard nav | Arrow keys cycle, Enter selects |
| Active descendant | `aria-activedescendant` tracks selection |
| Focus management | Focus returns to input on selection |
| Screen reader | Announce result counts |

---

## Performance Optimizations

1. **Debounce input** - 300ms delay prevents excessive API calls
2. **Abort previous requests** - Cancel in-flight fetches on new input
3. **Cache results** - Store recent queries in sessionStorage
4. **Lazy load images** - Use `loading="lazy"` on result images
5. **Limit results** - Show 4-6 per category max
6. **Preconnect** - `<link rel="preconnect" href="cdn.shopify.com">`

---

## Testing Checklist

1. **Keyboard Navigation**
   - [ ] Arrow keys move selection
   - [ ] Enter navigates to selected
   - [ ] Escape closes modal
   - [ ] Tab moves through results

2. **Screen Readers**
   - [ ] Input announced as combobox
   - [ ] Results count announced
   - [ ] Selection changes announced
   - [ ] Groups have headings

3. **Performance**
   - [ ] Results appear < 500ms
   - [ ] No duplicate requests
   - [ ] Smooth scrolling in results

4. **Edge Cases**
   - [ ] Empty query shows popular
   - [ ] No results shows message
   - [ ] Special characters handled
   - [ ] Long queries truncated
