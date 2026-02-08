# Checkout Extensibility Reference

## Overview

Shopify checkout is secure and locked-down by design. Customization happens through:

1. **Checkout UI Extensions** - Add UI elements to checkout
2. **Shopify Functions** - Customize backend logic (discounts, shipping, payment)
3. **Web Pixels** - Track checkout events
4. **Post-Purchase Extensions** - Upsells after order confirmation

> **Important:** Shopify Scripts deprecated June 30, 2026. Migrate to Functions.

---

## Availability by Plan

| Feature | Basic | Shopify | Advanced | Plus |
|---------|-------|---------|----------|------|
| Checkout branding | ✅ | ✅ | ✅ | ✅ |
| Checkout UI Extensions | ❌ | ❌ | ❌ | ✅ |
| Shopify Functions | Via public apps only | Via public apps only | Via public apps only | ✅ Full |
| Custom checkout liquid | ❌ | ❌ | ❌ | ✅ |

---

## Part 1: Checkout UI Extensions

### Extension Points (Targets)

| Target | Location | Use Case |
|--------|----------|----------|
| `purchase.checkout.block.render` | Multiple locations | Custom content blocks |
| `purchase.checkout.header.render-after` | After header | Trust badges |
| `purchase.checkout.contact.render-before` | Before contact form | Marketing opt-in |
| `purchase.checkout.shipping-option-item.render-after` | After shipping option | Delivery date picker |
| `purchase.checkout.payment-method-list.render-before` | Before payment | Payment terms info |
| `purchase.checkout.cart-line-item.render-after` | After each item | Line item customization |
| `purchase.checkout.reductions.render-before` | Before discounts | Loyalty points |
| `purchase.thank-you.block.render` | Thank you page | Upsells, surveys |
| `customer-account.order-status.block.render` | Order status | Tracking info |

### Basic Extension Structure

```jsx
// extensions/checkout-ui/src/Checkout.jsx
import {
  reactExtension,
  Banner,
  useTranslate,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension('purchase.checkout.block.render', () => <App />);

function App() {
  const translate = useTranslate();

  return (
    <Banner status="info">
      {translate('free_shipping_message')}
    </Banner>
  );
}
```

### Available UI Components

| Component | Purpose |
|-----------|---------|
| `Banner` | Info/warning/error messages |
| `BlockStack` | Vertical layout |
| `InlineStack` | Horizontal layout |
| `TextField` | Text input |
| `Checkbox` | Boolean input |
| `Select` | Dropdown |
| `DatePicker` | Date selection |
| `Button` | Actions |
| `Text` | Display text |
| `Heading` | Titles |
| `Image` | Images |
| `Divider` | Visual separator |
| `SkeletonText` | Loading states |

### Custom Field Example

```jsx
import {
  reactExtension,
  TextField,
  useMetafield,
  useApplyMetafieldsChange,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension('purchase.checkout.delivery-address.render-after', () => <DeliveryInstructions />);

function DeliveryInstructions() {
  const metafield = useMetafield({
    namespace: 'custom',
    key: 'delivery_instructions',
  });

  const applyMetafieldsChange = useApplyMetafieldsChange();

  const handleChange = (value) => {
    applyMetafieldsChange({
      type: 'updateMetafield',
      namespace: 'custom',
      key: 'delivery_instructions',
      valueType: 'string',
      value,
    });
  };

  return (
    <TextField
      label="Delivery Instructions"
      value={metafield?.value || ''}
      onChange={handleChange}
      maxLength={200}
    />
  );
}
```

### Gift Message Example

```jsx
import {
  reactExtension,
  Checkbox,
  TextField,
  BlockStack,
  useMetafield,
  useApplyMetafieldsChange,
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';

export default reactExtension('purchase.checkout.cart-line-list.render-after', () => <GiftOptions />);

function GiftOptions() {
  const [isGift, setIsGift] = useState(false);
  const applyMetafieldsChange = useApplyMetafieldsChange();

  const handleGiftToggle = (checked) => {
    setIsGift(checked);
    applyMetafieldsChange({
      type: 'updateMetafield',
      namespace: 'custom',
      key: 'is_gift',
      valueType: 'boolean',
      value: checked.toString(),
    });
  };

  const handleMessageChange = (value) => {
    applyMetafieldsChange({
      type: 'updateMetafield',
      namespace: 'custom',
      key: 'gift_message',
      valueType: 'string',
      value,
    });
  };

  return (
    <BlockStack>
      <Checkbox checked={isGift} onChange={handleGiftToggle}>
        This is a gift
      </Checkbox>
      {isGift && (
        <TextField
          label="Gift message"
          multiline
          onChange={handleMessageChange}
          maxLength={500}
        />
      )}
    </BlockStack>
  );
}
```

