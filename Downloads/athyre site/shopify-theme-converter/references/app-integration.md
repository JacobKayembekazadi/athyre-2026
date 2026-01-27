# App & Extension Integration

Guide for integrating Shopify apps and theme extensions.

## App Blocks

App blocks allow apps to add content to theme sections without modifying theme code.

### Supporting App Blocks in Sections

```liquid
{% schema %}
{
  "name": "Featured collection",
  "blocks": [
    {
      "type": "@app"
    },
    {
      "type": "heading",
      "name": "Heading",
      "settings": [...]
    }
  ]
}
{% endschema %}
```

### Rendering App Blocks

```liquid
{%- for block in section.blocks -%}
  {%- case block.type -%}
    {%- when '@app' -%}
      {% render block %}

    {%- when 'heading' -%}
      <h2 {{ block.shopify_attributes }}>{{ block.settings.title }}</h2>
  {%- endcase -%}
{%- endfor -%}
```

### App Block Placement

Specify where apps can inject blocks:

```liquid
{%- for block in section.blocks -%}
  {%- if block.type == '@app' -%}
    <div class="app-block-wrapper">
      {% render block %}
    </div>
  {%- endif -%}
{%- endfor -%}
```

---

## Theme App Extensions

### Extension Points in Theme

#### 1. Product Page Integration

```liquid
{%- comment -%}
  Common app extension points on product pages
{%- endcomment -%}

{%- for block in section.blocks -%}
  {%- case block.type -%}

    {%- when 'rating' -%}
      {%- comment -%} Reviews app rating stars {%- endcomment -%}
      {{ block.shopify_attributes }}

    {%- when '@app' -%}
      {%- comment -%}
        App blocks: reviews, size charts, bundles, etc.
      {%- endcomment -%}
      {% render block %}

  {%- endcase -%}
{%- endfor -%}
```

#### 2. Cart Extensions

```liquid
{%- comment -%} Cart upsells, gift wrapping, etc. {%- endcomment -%}
<div class="cart-apps">
  {%- for block in section.blocks -%}
    {%- if block.type == '@app' -%}
      {% render block %}
    {%- endif -%}
  {%- endfor -%}
</div>
```

#### 3. Footer/Global Apps

```liquid
{%- comment -%} Chat widgets, popups, etc. {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- if block.type == '@app' -%}
    {% render block %}
  {%- endif -%}
{%- endfor -%}
```

---

## Common App Types

### Reviews Apps

**Expected metafields:**
```liquid
{%- assign rating = product.metafields.reviews.rating.value -%}
{%- assign rating_count = product.metafields.reviews.rating_count.value -%}

{%- if rating != blank -%}
  <div class="product-rating">
    {%- render 'rating-stars', rating: rating.value, scale_max: rating.scale_max -%}
    <span class="rating-count">({{ rating_count }})</span>
  </div>
{%- endif -%}
```

**Rating stars snippet:**
```liquid
{%- comment -%} snippets/rating-stars.liquid {%- endcomment -%}
{%- liquid
  assign rating = rating | default: 0
  assign scale_max = scale_max | default: 5
-%}

<div class="rating-stars" role="img" aria-label="{{ rating }} out of {{ scale_max }} stars">
  {%- for i in (1..scale_max) -%}
    {%- if i <= rating -%}
      <span class="star star--filled">★</span>
    {%- elsif i <= rating | plus: 0.5 -%}
      <span class="star star--half">★</span>
    {%- else -%}
      <span class="star star--empty">☆</span>
    {%- endif -%}
  {%- endfor -%}
</div>
```

### Wishlist Apps

**Add to wishlist button:**
```liquid
{%- comment -%} Product card wishlist button placeholder {%- endcomment -%}
<div class="product-card-wishlist" data-product-id="{{ product.id }}">
  {%- comment -%} App will inject button here {%- endcomment -%}
</div>
```

### Subscription Apps

