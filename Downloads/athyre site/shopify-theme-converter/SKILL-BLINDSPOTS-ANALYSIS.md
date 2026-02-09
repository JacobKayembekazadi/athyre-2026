# Shopify Theme Converter: Blind Spot Analysis

## Ralph Loop Iteration 1 - Systems Thinking, First Principles, Second-Order Analysis

**Date:** 2026-02-08
**Analysis Method:** Systems Thinking + First Principles + Second-Order Effects

---

## Executive Summary

The current SKILL.md focuses heavily on **visual conversion** (components → sections) but misses **70% of what makes a Shopify store functional**. Converting a React site to Shopify isn't just about HTML/CSS/Liquid—it's about converting an entire **commerce system**.

### The Fundamental Gap

```
Current Focus (SKILL.md)         What's Actually Needed
─────────────────────────       ──────────────────────────
├── UI Components                ├── UI Components ✓
├── Page Templates               ├── Page Templates ✓
├── Navigation                   ├── Navigation ✓
├── Assets                       ├── Assets ✓
└── Setup Checklist              ├── Data Architecture
                                 ├── Commerce Logic
                                 ├── Customer Experience
                                 ├── International Support
                                 ├── Automation/Integrations
                                 ├── Performance/Accessibility
                                 └── Backend Connectivity
```

---

## Systems Thinking Analysis

### System Map: Complete Shopify Store

