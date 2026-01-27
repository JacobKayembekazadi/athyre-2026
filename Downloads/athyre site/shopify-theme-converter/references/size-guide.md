# Size Guide & Fit Finder Patterns

Size charts, measurement guides, fit recommendations, and unit conversion for apparel stores.

---

## Size Guide Modal

### Modal Trigger Snippet

```liquid
{%- comment -%}
  snippets/size-guide-trigger.liquid
  Button to open size guide modal

  Usage:
  {% render 'size-guide-trigger', product: product %}
{%- endcomment -%}

{%- comment -%} Check if product has size option {%- endcomment -%}
{%- assign has_size = false -%}
{%- for option in product.options -%}
  {%- assign option_lower = option | downcase -%}
  {%- if option_lower == 'size' or option_lower == 'taille' -%}
    {%- assign has_size = true -%}
    {%- break -%}
  {%- endif -%}
{%- endfor -%}

{%- if has_size -%}
  <button
    type="button"
    class="size-guide-trigger"
    data-size-guide-trigger
    aria-haspopup="dialog"
  >
    {% render 'icon', icon: 'ruler' %}
    <span>{{ 'products.size_guide.trigger' | t | default: 'Size Guide' }}</span>
  </button>
{%- endif -%}
```

### Size Guide Modal Section

