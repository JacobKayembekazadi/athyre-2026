# JSX to Liquid Conversion Checklist

This checklist documents common pitfalls when converting React/JSX code to Shopify Liquid templates.

---

## Automatic Conversions

These patterns can be auto-fixed using `sanitize_liquid.js --fix`:

| JSX Pattern | Liquid Equivalent | Notes |
|-------------|-------------------|-------|
| `{/* comment */}` | `{% comment %}...{% endcomment %}` | JSX comments render as literal text in Liquid! |
| `className=` | `class=` | React attribute name |
| `htmlFor=` | `for=` | React attribute name |

### Run the Sanitizer

```bash
# Scan for issues
node scripts/sanitize_liquid.js ./theme/

# Auto-fix fixable issues
node scripts/sanitize_liquid.js ./theme/ --fix
```

---

## Manual Conversions Required

### Event Handlers

React event handlers must be converted to vanilla JavaScript or removed:

| JSX | Liquid/JS Equivalent |
|-----|----------------------|
| `onClick={() => func()}` | Add `data-action` attribute + JS in `assets/` |
| `onChange={handleChange}` | Native form behavior or custom JS |
| `onSubmit={handleSubmit}` | Use `{% form %}...{% endform %}` |
| `onMouseEnter/Leave` | CSS `:hover` or custom JS |

**Example conversion:**

```jsx
// React
<button onClick={() => setOpen(!open)}>Toggle</button>
```

```liquid
<!-- Liquid + JS -->
<button data-toggle-target="menu">Toggle</button>

<script>
  document.querySelectorAll('[data-toggle-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.toggleTarget);
      target.classList.toggle('hidden');
    });
  });
</script>
```

---

### Conditional Rendering

| JSX | Liquid |
|-----|--------|
| `{condition && <Element />}` | `{% if condition %}...{% endif %}` |
| `{condition ? <A /> : <B />}` | `{% if condition %}...{% else %}...{% endif %}` |
| `{items.map(i => <Item />)}` | `{% for item in items %}...{% endfor %}` |
| `{items.length > 0 && ...}` | `{% if items.size > 0 %}...{% endif %}` |

**Example:**

```jsx
// React
{products.length > 0 && (
  <ul>
    {products.map(product => (
      <li key={product.id}>{product.title}</li>
    ))}
  </ul>
)}
```

```liquid
{% comment %} Liquid {% endcomment %}
{% if products.size > 0 %}
  <ul>
    {% for product in products %}
      <li>{{ product.title }}</li>
    {% endfor %}
  </ul>
{% endif %}
```

---

### State & Props

| JSX Concept | Liquid Equivalent |
|-------------|-------------------|
| `useState()` | Not applicable (Liquid is static) - use JS for interactivity |
| `props.title` | `section.settings.title` |
| `props.items` | `section.blocks` |
| `props.children` | Content goes directly in section |
| Context/Redux | Use Shopify's global objects (`cart`, `customer`, etc.) |

---

### Dynamic Links

**CRITICAL**: Never hardcode URLs - always use Liquid objects:

| Hardcoded (Bad) | Liquid (Good) |
|-----------------|---------------|
| `href="/about"` | `href="{{ pages.about.url }}"` |
| `href="/contact"` | `href="{{ pages.contact.url }}"` |
| `href="/shop"` | `href="{{ routes.all_products_collection_url }}"` |
| `href="/collections/all"` | `href="{{ collections.all.url }}"` |
| `href="/cart"` | `href="{{ routes.cart_url }}"` |
| `href="/account"` | `href="{{ routes.account_url }}"` |
| `href="/account/login"` | `href="{{ routes.account_login_url }}"` |
| `href="/search"` | `href="{{ routes.search_url }}"` |
| `href="/collections/summer"` | `href="{{ collections['summer'].url }}"` |
| `href="/products/shirt"` | `href="{{ all_products['shirt'].url }}"` |

---

## Blind Spots

### 1. Mobile Visibility Classes

**Problem**: Tailwind's responsive hide/show classes may hide content unexpectedly.

| Pattern | Behavior |
|---------|----------|
| `hidden md:block` | Hidden on mobile, visible on desktop |
| `md:hidden` | Visible on mobile, hidden on desktop |
| `hidden lg:flex` | Hidden until large breakpoint |

**Solution**: Add visibility settings to schema:

```json
{
  "type": "checkbox",
  "id": "show_on_mobile",
  "label": "Show on mobile",
  "default": true
},
{
  "type": "checkbox",
  "id": "show_on_desktop",
  "label": "Show on desktop",
  "default": true
}
```

Then in Liquid:

```liquid
{% liquid
  assign mobile_class = ''
  assign desktop_class = ''

  unless section.settings.show_on_mobile
    assign mobile_class = 'hidden md:block'
  endunless

  unless section.settings.show_on_desktop
    assign desktop_class = 'md:hidden'
  endunless
%}

<div class="{{ mobile_class }} {{ desktop_class }}">
  ...
</div>
```

---

### 2. Form Handlers

React forms with `onSubmit` handlers must be converted to Shopify form tags:

| Use Case | Shopify Form |
|----------|--------------|
| Contact form | `{% form 'contact' %}...{% endform %}` |
| Newsletter signup | `{% form 'customer' %}` with hidden `contact[tags]=newsletter` |
| Add to cart | `{% form 'product', product %}...{% endform %}` |
| Customer login | `{% form 'customer_login' %}...{% endform %}` |
| Customer register | `{% form 'create_customer' %}...{% endform %}` |
| Password reset | `{% form 'recover_customer_password' %}...{% endform %}` |

**Newsletter Example:**

```liquid
{% form 'customer', id: 'newsletter-form' %}
  <input type="hidden" name="contact[tags]" value="newsletter">
  <input
    type="email"
    name="contact[email]"
    placeholder="Enter your email"
    required
  >
  <button type="submit">Subscribe</button>
{% endform %}
```

---

### 3. Image Imports

React image imports don't work in Liquid:

```jsx
// React - DOES NOT WORK in Liquid
import heroImage from '../assets/hero.jpg';
<img src={heroImage} />
```

**Solution**: Use Shopify's image handling:

```liquid
{% comment %} From section settings {% endcomment %}
{{ section.settings.image | image_url: width: 1200 | image_tag }}

{% comment %} With responsive sizes {% endcomment %}
{{ section.settings.image | image_url: width: 1200 | image_tag:
  srcset: section.settings.image | image_url: width: 400, section.settings.image | image_url: width: 800, section.settings.image | image_url: width: 1200,
  sizes: '(max-width: 768px) 100vw, 50vw'
}}

{% comment %} Placeholder if no image {% endcomment %}
{% if section.settings.image %}
  {{ section.settings.image | image_url: width: 800 | image_tag }}
{% else %}
  {{ 'product-1' | placeholder_svg_tag: 'w-full h-auto' }}
{% endif %}
```

---

### 4. Icon Imports

React icon library imports must be converted to Liquid snippets:

```jsx
// React - DOES NOT WORK
import { ArrowRight, Heart } from 'lucide-react';
<ArrowRight className="w-4 h-4" />
```

**Solution**: Use icon snippets:

```liquid
{% comment %} Basic usage {% endcomment %}
{% render 'icon-arrow-right' %}

{% comment %} With classes {% endcomment %}
{% render 'icon-arrow-right', class: 'w-4 h-4' %}

{% comment %} With color {% endcomment %}
{% render 'icon-heart', class: 'w-6 h-6 text-red-500' %}
```

See `references/icon-mapping.md` for the full mapping table.

---

## Pre-Deployment Verification

Run these checks before deploying:

```bash
# 1. Scan for JSX patterns
node scripts/sanitize_liquid.js ./theme/

# 2. Validate section schemas (check for presets)
node scripts/validate_schema.js ./theme/sections/

# 3. Check for missing icons
grep -roh "render 'icon-[^']*'" ./theme/ | \
  sed "s/render 'icon-\([^']*\)'/\1/" | \
  sort -u | \
  while read icon; do
    if [ ! -f "./theme/snippets/icon-${icon}.liquid" ]; then
      echo "MISSING: icon-${icon}.liquid"
    fi
  done

# 4. Check for hardcoded links
grep -rn 'href="/pages/' ./theme/sections/ ./theme/snippets/
grep -rn 'href="/collections/' ./theme/sections/ ./theme/snippets/
grep -rn 'href="/products/' ./theme/sections/ ./theme/snippets/
```

---

## Quick Reference Card

```
JSX                          Liquid
---                          ------
{/* comment */}         -->  {% comment %}...{% endcomment %}
className=              -->  class=
htmlFor=                -->  for=
onClick={...}           -->  data-action + JS
{variable}              -->  {{ variable }}
{condition && <X/>}     -->  {% if condition %}...{% endif %}
{arr.map(i => ...)}     -->  {% for item in arr %}...{% endfor %}
props.title             -->  section.settings.title
props.items             -->  section.blocks
useState()              -->  N/A (use JS for interactivity)
import Icon             -->  {% render 'icon-name' %}
import img              -->  {{ settings.image | image_url }}
```
