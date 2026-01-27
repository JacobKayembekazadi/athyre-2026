# FAQ & Accordion Patterns

Collapsible content sections, FAQ pages, product Q&A, and accordion components with accessibility.

---

## Basic Accordion Component

### Accordion Section

```liquid
{%- comment -%}
  sections/accordion.liquid
  Generic accordion for FAQ, product details, etc.
{%- endcomment -%}

<div class="accordion-section section-{{ section.id }}">
  <div class="page-width">
    {%- if section.settings.title != blank -%}
      <h2 class="accordion-section__title {{ section.settings.heading_size }}">
        {{ section.settings.title }}
      </h2>
    {%- endif -%}

    {%- if section.settings.description != blank -%}
      <div class="accordion-section__description">
        {{ section.settings.description }}
      </div>
    {%- endif -%}

    <accordion-group
      class="accordion-group"
      data-allow-multiple="{{ section.settings.allow_multiple }}"
    >
      {%- for block in section.blocks -%}
        {%- case block.type -%}
          {%- when 'accordion_item' -%}
            <accordion-item
              class="accordion-item"
              {{ block.shopify_attributes }}
              {%- if block.settings.open_by_default %} data-open{% endif -%}
            >
              <h3 class="accordion-item__heading">
                <button
                  type="button"
                  class="accordion-item__trigger"
                  aria-expanded="{{ block.settings.open_by_default }}"
                  aria-controls="AccordionContent-{{ block.id }}"
                  id="AccordionTrigger-{{ block.id }}"
                >
                  {%- if block.settings.icon != 'none' -%}
                    <span class="accordion-item__icon">
                      {% render 'icon', icon: block.settings.icon %}
                    </span>
                  {%- endif -%}
                  <span class="accordion-item__title">
                    {{ block.settings.title }}
                  </span>
                  <span class="accordion-item__indicator" aria-hidden="true">
                    {% render 'icon', icon: 'chevron-down' %}
                  </span>
                </button>
              </h3>

              <div
                id="AccordionContent-{{ block.id }}"
                class="accordion-item__content"
                role="region"
                aria-labelledby="AccordionTrigger-{{ block.id }}"
                {%- unless block.settings.open_by_default %} hidden{% endunless -%}
              >
                <div class="accordion-item__body rte">
                  {{ block.settings.content }}
                </div>
              </div>
            </accordion-item>

          {%- when 'custom_liquid' -%}
            <div class="accordion-custom" {{ block.shopify_attributes }}>
              {{ block.settings.custom_liquid }}
            </div>
        {%- endcase -%}
      {%- endfor -%}
    </accordion-group>
  </div>
</div>

{% schema %}
{
  "name": "Accordion",
  "tag": "section",
  "class": "accordion-section-wrapper",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Frequently Asked Questions"
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
      "id": "description",
      "label": "Description"
    },
    {
      "type": "checkbox",
      "id": "allow_multiple",
      "label": "Allow multiple items open",
      "default": false,
      "info": "If disabled, opening one item closes others"
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
      "type": "accordion_item",
      "name": "Accordion item",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Question / Title",
          "default": "Question goes here"
        },
        {
          "type": "richtext",
          "id": "content",
          "label": "Answer / Content",
          "default": "<p>Answer content goes here.</p>"
        },
        {
          "type": "checkbox",
          "id": "open_by_default",
          "label": "Open by default",
          "default": false
        },
        {
          "type": "select",
          "id": "icon",
          "label": "Icon",
          "options": [
            { "value": "none", "label": "None" },
            { "value": "question", "label": "Question mark" },
            { "value": "shipping", "label": "Shipping" },
            { "value": "return", "label": "Returns" },
            { "value": "payment", "label": "Payment" },
            { "value": "sizing", "label": "Sizing" },
            { "value": "care", "label": "Care" }
          ],
          "default": "none"
        }
      ]
    },
    {
      "type": "custom_liquid",
      "name": "Custom Liquid",
      "settings": [
        {
          "type": "liquid",
          "id": "custom_liquid",
          "label": "Custom Liquid"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Accordion",
      "blocks": [
        {
          "type": "accordion_item",
          "settings": {
            "title": "What is your return policy?",
            "content": "<p>We offer a 30-day return policy for all unworn items in original packaging.</p>"
          }
        },
        {
          "type": "accordion_item",
          "settings": {
            "title": "How long does shipping take?",
            "content": "<p>Standard shipping takes 3-5 business days. Express shipping is available at checkout.</p>"
          }
        },
        {
          "type": "accordion_item",
          "settings": {
            "title": "Do you offer international shipping?",
            "content": "<p>Yes, we ship to over 50 countries worldwide. Shipping rates vary by location.</p>"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## JavaScript Components

```javascript
/**
 * Accordion Group - manages multiple accordion items
 */