```liquid
{%- comment -%}
  sections/size-guide-modal.liquid
  Modal containing size guide content
{%- endcomment -%}

<size-guide-modal
  id="SizeGuideModal"
  class="size-guide-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="SizeGuideTitle"
  aria-hidden="true"
  data-size-guide-modal
>
  <div class="size-guide-modal__overlay" data-size-guide-close></div>

  <div class="size-guide-modal__container">
    <header class="size-guide-modal__header">
      <h2 id="SizeGuideTitle" class="size-guide-modal__title">
        {{ section.settings.title | default: 'Size Guide' }}
      </h2>

      <button
        type="button"
        class="size-guide-modal__close"
        data-size-guide-close
        aria-label="{{ 'general.accessibility.close' | t }}"
      >
        {% render 'icon', icon: 'close' %}
      </button>
    </header>

    <div class="size-guide-modal__content">
      {%- comment -%} Unit Toggle {%- endcomment -%}
      {%- if section.settings.show_unit_toggle -%}
        <div class="size-guide-modal__units">
          <button
            type="button"
            class="size-guide-unit is-active"
            data-unit="in"
          >
            {{ 'products.size_guide.inches' | t | default: 'Inches' }}
          </button>
          <button
            type="button"
            class="size-guide-unit"
            data-unit="cm"
          >
            {{ 'products.size_guide.centimeters' | t | default: 'Centimeters' }}
          </button>
        </div>
      {%- endif -%}

      {%- comment -%} Category Tabs {%- endcomment -%}
      {%- if section.blocks.size > 1 -%}
        <div class="size-guide-tabs" role="tablist">
          {%- for block in section.blocks -%}
            {%- if block.type == 'size_chart' -%}
              <button
                type="button"
                role="tab"
                class="size-guide-tab{% if forloop.first %} is-active{% endif %}"
                aria-selected="{{ forloop.first }}"
                aria-controls="SizeChart-{{ block.id }}"
                id="SizeTab-{{ block.id }}"
              >
                {{ block.settings.category_name }}
              </button>
            {%- endif -%}
          {%- endfor -%}
        </div>
      {%- endif -%}

      {%- comment -%} Size Charts {%- endcomment -%}
      {%- for block in section.blocks -%}
        {%- case block.type -%}
          {%- when 'size_chart' -%}
            <div
              id="SizeChart-{{ block.id }}"
              role="tabpanel"
              aria-labelledby="SizeTab-{{ block.id }}"
              class="size-guide-chart{% unless forloop.first %} hidden{% endunless %}"
              {{ block.shopify_attributes }}
            >
              {%- if block.settings.description != blank -%}
                <p class="size-guide-chart__description">
                  {{ block.settings.description }}
                </p>
              {%- endif -%}

              <div class="size-guide-chart__table-wrapper">
                <table class="size-guide-chart__table" data-size-table>
                  <thead>
                    <tr>
                      <th>{{ 'products.size_guide.size' | t | default: 'Size' }}</th>
                      {%- assign headers = block.settings.headers | split: ',' -%}
                      {%- for header in headers -%}
                        <th>{{ header | strip }}</th>
                      {%- endfor -%}
                    </tr>
                  </thead>
                  <tbody>
                    {%- for i in (1..10) -%}
                      {%- assign size_key = 'size_' | append: i -%}
                      {%- assign values_key = 'values_' | append: i -%}
                      {%- assign size = block.settings[size_key] -%}
                      {%- assign values = block.settings[values_key] -%}

                      {%- if size != blank -%}
                        <tr>
                          <td>{{ size }}</td>
                          {%- assign value_list = values | split: ',' -%}
                          {%- for value in value_list -%}
                            <td data-value-in="{{ value | strip }}" data-value-cm="{{ value | strip | times: 2.54 | round: 1 }}">
                              <span class="size-value size-value--in">{{ value | strip }}"</span>
                              <span class="size-value size-value--cm hidden">{{ value | strip | times: 2.54 | round: 1 }} cm</span>
                            </td>
                          {%- endfor -%}
                        </tr>
                      {%- endif -%}
                    {%- endfor -%}
                  </tbody>
                </table>
              </div>
            </div>

          {%- when 'how_to_measure' -%}
            <div class="size-guide-measure" {{ block.shopify_attributes }}>
              <h3 class="size-guide-measure__title">
                {{ block.settings.title | default: 'How to Measure' }}
              </h3>

              {%- if block.settings.image != blank -%}
                <div class="size-guide-measure__image">
                  <img
                    src="{{ block.settings.image | image_url: width: 400 }}"
                    alt="{{ block.settings.image.alt | escape }}"
                    width="400"
                    height="auto"
                    loading="lazy"
                  >
                </div>
              {%- endif -%}

              <div class="size-guide-measure__instructions rte">
                {{ block.settings.instructions }}
              </div>
            </div>

          {%- when 'fit_tip' -%}
            <div class="size-guide-tip" {{ block.shopify_attributes }}>
              {% render 'icon', icon: 'info' %}
              <p>{{ block.settings.tip }}</p>
            </div>
        {%- endcase -%}
      {%- endfor -%}
    </div>
  </div>
</size-guide-modal>

{% schema %}
{
  "name": "Size Guide Modal",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Size Guide"
    },
    {
      "type": "checkbox",
      "id": "show_unit_toggle",
      "label": "Show unit toggle (in/cm)",
      "default": true
    }
  ],
  "blocks": [
    {
      "type": "size_chart",
      "name": "Size Chart",
      "settings": [
        {
          "type": "text",
          "id": "category_name",
          "label": "Category name",
          "default": "Tops"
        },
        {
          "type": "textarea",
          "id": "description",
          "label": "Description"
        },
        {
          "type": "text",
          "id": "headers",
          "label": "Column headers (comma-separated)",
          "default": "Chest, Length, Sleeve",
          "info": "Enter measurement types separated by commas"
        },
        {
          "type": "header",
          "content": "Sizes"
        },
        {
          "type": "text",
          "id": "size_1",
          "label": "Size 1 name",
          "default": "XS"
        },
        {
          "type": "text",
          "id": "values_1",
          "label": "Size 1 values (inches)",
          "default": "34, 26, 32",
          "info": "Values in inches, comma-separated"
        },
        {
          "type": "text",
          "id": "size_2",
          "label": "Size 2 name",
          "default": "S"
        },
        {
          "type": "text",
          "id": "values_2",
          "label": "Size 2 values (inches)",
          "default": "36, 27, 33"
        },
        {
          "type": "text",
          "id": "size_3",
          "label": "Size 3 name",
          "default": "M"
        },
        {
          "type": "text",
          "id": "values_3",
          "label": "Size 3 values (inches)",
          "default": "38, 28, 34"
        },
        {
          "type": "text",
          "id": "size_4",
          "label": "Size 4 name",
          "default": "L"
        },
        {
          "type": "text",
          "id": "values_4",
          "label": "Size 4 values (inches)",
          "default": "40, 29, 35"
        },
        {
          "type": "text",
          "id": "size_5",
          "label": "Size 5 name",
          "default": "XL"
        },
        {
          "type": "text",
          "id": "values_5",
          "label": "Size 5 values (inches)",
          "default": "42, 30, 36"
        },
        {
          "type": "text",
          "id": "size_6",
          "label": "Size 6 name"
        },
        {
          "type": "text",
          "id": "values_6",
          "label": "Size 6 values (inches)"
        },
        {
          "type": "text",
          "id": "size_7",
          "label": "Size 7 name"
        },
        {
          "type": "text",
          "id": "values_7",
          "label": "Size 7 values (inches)"
        },
        {
          "type": "text",
          "id": "size_8",
          "label": "Size 8 name"
        },
        {
          "type": "text",
          "id": "values_8",
          "label": "Size 8 values (inches)"
        },
        {
          "type": "text",
          "id": "size_9",
          "label": "Size 9 name"
        },
        {
          "type": "text",
          "id": "values_9",
          "label": "Size 9 values (inches)"
        },
        {
          "type": "text",
          "id": "size_10",
          "label": "Size 10 name"
        },
        {
          "type": "text",
          "id": "values_10",
          "label": "Size 10 values (inches)"
        }
      ]
    },
    {
      "type": "how_to_measure",
      "name": "How to Measure",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Title",
          "default": "How to Measure"
        },
        {
          "type": "image_picker",
          "id": "image",
          "label": "Measurement diagram"
        },
        {
          "type": "richtext",
          "id": "instructions",
          "label": "Instructions",
          "default": "<p><strong>Chest:</strong> Measure around the fullest part of your chest.</p><p><strong>Length:</strong> Measure from the highest point of the shoulder to the hem.</p>"
        }
      ]
    },
    {
      "type": "fit_tip",
      "name": "Fit Tip",
      "settings": [
        {
          "type": "textarea",
          "id": "tip",
          "label": "Tip text",
          "default": "This style runs small. We recommend ordering one size up."
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Size Guide Modal",
      "blocks": [
        {
          "type": "size_chart",
          "settings": {
            "category_name": "Tops"
          }
        },
        {
          "type": "how_to_measure"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## Size Guide JavaScript

```javascript
/**
 * Size Guide Modal Controller
 */
