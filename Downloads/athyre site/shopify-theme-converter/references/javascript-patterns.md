# JavaScript Patterns for Shopify

Complete reference for JavaScript in Shopify themes, including Web Components, AJAX, and React-to-Shopify conversion.

## Architecture Overview

Shopify themes use vanilla JavaScript with Web Components (Custom Elements). This approach:
- Works without build tools
- Progressive enhancement friendly
- No framework dependencies
- Easy to maintain

---

## Web Components Pattern

### Basic Structure

```javascript
// assets/my-component.js

class MyComponent extends HTMLElement {
  constructor() {
    super();
    // Initial setup (no DOM access yet)
  }

  connectedCallback() {
    // Element added to DOM - safe to access DOM now
    this.init();
  }

  disconnectedCallback() {
    // Element removed from DOM - cleanup here
    this.destroy();
  }

  static get observedAttributes() {
    // List attributes to watch for changes
    return ['data-value', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // React to attribute changes
    if (oldValue !== newValue) {
      this.update();
    }
  }

  init() {
    // Setup logic
  }

  update() {
    // Update logic
  }

  destroy() {
    // Cleanup logic
  }
}

// Register the component
customElements.define('my-component', MyComponent);
```

### Component with Shadow DOM (Optional)

```javascript
class EncapsulatedComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .internal { color: blue; }
      </style>
      <div class="internal">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('encapsulated-component', EncapsulatedComponent);
```

---

## Common Components

### Modal/Dialog

```javascript
// assets/modal-dialog.js

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.closeHandlers = [];
  }

  connectedCallback() {
    // Get elements
    this.dialog = this.querySelector('dialog') || this;
    this.closeButtons = this.querySelectorAll('[data-modal-close]');
    this.overlay = this.querySelector('.modal-overlay');

    // Bind close buttons
    this.closeButtons.forEach(btn => {
      const handler = () => this.close();
      btn.addEventListener('click', handler);
      this.closeHandlers.push({ element: btn, handler });
    });

    // Close on overlay click
    if (this.overlay) {
      const handler = (e) => {
        if (e.target === this.overlay) this.close();
      };
      this.overlay.addEventListener('click', handler);
      this.closeHandlers.push({ element: this.overlay, handler });
    }

    // Close on Escape
    this.escHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    };
    document.addEventListener('keydown', this.escHandler);
  }

  disconnectedCallback() {
    // Cleanup all handlers
    this.closeHandlers.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    document.removeEventListener('keydown', this.escHandler);
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  open() {
    this.setAttribute('open', '');
    document.body.classList.add('modal-open');
    this.trapFocus();

    // Dispatch event
    this.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
  }

  close() {
    this.removeAttribute('open');
    document.body.classList.remove('modal-open');
    this.releaseFocus();

    // Dispatch event
    this.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
  }

  trapFocus() {
    this.previousActiveElement = document.activeElement;
    const focusables = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length) focusables[0].focus();
  }

  releaseFocus() {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }
}

customElements.define('modal-dialog', ModalDialog);
```

### Dropdown/Disclosure

```javascript
// assets/disclosure.js

class DisclosureElement extends HTMLElement {
  connectedCallback() {
    this.trigger = this.querySelector('[data-disclosure-trigger]');
    this.content = this.querySelector('[data-disclosure-content]');

    if (this.trigger) {
      this.trigger.addEventListener('click', () => this.toggle());
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Close on Escape
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.trigger?.focus();
      }
    });
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.setAttribute('open', '');
    this.trigger?.setAttribute('aria-expanded', 'true');
    this.content?.removeAttribute('hidden');
  }

  close() {
    this.removeAttribute('open');
    this.trigger?.setAttribute('aria-expanded', 'false');
    this.content?.setAttribute('hidden', '');
  }
}

customElements.define('disclosure-element', DisclosureElement);
```

### Tabs

```javascript
// assets/tabs.js

class TabsComponent extends HTMLElement {
  connectedCallback() {
    this.tabList = this.querySelector('[role="tablist"]');
    this.tabs = this.querySelectorAll('[role="tab"]');
    this.panels = this.querySelectorAll('[role="tabpanel"]');

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.selectTab(tab));
      tab.addEventListener('keydown', (e) => this.handleKeydown(e));
    });

    // Initialize first tab
    if (this.tabs.length && !this.querySelector('[aria-selected="true"]')) {
      this.selectTab(this.tabs[0]);
    }
  }

  selectTab(selectedTab) {
    const panelId = selectedTab.getAttribute('aria-controls');
    const selectedPanel = this.querySelector(`#${panelId}`);

    // Update tabs
    this.tabs.forEach(tab => {
      tab.setAttribute('aria-selected', tab === selectedTab);
      tab.setAttribute('tabindex', tab === selectedTab ? '0' : '-1');
    });

    // Update panels
    this.panels.forEach(panel => {
      panel.hidden = panel !== selectedPanel;
    });

    selectedTab.focus();
  }

  handleKeydown(e) {
    const tabArray = Array.from(this.tabs);
    const currentIndex = tabArray.indexOf(e.target);
    let newIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % tabArray.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabArray.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this.selectTab(tabArray[newIndex]);
  }
}