class AccordionGroup extends HTMLElement {
  constructor() {
    super();
    this.allowMultiple = this.dataset.allowMultiple === 'true';
    this.items = [];
  }

  connectedCallback() {
    this.items = Array.from(this.querySelectorAll('accordion-item'));

    // Listen for item opens
    this.addEventListener('accordion:open', (e) => {
      if (!this.allowMultiple) {
        this.closeOthers(e.target);
      }
    });
  }

  closeOthers(currentItem) {
    this.items.forEach(item => {
      if (item !== currentItem && item.isOpen) {
        item.close();
      }
    });
  }

  openAll() {
    this.items.forEach(item => item.open());
  }

  closeAll() {
    this.items.forEach(item => item.close());
  }
}

customElements.define('accordion-group', AccordionGroup);

/**
 * Accordion Item - individual collapsible item
 */
class AccordionItem extends HTMLElement {
  constructor() {
    super();
    this.trigger = this.querySelector('.accordion-item__trigger');
    this.content = this.querySelector('.accordion-item__content');
    this.isOpen = this.hasAttribute('data-open');
  }

  connectedCallback() {
    this.trigger.addEventListener('click', () => this.toggle());

    // Keyboard support
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Initialize state
    if (this.isOpen) {
      this.open(false);
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(animate = true) {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.content.removeAttribute('hidden');
    this.classList.add('is-open');

    if (animate) {
      // Animate height
      this.animateOpen();
    }

    // Dispatch event for group
    this.dispatchEvent(new CustomEvent('accordion:open', {
      bubbles: true
    }));
  }

  close(animate = true) {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.classList.remove('is-open');

    if (animate) {
      this.animateClose();
    } else {
      this.content.setAttribute('hidden', '');
    }
  }

  animateOpen() {
    // Get the height
    const height = this.content.scrollHeight;

    // Set initial state
    this.content.style.height = '0';
    this.content.style.overflow = 'hidden';

    // Force reflow
    this.content.offsetHeight;

    // Animate
    this.content.style.transition = 'height 0.3s ease';
    this.content.style.height = `${height}px`;

    // Clean up after animation
    this.content.addEventListener('transitionend', () => {
      this.content.style.height = '';
      this.content.style.overflow = '';
      this.content.style.transition = '';
    }, { once: true });
  }

  animateClose() {
    // Get current height
    const height = this.content.scrollHeight;
    this.content.style.height = `${height}px`;
    this.content.style.overflow = 'hidden';

    // Force reflow
    this.content.offsetHeight;

    // Animate
    this.content.style.transition = 'height 0.3s ease';
    this.content.style.height = '0';

    // Hide after animation
    this.content.addEventListener('transitionend', () => {
      this.content.setAttribute('hidden', '');
      this.content.style.height = '';
      this.content.style.overflow = '';
      this.content.style.transition = '';
    }, { once: true });
  }
}

customElements.define('accordion-item', AccordionItem);
```

---

## FAQ Page Template

```liquid
{%- comment -%}
  templates/page.faq.json
  FAQ page with categories and search
{%- endcomment -%}

{
  "sections": {
    "main": {
      "type": "faq-page",
      "settings": {}
    }
  },
  "order": ["main"]
}
```

### FAQ Page Section

```liquid
{%- comment -%}
  sections/faq-page.liquid
  Full FAQ page with categories and search
{%- endcomment -%}

<div class="faq-page">
  <div class="page-width">
    <header class="faq-page__header">
      <h1 class="faq-page__title">{{ page.title }}</h1>
      {%- if page.content != blank -%}
        <div class="faq-page__intro rte">
          {{ page.content }}
        </div>
      {%- endif -%}

      {%- if section.settings.enable_search -%}
        <div class="faq-search" data-faq-search>
          <label for="faq-search-input" class="visually-hidden">
            {{ 'faq.search_label' | t }}
          </label>
          <div class="faq-search__field">
            {% render 'icon', icon: 'search' %}
            <input
              type="search"
              id="faq-search-input"
              class="faq-search__input"
              placeholder="{{ 'faq.search_placeholder' | t | default: 'Search FAQs...' }}"
              data-faq-search-input
            >
            <button
              type="button"
              class="faq-search__clear hidden"
              data-faq-search-clear
              aria-label="{{ 'faq.clear_search' | t }}"
            >
              {% render 'icon', icon: 'close' %}
            </button>
          </div>
          <div class="faq-search__results hidden" data-faq-search-results>
            <span data-faq-result-count>0</span> {{ 'faq.results_found' | t | default: 'results found' }}
          </div>
        </div>
      {%- endif -%}
    </header>

    {%- if section.settings.show_categories -%}
      <nav class="faq-categories" aria-label="{{ 'faq.categories' | t }}">
        <ul class="faq-categories__list">
          <li>
            <button
              type="button"
              class="faq-categories__item is-active"
              data-faq-category="all"
            >
              {{ 'faq.all_categories' | t | default: 'All' }}
            </button>
          </li>
          {%- for block in section.blocks -%}
            {%- if block.type == 'category' -%}
              <li>
                <button
                  type="button"
                  class="faq-categories__item"
                  data-faq-category="{{ block.settings.category_id | handleize }}"
                >
                  {{ block.settings.category_name }}
                </button>
              </li>
            {%- endif -%}
          {%- endfor -%}
        </ul>
      </nav>
    {%- endif -%}

    <div class="faq-content" data-faq-content>
      {%- for block in section.blocks -%}
        {%- case block.type -%}
          {%- when 'category' -%}
            <div
              class="faq-category"
              data-category="{{ block.settings.category_id | handleize }}"
              {{ block.shopify_attributes }}
            >
              <h2 class="faq-category__title">
                {{ block.settings.category_name }}
              </h2>
            </div>

          {%- when 'question' -%}
            <accordion-item
              class="faq-item accordion-item"
              data-category="{{ block.settings.category | handleize }}"
              data-faq-item
              {{ block.shopify_attributes }}
            >
              <h3 class="accordion-item__heading">
                <button
                  type="button"
                  class="accordion-item__trigger"
                  aria-expanded="false"
                  aria-controls="FaqContent-{{ block.id }}"
                >
                  <span class="accordion-item__title" data-faq-question>
                    {{ block.settings.question }}
                  </span>
                  <span class="accordion-item__indicator" aria-hidden="true">
                    {% render 'icon', icon: 'chevron-down' %}
                  </span>
                </button>
              </h3>

              <div
                id="FaqContent-{{ block.id }}"
                class="accordion-item__content"
                role="region"
                hidden
              >
                <div class="accordion-item__body rte" data-faq-answer>
                  {{ block.settings.answer }}
                </div>

                {%- if section.settings.show_helpful -%}
                  <div class="faq-helpful">
                    <span class="faq-helpful__label">
                      {{ 'faq.was_helpful' | t | default: 'Was this helpful?' }}
                    </span>
                    <button
                      type="button"
                      class="faq-helpful__button"
                      data-faq-helpful="yes"
                      data-faq-id="{{ block.id }}"
                    >
                      {% render 'icon', icon: 'thumbs-up' %}
                      {{ 'faq.yes' | t | default: 'Yes' }}
                    </button>
                    <button
                      type="button"
                      class="faq-helpful__button"
                      data-faq-helpful="no"
                      data-faq-id="{{ block.id }}"
                    >
                      {% render 'icon', icon: 'thumbs-down' %}
                      {{ 'faq.no' | t | default: 'No' }}
                    </button>
                  </div>
                {%- endif -%}
              </div>
            </accordion-item>
        {%- endcase -%}
      {%- endfor -%}
    </div>

    {%- if section.settings.show_contact_cta -%}
      <div class="faq-contact">
        <h3 class="faq-contact__title">
          {{ section.settings.contact_title | default: "Still have questions?" }}
        </h3>
        <p class="faq-contact__text">
          {{ section.settings.contact_text }}
        </p>
        <a href="{{ section.settings.contact_link }}" class="faq-contact__button button">
          {{ section.settings.contact_button_text | default: "Contact Us" }}
        </a>
      </div>
    {%- endif -%}
  </div>
</div>

<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {%- for block in section.blocks -%}
        {%- if block.type == 'question' -%}
          {
            "@type": "Question",
            "name": {{ block.settings.question | json }},
            "acceptedAnswer": {
              "@type": "Answer",
              "text": {{ block.settings.answer | strip_html | json }}
            }
          }{%- unless forloop.last -%},{%- endunless -%}
        {%- endif -%}
      {%- endfor -%}
    ]
  }