class SizeGuideModal extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('[data-size-guide-close]');
    this.closeButtons = this.querySelectorAll('[data-size-guide-close]');
    this.unitButtons = this.querySelectorAll('[data-unit]');
    this.tabs = this.querySelectorAll('[role="tab"]');
    this.panels = this.querySelectorAll('[role="tabpanel"]');
    this.currentUnit = 'in';
  }

  connectedCallback() {
    // Close handlers
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Unit toggle
    this.unitButtons.forEach(btn => {
      btn.addEventListener('click', () => this.toggleUnit(btn.dataset.unit));
    });

    // Tab navigation
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
      tab.addEventListener('keydown', (e) => this.handleTabKeydown(e, tab));
    });

    // Trigger buttons
    document.querySelectorAll('[data-size-guide-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => this.open());
    });
  }

  open() {
    this.setAttribute('aria-hidden', 'false');
    this.classList.add('is-open');
    document.body.classList.add('size-guide-open');

    // Focus management
    this.previousFocus = document.activeElement;
    const firstFocusable = this.querySelector('button, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    // Trap focus
    this.trapFocus();
  }

  close() {
    this.setAttribute('aria-hidden', 'true');
    this.classList.remove('is-open');
    document.body.classList.remove('size-guide-open');

    // Restore focus
    this.previousFocus?.focus();
  }

  isOpen() {
    return this.classList.contains('is-open');
  }

  trapFocus() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  toggleUnit(unit) {
    this.currentUnit = unit;

    // Update button states
    this.unitButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.unit === unit);
    });

    // Update visible values
    this.querySelectorAll('.size-value--in').forEach(el => {
      el.classList.toggle('hidden', unit !== 'in');
    });
    this.querySelectorAll('.size-value--cm').forEach(el => {
      el.classList.toggle('hidden', unit !== 'cm');
    });
  }

  switchTab(selectedTab) {
    // Update tab states
    this.tabs.forEach(tab => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected);
    });

    // Update panel visibility
    const targetPanelId = selectedTab.getAttribute('aria-controls');
    this.panels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== targetPanelId);
    });
  }

  handleTabKeydown(e, currentTab) {
    const tabsArray = Array.from(this.tabs);
    const currentIndex = tabsArray.indexOf(currentTab);

    let newIndex;

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = tabsArray.length - 1;
        break;
      case 'ArrowRight':
        newIndex = currentIndex + 1;
        if (newIndex >= tabsArray.length) newIndex = 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabsArray.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    tabsArray[newIndex].focus();
    this.switchTab(tabsArray[newIndex]);
  }
}

