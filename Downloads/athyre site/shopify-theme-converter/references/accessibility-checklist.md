# Accessibility Checklist

WCAG 2.1 Level AA compliance guide for Shopify themes.

## Quick Reference

| Priority | Area | Key Requirements |
|----------|------|------------------|
| 🔴 High | Images | Alt text on all images |
| 🔴 High | Forms | Labels on all inputs |
| 🔴 High | Navigation | Keyboard accessible |
| 🟡 Medium | Color | 4.5:1 contrast ratio |
| 🟡 Medium | Focus | Visible focus indicators |
| 🟡 Medium | Structure | Proper heading hierarchy |
| 🟢 Lower | Motion | Respect prefers-reduced-motion |

---

## Images & Media

### Alt Text

```liquid
{%- comment -%} Informative image - describe content {%- endcomment -%}
{{ product.featured_image | image_url: width: 600 | image_tag:
  alt: product.featured_image.alt | default: product.title
}}

{%- comment -%} Decorative image - empty alt {%- endcomment -%}
{{ 'decorative-pattern.svg' | asset_url | image_tag: alt: '' }}

{%- comment -%} Image with text overlay - include text in alt {%- endcomment -%}
{{ section.settings.image | image_url: width: 1200 | image_tag:
  alt: section.settings.heading | append: ' - ' | append: section.settings.subheading
}}
```

### Background Images

```liquid
{%- comment -%} Background images need role and aria-label {%- endcomment -%}
<div
  class="hero-banner"
  role="img"
  aria-label="{{ section.settings.image.alt | default: section.settings.heading }}"
  style="background-image: url({{ section.settings.image | image_url: width: 1920 }})"
>
```

### Videos

```liquid
{%- comment -%} Video with captions {%- endcomment -%}
<video controls>
  <source src="{{ video_url }}" type="video/mp4">
  <track kind="captions" src="{{ captions_url }}" srclang="en" label="English">
  Your browser does not support video.
</video>

{%- comment -%} Autoplay video (must be muted and have pause control) {%- endcomment -%}
<div class="video-wrapper">
  <video autoplay muted loop playsinline id="hero-video">
    <source src="{{ video_url }}" type="video/mp4">
  </video>
  <button type="button" class="video-pause-btn" aria-label="Pause video">
    {% render 'icon-pause' %}
  </button>
</div>
```

---

## Forms & Inputs

### Label Association

```liquid
{%- comment -%} Explicit label association {%- endcomment -%}
<label for="email-{{ section.id }}">Email address</label>
<input
  type="email"
  id="email-{{ section.id }}"
  name="email"
  autocomplete="email"
  required
>

{%- comment -%} Implicit label (wrapping) {%- endcomment -%}
<label>
  <span>Email address</span>
  <input type="email" name="email" required>
</label>
```

### Error Messages

```liquid
<div class="form-group{% if form.errors contains 'email' %} has-error{% endif %}">
  <label for="contact-email">
    Email
    <abbr title="required" aria-label="required">*</abbr>
  </label>

  <input
    type="email"
    id="contact-email"
    name="contact[email]"
    aria-describedby="{% if form.errors contains 'email' %}email-error{% endif %}"
    aria-invalid="{% if form.errors contains 'email' %}true{% endif %}"
    required
  >

  {%- if form.errors contains 'email' -%}
    <span id="email-error" class="form-error" role="alert">
      {{ form.errors.messages.email }}
    </span>
  {%- endif -%}
</div>
```

### Required Fields

```liquid
{%- comment -%} Indicate required fields visually and semantically {%- endcomment -%}
<p class="form-note">
  <abbr title="required">*</abbr> indicates required fields
</p>

<label for="name">
  Name <abbr title="required" aria-label="required">*</abbr>
</label>
<input type="text" id="name" name="name" required aria-required="true">
```

---

## Navigation & Links

### Skip Links