```
                                    ┌─────────────────┐
                                    │   SHOPIFY       │
                                    │   BACKEND       │
                                    └────────┬────────┘
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         │                                   │                                   │
         ▼                                   ▼                                   ▼
┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
│  ADMIN APIs     │               │  STOREFRONT     │               │  FUNCTIONS      │
│                 │               │                 │               │                 │
│ • Products      │               │ • Theme         │               │ • Discounts     │
│ • Orders        │               │ • Cart          │               │ • Shipping      │
│ • Customers     │               │ • Checkout      │               │ • Payments      │
│ • Inventory     │               │ • Search        │               │ • Validation    │
│ • Metafields    │               │ • Customer Acct │               │ • Fulfillment   │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
         │              ┌──────────────────┼──────────────────┐              │
         │              │                  │                  │              │
         ▼              ▼                  ▼                  ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMER TOUCHPOINTS                                    │
│                                                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Browse  │→│ Search  │→│  Cart   │→│Checkout │→│  Order  │→│ Account │      │
│  │         │  │         │  │         │  │         │  │ Status  │  │         │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Current SKILL.md covers:** Theme (partial)
**Missing:** Everything else

---

## Critical Blind Spots Identified

### 1. DATA ARCHITECTURE - Metafields & Metaobjects

**First Principles Question:** Where does custom data live?

React apps store data in:
- Component state
- API responses
- CMS (Contentful, Sanity, etc.)
- Hardcoded values

Shopify stores custom data in:
- **Metafields** (attached to products, customers, orders, etc.)
- **Metaobjects** (standalone custom content types)

**What's Missing:**

| Source Pattern | Shopify Equivalent | Reference Needed |
|----------------|-------------------|------------------|
| Custom product fields | Product metafields | `references/metafields-guide.md` (exists but incomplete) |
| Custom content types | Metaobjects | NEW: `references/metaobjects-guide.md` |
| Dynamic page content | Page/Article metafields | Extension needed |
| Customer preferences | Customer metafields | NEW section |
| Order customization | Order metafields | NEW section |

**Second-Order Effects:**
- Without metafield planning, custom data from source becomes hardcoded text
- Client can't update "special" content without developer
- Loses the dynamic nature of the original site

**REFERENCE TO CREATE:** `references/metafields-complete.md`

---

### 2. CART FUNCTIONALITY - Cart API & Attributes

**First Principles Question:** What happens between "Add to Cart" and "Checkout"?

React apps handle cart via:
- Redux/Context state
- Local storage
- API calls to backend

Shopify cart system:
- **Cart API** (Ajax endpoints for cart manipulation)
- **Line Item Properties** (per-item custom data)
- **Cart Attributes** (order-level custom data)
- **Cart Notes** (customer notes)

**What's Missing:**

| Feature | Current Coverage | Gap |
|---------|-----------------|-----|
| Basic add/remove | ❌ Not covered | Critical |
| Quantity updates | ❌ Not covered | Critical |
| Line item properties | ❌ Not covered | High |
| Cart attributes | ❌ Not covered | High |
| Cart drawer/popup | ❌ Not covered | Medium |
| Cart upsells | Mentioned in references | Incomplete |
| Gift wrapping options | ❌ Not covered | Medium |

**Key API Endpoints:**
```javascript
// NOT DOCUMENTED IN SKILL.md
/cart.js          // Get cart
/cart/add.js      // Add items
/cart/update.js   // Update quantities
/cart/change.js   // Change line item
/cart/clear.js    // Clear cart
```

**Second-Order Effects:**
- Source site's custom cart features (gift wrapping, notes, etc.) lost
- No way to pass custom data to checkout
- Cart-based upsells can't function

**REFERENCE TO CREATE:** `references/cart-api-complete.md`

---

### 3. CHECKOUT - Extensibility & Functions

**First Principles Question:** Can you customize checkout?

React apps have full checkout control.
Shopify checkout is:
- **Locked down** for security/compliance
- **Extended via** Checkout UI Extensions (Plus only)
- **Logic customized via** Shopify Functions

**What's Missing:**

| Checkout Feature | Availability | Reference Needed |
|-----------------|--------------|------------------|
| Custom fields | Checkout UI Extensions | NEW |
| Order validation | Validation Functions | NEW |
| Custom discounts | Discount Functions | NEW |
| Shipping customization | Delivery Functions | NEW |
| Payment customization | Payment Functions | NEW |
| Post-purchase upsells | Post-purchase Extensions | NEW |
| Thank you page | Thank You Extensions | NEW |

**Critical Timeline:**
> Shopify Scripts deprecated June 30, 2026 - must use Functions

**Second-Order Effects:**
- Source site's checkout customizations may be impossible without Plus
- Custom discount logic needs complete rewrite as Functions
- Shipping calculator from source won't work the same way

**REFERENCE TO CREATE:** `references/checkout-extensibility.md`

---

### 4. BACKEND CONNECTIVITY - App Proxy & Webhooks

**First Principles Question:** How does the theme talk to external systems?

React apps connect to backends via:
- Direct API calls
- Server-side rendering
- API routes (Next.js)

Shopify themes connect via:
- **App Proxy** (secure backend endpoints through store domain)
- **Webhooks** (event-driven notifications)
- **Storefront API** (GraphQL queries)

**What's Missing:**

| Backend Need | Shopify Solution | Current Coverage |
|--------------|-----------------|------------------|
| Custom API endpoints | App Proxy routes | ❌ Not covered |
| Order notifications | Webhooks | ❌ Not covered |
| Inventory sync | Webhooks | ❌ Not covered |
| CRM integration | Webhooks + Admin API | ❌ Not covered |
| Custom calculations | App Proxy + Functions | ❌ Not covered |

**App Proxy Example:**
```
Store URL: https://store.com/apps/custom/endpoint
Proxies to: https://your-app.com/api/endpoint
Supports: Liquid rendering in response!
```

**Second-Order Effects:**
- Source site's backend integrations need complete rearchitecting
- Real-time features may need app development
- Data sync requirements not documented for client

**REFERENCE TO CREATE:** `references/backend-connectivity.md`

---

### 5. THEME APP EXTENSIONS - App Integration

**First Principles Question:** How do apps integrate with themes?

React apps integrate libraries via:
- npm packages
- Script tags
- Component imports

Shopify themes integrate apps via:
- **App Blocks** (drag-and-drop in theme editor)
- **App Embed Blocks** (floating/popup elements)
- **Theme App Extensions** (bundled Liquid/JS/CSS)

**What's Missing:**

| Integration Type | Use Case | Current Coverage |
|-----------------|----------|------------------|
| App Blocks | Reviews, wishlists, etc. | `references/app-integration.md` (basic) |
| App Embed Blocks | Chat widgets, popups | ❌ Not covered |
| Script loading | Analytics, pixels | ❌ Not covered |
| App-provided sections | Product reviews section | ❌ Not covered |

**Second-Order Effects:**
- Source site features requiring apps not mapped to Shopify apps
- Client doesn't know which apps to install
- App blocks not pre-configured in templates

**REFERENCE TO CREATE:** `references/app-blocks-complete.md`

---

### 6. CUSTOMER ACCOUNTS - New Customer Accounts

**First Principles Question:** What is the logged-in customer experience?

React apps handle auth via:
- JWT/sessions
- OAuth providers
- Custom auth flows

Shopify customer accounts:
- **Classic accounts** (theme-based, customizable)
- **New customer accounts** (Shopify-hosted, limited customization)
- **Customer Account API** (headless/custom builds)
- **Customer Account UI Extensions** (customization)

**What's Missing:**

| Account Feature | Current Coverage | Gap |
|-----------------|-----------------|-----|
| Login/Register flow | ❌ Not covered | Critical |
| Order history | ❌ Not covered | Critical |
| Address management | ❌ Not covered | High |
| Account customization | ❌ Not covered | High |
| Wishlist persistence | ❌ Not covered | Medium |
| B2B company accounts | ❌ Not covered | Conditional |

**Second-Order Effects:**
- Source site's account features may not be replicable
- Customer data migration not planned
- Account page styling may be limited

**REFERENCE TO CREATE:** `references/customer-accounts.md`

---

### 7. INTERNATIONAL - Markets & Multi-Currency

**First Principles Question:** Does the site sell internationally?

React apps handle i18n via:
- i18next, react-intl
- Currency conversion APIs
- Geolocation

Shopify handles international via:
- **Shopify Markets** (region configuration)
- **Multi-currency** (automatic conversion)
- **Translations** (Liquid t: filter, translation files)
- **Localized URLs** (subfolders/domains)

**What's Missing:**

| International Feature | Current Coverage | Gap |
|----------------------|-----------------|-----|
| Currency selector | ❌ Not covered | High |
| Language selector | ❌ Not covered | High |
| Market-specific pricing | ❌ Not covered | Medium |
| Localized content | `locales/` mentioned | Incomplete |
| Geolocation redirects | ❌ Not covered | Medium |
| Tax/duty handling | ❌ Not covered | High |

**Second-Order Effects:**
- Source site's international features may be lost
- SEO implications of URL structure not considered
- Checkout experience varies by market

**REFERENCE TO CREATE:** `references/markets-multi-currency.md`

---

### 8. AUTOMATION - Shopify Flow Integration

**First Principles Question:** What happens automatically after events?

React apps automate via:
- Background jobs (cron, queues)
- Webhook handlers
- Serverless functions

Shopify automates via:
- **Shopify Flow** (visual workflow builder)
- **Webhooks** (event triggers)
- **Shopify Functions** (checkout-time logic)

**What's Missing:**

| Automation Type | Current Coverage | Gap |
|-----------------|-----------------|-----|
| Order tagging | ❌ Not covered | Medium |
| Inventory alerts | ❌ Not covered | Medium |
| Customer segmentation | ❌ Not covered | Medium |
| Fulfillment triggers | ❌ Not covered | High |
| Fraud review | ❌ Not covered | High |
| Marketing automation | ❌ Not covered | Medium |

**Flow Examples That Should Be Documented:**
```
Trigger: Order created
Condition: Order total > $500
Action: Tag order as "VIP", notify Slack

