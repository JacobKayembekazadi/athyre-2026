# Dawn Theme Inheritance

Guide for building on Shopify's Dawn theme or adopting its patterns.

## What is Dawn?

Dawn is Shopify's official reference theme, designed to be:
- **Fast:** Performance-optimized, uses Online Store 2.0 architecture
- **Accessible:** WCAG 2.1 Level AA compliant
- **Flexible:** Highly customizable through sections everywhere
- **Maintainable:** Clean code patterns, well-documented

**Source:** [github.com/Shopify/dawn](https://github.com/Shopify/dawn)

---

## When to Use Dawn

### Start from Dawn When:
- Building a new custom theme from scratch
- Client needs a fast, accessible foundation
- You want OS 2.0 best practices built-in
- Design is similar to Dawn's structure

### Build Custom When:
- Design is radically different from Dawn
- Specific performance requirements
- Legacy theme migration with complex logic
- Need different tech stack (e.g., Tailwind)

---

## Dawn Architecture

### Directory Structure

```
dawn/
├── assets/              # CSS, JS, icons
│   ├── base.css         # CSS custom properties, reset
│   ├── component-*.css  # Component-specific styles
│   ├── section-*.css    # Section-specific styles
│   └── *.js             # Web components
├── config/
│   ├── settings_schema.json  # Theme settings
│   └── settings_data.json    # Default values
├── layout/
│   └── theme.liquid     # Main layout
├── locales/             # Translation files
├── sections/            # All sections
├── snippets/            # Reusable partials
└── templates/           # JSON templates
```

### Key Patterns

#### 1. CSS Architecture

Dawn uses CSS custom properties for theming:

```css
/* base.css */
:root {
  --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
  --font-body-style: {{ settings.type_body_font.style }};
  --font-body-weight: {{ settings.type_body_font.weight }};

  --font-heading-family: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};

  --color-foreground: {{ settings.colors_text.red }}, {{ settings.colors_text.green }}, {{ settings.colors_text.blue }};
  --color-background: {{ settings.colors_background_1.red }}, {{ settings.colors_background_1.green }}, {{ settings.colors_background_1.blue }};
}
```

Usage in components:

```css
.button {
  background-color: rgb(var(--color-button));
  color: rgb(var(--color-button-text));
}
```

#### 2. Section Scoping

Each section has scoped styles using `section.id`:

```liquid
{% style %}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{% endstyle %}
```

#### 3. Web Components

Dawn uses vanilla JS Web Components:

```javascript
// Example: slideshow-component.js
class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    // ...
  }

  connectedCallback() {
    // Component initialization
  }
}
customElements.define('slideshow-component', SlideshowComponent);
```

#### 4. Responsive Images

Dawn's responsive image pattern:

```liquid
{%- liquid
  assign widths = '375, 550, 750, 1100, 1500, 1780, 2000, 3000, 3840'
  assign sizes = '100vw'
-%}

{{ image | image_url: width: 3840 | image_tag:
  widths: widths,
  sizes: sizes,
  loading: 'lazy'
}}
```

---

## Inheriting from Dawn

### Method 1: Fork & Modify

1. Clone Dawn repository
2. Remove sections you don't need
3. Modify existing sections
4. Add custom sections
5. Update settings_schema.json

**Pros:** Full control, clean codebase
**Cons:** Manual updates from Dawn

### Method 2: Reference & Adapt

Use Dawn as a reference, copy patterns you need:

```liquid
{%- comment -%}
  Adapted from Dawn's hero-banner section
  Original: https://github.com/Shopify/dawn/blob/main/sections/image-banner.liquid
{%- endcomment -%}
```

**Pros:** Learn best practices, stay flexible
**Cons:** More initial work

### Method 3: Extend with App Blocks

Use Dawn as-is, extend with app blocks:

```json
{% schema %}
{
  "blocks": [
    {
      "type": "@app"
    },
    {
      "type": "heading",
      // ...
    }
  ]
}
{% endschema %}
```

**Pros:** Keep Dawn updates, add functionality
**Cons:** Limited customization

---

## Dawn Patterns to Adopt

### 1. Standard Padding Settings

Every section should include:

```json
{
  "type": "range",
  "id": "padding_top",
  "min": 0,
  "max": 100,
  "step": 4,
  "unit": "px",
  "label": "t:sections.all.padding.padding_top",
  "default": 36
},
{
  "type": "range",
  "id": "padding_bottom",
  "min": 0,
  "max": 100,
  "step": 4,
  "unit": "px",
  "label": "t:sections.all.padding.padding_bottom",
  "default": 36
}
```

### 2. Color Scheme System

Dawn's color scheme approach:

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "t:sections.all.colors.label",
  "default": "background-1"
}
```

```liquid
<div class="color-{{ section.settings.color_scheme }}">
  <!-- Content uses scheme's colors -->