customElements.define('size-guide-modal', SizeGuideModal);
```

---

## Product-Specific Size Guide

```liquid
{%- comment -%}
  snippets/product-size-guide.liquid
  Size chart from product metafield

  Usage:
  {% render 'product-size-guide', product: product %}

  Metafield: product.metafields.custom.size_chart (JSON)
  {
    "description": "This style fits true to size",
    "headers": ["Chest", "Waist", "Hips"],
    "sizes": [
      { "name": "XS", "values": [32, 26, 34] },
      { "name": "S", "values": [34, 28, 36] },
      { "name": "M", "values": [36, 30, 38] }
    ]
  }
{%- endcomment -%}

{%- assign size_chart = product.metafields.custom.size_chart.value -%}

{%- if size_chart != blank -%}
  <div class="product-size-guide" data-product-size-guide>
    <button type="button" class="product-size-guide__toggle" data-toggle-size-guide>
      {% render 'icon', icon: 'ruler' %}
      {{ 'products.size_guide.view_chart' | t | default: 'View Size Chart' }}
    </button>

    <div class="product-size-guide__content hidden" data-size-guide-content>
      {%- if size_chart.description -%}
        <p class="product-size-guide__description">
          {{ size_chart.description }}
        </p>
      {%- endif -%}

      {%- comment -%} Unit Toggle {%- endcomment -%}
      <div class="product-size-guide__units">
        <button type="button" class="size-guide-unit is-active" data-unit="in">in</button>
        <button type="button" class="size-guide-unit" data-unit="cm">cm</button>
      </div>

      <div class="product-size-guide__table-wrapper">
        <table class="product-size-guide__table">
          <thead>
            <tr>
              <th>{{ 'products.size_guide.size' | t | default: 'Size' }}</th>
              {%- for header in size_chart.headers -%}
                <th>{{ header }}</th>
              {%- endfor -%}
            </tr>
          </thead>
          <tbody>
            {%- for size in size_chart.sizes -%}
              <tr>
                <td>{{ size.name }}</td>
                {%- for value in size.values -%}
                  <td>
                    <span class="size-value size-value--in">{{ value }}"</span>
                    <span class="size-value size-value--cm hidden">{{ value | times: 2.54 | round: 1 }} cm</span>
                  </td>
                {%- endfor -%}
              </tr>
            {%- endfor -%}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    (function() {
      const guide = document.querySelector('[data-product-size-guide]');
      const toggle = guide.querySelector('[data-toggle-size-guide]');
      const content = guide.querySelector('[data-size-guide-content]');
      const unitBtns = guide.querySelectorAll('[data-unit]');

      toggle.addEventListener('click', () => {
        content.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', !content.classList.contains('hidden'));
      });

      unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const unit = btn.dataset.unit;
          unitBtns.forEach(b => b.classList.toggle('is-active', b === btn));
          guide.querySelectorAll('.size-value--in').forEach(el => {
            el.classList.toggle('hidden', unit !== 'in');
          });
          guide.querySelectorAll('.size-value--cm').forEach(el => {
            el.classList.toggle('hidden', unit !== 'cm');
          });
        });
      });
    })();
  </script>
{%- endif -%}
```

---

## Fit Finder Quiz

```liquid
{%- comment -%}
  sections/fit-finder.liquid
  Interactive quiz to recommend sizes
{%- endcomment -%}