**Subscription widget on product page:**
```liquid
{%- if product.selling_plan_groups.size > 0 -%}
  <div class="product-subscriptions">
    {%- for selling_plan_group in product.selling_plan_groups -%}
      <fieldset class="selling-plan-group">
        <legend>{{ selling_plan_group.name }}</legend>

        {%- for selling_plan in selling_plan_group.selling_plans -%}
          <label>
            <input
              type="radio"
              name="selling_plan"
              value="{{ selling_plan.id }}"
              form="{{ product_form_id }}"
            >
            {{ selling_plan.name }}

            {%- if selling_plan.price_adjustments.size > 0 -%}
              <span class="selling-plan-savings">
                Save {{ selling_plan.price_adjustments[0].value }}%
              </span>
            {%- endif -%}
          </label>
        {%- endfor -%}
      </fieldset>
    {%- endfor -%}
  </div>
{%- endif -%}
```

### Advanced Subscription Patterns

#### Subscribe & Save Pricing Display

```liquid
{%- comment -%}
  Display subscription pricing with savings
  snippets/subscription-pricing.liquid
{%- endcomment -%}

{%- assign has_subscription = false -%}
{%- assign subscription_discount = 0 -%}
{%- assign subscription_price = variant.price -%}

{%- for selling_plan_group in product.selling_plan_groups -%}
  {%- assign has_subscription = true -%}
  {%- assign first_plan = selling_plan_group.selling_plans | first -%}

  {%- for price_adjustment in first_plan.price_adjustments -%}
    {%- if price_adjustment.value_type == 'percentage' -%}
      {%- assign subscription_discount = price_adjustment.value -%}
      {%- assign discount_multiplier = 100 | minus: subscription_discount | divided_by: 100.0 -%}
      {%- assign subscription_price = variant.price | times: discount_multiplier -%}
    {%- elsif price_adjustment.value_type == 'fixed_amount' -%}
      {%- assign subscription_discount = price_adjustment.value -%}
      {%- assign subscription_price = variant.price | minus: subscription_discount -%}
    {%- elsif price_adjustment.value_type == 'price' -%}
      {%- assign subscription_price = price_adjustment.value -%}
    {%- endif -%}
    {%- break -%}
  {%- endfor -%}
  {%- break -%}
{%- endfor -%}

{%- if has_subscription -%}
  <div class="subscription-pricing">
    <div class="subscription-pricing__option subscription-pricing__option--onetime">
      <label>
        <input
          type="radio"
          name="purchase_option"
          value="onetime"
          data-subscription-option="onetime"
          checked
        >
        <span class="subscription-pricing__label">
          {{ 'products.subscription.one_time' | t }}
        </span>
        <span class="subscription-pricing__price">
          {{ variant.price | money }}
        </span>
      </label>
    </div>

    <div class="subscription-pricing__option subscription-pricing__option--subscribe">
      <label>
        <input
          type="radio"
          name="purchase_option"
          value="subscribe"
          data-subscription-option="subscribe"
        >
        <span class="subscription-pricing__label">
          {{ 'products.subscription.subscribe_save' | t }}
          {%- if subscription_discount > 0 -%}
            <span class="subscription-pricing__badge">
              {{ 'products.subscription.save_percent' | t: percent: subscription_discount }}
            </span>
          {%- endif -%}
        </span>
        <span class="subscription-pricing__price">
          {{ subscription_price | money }}
        </span>
      </label>
    </div>
  </div>
{%- endif -%}
```

#### Subscription Frequency Selector