---

## Part 2: Shopify Functions

### Function Types

| Function Type | Purpose | Example |
|---------------|---------|---------|
| Product Discounts | Discounts on products | Buy 2, get 1 free |
| Order Discounts | Discounts on order total | $20 off orders over $100 |
| Shipping Discounts | Discounts on shipping | Free shipping over $50 |
| Payment Customization | Hide/reorder payment methods | Hide COD for large orders |
| Delivery Customization | Modify delivery options | Hide express for heavy items |
| Cart Transform | Modify cart items | Auto-add free gift |
| Order Validation | Block checkout | Require age verification |
| Fulfillment Constraints | Restrict fulfillment | Same-location items only |

### Basic Function Structure

```rust
// src/main.rs (Rust example - recommended for performance)
use shopify_function::prelude::*;
use shopify_function::Result;

#[shopify_function_target(query_path = "src/run.graphql", schema_path = "schema.graphql")]
fn run(input: input::ResponseData) -> Result<output::FunctionRunResult> {
    let cart_total = input.cart.cost.subtotal_amount.amount.parse::<f64>().unwrap_or(0.0);

    if cart_total >= 100.0 {
        Ok(output::FunctionRunResult {
            discounts: vec![output::Discount {
                message: Some("$10 off orders over $100!".to_string()),
                targets: vec![output::Target::OrderSubtotal {
                    excluded_variant_ids: vec![],
                }],
                value: output::Value::FixedAmount {
                    amount: "10.00".to_string(),
                },
            }],
            discount_application_strategy: output::DiscountApplicationStrategy::FIRST,
        })
    } else {
        Ok(output::FunctionRunResult {
            discounts: vec![],
            discount_application_strategy: output::DiscountApplicationStrategy::FIRST,
        })
    }
}
```

### JavaScript Function Example

```javascript
// src/run.js
export function run(input) {
  const DISCOUNT_THRESHOLD = 100;
  const DISCOUNT_AMOUNT = 10;

  const cartTotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  if (cartTotal >= DISCOUNT_THRESHOLD) {
    return {
      discounts: [
        {
          message: `$${DISCOUNT_AMOUNT} off orders over $${DISCOUNT_THRESHOLD}!`,
          targets: [{ orderSubtotal: { excludedVariantIds: [] } }],
          value: { fixedAmount: { amount: DISCOUNT_AMOUNT.toString() } },
        },
      ],
      discountApplicationStrategy: "FIRST",
    };
  }

  return { discounts: [], discountApplicationStrategy: "FIRST" };
}
```

### Common Function Patterns

#### Tiered Discount

```javascript
export function run(input) {
  const cartTotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  const tiers = [
    { threshold: 200, discount: 25, message: "$25 off orders over $200" },
    { threshold: 100, discount: 10, message: "$10 off orders over $100" },
    { threshold: 50, discount: 5, message: "$5 off orders over $50" },
  ];

  for (const tier of tiers) {
    if (cartTotal >= tier.threshold) {
      return {
        discounts: [
          {
            message: tier.message,
            targets: [{ orderSubtotal: { excludedVariantIds: [] } }],
            value: { fixedAmount: { amount: tier.discount.toString() } },
          },
        ],
        discountApplicationStrategy: "FIRST",
      };
    }
  }

  return { discounts: [], discountApplicationStrategy: "FIRST" };
}
```

#### Hide Payment Methods

```javascript
// Payment customization function
export function run(input) {
  const cartTotal = parseFloat(input.cart.cost.totalAmount.amount);
  const operations = [];

  // Hide COD for orders over $500
  if (cartTotal > 500) {
    const codMethod = input.paymentMethods.find(
      (m) => m.name.includes("Cash on Delivery")
    );
    if (codMethod) {
      operations.push({
        hide: {
          paymentMethodId: codMethod.id,
        },
      });
    }
  }

  return { operations };
}
```

#### Free Shipping Threshold