<section class="fit-finder section-{{ section.id }}">
  <div class="page-width">
    <fit-finder-quiz class="fit-finder__quiz" data-fit-finder>
      <div class="fit-finder__header">
        <h2 class="fit-finder__title">{{ section.settings.title }}</h2>
        <p class="fit-finder__subtitle">{{ section.settings.subtitle }}</p>
      </div>

      {%- comment -%} Progress Bar {%- endcomment -%}
      <div class="fit-finder__progress">
        <div class="fit-finder__progress-bar" data-progress-bar style="width: 0%"></div>
      </div>

      {%- comment -%} Questions {%- endcomment -%}
      <div class="fit-finder__questions" data-questions>
        {%- for block in section.blocks -%}
          {%- if block.type == 'question' -%}
            <div
              class="fit-finder__question{% unless forloop.first %} hidden{% endunless %}"
              data-question="{{ forloop.index }}"
              {{ block.shopify_attributes }}
            >
              <h3 class="fit-finder__question-text">{{ block.settings.question }}</h3>

              <div class="fit-finder__options">
                {%- assign options = block.settings.options | split: '|' -%}
                {%- assign values = block.settings.values | split: '|' -%}

                {%- for option in options -%}
                  <button
                    type="button"
                    class="fit-finder__option"
                    data-value="{{ values[forloop.index0] | default: option | strip }}"
                    data-field="{{ block.settings.field_name }}"
                  >
                    {{ option | strip }}
                  </button>
                {%- endfor -%}
              </div>
            </div>
          {%- endif -%}
        {%- endfor -%}
      </div>

      {%- comment -%} Result {%- endcomment -%}
      <div class="fit-finder__result hidden" data-result>
        <div class="fit-finder__result-content">
          <h3 class="fit-finder__result-title">
            {{ 'products.fit_finder.your_size' | t | default: 'Your Recommended Size' }}
          </h3>
          <p class="fit-finder__recommended-size" data-recommended-size></p>
          <p class="fit-finder__result-note" data-result-note></p>

          <button type="button" class="fit-finder__restart" data-restart>
            {{ 'products.fit_finder.start_over' | t | default: 'Start Over' }}
          </button>
        </div>
      </div>

      {%- comment -%} Navigation {%- endcomment -%}
      <div class="fit-finder__nav hidden" data-nav>
        <button type="button" class="fit-finder__prev" data-prev disabled>
          {{ 'products.fit_finder.previous' | t | default: 'Previous' }}
        </button>
      </div>
    </fit-finder-quiz>
  </div>
</section>