</script>

{% schema %}
{
  "name": "FAQ Page",
  "tag": "section",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable_search",
      "label": "Enable FAQ search",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_categories",
      "label": "Show category navigation",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_helpful",
      "label": "Show 'Was this helpful?' buttons",
      "default": false
    },
    {
      "type": "header",
      "content": "Contact CTA"
    },
    {
      "type": "checkbox",
      "id": "show_contact_cta",
      "label": "Show contact section",
      "default": true
    },
    {
      "type": "text",
      "id": "contact_title",
      "label": "Title",
      "default": "Still have questions?"
    },
    {
      "type": "textarea",
      "id": "contact_text",
      "label": "Text",
      "default": "Can't find the answer you're looking for? Our team is here to help."
    },
    {
      "type": "url",
      "id": "contact_link",
      "label": "Button link",
      "default": "/pages/contact"
    },
    {
      "type": "text",
      "id": "contact_button_text",
      "label": "Button text",
      "default": "Contact Us"
    }
  ],
  "blocks": [
    {
      "type": "category",
      "name": "Category",
      "settings": [
        {
          "type": "text",
          "id": "category_id",
          "label": "Category ID",
          "info": "Used to group questions (e.g., 'shipping')"
        },
        {
          "type": "text",
          "id": "category_name",
          "label": "Category name",
          "default": "Shipping"
        }
      ]
    },
    {
      "type": "question",
      "name": "Question",
      "settings": [
        {
          "type": "text",
          "id": "category",
          "label": "Category",
          "info": "Match to a category ID above"
        },
        {
          "type": "text",
          "id": "question",
          "label": "Question",
          "default": "How long does shipping take?"
        },
        {
          "type": "richtext",
          "id": "answer",
          "label": "Answer",
          "default": "<p>Standard shipping takes 3-5 business days.</p>"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "FAQ Page"
    }
  ]
}
{% endschema %}
```

---

## FAQ Search JavaScript

```javascript
/**
 * FAQ Search functionality
 */
class FaqSearch {
  constructor(container) {
    this.container = container;
    this.input = container.querySelector('[data-faq-search-input]');
    this.clearBtn = container.querySelector('[data-faq-search-clear]');
    this.resultsEl = container.querySelector('[data-faq-search-results]');
    this.countEl = container.querySelector('[data-faq-result-count]');
    this.faqItems = document.querySelectorAll('[data-faq-item]');
    this.categoryBtns = document.querySelectorAll('[data-faq-category]');

    this.init();
  }

  init() {
    this.input.addEventListener('input', () => this.search());
    this.clearBtn?.addEventListener('click', () => this.clear());

    // Category filtering
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => this.filterCategory(btn));
    });
  }

  search() {
    const query = this.input.value.toLowerCase().trim();

    if (query.length === 0) {
      this.clear();
      return;
    }

    this.clearBtn?.classList.remove('hidden');
    this.resultsEl?.classList.remove('hidden');

    // Reset category filters
    this.categoryBtns.forEach(btn => btn.classList.remove('is-active'));
    document.querySelector('[data-faq-category="all"]')?.classList.add('is-active');

    let matchCount = 0;

    this.faqItems.forEach(item => {
      const question = item.querySelector('[data-faq-question]')?.textContent.toLowerCase() || '';
      const answer = item.querySelector('[data-faq-answer]')?.textContent.toLowerCase() || '';

      const matches = question.includes(query) || answer.includes(query);

      item.style.display = matches ? '' : 'none';

      if (matches) {
        matchCount++;
        // Highlight matching text (optional)
        this.highlightMatches(item, query);
      }
    });

    if (this.countEl) {
      this.countEl.textContent = matchCount;
    }

    // Announce results to screen readers
    this.announceResults(matchCount);
  }

  clear() {
    this.input.value = '';
    this.clearBtn?.classList.add('hidden');
    this.resultsEl?.classList.add('hidden');

    this.faqItems.forEach(item => {
      item.style.display = '';
      this.removeHighlights(item);
    });
  }

  filterCategory(clickedBtn) {
    const category = clickedBtn.dataset.faqCategory;

    // Update active state
    this.categoryBtns.forEach(btn => btn.classList.remove('is-active'));
    clickedBtn.classList.add('is-active');

    // Clear search
    this.clear();

    // Show/hide items
    this.faqItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // Show/hide category headers
    document.querySelectorAll('.faq-category').forEach(cat => {
      if (category === 'all' || cat.dataset.category === category) {
        cat.style.display = '';
      } else {
        cat.style.display = 'none';
      }
    });
  }

  highlightMatches(item, query) {
    // Simple highlight - wraps matching text in <mark>
    const elements = item.querySelectorAll('[data-faq-question], [data-faq-answer]');

    elements.forEach(el => {
      const text = el.innerHTML;
      const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
      el.innerHTML = text.replace(regex, '<mark>$1</mark>');
    });
  }

  removeHighlights(item) {
    const marks = item.querySelectorAll('mark');
    marks.forEach(mark => {
      const text = document.createTextNode(mark.textContent);
      mark.parentNode.replaceChild(text, mark);
    });
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  announceResults(count) {
    // Create or update live region for screen readers
    let liveRegion = document.getElementById('faq-live-region');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'faq-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = `${count} results found`;
  }
}