```javascript
export function run(input) {
  const FREE_SHIPPING_THRESHOLD = 75;
  const cartTotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      discounts: [
        {
          message: "Free shipping on orders over $75!",
          targets: input.cart.deliveryGroups.map((group) => ({
            deliveryGroup: { id: group.id },
          })),
          value: { percentage: { value: "100" } },
        },
      ],
      discountApplicationStrategy: "FIRST",
    };
  }

  return { discounts: [], discountApplicationStrategy: "FIRST" };
}
```

---

## Part 3: Theme Checkout Considerations

### What Themes CAN Control

1. **Checkout branding** (via admin settings)
   - Logo
   - Colors
   - Fonts
   - Background image

2. **Cart page** (before checkout)
   - Full control via theme sections

3. **Thank you page** (limited, Plus only)
   - Via checkout extensions

### What Themes CANNOT Control

1. Checkout page layout (fixed)
2. Payment form fields (security)
3. Shipping rate display (via settings only)
4. Order summary structure (fixed)

### Cart Preparation for Checkout

Ensure cart data transfers properly:

```liquid
{% comment %} Cart page - capture data for checkout {% endcomment %}
<form action="/cart" method="post">
  {% for item in cart.items %}
    <div class="cart-item">
      {{ item.title }}

      {% comment %} Line item properties persist to checkout {% endcomment %}
      {% for property in item.properties %}
        <input type="hidden"
               name="updates[{{ item.key }}][properties][{{ property.first }}]"
               value="{{ property.last }}">
      {% endfor %}
    </div>
  {% endfor %}

  {% comment %} Cart attributes persist to checkout {% endcomment %}
  <label>
    Special Instructions:
    <textarea name="note">{{ cart.note }}</textarea>
  </label>

  <label>
    Preferred Delivery Date:
    <input type="date" name="attributes[Delivery Date]"
           value="{{ cart.attributes['Delivery Date'] }}">
  </label>
</form>
```

---

## Part 4: Migration from Scripts

### Scripts → Functions Mapping

| Script Type | Function Type |
|-------------|---------------|
| Line item scripts | Product Discount Function |
| Shipping scripts | Delivery Customization + Shipping Discount |
| Payment scripts | Payment Customization Function |

### Key Differences

| Scripts | Functions |
|---------|-----------|
| Ruby | Rust, JavaScript, or any language compiling to Wasm |
| Runs on Shopify's servers | Runs in isolated sandbox |
| Access to full cart object | Access via GraphQL input |
| Synchronous | Asynchronous |
| Editor in admin | Code deployed via CLI |

---

## Part 5: Conversion Implications

### When Source Site Has Custom Checkout

| Source Feature | Shopify Equivalent | Plus Required? |
|----------------|-------------------|----------------|
| Custom checkout layout | Not possible | - |
| Custom fields at checkout | Checkout UI Extensions | Yes |
| Discount logic | Shopify Functions | Public apps OK |
| Custom payment options | Payment Customization | Yes |
| Shipping calculator | Delivery Customization | Yes |
| Address validation | App + Extension | Yes |
| Gift options | Checkout UI Extensions | Yes |
| Delivery date picker | Checkout UI Extensions | Yes |
| Loyalty points redemption | Checkout UI Extensions | Yes |

### Documentation for Client

```markdown
## Checkout Customization Limitations

The following features from your original site have been adapted for Shopify:

### Fully Supported (All Plans)
- ✅ Cart page customization (full control)
- ✅ Basic checkout branding (logo, colors)
- ✅ Simple discounts (via admin)
- ✅ Cart attributes and notes

### Requires Shopify Plus
- ⚠️ Custom checkout fields (delivery instructions)
- ⚠️ Gift message at checkout
- ⚠️ Custom discount logic (tiered, conditional)
- ⚠️ Hiding payment methods
- ⚠️ Post-purchase upsells

### Not Possible
- ❌ Complete checkout redesign
- ❌ Custom payment form fields
- ❌ Multi-page checkout flow

### Recommended Apps (Non-Plus Alternative)
- Bold Discounts (complex discount logic)
- Gift Message (gift options without Plus)
- Delivery Date Picker apps
```

---

## Part 6: Testing Checkout Customizations

### Development Mode

```bash
# Preview checkout extensions
shopify app dev

# Test functions
shopify app function run
```

### Checklist

- [ ] Test all discount scenarios
- [ ] Verify cart attributes reach checkout
- [ ] Test line item properties display
- [ ] Check mobile checkout experience
- [ ] Verify shipping calculations
- [ ] Test payment method filtering
- [ ] Verify post-purchase flow
- [ ] Test order confirmation email includes custom data