```liquid
{%- comment -%} First element after <body> {%- endcomment -%}
<a href="#main-content" class="skip-link">
  {{ 'accessibility.skip_to_content' | t }}
</a>

{%- comment -%} Main content landmark {%- endcomment -%}
<main id="main-content" tabindex="-1">
  {{ content_for_layout }}
</main>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1em;
  background: #000;
  color: #fff;
}

.skip-link:focus {
  left: 0;
}
```

### Keyboard Navigation

```liquid
{%- comment -%} Dropdown menu with keyboard support {%- endcomment -%}
<nav aria-label="Main navigation">
  <ul role="menubar">
    {%- for link in linklists.main-menu.links -%}
      <li role="none">
        {%- if link.links.size > 0 -%}
          <button
            type="button"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {{ link.title }}
          </button>
          <ul role="menu" hidden>
            {%- for child in link.links -%}
              <li role="none">
                <a href="{{ child.url }}" role="menuitem">{{ child.title }}</a>
              </li>
            {%- endfor -%}
          </ul>
        {%- else -%}
          <a href="{{ link.url }}" role="menuitem">{{ link.title }}</a>
        {%- endif -%}
      </li>
    {%- endfor -%}
  </ul>
</nav>
```

### Link Purpose

```liquid
{%- comment -%} Bad: "Click here" doesn't describe destination {%- endcomment -%}
<a href="/products">Click here</a>

{%- comment -%} Good: Descriptive link text {%- endcomment -%}
<a href="/products">View all products</a>

{%- comment -%} Icon-only links need accessible names {%- endcomment -%}
<a href="{{ routes.cart_url }}" aria-label="Cart ({{ cart.item_count }} items)">
  {% render 'icon-cart' %}
  <span class="visually-hidden">{{ cart.item_count }} items</span>
</a>
```

---

## Focus Management

### Visible Focus States

```css
/* Custom focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline only when custom is applied */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast for focus */
button:focus-visible,
a:focus-visible {
  outline: 3px solid;
  outline-offset: 3px;
}
```

### Focus Trap for Modals

```javascript
class ModalDialog extends HTMLElement {
  open() {
    this.setAttribute('open', '');
    this.trapFocus();
  }

  trapFocus() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    this.firstFocusable = focusableElements[0];
    this.lastFocusable = focusableElements[focusableElements.length - 1];

    this.addEventListener('keydown', this.handleTabKey.bind(this));
    this.firstFocusable?.focus();
  }

  handleTabKey(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === this.firstFocusable) {
      e.preventDefault();
      this.lastFocusable?.focus();
    } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
      e.preventDefault();
      this.firstFocusable?.focus();
    }
  }
}
```

---

## Color & Contrast

### Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+ or 14px+ bold) | 3:1 |
| UI components | 3:1 |
| Non-text (icons, borders) | 3:1 |

### Testing Colors

```liquid
{%- comment -%} Provide theme settings that encourage good contrast {%- endcomment -%}
{% schema %}
{
  "settings": [
    {
      "type": "color",
      "id": "color_text",
      "label": "Text color",
      "default": "#1a1a1a",
      "info": "Ensure 4.5:1 contrast with background"
    },
    {
      "type": "color",
      "id": "color_background",
      "label": "Background color",
      "default": "#ffffff"
    }
  ]
}
{% endschema %}
```

### Don't Rely on Color Alone

```liquid
{%- comment -%} Bad: Only color indicates sale {%- endcomment -%}
<span style="color: red;">$29.99</span>

{%- comment -%} Good: Text AND color indicate sale {%- endcomment -%}
<span class="price-sale">
  <span class="visually-hidden">Sale price:</span>
  $29.99
</span>

{%- comment -%} Form errors: Use icon + color + text {%- endcomment -%}
<div class="form-error" role="alert">
  {% render 'icon-error' %}
  <span>Please enter a valid email address</span>
</div>
```

---

## Semantic HTML

### Heading Hierarchy