```liquid
{%- comment -%}
  Frequency selector UI
  Shows when "subscribe" option is selected
{%- endcomment -%}

<div class="subscription-frequency hidden" data-subscription-frequency>
  {%- for selling_plan_group in product.selling_plan_groups -%}
    <fieldset class="subscription-frequency__group">
      <legend class="subscription-frequency__legend">
        {{ 'products.subscription.delivery_frequency' | t }}
      </legend>

      <div class="subscription-frequency__options">
        {%- for selling_plan in selling_plan_group.selling_plans -%}
          {%- comment -%} Parse frequency from selling plan {%- endcomment -%}
          {%- assign delivery_policy = selling_plan.options | first -%}

          <label class="subscription-frequency__option">
            <input
              type="radio"
              name="selling_plan"
              value="{{ selling_plan.id }}"
              form="{{ product_form_id }}"
              data-selling-plan="{{ selling_plan.id }}"
              {% if forloop.first %}checked{% endif %}
            >
            <span class="subscription-frequency__label">
              {{ delivery_policy.value }}
            </span>

            {%- comment -%} Show per-unit price if different {%- endcomment -%}
            {%- for adjustment in selling_plan.price_adjustments -%}
              {%- if adjustment.order_count == nil or adjustment.order_count == 1 -%}
                {%- if adjustment.value > 0 -%}
                  <span class="subscription-frequency__savings">
                    {%- case adjustment.value_type -%}
                      {%- when 'percentage' -%}
                        {{ 'products.subscription.save_percent' | t: percent: adjustment.value }}
                      {%- when 'fixed_amount' -%}
                        {{ 'products.subscription.save_amount' | t: amount: adjustment.value | money }}
                    {%- endcase -%}
                  </span>
                {%- endif -%}
              {%- endif -%}
            {%- endfor -%}
          </label>
        {%- endfor -%}
      </div>
    </fieldset>
  {%- endfor -%}
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const purchaseOptions = document.querySelectorAll('[data-subscription-option]');
    const frequencySelector = document.querySelector('[data-subscription-frequency]');

    purchaseOptions.forEach(option => {
      option.addEventListener('change', function() {
        const isSubscribe = this.value === 'subscribe';
        frequencySelector.classList.toggle('hidden', !isSubscribe);

        // Clear selling plan if one-time purchase
        if (!isSubscribe) {
          document.querySelectorAll('[data-selling-plan]').forEach(input => {
            input.checked = false;
          });
        } else {
          // Select first frequency by default
          const firstFrequency = document.querySelector('[data-selling-plan]');
          if (firstFrequency) firstFrequency.checked = true;
        }
      });
    });
  });
</script>
```

#### Subscription Badge on Product Cards

```liquid
{%- comment -%}
  snippets/product-card-subscription-badge.liquid

  Accepts:
  - product: {Product} Product object
{%- endcomment -%}

{%- if product.selling_plan_groups.size > 0 -%}
  {%- assign first_group = product.selling_plan_groups | first -%}
  {%- assign first_plan = first_group.selling_plans | first -%}
  {%- assign max_discount = 0 -%}

  {%- for selling_plan_group in product.selling_plan_groups -%}
    {%- for selling_plan in selling_plan_group.selling_plans -%}
      {%- for adjustment in selling_plan.price_adjustments -%}
        {%- if adjustment.value_type == 'percentage' and adjustment.value > max_discount -%}
          {%- assign max_discount = adjustment.value -%}
        {%- endif -%}
      {%- endfor -%}
    {%- endfor -%}
  {%- endfor -%}

  <div class="product-card__subscription-badge">
    {%- if max_discount > 0 -%}
      <span class="subscription-badge subscription-badge--savings">
        {{ 'products.subscription.subscribe_save_up_to' | t: percent: max_discount }}
      </span>
    {%- else -%}
      <span class="subscription-badge">
        {{ 'products.subscription.subscription_available' | t }}
      </span>
    {%- endif -%}
  </div>
{%- endif -%}
```

#### Customer Subscription Portal Link

```liquid
{%- comment -%}
  snippets/subscription-portal-link.liquid

  Add to account page or header for logged-in customers
{%- endcomment -%}

{%- if customer -%}
  {%- comment -%}
    Most subscription apps use one of these patterns:
    1. App-specific portal URL stored in customer metafield
    2. Standard /apps/subscriptions path
    3. External portal URL in theme settings
  {%- endcomment -%}

  {%- assign portal_url = customer.metafields.subscriptions.portal_url.value -%}
  {%- if portal_url == blank -%}
    {%- assign portal_url = settings.subscription_portal_url | default: '/apps/subscriptions' -%}
  {%- endif -%}

  <a href="{{ portal_url }}" class="subscription-portal-link">
    {% render 'icon', icon: 'subscription' %}
    <span>{{ 'customer.account.manage_subscriptions' | t }}</span>
  </a>
{%- endif -%}
```

#### Account Page Subscription Section