// Initialize
document.querySelectorAll('[data-faq-search]').forEach(container => {
  new FaqSearch(container);
});
```

---

## Product FAQ Snippet

```liquid
{%- comment -%}
  snippets/product-faq.liquid
  FAQ section for product pages using metafields

  Usage:
  {% render 'product-faq', product: product %}

  Metafield structure:
  product.metafields.custom.faq (JSON)
  [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
{%- endcomment -%}

{%- assign faq_data = product.metafields.custom.faq.value -%}

{%- if faq_data != blank and faq_data.size > 0 -%}
  <div class="product-faq">
    <h2 class="product-faq__title">
      {{ 'products.faq.title' | t | default: 'Product Questions' }}
    </h2>

    <accordion-group class="accordion-group" data-allow-multiple="true">
      {%- for item in faq_data -%}
        <accordion-item class="accordion-item">
          <h3 class="accordion-item__heading">
            <button
              type="button"
              class="accordion-item__trigger"
              aria-expanded="false"
              aria-controls="ProductFaq-{{ forloop.index }}"
            >
              <span class="accordion-item__title">{{ item.question }}</span>
              <span class="accordion-item__indicator" aria-hidden="true">
                {% render 'icon', icon: 'chevron-down' %}
              </span>
            </button>
          </h3>

          <div
            id="ProductFaq-{{ forloop.index }}"
            class="accordion-item__content"
            role="region"
            hidden
          >
            <div class="accordion-item__body rte">
              {{ item.answer }}
            </div>
          </div>
        </accordion-item>
      {%- endfor -%}
    </accordion-group>
  </div>

  {%- comment -%} Schema.org markup {%- endcomment -%}
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {%- for item in faq_data -%}
          {
            "@type": "Question",
            "name": {{ item.question | json }},
            "acceptedAnswer": {
              "@type": "Answer",
              "text": {{ item.answer | strip_html | json }}
            }
          }{%- unless forloop.last -%},{%- endunless -%}
        {%- endfor -%}
      ]
    }
  </script>
{%- endif -%}
```

---

## Collapsible Product Details

```liquid
{%- comment -%}
  snippets/product-details-accordion.liquid
  Collapsible sections for product details

  Usage in product template:
  {% render 'product-details-accordion', product: product %}
{%- endcomment -%}

