# Mega Menu Pattern

Complete guide for implementing multi-column mega menus with accessibility and mobile fallback.

## Basic Mega Menu Structure

### Header Section with Mega Menu

```liquid
{% comment %} sections/header.liquid - Navigation portion {% endcomment %}

<nav class="header__nav" role="navigation" aria-label="{{ 'sections.header.main_nav' | t }}">
  <ul class="nav-list" role="menubar">
    {%- for link in linklists[section.settings.menu].links -%}
      <li
        class="nav-item {% if link.links.size > 0 %}has-dropdown{% endif %} {% if link.levels > 1 %}has-mega-menu{% endif %}"
        role="none"
      >
        {%- if link.links.size > 0 -%}
          <button
            type="button"
            class="nav-link nav-link--parent"
            aria-expanded="false"
            aria-controls="mega-menu-{{ forloop.index }}"
            aria-haspopup="true"
            role="menuitem"
          >
            {{ link.title }}
            {% render 'icon-chevron-down' %}
          </button>

          {%- if link.levels > 1 -%}
            {% comment %} Mega menu for deep nesting {% endcomment %}
            {% render 'mega-menu',
              link: link,
              index: forloop.index,
              featured_image: section.blocks[forloop.index0].settings.image,
              featured_product: section.blocks[forloop.index0].settings.product
            %}
          {%- else -%}
            {% comment %} Simple dropdown {% endcomment %}
            {% render 'dropdown-menu', link: link, index: forloop.index %}
          {%- endif -%}
        {%- else -%}
          <a href="{{ link.url }}" class="nav-link" role="menuitem">
            {{ link.title }}
          </a>
        {%- endif -%}
      </li>
    {%- endfor -%}
  </ul>
</nav>
```

---

## Mega Menu Snippet

```liquid
{% comment %} snippets/mega-menu.liquid {% endcomment %}

{%- comment -%}
  Renders a multi-column mega menu dropdown
  Accepts:
  - link: Parent link object (required)
  - index: Loop index for unique IDs (required)
  - featured_image: Optional featured image
  - featured_product: Optional featured product
{%- endcomment -%}

<div
  class="mega-menu"
  id="mega-menu-{{ index }}"
  role="menu"
  aria-label="{{ link.title }}"
  hidden
>
  <div class="mega-menu__inner">
    <div class="mega-menu__content">
      {%- comment -%} Column for each child link group {%- endcomment -%}
      {%- for child_link in link.links -%}
        <div class="mega-menu__column">
          {%- if child_link.links.size > 0 -%}
            {%- comment -%} Has grandchildren - render as column header {%- endcomment -%}
            <div class="mega-menu__column-header">
              {%- if child_link.url != '#' and child_link.url != '' -%}
                <a href="{{ child_link.url }}" class="mega-menu__heading" role="menuitem">
                  {{ child_link.title }}
                </a>
              {%- else -%}
                <span class="mega-menu__heading">{{ child_link.title }}</span>
              {%- endif -%}
            </div>

            <ul class="mega-menu__list" role="menu">
              {%- for grandchild_link in child_link.links -%}
                <li role="none">
                  <a href="{{ grandchild_link.url }}" class="mega-menu__link" role="menuitem">
                    {{ grandchild_link.title }}
                  </a>
                </li>
              {%- endfor -%}
            </ul>
          {%- else -%}
            {%- comment -%} No grandchildren - single link {%- endcomment -%}
            <a href="{{ child_link.url }}" class="mega-menu__link mega-menu__link--standalone" role="menuitem">
              {{ child_link.title }}
            </a>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>

    {%- comment -%} Optional featured content {%- endcomment -%}
    {%- if featured_image != blank or featured_product != blank -%}
      <div class="mega-menu__featured">
        {%- if featured_image != blank -%}
          <div class="mega-menu__featured-image">
            {{ featured_image | image_url: width: 400 | image_tag: loading: 'lazy' }}
          </div>
        {%- endif -%}

        {%- if featured_product != blank -%}
          <div class="mega-menu__featured-product">
            {% render 'product-card-mini', product: featured_product %}
          </div>
        {%- endif -%}
      </div>
    {%- endif -%}
  </div>
</div>
```

---

## Simple Dropdown Snippet