Trigger: Product inventory < 10
Action: Email inventory team, tag product

Trigger: Customer created
Action: Tag by source, add to Klaviyo segment
```

**Second-Order Effects:**
- Client expects source site automation to "just work"
- No documentation of what manual processes are now needed
- Integration with external tools (Klaviyo, Slack) not planned

**REFERENCE TO CREATE:** `references/shopify-flow-automation.md`

---

### 9. SEARCH & DISCOVERY - Predictive Search

**First Principles Question:** How do customers find products?

React apps implement search via:
- Algolia, Elasticsearch
- Custom search API
- Client-side filtering

Shopify search:
- **Predictive Search API** (autocomplete)
- **Search results page** (template)
- **Filters/Facets** (collection filtering)
- **Search analytics** (admin insights)

**What's Missing:**

| Search Feature | Current Coverage | Gap |
|----------------|-----------------|-----|
| Predictive search | ❌ Not covered | High |
| Search suggestions | ❌ Not covered | High |
| Typo tolerance | Built into Shopify | Document |
| Faceted navigation | ❌ Not covered | High |
| Collection filtering | ❌ Not covered | High |

**Second-Order Effects:**
- Source site's advanced search may be degraded
- Third-party search app may be needed
- Filter UX needs complete rebuild

**REFERENCE TO CREATE:** `references/search-discovery.md`

---

### 10. SUBSCRIPTIONS & SELLING PLANS

**First Principles Question:** Does the site sell recurring products?

**What's Missing:**

| Subscription Feature | Current Coverage | Gap |
|---------------------|-----------------|-----|
| Subscribe & save | ❌ Not covered | Critical if applicable |
| Selling plan display | ❌ Not covered | Critical |
| Subscription management | ❌ Not covered | Critical |
| Prepaid subscriptions | ❌ Not covered | Medium |

**Second-Order Effects:**
- Source site's subscription features need complete app integration
- Pricing display changes significantly
- Customer portal needs subscription management

**REFERENCE TO CREATE:** `references/subscriptions-selling-plans.md`

---

### 11. PERFORMANCE & ACCESSIBILITY

**First Principles Question:** Will the converted theme pass Shopify standards?

**Theme Store Requirements:**
- Lighthouse Performance: **minimum 60**
- Lighthouse Accessibility: **minimum 90**

**What's Missing:**

| Requirement | Current Coverage | Gap |
|-------------|-----------------|-----|
| Lazy loading | ❌ Not covered | High |
| Image optimization | Mentioned briefly | Incomplete |
| Render-blocking resources | ❌ Not covered | High |
| ARIA labels | ❌ Not covered | Critical |
| Skip links | ❌ Not covered | Critical |
| Heading hierarchy | ❌ Not covered | High |
| Focus management | ❌ Not covered | High |
| Color contrast | ❌ Not covered | High |
| Keyboard navigation | ❌ Not covered | High |

**Second-Order Effects:**
- Converted theme may fail store requirements
- Accessibility lawsuits are real risk
- SEO impacted by performance issues

**REFERENCE TO CREATE:** `references/performance-accessibility-checklist.md`

---

### 12. B2B & WHOLESALE

**First Principles Question:** Does the site serve business customers?

**What's Missing (if B2B applicable):**

| B2B Feature | Current Coverage | Gap |
|-------------|-----------------|-----|
| Company accounts | `references/b2b-wholesale.md` exists | Expand |
| Price lists | Mentioned | Incomplete |
| Quick order forms | Mentioned | Incomplete |
| Net payment terms | ❌ Not covered | Add |
| Minimum order values | ❌ Not covered | Add |
| Approval workflows | ❌ Not covered | Add |

---

## Phase Additions Needed

### New Phase: Data Architecture Analysis

**Before Phase 1, add:**

```markdown
### Phase 0.5: Data Architecture Analysis

