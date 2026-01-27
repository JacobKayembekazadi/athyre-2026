# Color Scheme System

Implementation guide for Dawn-style color schemes, CSS custom properties, dark mode, and dynamic theming in Shopify themes.

## Overview

Shopify's Dawn theme introduced a powerful color scheme system:
- **Multiple schemes** - Define several color palettes
- **Section-level control** - Each section can use any scheme
- **CSS variables** - Dynamic application via custom properties
- **Dark mode** - System preference detection

---

## Theme Settings Schema

### Defining Color Schemes
```json
// config/settings_schema.json

{
  "name": "Colors",
  "settings": [
    {
      "type": "header",
      "content": "Primary colors"
    },
    {
      "type": "color",
      "id": "colors_primary",
      "label": "Primary",
      "default": "#000000"
    },
    {
      "type": "color",
      "id": "colors_secondary",
      "label": "Secondary",
      "default": "#4A4A4A"
    },
    {
      "type": "color",
      "id": "colors_accent",
      "label": "Accent",
      "default": "#2563eb"
    }
  ]
},
{
  "name": "Color schemes",
  "settings": [
    {
      "type": "header",
      "content": "Scheme 1"
    },
    {
      "type": "color",
      "id": "colors_scheme_1_background",
      "label": "Background",
      "default": "#FFFFFF"
    },
    {
      "type": "color",
      "id": "colors_scheme_1_text",
      "label": "Text",
      "default": "#1A1A1A"
    },
    {
      "type": "color",
      "id": "colors_scheme_1_button",
      "label": "Button",
      "default": "#000000"
    },
    {
      "type": "color",
      "id": "colors_scheme_1_button_text",
      "label": "Button text",
      "default": "#FFFFFF"
    },
    {
      "type": "header",
      "content": "Scheme 2"
    },
    {
      "type": "color",
      "id": "colors_scheme_2_background",
      "label": "Background",
      "default": "#1A1A1A"
    },
    {
      "type": "color",
      "id": "colors_scheme_2_text",
      "label": "Text",
      "default": "#FFFFFF"
    },
    {
      "type": "color",
      "id": "colors_scheme_2_button",
      "label": "Button",
      "default": "#FFFFFF"
    },
    {
      "type": "color",
      "id": "colors_scheme_2_button_text",
      "label": "Button text",
      "default": "#000000"
    }
  ]
}
```

### Dawn-Style Color Scheme Definition
```json
{
  "name": "Color schemes",
  "settings": [
    {
      "type": "color_scheme_group",
      "id": "color_schemes",
      "definition": [
        {
          "type": "color",
          "id": "background",
          "label": "Background",
          "default": "#FFFFFF"
        },
        {
          "type": "color",
          "id": "background_gradient",
          "label": "Background gradient",
          "default": ""
        },
        {
          "type": "color",
          "id": "text",
          "label": "Text",
          "default": "#121212"
        },
        {
          "type": "color",
          "id": "button",
          "label": "Solid button",
          "default": "#121212"
        },
        {
          "type": "color",
          "id": "button_label",
          "label": "Solid button label",
          "default": "#FFFFFF"
        },
        {
          "type": "color",
          "id": "secondary_button_label",
          "label": "Outline button label",
          "default": "#121212"
        },
        {
          "type": "color",
          "id": "shadow",
          "label": "Shadow",
          "default": "#121212"
        }
      ],
      "role": {
        "text": "text",
        "background": {
          "solid": "background",
          "gradient": "background_gradient"
        },
        "links": "secondary_button_label",
        "icons": "text",
        "primary_button": "button",
        "on_primary_button": "button_label",
        "primary_button_border": "button",
        "secondary_button": "background",
        "on_secondary_button": "secondary_button_label",
        "secondary_button_border": "secondary_button_label"
      }
    }
  ]
}
```

---

## CSS Custom Properties Setup

