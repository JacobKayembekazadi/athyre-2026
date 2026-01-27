# Contact Form Patterns

Patterns for contact pages, multi-field forms, validation, spam prevention, and file uploads.

---

## Table of Contents

1. [Basic Contact Section](#basic-contact-section)
2. [Multi-Field Form Builder](#multi-field-form-builder)
3. [Form Validation Patterns](#form-validation-patterns)
4. [Spam Prevention](#spam-prevention)
5. [File Upload Handling](#file-upload-handling)
6. [Contact Form with Map](#contact-form-with-map)
7. [Success & Error States](#success--error-states)

---

## Basic Contact Section

### Simple Contact Form Section

```liquid
{% comment %} sections/contact-form.liquid {% endcomment %}
{%- style -%}
  #Contact-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<section id="Contact-{{ section.id }}" class="contact-section">
  <div class="container">
    <div class="contact__grid">
      {%- comment -%} Contact info column {%- endcomment -%}
      <div class="contact__info">
        {%- if section.settings.heading != blank -%}
          <h1 class="contact__title">{{ section.settings.heading }}</h1>
        {%- endif -%}

        {%- if section.settings.text != blank -%}
          <div class="contact__text rte">
            {{ section.settings.text }}
          </div>
        {%- endif -%}

        {%- if section.settings.show_contact_info -%}
          <div class="contact__details">
            {%- if section.settings.email != blank -%}
              <div class="contact__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:{{ section.settings.email }}">{{ section.settings.email }}</a>
              </div>
            {%- endif -%}

            {%- if section.settings.phone != blank -%}
              <div class="contact__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:{{ section.settings.phone | remove: ' ' | remove: '-' }}">{{ section.settings.phone }}</a>
              </div>
            {%- endif -%}

            {%- if section.settings.address != blank -%}
              <div class="contact__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <address>{{ section.settings.address | newline_to_br }}</address>
              </div>
            {%- endif -%}
          </div>
        {%- endif -%}

        {%- if section.settings.show_hours -%}
          <div class="contact__hours">
            <h3 class="contact__hours-title">{{ 'contact.hours.title' | t | default: 'Business Hours' }}</h3>
            <div class="contact__hours-list">
              {{ section.settings.hours | newline_to_br }}
            </div>
          </div>
        {%- endif -%}
      </div>

      {%- comment -%} Form column {%- endcomment -%}
      <div class="contact__form-wrapper">
        {% form 'contact', class: 'contact__form', id: 'ContactForm' %}
          {%- if form.posted_successfully? -%}
            <div class="form__success" role="alert" tabindex="-1" autofocus>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p>{{ 'contact.form.success' | t | default: 'Thanks for contacting us. We\'ll get back to you as soon as possible.' }}</p>
            </div>
          {%- endif -%}

          {%- if form.errors -%}
            <div class="form__errors" role="alert">
              <p>{{ 'contact.form.error' | t | default: 'Please correct the following errors:' }}</p>
              <ul>
                {%- for field in form.errors -%}
                  <li>
                    {%- if field == 'form' -%}
                      {{ form.errors.messages[field] }}
                    {%- else -%}
                      <a href="#ContactForm-{{ field }}">
                        {{ form.errors.translated_fields[field] }} - {{ form.errors.messages[field] }}
                      </a>
                    {%- endif -%}
                  </li>
                {%- endfor -%}
              </ul>
            </div>
          {%- endif -%}

          <div class="form__row">
            <div class="form__field">
              <label for="ContactForm-name" class="form__label">
                {{ 'contact.form.name' | t | default: 'Name' }} <span class="required">*</span>
              </label>
              <input
                type="text"
                id="ContactForm-name"
                name="contact[{{ 'contact.form.name' | t | default: 'Name' }}]"
                class="form__input"
                value="{{ form.name }}"
                autocomplete="name"
                required
              >
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label for="ContactForm-email" class="form__label">
                {{ 'contact.form.email' | t | default: 'Email' }} <span class="required">*</span>
              </label>
              <input
                type="email"
                id="ContactForm-email"
                name="contact[email]"
                class="form__input {% if form.errors contains 'email' %}form__input--error{% endif %}"
                value="{{ form.email }}"
                autocomplete="email"
                autocapitalize="off"
                spellcheck="false"
                required
                aria-describedby="ContactForm-email-error"
              >
              {%- if form.errors contains 'email' -%}
                <span id="ContactForm-email-error" class="form__error-message">
                  {{ form.errors.messages.email }}
                </span>
              {%- endif -%}
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label for="ContactForm-phone" class="form__label">
                {{ 'contact.form.phone' | t | default: 'Phone' }}
              </label>
              <input
                type="tel"
                id="ContactForm-phone"
                name="contact[{{ 'contact.form.phone' | t | default: 'Phone' }}]"
                class="form__input"
                value="{{ form.phone }}"
                autocomplete="tel"
              >
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label for="ContactForm-message" class="form__label">
                {{ 'contact.form.message' | t | default: 'Message' }} <span class="required">*</span>
              </label>
              <textarea
                id="ContactForm-message"
                name="contact[{{ 'contact.form.message' | t | default: 'Message' }}]"
                class="form__textarea"
                rows="6"
                required
              >{{ form.body }}</textarea>
            </div>
          </div>

          {%- comment -%} Honeypot spam field {%- endcomment -%}
          <div class="form__field--honeypot" aria-hidden="true">
            <label for="ContactForm-honeypot">Don't fill this out</label>
            <input type="text" id="ContactForm-honeypot" name="contact[honeypot]" tabindex="-1" autocomplete="off">
          </div>

          <div class="form__row form__row--submit">
            <button type="submit" class="button button--primary">
              {{ 'contact.form.submit' | t | default: 'Send Message' }}
            </button>
          </div>
        {% endform %}
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Contact Form",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Contact Us"
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Description",
      "default": "<p>Have a question? We're here to help.</p>"
    },
    {
      "type": "header",
      "content": "Contact Information"
    },
    {
      "type": "checkbox",
      "id": "show_contact_info",
      "label": "Show contact information",
      "default": true
    },
    {
      "type": "text",
      "id": "email",
      "label": "Email address"
    },
    {
      "type": "text",
      "id": "phone",
      "label": "Phone number"
    },
    {
      "type": "textarea",
      "id": "address",
      "label": "Address"
    },
    {
      "type": "header",
      "content": "Business Hours"
    },
    {
      "type": "checkbox",
      "id": "show_hours",
      "label": "Show business hours",
      "default": false
    },
    {
      "type": "textarea",
      "id": "hours",
      "label": "Hours",
      "default": "Monday - Friday: 9am - 5pm\nSaturday: 10am - 4pm\nSunday: Closed"
    },
    {
      "type": "header",
      "content": "Section Padding"
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
      "name": "Contact Form"
    }
  ]
}
{% endschema %}
```

### Contact Form Styles

```css
/* assets/section-contact.css */
.contact__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 768px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.contact__title {
  font-size: 2rem;
  margin: 0 0 1rem;
}

.contact__text {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.contact__details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact__detail {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.contact__detail svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: var(--color-primary);
}

.contact__detail a {
  color: var(--color-text);
  text-decoration: none;
}

.contact__detail a:hover {
  text-decoration: underline;
}

.contact__detail address {
  font-style: normal;
}

.contact__hours-title {
  font-size: 1rem;
  margin: 0 0 0.75rem;
}

.contact__hours-list {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

/* Form Wrapper */
.contact__form-wrapper {
  background: var(--color-background-secondary);
  padding: 2rem;
  border-radius: 8px;
}

/* Form Styles */
.form__row {
  margin-bottom: 1.25rem;
}

.form__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form__label .required {
  color: var(--color-error, #dc2626);
}

.form__input,
.form__textarea,
.form__select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form__input:focus,
.form__textarea:focus,
.form__select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form__input--error {
  border-color: var(--color-error, #dc2626);
}

.form__textarea {
  resize: vertical;
  min-height: 120px;
}

.form__error-message {
  display: block;
  font-size: 0.75rem;
  color: var(--color-error, #dc2626);
  margin-top: 0.25rem;
}

/* Honeypot (hidden) */
.form__field--honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* Success & Error Messages */
.form__success {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-success-light, #dcfce7);
  border: 1px solid var(--color-success, #22c55e);
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form__success svg {
  flex-shrink: 0;
  color: var(--color-success, #22c55e);
}

.form__success p {
  margin: 0;
  color: var(--color-success-dark, #166534);
}

.form__errors {
  padding: 1rem;
  background: var(--color-error-light, #fef2f2);
  border: 1px solid var(--color-error, #dc2626);
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form__errors p {
  margin: 0 0 0.5rem;
  font-weight: 500;
  color: var(--color-error, #dc2626);
}

.form__errors ul {
  margin: 0;
  padding-left: 1.25rem;
}

.form__errors a {
  color: var(--color-error, #dc2626);
}
```

---

## Multi-Field Form Builder

### Dynamic Form Section with Block Fields

```liquid
{% comment %} sections/custom-form.liquid {% endcomment %}
{%- style -%}
  #CustomForm-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<section id="CustomForm-{{ section.id }}" class="custom-form-section">
  <div class="container container--narrow">
    {%- if section.settings.heading != blank -%}
      <h2 class="custom-form__title text-center">{{ section.settings.heading }}</h2>
    {%- endif -%}

    {%- if section.settings.description != blank -%}
      <div class="custom-form__description text-center rte">
        {{ section.settings.description }}
      </div>
    {%- endif -%}

    {% form 'contact', class: 'custom-form', id: 'CustomForm-' | append: section.id %}
      {%- if form.posted_successfully? -%}
        <div class="form__success" role="alert">
          {{ section.settings.success_message | default: 'Thank you! Your submission has been received.' }}
        </div>
      {%- else -%}
        {%- if form.errors -%}
          <div class="form__errors" role="alert">
            {%- for field in form.errors -%}
              <p>{{ form.errors.messages[field] }}</p>
            {%- endfor -%}
          </div>
        {%- endif -%}

        <div class="custom-form__fields">
          {%- for block in section.blocks -%}
            {%- case block.type -%}

              {%- when 'text' -%}
                <div
                  class="form__field {% if block.settings.width == 'half' %}form__field--half{% endif %}"
                  {{ block.shopify_attributes }}
                >
                  <label for="field-{{ block.id }}" class="form__label">
                    {{ block.settings.label }}
                    {%- if block.settings.required -%}<span class="required">*</span>{%- endif -%}
                  </label>
                  <input
                    type="{{ block.settings.input_type | default: 'text' }}"
                    id="field-{{ block.id }}"
                    name="contact[{{ block.settings.label }}]"
                    class="form__input"
                    placeholder="{{ block.settings.placeholder }}"
                    {% if block.settings.required %}required{% endif %}
                  >
                </div>

              {%- when 'email' -%}
                <div
                  class="form__field {% if block.settings.width == 'half' %}form__field--half{% endif %}"
                  {{ block.shopify_attributes }}
                >
                  <label for="field-{{ block.id }}" class="form__label">
                    {{ block.settings.label | default: 'Email' }}
                    <span class="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="field-{{ block.id }}"
                    name="contact[email]"
                    class="form__input"
                    placeholder="{{ block.settings.placeholder }}"
                    autocomplete="email"
                    required
                  >
                </div>

              {%- when 'textarea' -%}
                <div class="form__field form__field--full" {{ block.shopify_attributes }}>
                  <label for="field-{{ block.id }}" class="form__label">
                    {{ block.settings.label }}
                    {%- if block.settings.required -%}<span class="required">*</span>{%- endif -%}
                  </label>
                  <textarea
                    id="field-{{ block.id }}"
                    name="contact[{{ block.settings.label }}]"
                    class="form__textarea"
                    rows="{{ block.settings.rows | default: 5 }}"
                    placeholder="{{ block.settings.placeholder }}"
                    {% if block.settings.required %}required{% endif %}
                  ></textarea>
                </div>

              {%- when 'select' -%}
                <div
                  class="form__field {% if block.settings.width == 'half' %}form__field--half{% endif %}"
                  {{ block.shopify_attributes }}
                >
                  <label for="field-{{ block.id }}" class="form__label">
                    {{ block.settings.label }}
                    {%- if block.settings.required -%}<span class="required">*</span>{%- endif -%}
                  </label>
                  <select
                    id="field-{{ block.id }}"
                    name="contact[{{ block.settings.label }}]"
                    class="form__select"
                    {% if block.settings.required %}required{% endif %}
                  >
                    <option value="">{{ block.settings.placeholder | default: 'Select an option' }}</option>
                    {%- assign options = block.settings.options | split: ',' -%}
                    {%- for option in options -%}
                      <option value="{{ option | strip }}">{{ option | strip }}</option>
                    {%- endfor -%}
                  </select>
                </div>

              {%- when 'radio' -%}
                <div class="form__field form__field--full" {{ block.shopify_attributes }}>
                  <fieldset class="form__fieldset">
                    <legend class="form__label">
                      {{ block.settings.label }}
                      {%- if block.settings.required -%}<span class="required">*</span>{%- endif -%}
                    </legend>
                    <div class="form__radio-group">
                      {%- assign options = block.settings.options | split: ',' -%}
                      {%- for option in options -%}
                        <label class="form__radio-label">
                          <input
                            type="radio"
                            name="contact[{{ block.settings.label }}]"
                            value="{{ option | strip }}"
                            class="form__radio"
                            {% if block.settings.required and forloop.first %}required{% endif %}
                          >
                          <span>{{ option | strip }}</span>
                        </label>
                      {%- endfor -%}
                    </div>
                  </fieldset>
                </div>

              {%- when 'checkbox' -%}
                <div class="form__field form__field--full" {{ block.shopify_attributes }}>
                  <label class="form__checkbox-label">
                    <input
                      type="checkbox"
                      name="contact[{{ block.settings.label }}]"
                      value="Yes"
                      class="form__checkbox"
                      {% if block.settings.required %}required{% endif %}
                    >
                    <span>{{ block.settings.label }}</span>
                    {%- if block.settings.required -%}<span class="required">*</span>{%- endif -%}
                  </label>
                </div>

              {%- when 'heading' -%}
                <div class="form__field form__field--full" {{ block.shopify_attributes }}>
                  <h3 class="form__section-heading">{{ block.settings.text }}</h3>
                  {%- if block.settings.subtext != blank -%}
                    <p class="form__section-subtext">{{ block.settings.subtext }}</p>
                  {%- endif -%}
                </div>

              {%- when 'divider' -%}
                <div class="form__field form__field--full" {{ block.shopify_attributes }}>
                  <hr class="form__divider">
                </div>

            {%- endcase -%}
          {%- endfor -%}
        </div>

        {%- comment -%} Honeypot {%- endcomment -%}
        <div class="form__field--honeypot" aria-hidden="true">
          <input type="text" name="contact[honeypot]" tabindex="-1" autocomplete="off">
        </div>

        <div class="custom-form__submit">
          <button type="submit" class="button button--primary">
            {{ section.settings.submit_text | default: 'Submit' }}
          </button>
        </div>
      {%- endif -%}
    {% endform %}
  </div>
</section>

{% schema %}
{
  "name": "Custom Form",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Get in Touch"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description"
    },
    {
      "type": "text",
      "id": "submit_text",
      "label": "Submit button text",
      "default": "Submit"
    },
    {
      "type": "textarea",
      "id": "success_message",
      "label": "Success message",
      "default": "Thank you! Your submission has been received."
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
      "type": "text",
      "name": "Text Field",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Name"
        },
        {
          "type": "text",
          "id": "placeholder",
          "label": "Placeholder"
        },
        {
          "type": "select",
          "id": "input_type",
          "label": "Input type",
          "options": [
            { "value": "text", "label": "Text" },
            { "value": "tel", "label": "Phone" },
            { "value": "url", "label": "URL" },
            { "value": "number", "label": "Number" }
          ],
          "default": "text"
        },
        {
          "type": "select",
          "id": "width",
          "label": "Field width",
          "options": [
            { "value": "full", "label": "Full width" },
            { "value": "half", "label": "Half width" }
          ],
          "default": "full"
        },
        {
          "type": "checkbox",
          "id": "required",
          "label": "Required",
          "default": false
        }
      ]
    },
    {
      "type": "email",
      "name": "Email Field",
      "limit": 1,
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Email"
        },
        {
          "type": "text",
          "id": "placeholder",
          "label": "Placeholder",
          "default": "your@email.com"
        },
        {
          "type": "select",
          "id": "width",
          "label": "Field width",
          "options": [
            { "value": "full", "label": "Full width" },
            { "value": "half", "label": "Half width" }
          ],
          "default": "full"
        }
      ]
    },
    {
      "type": "textarea",
      "name": "Text Area",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Message"
        },
        {
          "type": "text",
          "id": "placeholder",
          "label": "Placeholder"
        },
        {
          "type": "range",
          "id": "rows",
          "label": "Rows",
          "min": 3,
          "max": 10,
          "default": 5
        },
        {
          "type": "checkbox",
          "id": "required",
          "label": "Required",
          "default": false
        }
      ]
    },
    {
      "type": "select",
      "name": "Dropdown",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Subject"
        },
        {
          "type": "text",
          "id": "placeholder",
          "label": "Placeholder",
          "default": "Select a subject"
        },
        {
          "type": "textarea",
          "id": "options",
          "label": "Options",
          "info": "Separate options with commas",
          "default": "General Inquiry, Order Question, Returns, Other"
        },
        {
          "type": "select",
          "id": "width",
          "label": "Field width",
          "options": [
            { "value": "full", "label": "Full width" },
            { "value": "half", "label": "Half width" }
          ],
          "default": "full"
        },
        {
          "type": "checkbox",
          "id": "required",
          "label": "Required",
          "default": false
        }
      ]
    },
    {
      "type": "radio",
      "name": "Radio Buttons",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Preferred contact method"
        },
        {
          "type": "textarea",
          "id": "options",
          "label": "Options",
          "info": "Separate options with commas",
          "default": "Email, Phone, Text"
        },
        {
          "type": "checkbox",
          "id": "required",
          "label": "Required",
          "default": false
        }
      ]
    },
    {
      "type": "checkbox",
      "name": "Checkbox",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "I agree to the terms and conditions"
        },
        {
          "type": "checkbox",
          "id": "required",
          "label": "Required",
          "default": false
        }
      ]
    },
    {
      "type": "heading",
      "name": "Section Heading",
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Heading text",
          "default": "Additional Information"
        },
        {
          "type": "text",
          "id": "subtext",
          "label": "Subtext"
        }
      ]
    },
    {
      "type": "divider",
      "name": "Divider",
      "settings": []
    }
  ],
  "presets": [
    {
      "name": "Custom Form",
      "blocks": [
        { "type": "text", "settings": { "label": "Name", "required": true } },
        { "type": "email" },
        { "type": "select", "settings": { "label": "Subject" } },
        { "type": "textarea", "settings": { "label": "Message", "required": true } }
      ]
    }
  ]
}
{% endschema %}
```

### Multi-Field Form Styles

```css
/* Additional styles for custom form */
.custom-form__title {
  margin-bottom: 0.5rem;
}

.custom-form__description {
  margin-bottom: 2rem;
  color: var(--color-text-secondary);
}

.custom-form__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form__field--half {
  flex: 1 1 calc(50% - 0.5rem);
  min-width: 200px;
}

.form__field--full {
  flex: 1 1 100%;
}

.form__fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.form__radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.form__radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form__radio {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.form__checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.form__checkbox {
  width: 18px;
  height: 18px;
  margin-top: 0.125rem;
  accent-color: var(--color-primary);
}

.form__section-heading {
  font-size: 1.125rem;
  margin: 1rem 0 0.25rem;
}

.form__section-subtext {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.form__divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1rem 0;
}

.custom-form__submit {
  margin-top: 1.5rem;
}

@media (max-width: 480px) {
  .form__field--half {
    flex: 1 1 100%;
  }
}
```

---

## Form Validation Patterns

### Client-Side Validation Component

```javascript
// assets/form-validation.js
class FormValidator extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;

    this.form.setAttribute('novalidate', '');
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearError(field));
    });
  }

  handleSubmit(e) {
    const isValid = this.validateAll();

    if (!isValid) {
      e.preventDefault();

      // Focus first invalid field
      const firstInvalid = this.form.querySelector('.form__input--error, .form__textarea--error, .form__select--error');
      firstInvalid?.focus();
    }
  }

  validateAll() {
    let isValid = true;
    const fields = this.form.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const errors = [];

    // Skip honeypot
    if (field.name.includes('honeypot')) return true;

    // Required check
    if (field.required && !field.value.trim()) {
      errors.push(this.getMessage('required', field));
    }

    // Type-specific validation
    if (field.value.trim()) {
      switch (field.type) {
        case 'email':
          if (!this.isValidEmail(field.value)) {
            errors.push(this.getMessage('email', field));
          }
          break;

        case 'tel':
          if (!this.isValidPhone(field.value)) {
            errors.push(this.getMessage('phone', field));
          }
          break;

        case 'url':
          if (!this.isValidUrl(field.value)) {
            errors.push(this.getMessage('url', field));
          }
          break;

        case 'number':
          if (field.min && parseFloat(field.value) < parseFloat(field.min)) {
            errors.push(this.getMessage('min', field));
          }
          if (field.max && parseFloat(field.value) > parseFloat(field.max)) {
            errors.push(this.getMessage('max', field));
          }
          break;
      }

      // Pattern validation
      if (field.pattern && !new RegExp(field.pattern).test(field.value)) {
        errors.push(this.getMessage('pattern', field));
      }

      // Min/max length
      if (field.minLength && field.value.length < field.minLength) {
        errors.push(this.getMessage('minlength', field));
      }
      if (field.maxLength && field.value.length > field.maxLength) {
        errors.push(this.getMessage('maxlength', field));
      }
    }

    if (errors.length > 0) {
      this.showError(field, errors[0]);
      return false;
    } else {
      this.clearError(field);
      return true;
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    // Basic phone validation - at least 10 digits
    return /[\d\s\-\(\)\+]{10,}/.test(phone);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getMessage(type, field) {
    const label = this.getFieldLabel(field);
    const messages = {
      required: `${label} is required`,
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      url: 'Please enter a valid URL',
      min: `Value must be at least ${field.min}`,
      max: `Value must be no more than ${field.max}`,
      minlength: `Must be at least ${field.minLength} characters`,
      maxlength: `Must be no more than ${field.maxLength} characters`,
      pattern: field.title || 'Please match the requested format'
    };

    return field.dataset[`${type}Message`] || messages[type];
  }

  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    return field.name || 'This field';
  }

  showError(field, message) {
    field.classList.add('form__input--error');
    field.setAttribute('aria-invalid', 'true');

    // Find or create error element
    let errorEl = field.parentElement.querySelector('.form__error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form__error-message';
      errorEl.id = `${field.id}-error`;
      field.setAttribute('aria-describedby', errorEl.id);
      field.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  clearError(field) {
    field.classList.remove('form__input--error');
    field.removeAttribute('aria-invalid');

    const errorEl = field.parentElement.querySelector('.form__error-message');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }
}

customElements.define('form-validator', FormValidator);
```

### Usage with Form Validator

```liquid
{% comment %} Wrap form with validator {% endcomment %}
<form-validator>
  {% form 'contact', class: 'custom-form' %}
    {%- comment -%} Form fields {%- endcomment -%}
  {% endform %}
</form-validator>
```

---

## Spam Prevention

### Honeypot Pattern

```liquid
{% comment %} snippets/form-honeypot.liquid {% endcomment %}
{% comment %}
  Renders a honeypot field for spam prevention
  Include within any form

  Usage:
  {% render 'form-honeypot' %}
{% endcomment %}

<div class="form__field--honeypot" aria-hidden="true">
  <label for="contact-honeypot">Leave empty</label>
  <input
    type="text"
    id="contact-honeypot"
    name="contact[honeypot]"
    tabindex="-1"
    autocomplete="off"
  >
</div>

<style>
  .form__field--honeypot {
    position: absolute !important;
    left: -9999px !important;
    opacity: 0 !important;
    pointer-events: none !important;
    height: 0 !important;
    overflow: hidden !important;
  }
</style>
```

### Time-Based Spam Prevention

```javascript
// assets/spam-prevention.js
class SpamPrevention extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;

    // Record form load time
    this.loadTime = Date.now();

    // Create hidden timestamp field
    this.timestampField = document.createElement('input');
    this.timestampField.type = 'hidden';
    this.timestampField.name = 'contact[_timestamp]';
    this.timestampField.value = this.loadTime;
    this.form.appendChild(this.timestampField);

    this.form.addEventListener('submit', (e) => this.checkSubmission(e));
  }

  checkSubmission(e) {
    const submitTime = Date.now();
    const elapsedSeconds = (submitTime - this.loadTime) / 1000;

    // If form submitted in less than 3 seconds, likely a bot
    if (elapsedSeconds < 3) {
      e.preventDefault();
      console.warn('Form submitted too quickly');
      return false;
    }

    // Add elapsed time as hidden field (for server-side validation)
    const elapsedField = document.createElement('input');
    elapsedField.type = 'hidden';
    elapsedField.name = 'contact[_elapsed]';
    elapsedField.value = Math.round(elapsedSeconds);
    this.form.appendChild(elapsedField);

    return true;
  }
}

customElements.define('spam-prevention', SpamPrevention);
```

### reCAPTCHA Integration

```liquid
{% comment %} snippets/recaptcha.liquid {% endcomment %}
{% comment %}
  Renders Google reCAPTCHA v3 (invisible)
  Requires theme settings for site key

  Usage:
  {% render 'recaptcha', form_id: 'contact-form' %}
{% endcomment %}

{%- if settings.recaptcha_site_key != blank -%}
  <script src="https://www.google.com/recaptcha/api.js?render={{ settings.recaptcha_site_key }}"></script>

  <script>
    (function() {
      const form = document.getElementById('{{ form_id }}');
      if (!form) return;

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        grecaptcha.ready(function() {
          grecaptcha.execute('{{ settings.recaptcha_site_key }}', { action: 'contact' })
            .then(function(token) {
              // Add token to form
              let tokenInput = form.querySelector('[name="g-recaptcha-response"]');
              if (!tokenInput) {
                tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'g-recaptcha-response';
                form.appendChild(tokenInput);
              }
              tokenInput.value = token;

              // Submit form
              form.submit();
            });
        });
      });
    })();
  </script>

  {%- comment -%} Hide reCAPTCHA badge (optional - must include attribution elsewhere) {%- endcomment -%}
  <style>
    .grecaptcha-badge {
      visibility: hidden;
    }
  </style>

  <p class="recaptcha-notice">
    This site is protected by reCAPTCHA and the Google
    <a href="https://policies.google.com/privacy">Privacy Policy</a> and
    <a href="https://policies.google.com/terms">Terms of Service</a> apply.
  </p>
{%- endif -%}
```

---

## File Upload Handling

### File Upload Component

```liquid
{% comment %} snippets/form-file-upload.liquid {% endcomment %}
{% comment %}
  Renders a file upload field
  Note: Shopify contact forms don't natively support file uploads.
  This requires a third-party service or custom app.

  Accepts:
  - label: Field label
  - accept: Accepted file types
  - max_size_mb: Maximum file size in MB
  - multiple: Allow multiple files
  - upload_url: Custom upload endpoint

  Usage:
  {% render 'form-file-upload', label: 'Attachments', accept: '.pdf,.jpg,.png', max_size_mb: 5 %}
{% endcomment %}

<file-upload
  class="form__file-upload"
  data-accept="{{ accept | default: '*' }}"
  data-max-size="{{ max_size_mb | default: 10 }}"
  {% if multiple %}data-multiple{% endif %}
  data-upload-url="{{ upload_url }}"
>
  <label class="form__label">
    {{ label | default: 'Upload files' }}
  </label>

  <div class="file-upload__dropzone" data-dropzone>
    <input
      type="file"
      class="file-upload__input"
      accept="{{ accept | default: '*' }}"
      {% if multiple %}multiple{% endif %}
      data-file-input
    >

    <div class="file-upload__placeholder">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p class="file-upload__text">
        <span class="file-upload__link">Click to upload</span>
        or drag and drop
      </p>
      <p class="file-upload__hint">
        Max {{ max_size_mb | default: 10 }}MB
        {%- if accept != blank %} ({{ accept }}){%- endif -%}
      </p>
    </div>
  </div>

  <div class="file-upload__files" data-file-list></div>

  {%- comment -%} Hidden input for uploaded file URLs {%- endcomment -%}
  <input type="hidden" name="contact[attachments]" data-attachment-urls>
</file-upload>

<script>
  class FileUpload extends HTMLElement {
    constructor() {
      super();
      this.files = [];
      this.maxSize = parseFloat(this.dataset.maxSize) * 1024 * 1024; // Convert to bytes
      this.accept = this.dataset.accept;
      this.multiple = this.hasAttribute('data-multiple');
      this.uploadUrl = this.dataset.uploadUrl;
    }

    connectedCallback() {
      this.dropzone = this.querySelector('[data-dropzone]');
      this.fileInput = this.querySelector('[data-file-input]');
      this.fileList = this.querySelector('[data-file-list]');
      this.urlInput = this.querySelector('[data-attachment-urls]');

      this.bindEvents();
    }

    bindEvents() {
      // Click to select
      this.dropzone.addEventListener('click', () => this.fileInput.click());

      // File input change
      this.fileInput.addEventListener('change', () => {
        this.handleFiles(this.fileInput.files);
      });

      // Drag and drop
      this.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropzone.classList.add('is-dragover');
      });

      this.dropzone.addEventListener('dragleave', () => {
        this.dropzone.classList.remove('is-dragover');
      });

      this.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropzone.classList.remove('is-dragover');
        this.handleFiles(e.dataTransfer.files);
      });
    }

    handleFiles(fileList) {
      Array.from(fileList).forEach(file => {
        // Validate size
        if (file.size > this.maxSize) {
          this.showError(`${file.name} is too large. Maximum size is ${this.dataset.maxSize}MB.`);
          return;
        }

        // Validate type
        if (this.accept !== '*' && !this.isAcceptedType(file)) {
          this.showError(`${file.name} is not an accepted file type.`);
          return;
        }

        // Add to files array
        if (!this.multiple) {
          this.files = [];
        }

        this.files.push(file);
        this.uploadFile(file);
      });

      this.renderFileList();
    }

    isAcceptedType(file) {
      const accepted = this.accept.split(',').map(t => t.trim().toLowerCase());
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const mimeType = file.type.toLowerCase();

      return accepted.some(type => {
        if (type.startsWith('.')) {
          return extension === type;
        }
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });
    }

    async uploadFile(file) {
      if (!this.uploadUrl) {
        // No upload URL - just show file preview
        console.warn('No upload URL provided. File will not be uploaded.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();

        // Store uploaded URL
        const urls = this.urlInput.value ? JSON.parse(this.urlInput.value) : [];
        urls.push(data.url);
        this.urlInput.value = JSON.stringify(urls);

        // Mark file as uploaded in list
        const fileItem = this.fileList.querySelector(`[data-filename="${file.name}"]`);
        if (fileItem) {
          fileItem.classList.add('is-uploaded');
          fileItem.querySelector('.file-upload__progress').style.display = 'none';
        }
      } catch (error) {
        console.error('File upload error:', error);
        this.showError(`Failed to upload ${file.name}`);
      }
    }

    renderFileList() {
      this.fileList.innerHTML = this.files.map(file => `
        <div class="file-upload__file" data-filename="${file.name}">
          <div class="file-upload__file-info">
            <span class="file-upload__file-icon">
              ${this.getFileIcon(file)}
            </span>
            <div>
              <span class="file-upload__file-name">${file.name}</span>
              <span class="file-upload__file-size">${this.formatSize(file.size)}</span>
            </div>
          </div>
          <div class="file-upload__progress">
            <div class="file-upload__progress-bar"></div>
          </div>
          <button type="button" class="file-upload__remove" data-remove="${file.name}" aria-label="Remove ${file.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `).join('');

      // Bind remove buttons
      this.fileList.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const filename = btn.dataset.remove;
          this.files = this.files.filter(f => f.name !== filename);
          this.renderFileList();
        });
      });
    }

    getFileIcon(file) {
      const type = file.type.split('/')[0];
      const icons = {
        image: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        video: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
        audio: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        application: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
      };
      return icons[type] || icons.application;
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    showError(message) {
      // You could implement a toast notification here
      alert(message);
    }
  }

  customElements.define('file-upload', FileUpload);
</script>

<style>
  file-upload {
    display: block;
    margin-bottom: 1.25rem;
  }

  .file-upload__dropzone {
    position: relative;
    padding: 2rem;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .file-upload__dropzone:hover,
  .file-upload__dropzone.is-dragover {
    border-color: var(--color-primary);
    background: rgba(var(--color-primary-rgb), 0.05);
  }

  .file-upload__input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .file-upload__placeholder svg {
    margin: 0 auto 1rem;
    color: var(--color-text-secondary);
  }

  .file-upload__text {
    margin: 0 0 0.25rem;
  }

  .file-upload__link {
    color: var(--color-primary);
    font-weight: 500;
  }

  .file-upload__hint {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .file-upload__files {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .file-upload__file {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-background-secondary);
    border-radius: 4px;
  }

  .file-upload__file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .file-upload__file-icon {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  .file-upload__file-name {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-upload__file-size {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .file-upload__progress {
    flex: 0 0 100px;
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
  }

  .file-upload__progress-bar {
    height: 100%;
    width: 0;
    background: var(--color-primary);
    animation: progress 2s ease-in-out infinite;
  }

  @keyframes progress {
    0% { width: 0; }
    50% { width: 70%; }
    100% { width: 100%; }
  }

  .file-upload__file.is-uploaded .file-upload__progress {
    display: none;
  }

  .file-upload__remove {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: background 0.2s, color 0.2s;
  }

  .file-upload__remove:hover {
    background: var(--color-error-light, #fef2f2);
    color: var(--color-error, #dc2626);
  }
</style>
```

---

## Contact Form with Map

### Contact Section with Google Map

```liquid
{% comment %} sections/contact-with-map.liquid {% endcomment %}
<section class="contact-map-section" id="ContactMap-{{ section.id }}">
  <div class="contact-map__grid">
    {%- comment -%} Map column {%- endcomment -%}
    <div class="contact-map__map">
      {%- if section.settings.map_address != blank -%}
        {%- if section.settings.api_key != blank -%}
          <div
            id="map-{{ section.id }}"
            class="contact-map__embed"
            data-address="{{ section.settings.map_address | escape }}"
            data-api-key="{{ section.settings.api_key }}"
            data-zoom="{{ section.settings.map_zoom }}"
          ></div>
        {%- else -%}
          {%- comment -%} Fallback to static map image or iframe embed {%- endcomment -%}
          <iframe
            class="contact-map__iframe"
            src="https://maps.google.com/maps?q={{ section.settings.map_address | url_encode }}&output=embed"
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        {%- endif -%}
      {%- else -%}
        <div class="contact-map__placeholder">
          {{ 'lifestyle-1' | placeholder_svg_tag: 'placeholder-svg' }}
        </div>
      {%- endif -%}
    </div>

    {%- comment -%} Form column {%- endcomment -%}
    <div class="contact-map__content">
      {%- if section.settings.heading != blank -%}
        <h2 class="contact-map__title">{{ section.settings.heading }}</h2>
      {%- endif -%}

      {%- comment -%} Contact details {%- endcomment -%}
      <div class="contact-map__details">
        {%- for block in section.blocks -%}
          {%- case block.type -%}
            {%- when 'address' -%}
              <div class="contact-map__detail" {{ block.shopify_attributes }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>{{ block.settings.label | default: 'Address' }}</strong>
                  <address>{{ block.settings.text | newline_to_br }}</address>
                </div>
              </div>

            {%- when 'email' -%}
              <div class="contact-map__detail" {{ block.shopify_attributes }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <div>
                  <strong>{{ block.settings.label | default: 'Email' }}</strong>
                  <a href="mailto:{{ block.settings.text }}">{{ block.settings.text }}</a>
                </div>
              </div>

            {%- when 'phone' -%}
              <div class="contact-map__detail" {{ block.shopify_attributes }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <strong>{{ block.settings.label | default: 'Phone' }}</strong>
                  <a href="tel:{{ block.settings.text | remove: ' ' }}">{{ block.settings.text }}</a>
                </div>
              </div>

            {%- when 'hours' -%}
              <div class="contact-map__detail" {{ block.shopify_attributes }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div>
                  <strong>{{ block.settings.label | default: 'Hours' }}</strong>
                  <p>{{ block.settings.text | newline_to_br }}</p>
                </div>
              </div>
          {%- endcase -%}
        {%- endfor -%}
      </div>

      {%- comment -%} Contact form {%- endcomment -%}
      {% form 'contact', class: 'contact-map__form' %}
        {%- if form.posted_successfully? -%}
          <div class="form__success">Thanks! We'll be in touch soon.</div>
        {%- else -%}
          <div class="form__row form__row--two-col">
            <div class="form__field">
              <input type="text" name="contact[name]" placeholder="Name *" required class="form__input">
            </div>
            <div class="form__field">
              <input type="email" name="contact[email]" placeholder="Email *" required class="form__input">
            </div>
          </div>
          <div class="form__row">
            <textarea name="contact[message]" placeholder="Message *" rows="4" required class="form__textarea"></textarea>
          </div>
          {% render 'form-honeypot' %}
          <button type="submit" class="button">Send Message</button>
        {%- endif -%}
      {% endform %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Contact with Map",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Visit Us"
    },
    {
      "type": "header",
      "content": "Map"
    },
    {
      "type": "text",
      "id": "map_address",
      "label": "Map address",
      "info": "Enter a full address for Google Maps"
    },
    {
      "type": "text",
      "id": "api_key",
      "label": "Google Maps API key",
      "info": "Optional. Without API key, uses iframe embed."
    },
    {
      "type": "range",
      "id": "map_zoom",
      "label": "Map zoom level",
      "min": 10,
      "max": 18,
      "default": 15
    }
  ],
  "blocks": [
    {
      "type": "address",
      "name": "Address",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Address"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Address"
        }
      ]
    },
    {
      "type": "email",
      "name": "Email",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Email"
        },
        {
          "type": "text",
          "id": "text",
          "label": "Email address"
        }
      ]
    },
    {
      "type": "phone",
      "name": "Phone",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Phone"
        },
        {
          "type": "text",
          "id": "text",
          "label": "Phone number"
        }
      ]
    },
    {
      "type": "hours",
      "name": "Hours",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Hours"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Hours text"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Contact with Map",
      "blocks": [
        { "type": "address", "settings": { "text": "123 Main Street\nNew York, NY 10001" } },
        { "type": "email", "settings": { "text": "hello@example.com" } },
        { "type": "phone", "settings": { "text": "(555) 123-4567" } }
      ]
    }
  ]
}
{% endschema %}
```

---

## Success & Error States

### AJAX Form Submission

```javascript
// assets/ajax-form.js
class AjaxForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const submitBtn = this.form.querySelector('[type="submit"]');

    // Show loading state
    this.setLoading(true, submitBtn);

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok || response.redirected) {
        this.showSuccess();
      } else {
        const data = await response.json();
        this.showError(data.errors || ['An error occurred. Please try again.']);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(['Network error. Please check your connection and try again.']);
    } finally {
      this.setLoading(false, submitBtn);
    }
  }

  setLoading(isLoading, button) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = `
        <span class="button__spinner"></span>
        <span>Sending...</span>
      `;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText;
    }
  }

  showSuccess() {
    const successMessage = this.dataset.successMessage || 'Thank you! Your message has been sent.';

    this.form.innerHTML = `
      <div class="form__success" role="alert">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3>Message Sent!</h3>
        <p>${successMessage}</p>
      </div>
    `;

    // Dispatch event for analytics
    this.dispatchEvent(new CustomEvent('form:success', { bubbles: true }));
  }

  showError(errors) {
    // Remove existing errors
    const existingError = this.querySelector('.form__errors');
    existingError?.remove();

    // Create error element
    const errorEl = document.createElement('div');
    errorEl.className = 'form__errors';
    errorEl.setAttribute('role', 'alert');
    errorEl.innerHTML = `
      <p>Please fix the following errors:</p>
      <ul>
        ${errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    `;

    // Insert at top of form
    this.form.insertBefore(errorEl, this.form.firstChild);

    // Scroll to error
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

customElements.define('ajax-form', AjaxForm);
```

### Enhanced Success State Styles

```css
/* Success animation */
.form__success {
  text-align: center;
  padding: 3rem 2rem;
  animation: fadeIn 0.5s ease;
}

.form__success svg {
  color: var(--color-success, #22c55e);
  margin-bottom: 1rem;
  animation: checkmark 0.5s ease 0.2s both;
}

.form__success h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.form__success p {
  color: var(--color-text-secondary);
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkmark {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Button spinner */
.button__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## Checklist

When implementing contact forms:

- [ ] Include honeypot field for basic spam prevention
- [ ] Mark required fields clearly with asterisks
- [ ] Use proper input types (email, tel, url)
- [ ] Add autocomplete attributes for better UX
- [ ] Implement client-side validation
- [ ] Show clear success/error messages
- [ ] Focus on first invalid field on error
- [ ] Ensure form is keyboard accessible
- [ ] Use aria-invalid and aria-describedby for errors
- [ ] Consider time-based spam prevention
- [ ] Test form submission on mobile devices
- [ ] Verify email notifications are received
- [ ] Add loading states during submission
- [ ] Consider AJAX submission for better UX