```liquid
{%- comment -%}
  templates/customers/account.liquid excerpt
  Display active subscriptions on account page
{%- endcomment -%}

<div class="account-subscriptions">
  <h2>{{ 'customer.account.subscriptions' | t }}</h2>

  {%- comment -%}
    Subscription data is typically managed by apps.
    Provide a container for app blocks or link to portal.
  {%- endcomment -%}

  <div class="account-subscriptions__content">
    {%- for block in section.blocks -%}
      {%- if block.type == '@app' -%}
        {% render block %}
      {%- endif -%}
    {%- endfor -%}

    {%- comment -%} Fallback if no app block {%- endcomment -%}
    {%- if section.blocks.size == 0 -%}
      <div class="account-subscriptions__empty">
        <p>{{ 'customer.account.subscriptions_description' | t }}</p>
        <a href="{{ settings.subscription_portal_url | default: '/apps/subscriptions' }}" class="button">
          {{ 'customer.account.manage_subscriptions' | t }}
        </a>
      </div>
    {%- endif -%}
  </div>
</div>
```

#### Subscription-Specific Cart Line Display

```liquid
{%- comment -%}
  snippets/cart-item.liquid excerpt
  Show subscription details for subscription items
{%- endcomment -%}

{%- if item.selling_plan_allocation -%}
  <div class="cart-item__subscription-info">
    <span class="cart-item__subscription-badge">
      {% render 'icon', icon: 'subscription' %}
      {{ 'cart.subscription' | t }}
    </span>

    <span class="cart-item__subscription-frequency">
      {{ item.selling_plan_allocation.selling_plan.name }}
    </span>

    {%- comment -%} Show per-delivery price if different from one-time {%- endcomment -%}
    {%- assign allocation = item.selling_plan_allocation -%}
    {%- if allocation.compare_at_price > allocation.price -%}
      <span class="cart-item__subscription-savings">
        {{ 'cart.subscription_savings' | t: amount: allocation.compare_at_price | minus: allocation.price | money }}
      </span>
    {%- endif -%}
  </div>
{%- endif -%}
```

#### Subscription Locales

```json
{
  "products": {
    "subscription": {
      "one_time": "One-time purchase",
      "subscribe_save": "Subscribe & Save",
      "save_percent": "Save {{ percent }}%",
      "save_amount": "Save {{ amount }}",
      "subscribe_save_up_to": "Subscribe & save up to {{ percent }}%",
      "subscription_available": "Subscription available",
      "delivery_frequency": "Delivery frequency",
      "every_week": "Every week",
      "every_2_weeks": "Every 2 weeks",
      "every_month": "Every month",
      "every_2_months": "Every 2 months",
      "every_3_months": "Every 3 months"
    }
  },
  "customer": {
    "account": {
      "subscriptions": "My Subscriptions",
      "manage_subscriptions": "Manage Subscriptions",
      "subscriptions_description": "View and manage your active subscriptions."
    }
  },
  "cart": {
    "subscription": "Subscription",
    "subscription_savings": "You save {{ amount }} per delivery"
  }
}
```

#### Subscription CSS

```css
/* Subscribe & Save Pricing */
.subscription-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.subscription-pricing__option {
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  transition: border-color 0.2s ease;
}

.subscription-pricing__option:has(input:checked) {
  border-color: var(--color-primary);
  background: var(--color-primary-background);
}

.subscription-pricing__option label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.subscription-pricing__label {
  flex: 1;
}

.subscription-pricing__badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--color-sale);
  color: var(--color-sale-contrast);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1rem;
  margin-left: 0.5rem;
}

.subscription-pricing__price {
  font-weight: 600;
}

/* Frequency Selector */
.subscription-frequency {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.subscription-frequency.hidden {
  display: none;
}

.subscription-frequency__legend {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.subscription-frequency__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subscription-frequency__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscription-frequency__option:has(input:checked) {
  border-color: var(--color-primary);
  background: var(--color-primary-background);
}

.subscription-frequency__option input {
  margin: 0;
}

.subscription-frequency__savings {
  font-size: 0.75rem;
  color: var(--color-sale);
  font-weight: 600;
}

/* Product Card Badge */
.product-card__subscription-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
}

.subscription-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--border-radius);
}

.subscription-badge--savings {
  background: var(--color-sale);
  color: var(--color-sale-contrast);
}

/* Cart Subscription Info */
.cart-item__subscription-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.cart-item__subscription-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: var(--color-primary-background);
  border-radius: var(--border-radius);
  font-weight: 500;
}

.cart-item__subscription-badge svg {
  width: 1rem;
  height: 1rem;
}

.cart-item__subscription-savings {
  color: var(--color-sale);
  font-weight: 600;
}
```