customElements.define('tabs-component', TabsComponent);
```

### Slideshow/Carousel

```javascript
// assets/slideshow.js

class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.autoplayInterval = null;
  }

  connectedCallback() {
    this.slides = this.querySelectorAll('[data-slide]');
    this.prevBtn = this.querySelector('[data-prev]');
    this.nextBtn = this.querySelector('[data-next]');
    this.dots = this.querySelectorAll('[data-dot]');
    this.autoplayDelay = parseInt(this.dataset.autoplay) || 0;

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index));
    });

    // Touch/swipe support
    this.setupTouch();

    // Autoplay
    if (this.autoplayDelay > 0) {
      this.startAutoplay();

      // Pause on hover/focus
      this.addEventListener('mouseenter', () => this.stopAutoplay());
      this.addEventListener('mouseleave', () => this.startAutoplay());
      this.addEventListener('focusin', () => this.stopAutoplay());
      this.addEventListener('focusout', () => this.startAutoplay());
    }

    this.updateSlides();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  setupTouch() {
    let startX = 0;
    let startY = 0;

    this.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    this.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) this.prev();
        else this.next();
      }
    }, { passive: true });
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  goTo(index) {
    // Wrap around
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    this.currentIndex = index;
    this.updateSlides();
  }

  updateSlides() {
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === this.currentIndex);
      slide.setAttribute('aria-hidden', i !== this.currentIndex);
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.currentIndex);
      dot.setAttribute('aria-current', i === this.currentIndex);
    });

    // Announce to screen readers
    this.setAttribute('aria-live', 'polite');
  }

  startAutoplay() {
    if (this.autoplayDelay > 0) {
      this.autoplayInterval = setInterval(() => this.next(), this.autoplayDelay);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

customElements.define('slideshow-component', SlideshowComponent);
```

---

## Product Form JavaScript

### Variant Selection

```javascript
// assets/variant-selects.js

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.variants = JSON.parse(this.querySelector('script[type="application/json"]')?.textContent || '[]');
  }

  connectedCallback() {
    this.selects = this.querySelectorAll('select');
    this.selects.forEach(select => {
      select.addEventListener('change', () => this.onVariantChange());
    });
  }

  onVariantChange() {
    const selectedOptions = Array.from(this.selects).map(select => select.value);
    const variant = this.findVariant(selectedOptions);

    if (variant) {
      this.updateUrl(variant);
      this.updateFormId(variant);
      this.updatePrice(variant);
      this.updateButton(variant);
      this.updateMedia(variant);
    }
  }

  findVariant(options) {
    return this.variants.find(variant => {
      return variant.options.every((option, index) => option === options[index]);
    });
  }

  updateUrl(variant) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  }

  updateFormId(variant) {
    const form = document.querySelector('[data-type="add-to-cart-form"]');
    const input = form?.querySelector('input[name="id"]');
    if (input) input.value = variant.id;
  }

  updatePrice(variant) {
    const priceElement = document.querySelector('[data-product-price]');
    if (priceElement) {
      priceElement.innerHTML = this.formatMoney(variant.price);
    }

    const compareElement = document.querySelector('[data-compare-price]');
    if (compareElement) {
      if (variant.compare_at_price > variant.price) {
        compareElement.innerHTML = this.formatMoney(variant.compare_at_price);
        compareElement.hidden = false;
      } else {
        compareElement.hidden = true;
      }
    }
  }

  updateButton(variant) {
    const button = document.querySelector('[data-add-to-cart]');
    const buttonText = button?.querySelector('.btn-text');

    if (button && buttonText) {
      if (variant.available) {
        button.disabled = false;
        buttonText.textContent = window.variantStrings?.addToCart || 'Add to cart';
      } else {
        button.disabled = true;
        buttonText.textContent = window.variantStrings?.soldOut || 'Sold out';
      }
    }
  }

  updateMedia(variant) {
    if (variant.featured_media) {
      const mediaGallery = document.querySelector('[data-product-gallery]');
      mediaGallery?.dispatchEvent(new CustomEvent('variant:change', {
        detail: { mediaId: variant.featured_media.id }
      }));
    }
  }

  formatMoney(cents) {
    // Basic money formatting - use Shopify.formatMoney if available
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    });
  }
}