### Base Variables (theme.liquid or base.css)
```liquid
{% comment %} snippets/css-variables.liquid {% endcomment %}

<style>
  :root {
    /* Typography */
    --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    --font-body-weight: {{ settings.type_body_font.weight }};
    --font-heading-family: {{ settings.type_heading_font.family }}, {{ settings.type_heading_font.fallback_families }};
    --font-heading-weight: {{ settings.type_heading_font.weight }};

    /* Base sizes */
    --font-body-scale: {{ settings.body_scale | divided_by: 100.0 }};
    --font-heading-scale: {{ settings.heading_scale | divided_by: 100.0 }};

    /* Spacing */
    --spacing-sections-desktop: {{ settings.spacing_sections }}px;
    --spacing-sections-mobile: {{ settings.spacing_sections | times: 0.6 | round }}px;

    /* Borders */
    --border-radius: {{ settings.border_radius }}px;
    --border-width: {{ settings.border_width }}px;

    /* Shadows */
    --shadow-opacity: {{ settings.shadow_opacity | divided_by: 100.0 }};

    /* Primary colors (always available) */
    --color-primary: {{ settings.colors_primary }};
    --color-secondary: {{ settings.colors_secondary }};
    --color-accent: {{ settings.colors_accent }};

    /* Color scheme 1 (default) */
    --color-background: {{ settings.colors_scheme_1_background }};
    --color-background-rgb: {{ settings.colors_scheme_1_background | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-text: {{ settings.colors_scheme_1_text }};
    --color-text-rgb: {{ settings.colors_scheme_1_text | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-button: {{ settings.colors_scheme_1_button }};
    --color-button-text: {{ settings.colors_scheme_1_button_text }};

    /* Derived colors */
    --color-text-muted: rgba(var(--color-text-rgb), 0.6);
    --color-border: rgba(var(--color-text-rgb), 0.1);
    --color-background-secondary: rgba(var(--color-text-rgb), 0.05);
  }

  /* Color Scheme 1 (Light) */
  .color-scheme-1 {
    --color-background: {{ settings.colors_scheme_1_background }};
    --color-background-rgb: {{ settings.colors_scheme_1_background | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-text: {{ settings.colors_scheme_1_text }};
    --color-text-rgb: {{ settings.colors_scheme_1_text | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-button: {{ settings.colors_scheme_1_button }};
    --color-button-text: {{ settings.colors_scheme_1_button_text }};

    background-color: var(--color-background);
    color: var(--color-text);
  }

  /* Color Scheme 2 (Dark) */
  .color-scheme-2 {
    --color-background: {{ settings.colors_scheme_2_background }};
    --color-background-rgb: {{ settings.colors_scheme_2_background | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-text: {{ settings.colors_scheme_2_text }};
    --color-text-rgb: {{ settings.colors_scheme_2_text | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-button: {{ settings.colors_scheme_2_button }};
    --color-button-text: {{ settings.colors_scheme_2_button_text }};

    background-color: var(--color-background);
    color: var(--color-text);
  }

  /* Color Scheme 3 (Accent) */
  .color-scheme-3 {
    --color-background: {{ settings.colors_accent }};
    --color-background-rgb: {{ settings.colors_accent | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-text: {{ settings.colors_scheme_3_text | default: '#FFFFFF' }};
    --color-text-rgb: {{ settings.colors_scheme_3_text | default: '#FFFFFF' | color_to_rgb | remove: 'rgb(' | remove: ')' }};
    --color-button: {{ settings.colors_scheme_3_button | default: '#FFFFFF' }};
    --color-button-text: {{ settings.colors_scheme_3_button_text | default: '#000000' }};

    background-color: var(--color-background);
    color: var(--color-text);
  }
</style>
```

---

## Section Color Scheme Setting

### Schema Definition
```json
{
  "name": "Featured collection",
  "settings": [
    {
      "type": "select",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "1",
      "options": [
        { "value": "1", "label": "Scheme 1 (Light)" },
        { "value": "2", "label": "Scheme 2 (Dark)" },
        { "value": "3", "label": "Scheme 3 (Accent)" }
      ]
    }
  ]
}
```

### Section Usage
```liquid
<section
  class="featured-collection color-scheme-{{ section.settings.color_scheme }}"
  style="--padding-top: {{ section.settings.padding_top }}px; --padding-bottom: {{ section.settings.padding_bottom }}px;"
>
  <div class="section-content">
    {{ section_content }}
  </div>
</section>
```

---

## Component Styling with Variables

### Buttons
```css
/* All buttons use CSS variables */
.btn {
  background-color: var(--color-button);
  color: var(--color-button-text);
  border: var(--border-width) solid var(--color-button);
  border-radius: var(--border-radius);
  transition: opacity 0.2s ease;
}

.btn:hover {
  opacity: 0.9;
}

.btn--secondary {
  background-color: transparent;
  color: var(--color-button);
  border-color: var(--color-button);
}

.btn--secondary:hover {
  background-color: var(--color-button);
  color: var(--color-button-text);
}

.btn--outline {
  background-color: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
```

### Cards
```css
.card {
  background-color: var(--color-background);
  color: var(--color-text);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(var(--color-text-rgb), var(--shadow-opacity));
}

.card-title {
  color: var(--color-text);
}

.card-text {
  color: var(--color-text-muted);
}
```

### Links
```css
a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Links in different schemes */
.color-scheme-2 a {
  color: var(--color-button);
}
```

### Form Fields
```css
.field-input {
  background-color: var(--color-background);
  color: var(--color-text);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
}

.field-input:focus {
  border-color: var(--color-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.2);
}

.field-input::placeholder {
  color: var(--color-text-muted);
}
```

---

## Dark Mode Implementation

### System Preference Detection
```liquid
{% comment %} In theme.liquid head {% endcomment %}

<script>
  // Detect system dark mode preference
  (function() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyColorMode(isDark) {
      document.documentElement.classList.toggle('dark-mode', isDark);
      document.documentElement.classList.toggle('light-mode', !isDark);
    }

    // Check for saved preference
    const savedMode = localStorage.getItem('color-mode');
    if (savedMode) {
      applyColorMode(savedMode === 'dark');
    } else {
      applyColorMode(darkModeMediaQuery.matches);
    }

    // Listen for system changes
    darkModeMediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('color-mode')) {
        applyColorMode(e.matches);
      }
    });
  })();
</script>
```