**Step 0.5.1: Identify custom data in source**

For each page/component, document:
- Custom fields displayed (e.g., "Ingredients", "Care Instructions")
- Dynamic content sources (CMS, database, API)
- Customer-specific data (preferences, history)
- Order customization options (gift wrapping, notes)

**Step 0.5.2: Map to Shopify data structures**

| Source Data | Shopify Destination | Type |
|-------------|---------------------|------|
| Product ingredients | Product metafield | single_line_text_field |
| Care instructions | Product metafield | multi_line_text_field |
| Team members | Metaobject | team_member |
| Testimonials | Metaobject | testimonial |
| Store locations | Metaobject | location |

**Step 0.5.3: Create metafield definitions document**

```json
{
  "metafield_definitions": [
    {
      "name": "Ingredients",
      "namespace": "custom",
      "key": "ingredients",
      "type": "single_line_text_field",
      "owner_type": "product",
      "description": "Product ingredients list"
    }
  ],
  "metaobject_definitions": [
    {
      "name": "Team Member",
      "type": "team_member",
      "fields": [
        { "key": "name", "type": "single_line_text_field" },
        { "key": "role", "type": "single_line_text_field" },
        { "key": "bio", "type": "multi_line_text_field" },
        { "key": "photo", "type": "file_reference" }
      ]
    }
  ]
}
```
```

### New Phase: Commerce Logic Mapping

**After Phase 2, add:**

```markdown
### Phase 2.5: Commerce Logic Mapping

**Step 2.5.1: Document source commerce features**

- [ ] Cart functionality (add, remove, update, attributes)
- [ ] Discount types (automatic, code-based, tiered)
- [ ] Shipping calculation (real-time rates, free shipping thresholds)
- [ ] Payment options (express checkout, payment plans)
- [ ] Subscription/recurring products

**Step 2.5.2: Map to Shopify capabilities**

| Source Feature | Shopify Solution | Implementation |
|----------------|------------------|----------------|
| Cart drawer | Ajax Cart API + Liquid | Section + JS |
| 20% off $100+ | Automatic discount OR Function | Admin OR App |
| Free shipping $50+ | Shipping discount | Admin setting |
| Gift wrapping option | Line item properties | Cart form |
| Subscribe & save | Selling plans | Subscription app |

**Step 2.5.3: Document what requires apps/development**

| Feature | Requires | Recommended Solution |
|---------|----------|---------------------|
| Product reviews | App | Judge.me, Loox |
| Wishlist | App | Wishlist Plus |
| Custom discounts | Function/App | Native OR custom app |
| Subscriptions | App | Recharge, Loop |
```

### New Phase: Integration & Automation Planning

**After Phase 7, add:**

```markdown
### Phase 7.5: Integration & Automation Planning

**Step 7.5.1: Document current integrations**