---

## Checkout Extensions

### Checkout UI Extensions

For custom checkout experience (Shopify Plus or Checkout Extensibility):

```liquid
{%- comment -%}
  Checkout customization is handled through:
  1. Checkout Branding API
  2. Checkout UI Extensions (React components)
  3. Functions (discounts, shipping, payment)
{%- endcomment -%}

{%- comment -%} Checkout branding in settings {%- endcomment -%}
{%- comment -%} settings_schema.json {%- endcomment -%}
{
  "name": "Checkout",
  "settings": [
    {
      "type": "header",
      "content": "Checkout styling is configured in Settings > Checkout"
    }
  ]
}
```

### Order Confirmation Page

```liquid
{%- comment -%}
  templates/customers/order.liquid
  Can include app blocks for order tracking, etc.
{%- endcomment -%}

<div class="order-details">
  <h1>{{ 'customer.order.title' | t: name: order.name }}</h1>

  {%- comment -%} Order tracking apps {%- endcomment -%}
  {%- for block in section.blocks -%}
    {%- if block.type == '@app' -%}
      {% render block %}
    {%- endif -%}
  {%- endfor -%}
</div>
```

### Advanced Checkout Extensions

#### Checkout UI Extension Targets

Checkout UI extensions render in specific locations. Theme developers should be aware of these extension points:

```
Extension Points (targets):
- purchase.checkout.header.render-after
- purchase.checkout.block.render
- purchase.checkout.actions.render-before
- purchase.checkout.cart-line-item.render-after
- purchase.checkout.cart-line-list.render-after
- purchase.checkout.contact.render-after
- purchase.checkout.delivery-address.render-after
- purchase.checkout.shipping-option-item.render-after
- purchase.checkout.payment-method-list.render-after
- purchase.checkout.footer.render-after
```

#### Post-Purchase Upsell Integration

```liquid
{%- comment -%}
  Post-purchase upsells are handled entirely by checkout extensions.
  Theme integration is limited to order status page customization.

  For Shopify Plus, use post-purchase extensions:
  - purchase.post-purchase.render
  - purchase.post-purchase.cross-sell-render
{%- endcomment -%}

{%- comment -%}
  Order status page can display upsell success messages
  templates/customers/order.liquid
{%- endcomment -%}

{%- if order.attributes['post_purchase_upsell'] -%}
  <div class="order-upsell-notice">
    <p>{{ 'customer.order.upsell_added' | t }}</p>
  </div>
{%- endif -%}
```

#### Order Status Page Customization