<accordion-group class="product-details-accordion" data-allow-multiple="true">
  {%- comment -%} Description {%- endcomment -%}
  {%- if product.description != blank -%}
    <accordion-item class="accordion-item" data-open>
      <h3 class="accordion-item__heading">
        <button
          type="button"
          class="accordion-item__trigger"
          aria-expanded="true"
          aria-controls="ProductDescription"
        >
          <span class="accordion-item__title">
            {{ 'products.product.description' | t }}
          </span>
          <span class="accordion-item__indicator" aria-hidden="true">
            {% render 'icon', icon: 'chevron-down' %}
          </span>
        </button>
      </h3>

      <div id="ProductDescription" class="accordion-item__content" role="region">
        <div class="accordion-item__body rte">
          {{ product.description }}
        </div>
      </div>
    </accordion-item>
  {%- endif -%}

  {%- comment -%} Materials & Care (from metafield) {%- endcomment -%}
  {%- assign materials = product.metafields.custom.materials.value -%}
  {%- if materials != blank -%}
    <accordion-item class="accordion-item">
      <h3 class="accordion-item__heading">
        <button
          type="button"
          class="accordion-item__trigger"
          aria-expanded="false"
          aria-controls="ProductMaterials"
        >
          <span class="accordion-item__title">
            {{ 'products.product.materials' | t | default: 'Materials & Care' }}
          </span>
          <span class="accordion-item__indicator" aria-hidden="true">
            {% render 'icon', icon: 'chevron-down' %}
          </span>
        </button>
      </h3>

      <div id="ProductMaterials" class="accordion-item__content" role="region" hidden>
        <div class="accordion-item__body rte">
          {{ materials }}
        </div>
      </div>
    </accordion-item>
  {%- endif -%}

  {%- comment -%} Sizing (from metafield) {%- endcomment -%}
  {%- assign sizing = product.metafields.custom.sizing_info.value -%}
  {%- if sizing != blank -%}
    <accordion-item class="accordion-item">
      <h3 class="accordion-item__heading">
        <button
          type="button"
          class="accordion-item__trigger"
          aria-expanded="false"
          aria-controls="ProductSizing"
        >
          <span class="accordion-item__title">
            {{ 'products.product.sizing' | t | default: 'Sizing' }}
          </span>
          <span class="accordion-item__indicator" aria-hidden="true">
            {% render 'icon', icon: 'chevron-down' %}
          </span>
        </button>
      </h3>

      <div id="ProductSizing" class="accordion-item__content" role="region" hidden>
        <div class="accordion-item__body rte">
          {{ sizing }}
        </div>
      </div>
    </accordion-item>
  {%- endif -%}

  {%- comment -%} Shipping & Returns (from settings) {%- endcomment -%}
  {%- if settings.shipping_info != blank -%}
    <accordion-item class="accordion-item">
      <h3 class="accordion-item__heading">
        <button
          type="button"
          class="accordion-item__trigger"
          aria-expanded="false"
          aria-controls="ProductShipping"
        >
          <span class="accordion-item__title">
            {{ 'products.product.shipping' | t | default: 'Shipping & Returns' }}
          </span>
          <span class="accordion-item__indicator" aria-hidden="true">
            {% render 'icon', icon: 'chevron-down' %}
          </span>
        </button>
      </h3>

      <div id="ProductShipping" class="accordion-item__content" role="region" hidden>
        <div class="accordion-item__body rte">
          {{ settings.shipping_info }}
        </div>
      </div>
    </accordion-item>
  {%- endif -%}