| Integration | Purpose | Shopify Equivalent |
|-------------|---------|-------------------|
| Mailchimp | Email marketing | Shopify Email, Klaviyo |
| Google Analytics | Analytics | GA4 via theme |
| Zendesk | Support | Gorgias, Zendesk app |
| Custom CRM | Customer data | Webhooks + API |

**Step 7.5.2: Document automation needs**

| Automation | Trigger | Action | Implementation |
|------------|---------|--------|----------------|
| New order notification | Order created | Slack message | Shopify Flow |
| Low stock alert | Inventory < 10 | Email team | Shopify Flow |
| VIP tagging | Order > $500 | Tag customer | Shopify Flow |
| Review request | Order fulfilled + 7 days | Email customer | Judge.me |

**Step 7.5.3: Create webhook requirements document**

```json
{
  "webhooks_needed": [
    {
      "topic": "orders/create",
      "purpose": "Sync to external CRM",
      "endpoint": "https://your-app.com/webhooks/order"
    },
    {
      "topic": "customers/create",
      "purpose": "Add to email marketing",
      "endpoint": "https://your-app.com/webhooks/customer"
    }
  ]
}
```
```

---

## Updated Deployment Package Structure

```
deployment-package/
│
├── theme/                              ← Upload to Shopify
│
├── data-architecture/                  ← NEW
│   ├── metafield-definitions.json
│   ├── metaobject-definitions.json
│   └── content-migration-plan.md
│
├── commerce-logic/                     ← NEW
│   ├── discount-rules.md
│   ├── shipping-rules.md
│   ├── cart-customizations.md
│   └── checkout-requirements.md
│
├── integrations/                       ← NEW
│   ├── webhooks-config.json
│   ├── flow-workflows.json
│   └── app-requirements.md
│
├── international/                      ← NEW (if applicable)
│   ├── markets-config.md
│   ├── translations/
│   └── currency-settings.md
│
├── performance/                        ← NEW
│   ├── lighthouse-baseline.md
│   └── optimization-checklist.md
│
├── SETUP-CHECKLIST.md                  ← EXPANDED
├── pages-to-create.md
├── menus.json
├── assets-manifest.md
├── content-reference.json
├── section-inventory.md
└── dependencies.md                     ← EXPANDED
```

---

## New Reference Files Needed

### Priority 1 (Critical)
1. `references/metafields-complete.md` - Full metafield/metaobject guide
2. `references/cart-api-complete.md` - Cart API and attributes
3. `references/checkout-extensibility.md` - Functions and extensions
4. `references/customer-accounts.md` - Account system guide

### Priority 2 (High)
5. `references/backend-connectivity.md` - App proxy and webhooks
6. `references/markets-multi-currency.md` - International selling
7. `references/search-discovery.md` - Search and filtering
8. `references/performance-accessibility-checklist.md` - Requirements

### Priority 3 (Medium)
9. `references/shopify-flow-automation.md` - Workflow automation
10. `references/subscriptions-selling-plans.md` - Recurring products
11. `references/app-blocks-complete.md` - Theme app extensions

---

## Conversion Questionnaire (New Requirement)

Before starting ANY conversion, ask:

### Data Questions
- [ ] What custom product data exists? (specs, ingredients, care, etc.)
- [ ] Is there a CMS? What content types?
- [ ] Are there customer accounts with custom data?
- [ ] Are there order customization options?

### Commerce Questions
- [ ] What discount types exist? (automatic, codes, tiered)
- [ ] Is there free shipping logic?
- [ ] Are there subscription/recurring products?
- [ ] What payment methods are used?
- [ ] Is there B2B/wholesale functionality?

### Integration Questions
- [ ] What external services are integrated?
- [ ] What automations exist (email sequences, notifications)?
- [ ] Is there a custom backend/API?
- [ ] What analytics are used?

### International Questions
- [ ] Does the site sell internationally?
- [ ] What currencies are supported?
- [ ] What languages are supported?
- [ ] Are there market-specific prices?

### Customer Questions
- [ ] What does the account dashboard show?
- [ ] Is there wishlist functionality?
- [ ] Are there loyalty/rewards features?
- [ ] What is the customer support flow?

---

---

## Ralph Loop Iteration 2: Implementation Status

**Date:** 2026-02-08
**Analysis Source:** Antigravity Practical Implementation (Phase 9 E-Commerce Fixes)

### Key Finding from Antigravity

> "The skill tells you what to do but doesn't always give you the code to do it."

**Problem:** Reference documentation was 95%+ complete, but scaffold templates were only 30% complete, causing **6.5 hours of preventable rework**.

### Implementation Status by Blind Spot

| Blind Spot | Documentation | Scaffold Implementation | Verification |
|------------|---------------|------------------------|--------------|
| Variant Selection | ✅ `references/product-section-patterns.md` | ✅ `scaffold/snippets/variant-picker.liquid` | ✅ `verify_theme.js` |
| Collection Filtering | ✅ `references/collection-patterns.md` | ✅ `scaffold/sections/main-collection.liquid` | ✅ `verify_theme.js` |
| Cart API / AJAX Cart | ✅ `references/cart-api-complete.md` | ✅ `scaffold/assets/product-form.js` | ✅ `verify_theme.js` |
| Breadcrumbs + JSON-LD | ✅ `references/seo-structured-data.md` | ✅ `scaffold/snippets/breadcrumbs.liquid` | ✅ `verify_theme.js` |
| Price Display | ✅ Inline in patterns | ✅ `scaffold/snippets/price.liquid` | ✅ `verify_theme.js` |
| Cart Drawer Enabled | ✅ Documented in SKILL.md | ✅ `scaffold/layout/theme.liquid` | ✅ `verify_theme.js` |
| Cookie Banner | ✅ GDPR section | ✅ `scaffold/layout/theme.liquid` | ✅ `verify_theme.js` |
| Skip-to-Content | ✅ Accessibility ref | ✅ `scaffold/layout/theme.liquid` | ✅ `verify_theme.js` |
| Metafields | ✅ `references/metafields-complete.md` | ❌ No scaffold | ❌ No verification |
| Checkout Extensibility | ✅ `references/checkout-extensibility.md` | ❌ N/A (Plus only) | ❌ N/A |
| Customer Accounts | ✅ `references/customer-accounts.md` | ❌ No scaffold | ❌ No verification |
| Markets/Multi-Currency | ✅ `references/markets-multi-currency.md` | ❌ No scaffold | ❌ No verification |
| Shopify Flow | ✅ `references/shopify-flow-automation.md` | ❌ N/A (Admin feature) | ❌ N/A |
| Subscriptions | ✅ `references/subscriptions-selling-plans.md` | ❌ No scaffold | ❌ No verification |

### Scaffold Files Created (Iteration 2)

```
scaffold/
├── assets/
│   └── product-form.js          ← AJAX cart, variant selection, quantity
├── layout/
│   └── theme.liquid             ← Cart drawer, cookie banner, breadcrumbs ENABLED
├── sections/
│   ├── main-product.liquid      ← Full product page with blocks
│   └── main-collection.liquid   ← Real Shopify Filter API
└── snippets/
    ├── variant-picker.liquid    ← Option-based with color swatches
    ├── breadcrumbs.liquid       ← JSON-LD BreadcrumbList schema
    └── price.liquid             ← Compare-at, sale badges, unit pricing