```liquid
{%- comment -%}
  templates/customers/order.liquid
  Enhanced order status page with app integration
{%- endcomment -%}

<div class="order-status-page">
  {%- comment -%} Order header {%- endcomment -%}
  <header class="order-status__header">
    <h1>{{ 'customer.order.title' | t: name: order.name }}</h1>
    <p class="order-status__date">
      {{ order.created_at | date: format: 'date' }}
    </p>
  </header>

  {%- comment -%} Order status timeline {%- endcomment -%}
  <div class="order-status__timeline">
    <div class="timeline-step{% if order.confirmed %} is-complete{% endif %}">
      <span class="timeline-icon">{% render 'icon', icon: 'check' %}</span>
      <span class="timeline-label">{{ 'customer.order.confirmed' | t }}</span>
    </div>

    {%- if order.fulfillment_status == 'fulfilled' or order.fulfillment_status == 'partial' -%}
      <div class="timeline-step{% if order.fulfillment_status == 'fulfilled' %} is-complete{% endif %}">
        <span class="timeline-icon">{% render 'icon', icon: 'package' %}</span>
        <span class="timeline-label">{{ 'customer.order.shipped' | t }}</span>
      </div>
    {%- endif -%}
  </div>

  {%- comment -%} Tracking information from fulfillments {%- endcomment -%}
  {%- for fulfillment in order.line_items_by_fulfillment -%}
    {%- if fulfillment.tracking_company and fulfillment.tracking_number -%}
      <div class="order-tracking">
        <h3>{{ 'customer.order.tracking' | t }}</h3>
        <p>
          <strong>{{ fulfillment.tracking_company }}</strong>:
          {%- if fulfillment.tracking_url -%}
            <a href="{{ fulfillment.tracking_url }}" target="_blank" rel="noopener">
              {{ fulfillment.tracking_number }}
            </a>
          {%- else -%}
            {{ fulfillment.tracking_number }}
          {%- endif -%}
        </p>
      </div>
    {%- endif -%}
  {%- endfor -%}

  {%- comment -%} App blocks for order tracking, returns, etc. {%- endcomment -%}
  <div class="order-apps">
    {%- for block in section.blocks -%}
      {%- if block.type == '@app' -%}
        <div class="order-app-block">
          {% render block %}
        </div>
      {%- endif -%}
    {%- endfor -%}
  </div>

  {%- comment -%} Order items {%- endcomment -%}
  <div class="order-items">
    <h2>{{ 'customer.order.items' | t }}</h2>
    <table class="order-items__table">
      <thead>
        <tr>
          <th>{{ 'customer.order.product' | t }}</th>
          <th>{{ 'customer.order.quantity' | t }}</th>
          <th>{{ 'customer.order.total' | t }}</th>
        </tr>
      </thead>
      <tbody>
        {%- for line_item in order.line_items -%}
          <tr>
            <td>
              <div class="order-item">
                {%- if line_item.image -%}
                  <img
                    src="{{ line_item.image | image_url: width: 80 }}"
                    alt="{{ line_item.image.alt | escape }}"
                    width="60"
                    height="60"
                  >
                {%- endif -%}
                <div class="order-item__info">
                  <a href="{{ line_item.product.url }}">{{ line_item.title }}</a>
                  {%- if line_item.variant_title != 'Default Title' -%}
                    <span class="order-item__variant">{{ line_item.variant_title }}</span>
                  {%- endif -%}
                </div>
              </div>
            </td>
            <td>{{ line_item.quantity }}</td>
            <td>{{ line_item.final_line_price | money }}</td>
          </tr>
        {%- endfor -%}
      </tbody>
    </table>
  </div>

  {%- comment -%} Order totals {%- endcomment -%}
  <div class="order-totals">
    <div class="order-totals__row">
      <span>{{ 'customer.order.subtotal' | t }}</span>
      <span>{{ order.line_items_subtotal_price | money }}</span>
    </div>

    {%- for discount_application in order.discount_applications -%}
      <div class="order-totals__row order-totals__discount">
        <span>{{ discount_application.title }}</span>
        <span>-{{ discount_application.total_allocated_amount | money }}</span>
      </div>
    {%- endfor -%}

    {%- for shipping_method in order.shipping_methods -%}
      <div class="order-totals__row">
        <span>{{ 'customer.order.shipping' | t }} ({{ shipping_method.title }})</span>
        <span>{{ shipping_method.price | money }}</span>
      </div>
    {%- endfor -%}

    {%- for tax_line in order.tax_lines -%}
      <div class="order-totals__row">
        <span>{{ tax_line.title }}</span>
        <span>{{ tax_line.price | money }}</span>
      </div>
    {%- endfor -%}

    <div class="order-totals__row order-totals__total">
      <span>{{ 'customer.order.total' | t }}</span>
      <span>{{ order.total_price | money }}</span>
    </div>
  </div>

  {%- comment -%} Reorder button {%- endcomment -%}
  <div class="order-actions">
    <form action="/cart/add" method="post">
      {%- for line_item in order.line_items -%}
        {%- if line_item.variant.available -%}
          <input type="hidden" name="items[][id]" value="{{ line_item.variant_id }}">
          <input type="hidden" name="items[][quantity]" value="{{ line_item.quantity }}">
        {%- endif -%}
      {%- endfor -%}
      <button type="submit" class="button button--secondary">
        {{ 'customer.order.reorder' | t }}
      </button>
    </form>
  </div>
</div>

{% schema %}
{
  "name": "Order Status",
  "blocks": [
    {
      "type": "@app"
    }
  ]
}
{% endschema %}
```

#### Thank You Page Sections