```liquid
{% comment %} snippets/dropdown-menu.liquid {% endcomment %}

{%- comment -%}
  Renders a simple dropdown menu (single level)
  Accepts:
  - link: Parent link object (required)
  - index: Loop index for unique IDs (required)
{%- endcomment -%}

<ul
  class="dropdown-menu"
  id="mega-menu-{{ index }}"
  role="menu"
  aria-label="{{ link.title }}"
  hidden
>
  {%- for child_link in link.links -%}
    <li role="none">
      <a href="{{ child_link.url }}" class="dropdown-menu__link" role="menuitem">
        {{ child_link.title }}
      </a>
    </li>
  {%- endfor -%}
</ul>
```

---

## Schema with Featured Content Blocks

```json
{% schema %}
{
  "name": "Header",
  "settings": [
    {
      "type": "link_list",
      "id": "menu",
      "label": "Menu",
      "default": "main-menu"
    }
  ],
  "blocks": [
    {
      "type": "mega_menu_featured",
      "name": "Mega menu featured",
      "settings": [
        {
          "type": "text",
          "id": "menu_title",
          "label": "Menu item title",
          "info": "Enter the exact menu title this featured content should appear in"
        },
        {
          "type": "image_picker",
          "id": "image",
          "label": "Featured image"
        },
        {
          "type": "url",
          "id": "image_link",
          "label": "Image link"
        },
        {
          "type": "product",
          "id": "product",
          "label": "Featured product"
        },
        {
          "type": "collection",
          "id": "collection",
          "label": "Featured collection"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## Accessibility: Keyboard Navigation

```javascript
// assets/mega-menu.js

class MegaMenu {
  constructor() {
    this.nav = document.querySelector('.header__nav');
    this.menuItems = this.nav.querySelectorAll('.nav-item');
    this.openMenu = null;

    this.init();
  }

  init() {
    this.menuItems.forEach(item => {
      const button = item.querySelector('.nav-link--parent');
      const menu = item.querySelector('.mega-menu, .dropdown-menu');

      if (button && menu) {
        // Mouse events
        item.addEventListener('mouseenter', () => this.open(button, menu));
        item.addEventListener('mouseleave', () => this.close(button, menu));

        // Click event for touch devices
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = button.getAttribute('aria-expanded') === 'true';
          isOpen ? this.close(button, menu) : this.open(button, menu);
        });

        // Keyboard navigation
        button.addEventListener('keydown', (e) => this.handleKeydown(e, button, menu, item));

        // Close on escape
        menu.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.close(button, menu);
            button.focus();
          }
        });
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) {
        this.closeAll();
      }
    });
  }

  open(button, menu) {
    // Close any other open menus
    this.closeAll();

    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    this.openMenu = { button, menu };

    // Focus first link
    const firstLink = menu.querySelector('a, button');
    if (firstLink) {
      firstLink.focus();
    }
  }

  close(button, menu) {
    button.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    this.openMenu = null;
  }

  closeAll() {
    this.menuItems.forEach(item => {
      const button = item.querySelector('.nav-link--parent');
      const menu = item.querySelector('.mega-menu, .dropdown-menu');
      if (button && menu) {
        this.close(button, menu);
      }
    });
  }

  handleKeydown(e, button, menu, item) {
    const { key } = e;

    switch (key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.open(button, menu);
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.open(button, menu);
        break;

      case 'ArrowRight':
        e.preventDefault();
        this.focusNextMenuItem(item);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        this.focusPreviousMenuItem(item);
        break;

      case 'Escape':
        this.close(button, menu);
        break;
    }
  }

  focusNextMenuItem(currentItem) {
    const items = Array.from(this.menuItems);
    const currentIndex = items.indexOf(currentItem);
    const nextItem = items[currentIndex + 1] || items[0];
    const nextButton = nextItem.querySelector('.nav-link, .nav-link--parent');
    if (nextButton) nextButton.focus();
  }

  focusPreviousMenuItem(currentItem) {
    const items = Array.from(this.menuItems);
    const currentIndex = items.indexOf(currentItem);
    const prevItem = items[currentIndex - 1] || items[items.length - 1];
    const prevButton = prevItem.querySelector('.nav-link, .nav-link--parent');
    if (prevButton) prevButton.focus();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MegaMenu();
});
```

---

## Mobile Drawer Fallback

```liquid
{% comment %} snippets/mobile-menu.liquid {% endcomment %}