```liquid
{%- comment -%} Page should have one h1, then h2, h3 in order {%- endcomment -%}
<h1>{{ page.title }}</h1>

<section>
  <h2>{{ section.settings.heading }}</h2>

  {%- for block in section.blocks -%}
    <h3>{{ block.settings.title }}</h3>
    <p>{{ block.settings.text }}</p>
  {%- endfor -%}
</section>
```

### Landmark Regions

```liquid
<!DOCTYPE html>
<html lang="{{ request.locale.iso_code }}">
<head>...</head>
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>

  <header role="banner">
    {% sections 'header-group' %}
  </header>

  <main id="main-content" role="main">
    {{ content_for_layout }}
  </main>

  <footer role="contentinfo">
    {% sections 'footer-group' %}
  </footer>
</body>
</html>
```

### Lists

```liquid
{%- comment -%} Use semantic lists for related items {%- endcomment -%}
<ul class="product-features">
  {%- for feature in product.metafields.custom.features.value -%}
    <li>{{ feature }}</li>
  {%- endfor -%}
</ul>

{%- comment -%} Navigation should be a list {%- endcomment -%}
<nav aria-label="Breadcrumb">
  <ol class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li><a href="{{ collection.url }}">{{ collection.title }}</a></li>
    <li aria-current="page">{{ product.title }}</li>
  </ol>
</nav>
```

---

## Motion & Animations

### Respect User Preferences

```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Pausable Animations

```liquid
<slideshow-component data-autoplay="{{ section.settings.autoplay_speed }}">
  <button
    type="button"
    class="slideshow-pause"
    aria-label="Pause slideshow"
    data-pause-button
  >
    {% render 'icon-pause' %}
  </button>

  {%- for block in section.blocks -%}
    <div class="slide">...</div>
  {%- endfor -%}
</slideshow-component>
```

---

## ARIA Usage

### Common ARIA Patterns

```liquid
{%- comment -%} Expandable sections {%- endcomment -%}
<button
  type="button"
  aria-expanded="false"
  aria-controls="details-{{ block.id }}"
>
  {{ block.settings.heading }}
</button>
<div id="details-{{ block.id }}" hidden>
  {{ block.settings.content }}
</div>

{%- comment -%} Loading states {%- endcomment -%}
<button
  type="submit"
  aria-busy="false"
  aria-disabled="false"
>
  <span class="btn-text">Add to cart</span>
  <span class="btn-loading" aria-hidden="true" hidden>Loading...</span>
</button>

{%- comment -%} Live regions for dynamic updates {%- endcomment -%}
<div
  class="cart-count"
  aria-live="polite"
  aria-atomic="true"
>
  {{ cart.item_count }} items
</div>
```

### When NOT to Use ARIA

```liquid
{%- comment -%} Don't use ARIA when HTML works {%- endcomment -%}

{%- comment -%} Bad {%- endcomment -%}
<div role="button" tabindex="0">Click me</div>

{%- comment -%} Good {%- endcomment -%}
<button type="button">Click me</button>

{%- comment -%} Bad {%- endcomment -%}
<div role="navigation">...</div>

{%- comment -%} Good {%- endcomment -%}
<nav>...</nav>
```

---

## Testing Checklist

### Automated Testing
- [ ] Run aXe DevTools
- [ ] Run Lighthouse accessibility audit
- [ ] Validate HTML

### Manual Testing
- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Zoom to 200% - ensure usability
- [ ] Disable CSS - content still makes sense
- [ ] Check color contrast with tool

### Screen Reader Testing
- [ ] All images have appropriate alt text
- [ ] Forms announce labels and errors
- [ ] Dynamic content updates are announced
- [ ] Page structure is logical

---

## Useful Snippets

### Visually Hidden

```liquid
{%- comment -%} snippets/visually-hidden.liquid {%- endcomment -%}
<span class="visually-hidden">{{ text }}</span>
```

```css
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

### Icon with Text

```liquid
{%- comment -%} Always pair icons with text (visible or hidden) {%- endcomment -%}
<button type="button">
  {% render 'icon-search' %}
  <span class="visually-hidden">Search</span>
</button>
```