```liquid
{%- comment -%}
  Thank you page customization is done via checkout branding
  and checkout UI extensions, not theme Liquid.

  However, you can prepare content for order status updates:
{%- endcomment -%}

{%- comment -%}
  snippets/thank-you-recommendations.liquid
  Product recommendations for thank you / order status page
  Uses order data to suggest related products
{%- endcomment -%}

{%- assign ordered_products = '' -%}
{%- for line_item in order.line_items -%}
  {%- assign ordered_products = ordered_products | append: line_item.product_id | append: ',' -%}
{%- endfor -%}

{%- comment -%} Get first product for recommendations {%- endcomment -%}
{%- assign first_product_id = ordered_products | split: ',' | first -%}
{%- assign recommendation_product = all_products[first_product_id] -%}

{%- if recommendation_product -%}
  <section class="thank-you-recommendations">
    <h3>{{ 'customer.order.you_may_also_like' | t }}</h3>

    <div class="recommendation-grid">
      {%- for product in recommendation_product.collections.first.products limit: 4 -%}
        {%- unless ordered_products contains product.id -%}
          {% render 'product-card', product: product %}
        {%- endunless -%}
      {%- endfor -%}
    </div>
  </section>
{%- endif -%}
```

#### Checkout Branding Theme Settings

```json
{
  "name": "Checkout",
  "settings": [
    {
      "type": "header",
      "content": "Checkout Appearance"
    },
    {
      "type": "paragraph",
      "content": "Checkout styling is configured in Settings > Checkout > Customize checkout. These settings provide reference values."
    },
    {
      "type": "color",
      "id": "checkout_accent_color",
      "label": "Checkout accent color",
      "default": "#000000",
      "info": "Used as reference for checkout branding API"
    },
    {
      "type": "image_picker",
      "id": "checkout_logo",
      "label": "Checkout logo",
      "info": "Logo displayed in checkout header"
    },
    {
      "type": "image_picker",
      "id": "checkout_banner",
      "label": "Checkout banner",
      "info": "Optional banner image for checkout"
    },
    {
      "type": "header",
      "content": "Trust Elements"
    },
    {
      "type": "richtext",
      "id": "checkout_footer_text",
      "label": "Checkout footer text",
      "info": "Additional trust messaging for checkout footer"
    }
  ]
}
```

#### Checkout Events JavaScript

```javascript
/**
 * Theme-side checkout event handling
 * Listen for checkout-related events from the storefront
 */

class CheckoutEventHandler {
  constructor() {
    this.init();
  }

  init() {
    // Track checkout initiation
    document.addEventListener('cart:checkout', () => {
      this.trackCheckoutStart();
    });

    // Handle checkout redirects
    document.querySelectorAll('[name="checkout"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.onCheckoutClick();
      });
    });

    // Dynamic checkout buttons
    this.initDynamicCheckout();
  }

  trackCheckoutStart() {
    // Analytics integration
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          items: this.getCartItems()
        }
      });
    }
  }

  onCheckoutClick() {
    // Pre-checkout validation
    const cartForm = document.querySelector('form[action="/cart"]');
    if (cartForm && !cartForm.checkValidity()) {
      event.preventDefault();
      cartForm.reportValidity();
      return;
    }

    // Show loading state
    document.body.classList.add('checkout-loading');
  }

  initDynamicCheckout() {
    // Handle dynamic checkout buttons (Shop Pay, Apple Pay, etc.)
    // These are rendered by Shopify and don't need theme code
    // but you can style the container

    const dynamicCheckout = document.querySelector('[data-dynamic-checkout]');
    if (dynamicCheckout) {
      // Observe for button renders
      const observer = new MutationObserver(() => {
        const buttons = dynamicCheckout.querySelectorAll('[role="button"]');
        if (buttons.length > 0) {
          dynamicCheckout.classList.add('has-buttons');
        }
      });

      observer.observe(dynamicCheckout, { childList: true, subtree: true });
    }
  }

  getCartItems() {
    // Return cart items for analytics
    return window.cartItems || [];
  }
}

new CheckoutEventHandler();
```

#### Dynamic Checkout Button Styling

```css
/* Dynamic checkout buttons container */
[data-dynamic-checkout] {
  margin-top: 1rem;
}

[data-dynamic-checkout]:empty {
  display: none;
}

/* Separator between regular and dynamic checkout */
.checkout-separator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  color: var(--color-foreground-muted);
  font-size: 0.875rem;
}

.checkout-separator::before,
.checkout-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

/* Shop Pay button specific */
.shopify-payment-button__button--branded {
  border-radius: var(--border-radius) !important;
}

/* Apple Pay / Google Pay */
.shopify-payment-button__button--unbranded {
  background: var(--color-foreground) !important;
  color: var(--color-background) !important;
  border-radius: var(--border-radius) !important;
}

/* Loading state during checkout redirect */
body.checkout-loading::after {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
```