<div class="mobile-menu" id="mobile-menu" hidden>
  <div class="mobile-menu__header">
    <span class="mobile-menu__title">{{ 'sections.header.menu' | t }}</span>
    <button
      type="button"
      class="mobile-menu__close"
      aria-label="{{ 'sections.header.close_menu' | t }}"
      data-close-mobile-menu
    >
      {% render 'icon-close' %}
    </button>
  </div>

  <nav class="mobile-menu__nav" aria-label="{{ 'sections.header.main_nav' | t }}">
    <ul class="mobile-menu__list" data-mobile-menu-level="0">
      {%- for link in linklists[menu].links -%}
        <li class="mobile-menu__item">
          {%- if link.links.size > 0 -%}
            <button
              type="button"
              class="mobile-menu__link mobile-menu__link--parent"
              aria-expanded="false"
              data-mobile-submenu-trigger="{{ forloop.index }}"
            >
              {{ link.title }}
              {% render 'icon-chevron-right' %}
            </button>

            {% render 'mobile-submenu', link: link, index: forloop.index, level: 1 %}
          {%- else -%}
            <a href="{{ link.url }}" class="mobile-menu__link">
              {{ link.title }}
            </a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>
  </nav>
</div>
```

### Mobile Submenu Snippet

```liquid
{% comment %} snippets/mobile-submenu.liquid {% endcomment %}

<div
  class="mobile-submenu"
  id="mobile-submenu-{{ index }}"
  data-mobile-menu-level="{{ level }}"
  hidden
>
  <div class="mobile-submenu__header">
    <button
      type="button"
      class="mobile-submenu__back"
      data-mobile-submenu-back
    >
      {% render 'icon-chevron-left' %}
      {{ 'sections.header.back' | t }}
    </button>
    <span class="mobile-submenu__title">{{ link.title }}</span>
  </div>

  {%- if link.url != '#' and link.url != '' -%}
    <a href="{{ link.url }}" class="mobile-submenu__view-all">
      {{ 'sections.header.view_all' | t: title: link.title }}
    </a>
  {%- endif -%}

  <ul class="mobile-menu__list">
    {%- for child_link in link.links -%}
      <li class="mobile-menu__item">
        {%- if child_link.links.size > 0 -%}
          <button
            type="button"
            class="mobile-menu__link mobile-menu__link--parent"
            aria-expanded="false"
            data-mobile-submenu-trigger="{{ index }}-{{ forloop.index }}"
          >
            {{ child_link.title }}
            {% render 'icon-chevron-right' %}
          </button>

          {%- assign nested_index = index | append: '-' | append: forloop.index -%}
          {%- assign nested_level = level | plus: 1 -%}
          {% render 'mobile-submenu', link: child_link, index: nested_index, level: nested_level %}
        {%- else -%}
          <a href="{{ child_link.url }}" class="mobile-menu__link">
            {{ child_link.title }}
          </a>
        {%- endif -%}
      </li>
    {%- endfor -%}
  </ul>
</div>
```

### Mobile Menu JavaScript

```javascript
// assets/mobile-menu.js

class MobileMenu {
  constructor() {
    this.menu = document.getElementById('mobile-menu');
    this.openBtn = document.querySelector('[data-open-mobile-menu]');
    this.closeBtn = document.querySelector('[data-close-mobile-menu]');
    this.overlay = document.querySelector('.mobile-menu-overlay');

    this.init();
  }

  init() {
    // Open/close menu
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    // Submenu triggers
    this.menu.querySelectorAll('[data-mobile-submenu-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => this.openSubmenu(trigger));
    });