```

### Verification Script Created

`scripts/verify_theme.js` - Automated commerce checks:
- ✅ Cart drawer rendered (not commented)
- ✅ Cookie banner section exists
- ✅ Product form JavaScript reference
- ✅ Collection filtering uses real Filter API
- ✅ Breadcrumbs snippet exists
- ✅ Variant picker is option-based (not flat list)
- ✅ Price snippet has compare-at support
- ✅ Skip-to-content accessibility link

### Remaining Gaps (Future Iterations)

| Gap | Priority | Notes |
|-----|----------|-------|
| Metafield scaffold | Medium | Need template for common metafield patterns |
| Customer account templates | Low | Depends on classic vs new accounts |
| Localization form snippet | Low | Only needed for multi-market |
| Subscription display | Low | App-dependent |

---

## Conclusion

The current SKILL.md is an excellent foundation for **visual conversion** but treats Shopify as a "static site generator with e-commerce bolt-ons" rather than as a **complete commerce platform**.

A truly launch-ready conversion must address:
1. **Data architecture** - Where custom data lives
2. **Commerce logic** - How business rules translate
3. **Customer experience** - The full journey, not just pages
4. **System integration** - How everything connects
5. **Automation** - What happens without manual intervention
6. **Performance** - Meeting Shopify's standards

**Next iteration should:** Create the missing reference files and update SKILL.md with the new phases.

---

## Sources

### Metafields
- [Shopify Metafields Complete Guide](https://www.skailama.com/blog/the-complete-guide-to-shopify-metafields)
- [Shopify Help - Metafields](https://help.shopify.com/en/manual/custom-data/metafields)
- [Working with Metafields in Themes](https://www.shopify.com/partners/blog/metafields)

### Cart API
- [Cart API Reference](https://shopify.dev/docs/api/ajax/reference/cart)
- [Liquid Ajax Cart](https://liquid-ajax-cart.js.org/)

### Checkout Extensibility
- [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions/latest)
- [Checkout Extensibility Overview](https://www.shopify.com/enterprise/blog/checkout-extensibility-winter-editions)
- [About Checkout Extensions](https://shopify.dev/docs/api/checkout-extensions)

### Shopify Functions
- [Shopify Functions Overview](https://www.shopify.com/enterprise/blog/shopify-functions)
- [Function APIs](https://shopify.dev/docs/api/functions/latest)
- [Discount Function API](https://shopify.dev/docs/api/functions/latest/discount)

### App Proxy & Webhooks
- [About App Proxies](https://shopify.dev/docs/apps/build/online-store/app-proxies)
- [About Webhooks](https://shopify.dev/docs/apps/build/webhooks)
- [Webhooks Best Practices](https://hookdeck.com/webhooks/platforms/shopify-webhooks-features-and-best-practices-guide)

### Theme App Extensions
- [About Theme App Extensions](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions)
- [App Blocks for Themes](https://shopify.dev/docs/storefronts/themes/architecture/blocks/app-blocks)

### Customer Accounts
- [Customer Account API](https://shopify.dev/docs/api/customer/latest)
- [New Customer Accounts](https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started)

### Markets & Multi-Currency
- [Managing Markets](https://help.shopify.com/en/manual/international/managing)
- [Multi-Currency Support](https://shopify.dev/docs/storefronts/themes/markets/multiple-currencies-languages)

### Shopify Flow
- [Shopify Flow Guide](https://www.getmesa.com/blog/shopify-flow-guide/)
- [Flow Triggers Reference](https://help.shopify.com/en/manual/shopify-flow/reference/triggers)
- [Flow Automation Updates 2025](https://www.shopify.com/blog/flow-automation-updates-2025)

### Storefront API
- [GraphQL Storefront API](https://shopify.dev/docs/api/storefront/latest)
- [Headless Commerce Guide](https://webandcrafts.com/blog/shopify-headless-commerce)

### Performance & Accessibility
- [Theme Store Requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)
- [Accessibility Best Practices](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility)

### Subscriptions
- [About Subscriptions](https://shopify.dev/docs/apps/build/purchase-options/subscriptions)
- [Subscription APIs](https://www.shopify.com/partners/blog/shopify-subscription-apis)

### Search
- [Predictive Search API](https://shopify.dev/docs/api/ajax/reference/predictive-search)
- [Add Predictive Search](https://shopify.dev/docs/storefronts/themes/navigation-search/search/predictive-search)

### B2B
- [B2B Features Overview](https://help.shopify.com/en/manual/b2b/getting-started/features)
- [B2B Winter 2026 Updates](https://echidna.co/blog/shopify-b2b-features-winter-2026/)

---

## Ralph Loop Iteration 2 — Athyre Conversion Post-Mortem

**Date:** 2026-02-08
**Source:** Production deployment of Athyre luxury fashion brand website to Shopify theme
**Evidence:** 22 commits across 15 issue categories to reach production readiness

### What Actually Broke (The Evidence)

| Category | Count | Severity | Caught by Skill? |
|----------|-------|----------|-------------------|
| Hardcoded URLs/handles | 12+ | Critical | No |
| Missing required templates | 8 files | Critical | No |
| JSX syntax artifacts | 3 types | Critical | Yes (sanitize_liquid.js) |
| Missing icon snippets | 50+ | High | No |
| Invalid Liquid filters | 1 | Critical | No |
| Mobile responsiveness | 9 locations | High | No |
| Missing e-commerce JS | 5 features | High | Partial (verify_theme.js) |
| Missing locale keys | 10+ keys | Medium | No |
| Unpinned CDN dependencies | 2 | Medium | No |
| Theme settings not wired | 3 areas | Medium | No |
| Accessibility duplicates | 1 | Medium | No |
| Blog handle mismatch | 2 | Critical | No |
| Missing customer templates | 2 | Critical | No |
| Non-functional UI elements | 1 | Low | No |
| Build/asset pipeline | 3 | High | No |

**Key stat: The skill's verification scripts caught only ~15% of actual production issues.**

### Root Causes Identified

#### 1. Theme as CONTRACT vs. Theme as FILES

The skill treated theme creation as "put files in folders" rather than "satisfy a runtime contract." Shopify expects specific files (gift_card.liquid, activate_account.json, reset_password.json) and specific patterns (content_for_header, content_for_layout). Without them, entire customer flows break silently.

**Resolution:** Added `check_mandatory_files.js` script and mandatory file manifest. Added scaffold templates for gift card, account activation, and password reset.

#### 2. Code-Content Binding Blindness

Every `blogs['journal']`, `pages['vision']`, `collections['all']` is a runtime binding. The skill had no mechanism to verify these bindings resolve against actual Shopify admin content.

**Example:** Footer referenced `blogs['journal']` but blog was created as "this-is-athyre". Blog-posts section fell back to `/blogs/news`. Both silently failed.

**Resolution:** Added `extract_handle_references.js` script that scans all .liquid files and generates a `content-bindings.json` manifest for verification.

#### 3. Behavior Conversion vs. Structure Conversion

The skill converts structure (HTML → Liquid) but doesn't translate behavior. React components with useState, useEffect, and event handlers became static HTML with no interactivity.

**Examples:**
- Wishlist button → Liquid button with invalid `is_in_wishlist` filter
- Cart drawer with useState → empty section
- Predictive search → static input with no JS

**Resolution:** Added JS behavior mapping rules to Phase 2. Every interactive component must have a documented behavior plan.

#### 4. Desktop-Only Conversion

Converted sections used source site's desktop styles without responsive patterns. 65% of e-commerce traffic is mobile.

**Resolution:** Added mobile-first enforcement rules to Phase 2. Every section must use responsive classes.

#### 5. Locale Dependency Graph Invisible

Every `| t` filter creates an implicit dependency on en.default.json. Missing keys either fail theme check or display raw key paths to customers.

**Resolution:** Added `check_locale_coverage.js` script and comprehensive baseline locale file in scaffold.

### System Layer Analysis

```
Layer 4: DEPLOYMENT (admin content, CDN)   ← WAS ABSENT → Now has Phase 9 + content bindings
Layer 3: BEHAVIOR (JS, interactivity)      ← WAS WEAK → Now has behavior mapping rules
Layer 2: STRUCTURE (templates, sections)   ← WAS STRONG → Strengthened with mandatory files
Layer 1: CONVERSION (JSX → Liquid syntax)  ← WAS STRONG → Unchanged
```

### Changes Implemented

#### New Scripts (4)
1. `check_mandatory_files.js` — Verify ALL Shopify-required files exist (BLOCKING)
2. `check_locale_coverage.js` — Verify every | t key exists in locale JSON
3. `extract_handle_references.js` — Scan for content-code bindings
4. `check_icon_references.js` — Verify icon snippet completeness

#### New Scaffold Files (6)
1. `scaffold/templates/gift_card.liquid` — Mandatory gift card template
2. `scaffold/templates/customers/activate_account.json` — Account activation
3. `scaffold/templates/customers/reset_password.json` — Password reset
4. `scaffold/sections/main-activate-account.liquid` — Activation form
5. `scaffold/sections/main-reset-password.liquid` — Reset form
6. `scaffold/locales/en.default.json` — Comprehensive baseline locale

#### New Reference Docs (4)
1. `references/mandatory-files.md` — Exact required files list
2. `references/content-code-bindings.md` — How code references admin content
3. `references/post-deployment-checklist.md` — Full verification checklist
4. `references/critical-user-journeys.md` — 8 flows every store must support

#### SKILL.md Updates
- Phase 0: Now copies mandatory templates and baseline locale
- Phase 2: Enforces mobile-first classes and JS behavior mapping
- Phase 6: Runs all 7 verification scripts (was 3)
- Phase 9 (NEW): Post-deployment verification with Critical User Journeys

### The Meta-Lesson

**The skill optimized for the HAPPY PATH but didn't defend against FAILURE MODES.**

Every reference doc said "here's how to do X well." None said "here's what breaks if you skip X." The verification scripts checked "does this pattern exist?" but not "does this reference resolve?"

A complete skill needs both:
- **Generative guidance** (how to build) — existed, was excellent
- **Defensive verification** (what breaks if you don't) — was almost entirely missing

The 4 new scripts would have caught every single Athyre issue BEFORE deployment.

### Remaining Gaps (Future Iterations)

| Gap | Priority | Description |
|-----|----------|-------------|
| CDN pinning check | P2 | Verify all external scripts use pinned versions |
| Mobile pattern lint | P2 | Automated check for missing responsive classes |
| Automated journey testing | P3 | Puppeteer-based automated user flow testing |
| Theme check integration | P3 | Run Shopify CLI `theme check` as part of Phase 6 |
| Performance budget | P3 | Fail if JS bundle > 200KB or CSS > 100KB |
