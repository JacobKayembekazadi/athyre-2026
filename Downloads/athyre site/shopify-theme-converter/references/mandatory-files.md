# Mandatory Files for a Shopify Theme

A theme is a **contract with Shopify's runtime**. Without these exact files, pages will 404, customer flows will break, and theme check will reject your submission.

This is NOT a "best practices" list. These are **hard requirements**.

---

## Layout Files

| File | Why It's Required |
|------|-------------------|
| `layout/theme.liquid` | Master layout wrapping every page. Must contain `{{ content_for_header }}` and `{{ content_for_layout }}`. |

### theme.liquid Must-Haves

```liquid
{{ content_for_header }}  {%- comment -%}Shopify injects analytics, checkout, etc.{%- endcomment -%}
{{ content_for_layout }}  {%- comment -%}The page content renders here{%- endcomment -%}
```

Without `content_for_header`, checkout won't work. Without `content_for_layout`, no page renders.

---

## Core Page Templates

| File | Why It's Required |
|------|-------------------|
| `templates/index.json` | Homepage — the first thing customers see |
| `templates/product.json` | Product detail page — required for any product URL to work |
| `templates/collection.json` | Collection listing — required for browsing products |
| `templates/cart.json` | Shopping cart — required for the checkout flow |
| `templates/page.json` | Generic page — used for About, Contact, legal pages |
| `templates/blog.json` | Blog listing — required if the store has any blog |
| `templates/article.json` | Individual blog post — required for blog post URLs |
| `templates/list-collections.json` | Collections directory page |
| `templates/search.json` | Search results page |
| `templates/404.json` | 404 error page — shown when URL doesn't exist |
| `templates/password.json` | Password page — shown when store is locked |

---

## Gift Card Template (SPECIAL CASE)

| File | Why It's Required |
|------|-------------------|
| `templates/gift_card.liquid` | **MUST be `.liquid`, NOT `.json`** — Shopify requires this format |

This is the page customers see when they click "View gift card" from their email. Without it, gift card recipients get a blank page or error.

**Common mistake:** Creating `templates/gift_card.json` instead of `.liquid`. Shopify will silently ignore the JSON version.

---

## Customer Account Templates

These are required if customer accounts are enabled (which they are by default in most stores).

| File | Why It's Required |
|------|-------------------|
| `templates/customers/account.json` | Customer dashboard — order history, account info |
| `templates/customers/login.json` | Login page — customer authentication |
| `templates/customers/register.json` | Registration page — new customer signup |
| `templates/customers/order.json` | Order detail page — viewing past orders |
| `templates/customers/addresses.json` | Address management |
| `templates/customers/activate_account.json` | **Account activation** — sent via email when merchant creates a customer. Without this, invited customers CANNOT activate their account. |
| `templates/customers/reset_password.json` | **Password reset** — the "Forgot password" flow leads here. Without this, customers CANNOT reset their password. |

### Why activate_account and reset_password are critical

When a merchant manually creates a customer in Shopify admin, the customer receives an email with an activation link. That link points to `/account/activate/<token>`. If `activate_account.json` doesn't exist, the customer sees a blank or broken page and **cannot create their password**.

Same for password reset: the "Forgot password?" link sends an email pointing to `/account/reset/<token>`. If `reset_password.json` doesn't exist, the flow is broken.

---

## Configuration Files

| File | Why It's Required |
|------|-------------------|
| `config/settings_schema.json` | Defines theme customization options in Shopify admin |
| `config/settings_data.json` | Default values for theme settings |

---

## Locale Files

| File | Why It's Required |
|------|-------------------|
| `locales/en.default.json` | Default English locale — every `| t` filter resolves from this file |

Without this file, all translation keys render as raw key paths (e.g., customers see `products.product.add_to_cart` instead of "Add to Cart").

---

## Essential Sections

These sections are directly referenced by templates or layout and MUST exist:

| File | Why It's Required |
|------|-------------------|
| `sections/header.liquid` | Site navigation — on every page |
| `sections/footer.liquid` | Site footer — on every page |
| `sections/main-product.liquid` | Product page content |
| `sections/main-collection.liquid` | Collection page content |
| `sections/main-cart.liquid` | Cart page content |
| `sections/main-activate-account.liquid` | Activation form |
| `sections/main-reset-password.liquid` | Password reset form |

---

## Verification

Run the mandatory files check script:

```bash
node scripts/check_mandatory_files.js ./deployment-package/theme
```

This will output PASS/FAIL for each file and exit with code 1 if any critical files are missing.

---

## What Happens When Files Are Missing

| Missing File | Symptom |
|-------------|---------|
| `gift_card.liquid` | Customer clicks gift card email link → blank page |
| `activate_account.json` | New customer can't activate account → can never log in |
| `reset_password.json` | "Forgot password" flow → dead end |
| `en.default.json` | All text shows raw key paths: `customer.login.title` |
| `main-product.liquid` | Product pages show empty content area |
| `header.liquid` | Every page has no navigation |
| `settings_schema.json` | Theme editor shows no customization options |