</accordion-group>
```

---

## CSS Styles

```css
/* Accordion Group */
.accordion-group {
  display: flex;
  flex-direction: column;
}

/* Accordion Item */
.accordion-item {
  border-bottom: 1px solid var(--color-border);
}

.accordion-item:first-child {
  border-top: 1px solid var(--color-border);
}

/* Trigger Button */
.accordion-item__heading {
  margin: 0;
}

.accordion-item__trigger {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1.25rem 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-foreground);
  gap: 1rem;
}

.accordion-item__trigger:hover {
  color: var(--color-primary);
}

.accordion-item__trigger:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.accordion-item__icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-foreground-muted);
}

.accordion-item__title {
  flex: 1;
}

.accordion-item__indicator {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.accordion-item.is-open .accordion-item__indicator {
  transform: rotate(180deg);
}

/* Content */
.accordion-item__content {
  overflow: hidden;
}

.accordion-item__body {
  padding: 0 0 1.25rem;
  color: var(--color-foreground-muted);
}

.accordion-item__body > *:last-child {
  margin-bottom: 0;
}

/* FAQ Page Specific */
.faq-page__header {
  text-align: center;
  margin-bottom: 3rem;
}

.faq-page__title {
  margin-bottom: 1rem;
}

.faq-page__intro {
  max-width: 600px;
  margin: 0 auto 2rem;
  color: var(--color-foreground-muted);
}

/* FAQ Search */
.faq-search {
  max-width: 500px;
  margin: 0 auto;
}

.faq-search__field {
  position: relative;
  display: flex;
  align-items: center;
}

.faq-search__field svg:first-child {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-foreground-muted);
  pointer-events: none;
}