    // Back buttons
    this.menu.querySelectorAll('[data-mobile-submenu-back]').forEach(btn => {
      btn.addEventListener('click', () => this.closeSubmenu(btn));
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.menu.hidden) {
        this.close();
      }
    });
  }

  open() {
    this.menu.hidden = false;
    document.body.classList.add('mobile-menu-open');
    this.menu.querySelector('.mobile-menu__close').focus();
  }

  close() {
    this.menu.hidden = true;
    document.body.classList.remove('mobile-menu-open');
    // Reset all submenus
    this.menu.querySelectorAll('.mobile-submenu').forEach(sub => sub.hidden = true);
    this.openBtn?.focus();
  }

  openSubmenu(trigger) {
    const submenuId = `mobile-submenu-${trigger.dataset.mobileSubmenuTrigger}`;
    const submenu = document.getElementById(submenuId);

    trigger.setAttribute('aria-expanded', 'true');
    submenu.hidden = false;

    // Slide animation
    submenu.classList.add('is-entering');
    requestAnimationFrame(() => {
      submenu.classList.remove('is-entering');
      submenu.classList.add('is-active');
    });

    submenu.querySelector('.mobile-submenu__back').focus();
  }

  closeSubmenu(backBtn) {
    const submenu = backBtn.closest('.mobile-submenu');
    const trigger = document.querySelector(`[data-mobile-submenu-trigger="${submenu.id.replace('mobile-submenu-', '')}"]`);

    submenu.classList.remove('is-active');
    submenu.classList.add('is-leaving');

    setTimeout(() => {
      submenu.hidden = true;
      submenu.classList.remove('is-leaving');
      trigger?.setAttribute('aria-expanded', 'false');
      trigger?.focus();
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
});
```

---

## CSS Styles

```css
/* assets/mega-menu.css */

/* Desktop mega menu */
.mega-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mega-menu:not([hidden]) {
  opacity: 1;
  transform: translateY(0);
}

.mega-menu__inner {
  display: flex;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.mega-menu__content {
  display: flex;
  flex: 1;
  gap: 2rem;
}

.mega-menu__column {
  min-width: 150px;
}

.mega-menu__heading {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-foreground);
  text-decoration: none;
}

.mega-menu__heading:hover {
  color: var(--color-primary);
}

.mega-menu__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mega-menu__link {
  display: block;
  padding: 0.375rem 0;
  color: var(--color-foreground-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.mega-menu__link:hover {
  color: var(--color-primary);
}

.mega-menu__featured {
  flex-shrink: 0;
  width: 300px;
}

.mega-menu__featured-image img {
  width: 100%;
  border-radius: var(--border-radius);
}

/* Simple dropdown */
.dropdown-menu {
  position: absolute;
  left: 0;
  top: 100%;
  min-width: 200px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  z-index: 100;
}

.dropdown-menu__link {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--color-foreground);
  text-decoration: none;
}

.dropdown-menu__link:hover {
  background: var(--color-background-alt);
}

/* Nav parent button */
.nav-link--parent {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
}

.nav-link--parent svg {
  width: 1em;
  height: 1em;
  transition: transform 0.2s ease;
}

.nav-link--parent[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

/* Mobile menu */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.mobile-menu:not([hidden]) {
  transform: translateX(0);
}

.mobile-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-menu__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
  border: none;
  background: none;
  text-align: left;
  color: var(--color-foreground);
  text-decoration: none;
  font-size: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-submenu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background);
  z-index: 1001;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.mobile-submenu.is-active {
  transform: translateX(0);
}

.mobile-submenu.is-leaving {
  transform: translateX(100%);
}

.mobile-submenu__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-submenu__back {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-foreground-muted);
}

.mobile-submenu__view-all {
  display: block;
  padding: 1rem;
  background: var(--color-background-alt);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

/* Body class when menu open */
body.mobile-menu-open {
  overflow: hidden;
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

body.mobile-menu-open .mobile-menu-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* Hide desktop nav on mobile, show mobile menu trigger */
@media screen and (max-width: 989px) {
  .header__nav {
    display: none;
  }

  [data-open-mobile-menu] {
    display: block;
  }
}

@media screen and (min-width: 990px) {
  .mobile-menu,
  [data-open-mobile-menu],
  .mobile-menu-overlay {
    display: none !important;
  }
}
```

---

## Locales

```json
{
  "sections": {
    "header": {
      "menu": "Menu",
      "main_nav": "Main navigation",
      "close_menu": "Close menu",
      "back": "Back",
      "view_all": "View all {{ title }}"
    }
  }
}
```

---

## Best Practices

1. **Accessibility:**
   - Use `role="menubar"`, `role="menu"`, `role="menuitem"`
   - Manage `aria-expanded` and `aria-haspopup`
   - Support keyboard navigation (arrows, Enter, Escape)
   - Trap focus within open menus

2. **Performance:**
   - Use CSS transitions instead of JavaScript animations
   - Lazy load featured images in mega menu
   - Don't render mega menu content if not used

3. **Mobile:**
   - Always provide mobile drawer fallback
   - Support touch gestures (swipe to close)
   - Back button for nested levels
   - "View all" link at category level

4. **Content:**
   - Limit to 3 levels of nesting
   - Featured images/products for visual interest
   - "View all" links for each category
   - Keep column count manageable (4-5 max)