#### Checkout Locales

```json
{
  "customer": {
    "order": {
      "title": "Order {{ name }}",
      "confirmed": "Confirmed",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "tracking": "Tracking Information",
      "items": "Items",
      "product": "Product",
      "quantity": "Qty",
      "subtotal": "Subtotal",
      "shipping": "Shipping",
      "total": "Total",
      "reorder": "Order Again",
      "you_may_also_like": "You may also like",
      "upsell_added": "Your additional items have been added to this order."
    }
  }
}
```

---

## Third-Party Script Integration

### Recommended Pattern

```liquid
{%- comment -%}
  Load third-party scripts efficiently
  Place in theme.liquid before closing </body>
{%- endcomment -%}

{%- comment -%} Analytics {%- endcomment -%}
{% if settings.enable_analytics %}
  <script defer src="https://analytics.example.com/script.js"></script>
{% endif %}

{%- comment -%} Chat widget {%- endcomment -%}
{% if settings.enable_chat %}
  <script>
    window.addEventListener('load', function() {
      // Delay chat widget load for better performance
      setTimeout(function() {
        const script = document.createElement('script');
        script.src = 'https://chat.example.com/widget.js';
        document.body.appendChild(script);
      }, 3000);
    });
  </script>
{% endif %}
```

### Settings for App Scripts

```json
{
  "name": "Integrations",
  "settings": [
    {
      "type": "header",
      "content": "Analytics"
    },
    {
      "type": "checkbox",
      "id": "enable_analytics",
      "label": "Enable analytics",
      "default": false
    },
    {
      "type": "text",
      "id": "analytics_id",
      "label": "Analytics ID",
      "info": "Your analytics tracking ID"
    },
    {
      "type": "header",
      "content": "Chat"
    },
    {
      "type": "checkbox",
      "id": "enable_chat",
      "label": "Enable chat widget",
      "default": false
    }
  ]
}
```

---

## App-Specific Liquid

### Detecting App Installation

```liquid
{%- comment -%}
  Check if an app has installed specific metafields
{%- endcomment -%}

{%- if shop.metafields.app_namespace.installed == true -%}
  {%- comment -%} App is installed {%- endcomment -%}
{%- endif -%}

{%- comment -%} Or check for app-specific objects {%- endcomment -%}
{%- if product.metafields.judgeme.badge -%}
  {{ product.metafields.judgeme.badge }}
{%- endif -%}
```

### Common App Metafields

| App Type | Namespace | Common Keys |
|----------|-----------|-------------|
| Reviews | `reviews`, `judgeme`, `yotpo` | `rating`, `rating_count`, `badge` |
| Subscriptions | `subscriptions` | `selling_plan`, `delivery_schedule` |
| Product Bundles | `bundles` | `bundle_products`, `bundle_discount` |
| Loyalty | `loyalty`, `smile` | `points_earned`, `rewards` |

---

## Testing App Integration

### Checklist

- [ ] App blocks render in section editor
- [ ] App blocks respect theme styling
- [ ] No layout breaks when app is uninstalled
- [ ] Scripts don't block page render
- [ ] Mobile responsive
- [ ] No console errors

### Graceful Degradation

```liquid
{%- comment -%}
  Always provide fallback when app metafields are empty
{%- endcomment -%}

{%- assign rating = product.metafields.reviews.rating.value -%}
{%- if rating != blank -%}
  {% render 'rating-stars', rating: rating %}
{%- else -%}
  {%- comment -%} No rating yet - hide or show placeholder {%- endcomment -%}
{%- endif -%}
```

---

## Performance Considerations

1. **Lazy Load App Scripts:** Defer non-critical app scripts
2. **Conditional Loading:** Only load scripts where needed
3. **Monitor Impact:** Use Lighthouse to measure app impact
4. **App Block Limits:** Limit number of app blocks per section

```json
{% schema %}
{
  "blocks": [
    {
      "type": "@app",
      "limit": 2
    }
  ]
}
{% endschema %}
```