{% schema %}
{
  "name": "Fit Finder",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Find Your Perfect Fit"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle",
      "default": "Answer a few questions to get your recommended size"
    }
  ],
  "blocks": [
    {
      "type": "question",
      "name": "Question",
      "settings": [
        {
          "type": "text",
          "id": "question",
          "label": "Question",
          "default": "What's your usual size in tops?"
        },
        {
          "type": "text",
          "id": "field_name",
          "label": "Field name",
          "default": "usual_size",
          "info": "Used internally for calculations"
        },
        {
          "type": "textarea",
          "id": "options",
          "label": "Options (separated by |)",
          "default": "XS|S|M|L|XL"
        },
        {
          "type": "textarea",
          "id": "values",
          "label": "Values (separated by |)",
          "default": "XS|S|M|L|XL",
          "info": "Internal values for each option"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Fit Finder",
      "blocks": [
        {
          "type": "question",
          "settings": {
            "question": "What's your usual size?",
            "field_name": "usual_size",
            "options": "XS|S|M|L|XL|XXL",
            "values": "XS|S|M|L|XL|XXL"
          }
        },
        {
          "type": "question",
          "settings": {
            "question": "How do you like your fit?",
            "field_name": "fit_preference",
            "options": "Fitted|Regular|Relaxed",
            "values": "-1|0|1"
          }
        },
        {
          "type": "question",
          "settings": {
            "question": "What's your height?",
            "field_name": "height",
            "options": "Under 5'4\"|5'4\" - 5'7\"|5'8\" - 5'11\"|6' and above",
            "values": "short|average|tall|very_tall"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

### Fit Finder JavaScript

```javascript
/**
 * Fit Finder Quiz Component
 */
class FitFinderQuiz extends HTMLElement {
  constructor() {
    super();
    this.questions = this.querySelectorAll('[data-question]');
    this.progressBar = this.querySelector('[data-progress-bar]');
    this.resultSection = this.querySelector('[data-result]');
    this.recommendedSize = this.querySelector('[data-recommended-size]');
    this.resultNote = this.querySelector('[data-result-note]');
    this.prevBtn = this.querySelector('[data-prev]');
    this.restartBtn = this.querySelector('[data-restart]');
    this.nav = this.querySelector('[data-nav]');

    this.currentQuestion = 1;
    this.totalQuestions = this.questions.length;
    this.answers = {};
  }

  connectedCallback() {
    // Option selection
    this.querySelectorAll('.fit-finder__option').forEach(option => {
      option.addEventListener('click', () => this.selectOption(option));
    });

    // Navigation
    this.prevBtn?.addEventListener('click', () => this.prevQuestion());
    this.restartBtn?.addEventListener('click', () => this.restart());

    this.updateProgress();
  }

  selectOption(option) {
    const question = option.closest('[data-question]');
    const fieldName = option.dataset.field;
    const value = option.dataset.value;

    // Store answer
    this.answers[fieldName] = value;

    // Visual feedback
    question.querySelectorAll('.fit-finder__option').forEach(opt => {
      opt.classList.remove('is-selected');
    });
    option.classList.add('is-selected');

    // Auto-advance after short delay
    setTimeout(() => {
      if (this.currentQuestion < this.totalQuestions) {
        this.nextQuestion();
      } else {
        this.showResult();
      }
    }, 300);
  }

  nextQuestion() {
    // Hide current
    this.querySelector(`[data-question="${this.currentQuestion}"]`).classList.add('hidden');

    // Show next
    this.currentQuestion++;
    this.querySelector(`[data-question="${this.currentQuestion}"]`).classList.remove('hidden');

    // Update UI
    this.updateProgress();
    this.updateNav();
  }

  prevQuestion() {
    if (this.currentQuestion <= 1) return;

    // Hide current
    this.querySelector(`[data-question="${this.currentQuestion}"]`).classList.add('hidden');

    // Show previous
    this.currentQuestion--;
    this.querySelector(`[data-question="${this.currentQuestion}"]`).classList.remove('hidden');

    // Update UI
    this.updateProgress();
    this.updateNav();
  }

  updateProgress() {
    const progress = ((this.currentQuestion - 1) / this.totalQuestions) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  updateNav() {
    this.nav?.classList.toggle('hidden', this.currentQuestion === 1);
    this.prevBtn.disabled = this.currentQuestion === 1;
  }

  showResult() {
    // Hide questions
    this.questions.forEach(q => q.classList.add('hidden'));

    // Calculate recommendation
    const recommendation = this.calculateSize();

    // Show result
    this.recommendedSize.textContent = recommendation.size;
    this.resultNote.textContent = recommendation.note;
    this.resultSection.classList.remove('hidden');
    this.nav?.classList.add('hidden');

    // Complete progress
    this.progressBar.style.width = '100%';

    // Analytics
    this.trackResult(recommendation);
  }

  calculateSize() {
    const { usual_size, fit_preference, height } = this.answers;

    // Size mapping
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    let sizeIndex = sizes.indexOf(usual_size);

    // Adjust for fit preference
    const fitAdjustment = parseInt(fit_preference) || 0;
    sizeIndex = Math.max(0, Math.min(sizes.length - 1, sizeIndex + fitAdjustment));

    // Generate note based on preferences
    let note = '';
    if (fitAdjustment > 0) {
      note = 'Based on your relaxed fit preference, we recommend sizing up.';
    } else if (fitAdjustment < 0) {
      note = 'Based on your fitted preference, we recommend your usual size.';
    }

    if (height === 'very_tall') {
      note += ' Consider our tall sizes if available.';
    } else if (height === 'short') {
      note += ' Consider our petite sizes if available.';
    }

    return {
      size: sizes[sizeIndex],
      note: note.trim() || 'This size should fit you well based on your preferences.'
    };
  }

  restart() {
    this.currentQuestion = 1;
    this.answers = {};

    // Reset UI
    this.questions.forEach((q, i) => {
      q.classList.toggle('hidden', i !== 0);
      q.querySelectorAll('.fit-finder__option').forEach(opt => {
        opt.classList.remove('is-selected');
      });
    });

    this.resultSection.classList.add('hidden');
    this.updateProgress();
    this.updateNav();
  }

  trackResult(recommendation) {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'fit_finder_complete',
        recommended_size: recommendation.size,
        answers: this.answers
      });
    }
  }
}

customElements.define('fit-finder-quiz', FitFinderQuiz);
```

---

## CSS Styles

```css
/* Size Guide Trigger */
.size-guide-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.size-guide-trigger:hover {
  color: var(--color-primary);
}

.size-guide-trigger svg {
  width: 1rem;
  height: 1rem;
}

/* Size Guide Modal */
.size-guide-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.size-guide-modal.is-open {
  opacity: 1;
  visibility: visible;
}

.size-guide-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.size-guide-modal__container {
  position: relative;
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.size-guide-modal.is-open .size-guide-modal__container {
  transform: scale(1);
}

.size-guide-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-background);
  z-index: 1;
}

.size-guide-modal__title {
  margin: 0;
  font-size: 1.25rem;
}

.size-guide-modal__close {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.size-guide-modal__close:hover {
  background: var(--color-background-alt);
}

.size-guide-modal__content {
  padding: 1.5rem;
}

/* Unit Toggle */
.size-guide-modal__units,
.product-size-guide__units {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.size-guide-unit {
  padding: 0.5rem 1rem;
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-guide-unit.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

/* Tabs */
.size-guide-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.size-guide-tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-guide-tab:hover {
  color: var(--color-primary);
}

.size-guide-tab.is-active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}

/* Size Chart Table */
.size-guide-chart__description {
  color: var(--color-foreground-muted);
  margin-bottom: 1rem;
}

.size-guide-chart__table-wrapper,
.product-size-guide__table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.size-guide-chart__table,
.product-size-guide__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.size-guide-chart__table th,
.size-guide-chart__table td,
.product-size-guide__table th,
.product-size-guide__table td {
  padding: 0.75rem 1rem;
  text-align: center;
  border: 1px solid var(--color-border);
}

.size-guide-chart__table th,
.product-size-guide__table th {
  background: var(--color-background-alt);
  font-weight: 600;
}

.size-guide-chart__table tr:hover,
.product-size-guide__table tr:hover {
  background: var(--color-background-alt);
}

/* How to Measure */
.size-guide-measure {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.size-guide-measure__title {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.size-guide-measure__image {
  margin-bottom: 1rem;
}

.size-guide-measure__image img {
  max-width: 100%;
  height: auto;
}

/* Fit Tip */
.size-guide-tip {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-primary-background);
  border-radius: var(--border-radius);
  margin-top: 1.5rem;
}

.size-guide-tip svg {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.size-guide-tip p {
  margin: 0;
  font-size: 0.875rem;
}

/* Product Size Guide (inline) */
.product-size-guide {
  margin: 1rem 0;
}

.product-size-guide__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
  text-decoration: underline;
  cursor: pointer;
}

.product-size-guide__toggle:hover {
  color: var(--color-primary);
}

.product-size-guide__content {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

/* Fit Finder Quiz */
.fit-finder {
  padding: 3rem 0;
  background: var(--color-background-alt);
}

.fit-finder__quiz {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.fit-finder__title {
  margin-bottom: 0.5rem;
}

.fit-finder__subtitle {
  color: var(--color-foreground-muted);
  margin-bottom: 2rem;
}

.fit-finder__progress {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.fit-finder__progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.fit-finder__question-text {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.fit-finder__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.fit-finder__option {
  padding: 1rem 1.5rem;
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fit-finder__option:hover {
  border-color: var(--color-primary);
}

.fit-finder__option.is-selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.fit-finder__nav {
  margin-top: 2rem;
}

.fit-finder__prev {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.fit-finder__result {
  padding: 2rem;
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
}

.fit-finder__result-title {
  color: var(--color-foreground-muted);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.fit-finder__recommended-size {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.fit-finder__result-note {
  color: var(--color-foreground-muted);
  margin-bottom: 1.5rem;
}

.fit-finder__restart {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
}

/* Body scroll lock */
body.size-guide-open {
  overflow: hidden;
}

/* Mobile */
@media (max-width: 640px) {
  .size-guide-modal {
    align-items: flex-end;
    padding: 0;
  }

  .size-guide-modal__container {
    max-height: 85vh;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  }

  .fit-finder__options {
    flex-direction: column;
  }

  .fit-finder__option {
    width: 100%;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .size-guide-modal,
  .size-guide-modal__container {
    transition: none;
  }
}
```

---

## Locales

```json
{
  "products": {
    "size_guide": {
      "trigger": "Size Guide",
      "view_chart": "View Size Chart",
      "size": "Size",
      "inches": "Inches",
      "centimeters": "Centimeters"
    },
    "fit_finder": {
      "your_size": "Your Recommended Size",
      "start_over": "Start Over",
      "previous": "Previous"
    }
  }
}
```