customElements.define('variant-selects', VariantSelects);
```

### Product Form Submit

```javascript
// assets/product-form.js

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');
    this.errorContainer = this.querySelector('[data-error]');
  }

  connectedCallback() {
    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();
    if (this.submitButton.disabled) return;

    this.setLoading(true);
    this.clearError();

    const formData = new FormData(this.form);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || 'Error adding to cart');
      }

      this.onSuccess(data);

    } catch (error) {
      this.onError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  onSuccess(data) {
    document.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: { item: data },
      bubbles: true
    }));

    // Show success feedback
    this.submitButton.classList.add('is-success');
    setTimeout(() => {
      this.submitButton.classList.remove('is-success');
    }, 2000);
  }

  onError(message) {
    if (this.errorContainer) {
      this.errorContainer.textContent = message;
      this.errorContainer.hidden = false;
    }
  }

  clearError() {
    if (this.errorContainer) {
      this.errorContainer.textContent = '';
      this.errorContainer.hidden = true;
    }
  }

  setLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.classList.toggle('is-loading', loading);
  }
}

customElements.define('product-form', ProductForm);
```

---

## Event Communication

### Custom Events Pattern

```javascript
// Dispatch events
document.dispatchEvent(new CustomEvent('cart:updated', {
  detail: { cart: cartData },
  bubbles: true
}));

// Listen for events
document.addEventListener('cart:updated', (event) => {
  console.log('Cart updated:', event.detail.cart);
});
```

### Common Events

| Event | Detail | Purpose |
|-------|--------|---------|
| `cart:item-added` | `{ item }` | Item added to cart |
| `cart:updated` | `{ cart }` | Cart state changed |
| `cart:error` | `{ message }` | Cart operation failed |
| `variant:change` | `{ variant }` | Variant selection changed |
| `modal:open` | `{}` | Modal opened |
| `modal:close` | `{}` | Modal closed |

---

## Utility Functions

### Debounce

```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage
const handleSearch = debounce((query) => {
  fetch(`/search/suggest.json?q=${query}`)
    .then(res => res.json())
    .then(showResults);
}, 300);
```

### Throttle

```javascript
function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  updateStickyHeader();
}, 100);
```

### Fetch with Timeout

```javascript
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
```

---

## React to Vanilla JS Conversion

### State Management

**React:**
```jsx
const [count, setCount] = useState(0);
```

**Vanilla:**
```javascript
class Counter extends HTMLElement {
  constructor() {
    super();
    this._count = 0;
  }

  get count() {
    return this._count;
  }

  set count(value) {
    this._count = value;
    this.render();
  }

  render() {
    this.querySelector('.count').textContent = this.count;
  }
}
```

### Effect Hooks

**React:**
```jsx
useEffect(() => {
  fetchData();
  return () => cleanup();
}, [dependency]);
```

**Vanilla:**
```javascript
class DataFetcher extends HTMLElement {
  static get observedAttributes() {
    return ['data-url'];
  }

  connectedCallback() {
    this.fetchData();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-url' && oldValue !== newValue) {
      this.fetchData();
    }
  }
}
```

### Context/Prop Drilling

**React:**
```jsx
<CartContext.Provider value={cart}>
  <CartButton />
</CartContext.Provider>
```

**Vanilla:**
```javascript
// Global event bus
class CartButton extends HTMLElement {
  connectedCallback() {
    document.addEventListener('cart:updated', (e) => {
      this.updateCount(e.detail.cart.item_count);
    });
  }

  updateCount(count) {
    this.querySelector('[data-count]').textContent = count;
  }
}
```

---

## Loading Scripts

### Conditional Loading

```liquid
{%- comment -%} Only load on product pages {%- endcomment -%}
{% if request.page_type == 'product' %}
  <script src="{{ 'product-form.js' | asset_url }}" defer></script>
{% endif %}
```

### Lazy Loading

```javascript
// Load component when visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      import('/assets/heavy-component.js');
      observer.disconnect();
    }
  });
});

observer.observe(document.querySelector('.heavy-section'));
```

### Import on Interaction

```javascript
// Load on first interaction
document.querySelector('[data-search]')?.addEventListener('focus', async () => {
  const { initSearch } = await import('/assets/predictive-search.js');
  initSearch();
}, { once: true });
```

---

## Best Practices

1. **Progressive Enhancement:** JavaScript should enhance, not be required
2. **No Build Required:** Keep it browser-native
3. **Small Modules:** One component per file
4. **Events Over Direct Coupling:** Components communicate via events
5. **Accessibility:** All interactions keyboard-accessible
6. **Performance:** Lazy load non-critical scripts
7. **Error Handling:** Always catch fetch errors gracefully