### CSS Dark Mode Variables
```css
/* Default (light mode) */
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --color-border: rgba(0, 0, 0, 0.1);
}

/* Dark mode */
:root.dark-mode {
  --color-background: #1a1a1a;
  --color-text: #ffffff;
  --color-border: rgba(255, 255, 255, 0.1);
}

/* Or using media query */
@media (prefers-color-scheme: dark) {
  :root:not(.light-mode) {
    --color-background: #1a1a1a;
    --color-text: #ffffff;
    --color-border: rgba(255, 255, 255, 0.1);
  }
}
```

### Theme Toggle Component
```liquid
{% comment %} snippets/theme-toggle.liquid {% endcomment %}

<button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle dark mode">
  <span class="theme-toggle-icon theme-toggle-icon--light">
    {% render 'icon', icon: 'sun' %}
  </span>
  <span class="theme-toggle-icon theme-toggle-icon--dark">
    {% render 'icon', icon: 'moon' %}
  </span>
</button>

<script>
  document.querySelector('[data-theme-toggle]').addEventListener('click', function() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    const newMode = isDark ? 'light' : 'dark';

    document.documentElement.classList.toggle('dark-mode', !isDark);
    document.documentElement.classList.toggle('light-mode', isDark);
    localStorage.setItem('color-mode', newMode);
  });
</script>

<style>
  .theme-toggle {
    position: relative;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .theme-toggle:hover {
    background: var(--color-background-secondary);
  }

  .theme-toggle-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s, transform 0.3s;
  }

  .theme-toggle-icon--dark {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(-90deg);
  }

  :root.dark-mode .theme-toggle-icon--light {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(90deg);
  }

  :root.dark-mode .theme-toggle-icon--dark {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0);
  }
</style>
```

---

## Gradient Backgrounds

### Schema Setting
```json
{
  "type": "color_background",
  "id": "background_gradient",
  "label": "Background gradient"
}
```

### Usage
```liquid
<section
  class="hero-section"
  style="background: {{ section.settings.background_gradient | default: section.settings.background_color }}"
>
  {{ content }}
</section>
```

### CSS Fallback
```css
.gradient-section {
  background-color: var(--color-background); /* Fallback */
  background: var(--gradient-background, var(--color-background));
}
```

---

## Dynamic Color Generation

### JavaScript Color Utilities
```javascript
// assets/color-utils.js

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate luminance for contrast checking
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if text should be light or dark
 */
function getContrastColor(backgroundColor) {
  const rgb = hexToRgb(backgroundColor);
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

### Liquid Color Manipulation
```liquid
{%- comment -%}
  Lighten/darken colors in Liquid
{%- endcomment -%}

{%- assign bg_color = settings.colors_primary -%}
{%- assign bg_lightened = bg_color | color_lighten: 20 -%}
{%- assign bg_darkened = bg_color | color_darken: 20 -%}
{%- assign bg_saturated = bg_color | color_saturate: 20 -%}
{%- assign bg_desaturated = bg_color | color_desaturate: 20 -%}

{%- comment -%}
  Check if color is light or dark
{%- endcomment -%}
{%- assign brightness = bg_color | color_brightness -%}
{%- if brightness > 128 -%}
  {%- assign text_color = '#000000' -%}
{%- else -%}
  {%- assign text_color = '#FFFFFF' -%}
{%- endif -%}
```

---

## Accessibility Considerations

### Contrast Requirements
| Level | Text Size | Ratio |
|-------|-----------|-------|
| AA | Normal text | 4.5:1 |
| AA | Large text (18px+) | 3:1 |
| AAA | Normal text | 7:1 |
| AAA | Large text | 4.5:1 |

### Testing Contrast
```liquid
{% comment %} Debug contrast in development {% endcomment %}

{%- if request.design_mode -%}
  <script>
    // Log contrast ratios for debugging
    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue('--color-background').trim();
    const text = styles.getPropertyValue('--color-text').trim();
    const ratio = getContrastRatio(bg, text);
    console.log(`Contrast ratio: ${ratio.toFixed(2)}:1 (AA requires 4.5:1)`);
  </script>
{%- endif -%}
```

---

## Best Practices

1. **Use semantic variable names** - `--color-text` not `--color-black`
2. **Define RGB variants** - For rgba() usage: `--color-text-rgb`
3. **Test all schemes** - Verify readability in each color scheme
4. **Provide fallbacks** - CSS custom properties need fallbacks for old browsers
5. **Document schemes** - Comment what each scheme is intended for
6. **Limit schemes** - 3-4 schemes is usually sufficient

---

## Testing Checklist

- [ ] All text meets WCAG AA contrast (4.5:1)
- [ ] Interactive elements are visible
- [ ] Focus states are visible in all schemes
- [ ] Dark mode respects system preference
- [ ] Toggle saves preference
- [ ] No flash of wrong colors on load
- [ ] Gradients work in all schemes
- [ ] Images look good on all backgrounds