.faq-search__input {
  width: 100%;
  padding: 1rem 3rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full, 9999px);
  font-size: 1rem;
  background: var(--color-background);
}

.faq-search__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.faq-search__clear {
  position: absolute;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-alt);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.faq-search__results {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-foreground-muted);
  text-align: center;
}

/* FAQ Categories */
.faq-categories {
  margin-bottom: 2rem;
}

.faq-categories__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.faq-categories__item {
  padding: 0.5rem 1rem;
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full, 9999px);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-categories__item:hover {
  border-color: var(--color-primary);
}

.faq-categories__item.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

/* FAQ Category Headers */
.faq-category__title {
  font-size: 1.25rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

/* Helpful Buttons */
.faq-helpful {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.faq-helpful__label {
  color: var(--color-foreground-muted);
}

.faq-helpful__button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-helpful__button:hover {
  border-color: var(--color-primary);
}

.faq-helpful__button.is-selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.faq-helpful__button svg {
  width: 1rem;
  height: 1rem;
}

/* Contact CTA */
.faq-contact {
  text-align: center;
  padding: 3rem 2rem;
  margin-top: 3rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius-lg);
}

.faq-contact__title {
  margin-bottom: 0.5rem;
}

.faq-contact__text {
  color: var(--color-foreground-muted);
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Product FAQ */
.product-faq {
  margin: 2rem 0;
}

.product-faq__title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

/* Search Highlight */
.faq-item mark {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: inherit;
  padding: 0.125em 0.25em;
  border-radius: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .accordion-item__indicator,
  .accordion-item__content {
    transition: none;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .faq-categories__list {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .faq-categories__item {
    white-space: nowrap;
  }
}
```

---

## Locales

```json
{
  "faq": {
    "search_label": "Search FAQs",
    "search_placeholder": "Search FAQs...",
    "clear_search": "Clear search",
    "results_found": "results found",
    "categories": "Categories",
    "all_categories": "All",
    "was_helpful": "Was this helpful?",
    "yes": "Yes",
    "no": "No"
  },
  "products": {
    "product": {
      "description": "Description",
      "materials": "Materials & Care",
      "sizing": "Sizing",
      "shipping": "Shipping & Returns"
    },
    "faq": {
      "title": "Product Questions"
    }
  }
}
```

---

## Metafield Setup

For product-specific FAQs, create a metafield:

**Namespace:** `custom`
**Key:** `faq`
**Type:** `JSON`

Example value:
```json
[
  {
    "question": "What materials is this made from?",
    "answer": "This product is made from 100% organic cotton."
  },
  {
    "question": "How should I care for this item?",
    "answer": "Machine wash cold, tumble dry low."
  }
]
```