</div>
```

```css
.color-background-1 {
  --color-background: var(--color-background-1);
  --color-foreground: var(--color-foreground-1);
}
```

### 3. Animation Patterns

Dawn's reveal animations:

```liquid
<div class="scroll-trigger animate--slide-in">
  <!-- Animates on scroll -->
</div>
```

```css
.scroll-trigger.animate--slide-in {
  opacity: 0;
  transform: translateY(1rem);
}

.scroll-trigger.animate--slide-in.scroll-trigger--offscreen {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s, transform 0.5s;
}
```

### 4. Media Queries

Dawn's breakpoint approach:

```css
/* Mobile first, then: */
@media screen and (min-width: 750px) { /* Tablet */ }
@media screen and (min-width: 990px) { /* Desktop */ }
@media screen and (min-width: 1400px) { /* Large */ }
```

### 5. Accessibility Patterns

Visually hidden text:

```liquid
<span class="visually-hidden">{{ 'accessibility.skip_to_text' | t }}</span>
```

Focus states:

```css
:focus-visible {
  outline: 0.2rem solid rgba(var(--color-foreground), 0.5);
  outline-offset: 0.3rem;
  box-shadow: 0 0 0 0.3rem rgb(var(--color-background)), 0 0 0.5rem 0.4rem rgba(var(--color-foreground), 0.3);
}
```

---

## Converting to Dawn Structure

### Before (Custom Theme)

```liquid
<section class="hero" style="background-image: url({{ section.settings.image | img_url: '1920x' }})">
  <h1 style="color: {{ section.settings.text_color }}">{{ section.settings.heading }}</h1>
</section>
```

### After (Dawn Pattern)

```liquid
{%- style -%}
  #Banner-{{ section.id }}::after {
    opacity: {{ section.settings.image_overlay_opacity | divided_by: 100.0 }};
  }
{%- endstyle -%}

<div id="Banner-{{ section.id }}" class="banner banner--{{ section.settings.image_height }} color-{{ section.settings.color_scheme }}">
  {%- if section.settings.image != blank -%}
    <div class="banner__media media">
      {%- liquid
        assign image_height = section.settings.image.width | divided_by: section.settings.image.aspect_ratio
        assign sizes = '100vw'
      -%}
      {{ section.settings.image | image_url: width: 3840 | image_tag:
        loading: 'lazy',
        width: section.settings.image.width,
        height: image_height,
        sizes: sizes,
        widths: '375, 550, 750, 1100, 1500, 1780, 2000, 3000, 3840'
      }}
    </div>
  {%- endif -%}

  <div class="banner__content banner__content--{{ section.settings.desktop_content_position }}">
    <h1 class="banner__heading {{ section.settings.heading_size }}">
      {{ section.settings.heading }}
    </h1>
  </div>
</div>
```

---

## Keeping Dawn Updated

### Check for Updates

```bash
# Add Dawn as upstream
git remote add dawn https://github.com/Shopify/dawn.git

# Fetch updates
git fetch dawn

# See what changed
git log dawn/main --oneline -20
```

### Merge Updates (Careful!)

```bash
# Create update branch
git checkout -b dawn-update

# Merge specific files
git checkout dawn/main -- assets/base.css
git checkout dawn/main -- snippets/price.liquid

# Review and commit
git diff --staged
git commit -m "Update from Dawn: base.css, price snippet"
```

---

## Dawn Resources

- **Source Code:** [github.com/Shopify/dawn](https://github.com/Shopify/dawn)
- **Changelog:** [github.com/Shopify/dawn/releases](https://github.com/Shopify/dawn/releases)
- **Documentation:** [shopify.dev/themes/architecture](https://shopify.dev/themes/architecture)
- **Demo Store:** [dawn.shopify.com](https://dawn.shopify.com)
