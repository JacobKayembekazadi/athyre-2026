# Critical User Journeys

## Why This Matters

Every Shopify store must support these 8 user journeys. If ANY journey is broken, the store loses revenue or trust. These journeys are the **minimum acceptance criteria** for a converted theme.

"It renders" is not the same as "it works."

---

## Journey 1: Browse → Buy (The Revenue Path)

### Steps
1. Customer lands on homepage
2. Clicks featured product or browses collection
3. Views product page (images, description, price)
4. Selects variant (size, color)
5. Clicks "Add to Cart"
6. Reviews cart (cart drawer or cart page)
7. Clicks "Checkout"
8. Completes Shopify checkout

### What Must Work
- Product images load and are navigable (gallery/carousel)
- Variant selector updates price and shows availability
- "Add to Cart" triggers cart API and shows feedback
- Cart displays line items with correct quantities/prices
- "Checkout" redirects to `{{ routes.cart_url }}` or Shopify checkout

### Common Conversion Failures
- Variant selector uses flat dropdown instead of option-based picker
- "Add to Cart" button has no JavaScript handler (React onClick wasn't converted)
- Cart drawer is commented out in theme.liquid
- Price doesn't update on variant change

### Required Files
- `sections/main-product.liquid` with variant picker
- `assets/product-form.js` with AJAX cart logic
- `sections/cart-drawer.liquid` (or `templates/cart.json`)
- `snippets/variant-picker.liquid`
- `snippets/price.liquid`

---

## Journey 2: Search → Find → Buy

### Steps
1. Customer clicks search icon
2. Types product name
3. Sees predictive results dropdown
4. Clicks a result (or presses Enter for full results)
5. Views product → adds to cart

### What Must Work
- Search input is accessible from header
- Predictive search API returns results with debounce
- Search results page shows relevant products
- "No results" state shows helpful message

### Required Files
- `assets/predictive-search.js`
- `sections/predictive-search-results.liquid` (or inline in header)
- `templates/search.json`
- `sections/main-search.liquid`

---

## Journey 3: Collection Browsing with Filters

### Steps
1. Customer navigates to a collection
2. Applies filter (e.g., size: Medium, color: Black)
3. Results update to show matching products
4. Applies sort (e.g., Price: Low to High)
5. Browses paginated results

### What Must Work
- `collection.filters` Liquid API is used (not mock dropdowns)
- Filter selection updates URL and results
- Active filters are shown with "Clear" option
- Sort dropdown uses Shopify's sort options
- Pagination works

### Common Conversion Failures
- Filters are static HTML from the source site (don't connect to Shopify Filter API)
- Sort is a mock dropdown that doesn't change results
- Pagination hardcodes page numbers instead of using Shopify pagination

### Required Files
- `sections/main-collection.liquid` with `collection.filters` loop
- Real filter form that submits to `collection.url`

---

## Journey 4: Customer Registration → Login → Account

### Steps
1. Customer clicks "Account" or "Sign In"
2. Registers with email/password
3. Receives confirmation email
4. Logs in
5. Views account dashboard (orders, addresses)
6. Logs out

### What Must Work
- Registration form submits to Shopify customer API
- Login form authenticates and redirects to account
- Account page shows order history
- Address management works (add/edit/delete)
- Logout redirects to homepage or login page

### Required Files
- `templates/customers/login.json`
- `templates/customers/register.json`
- `templates/customers/account.json`
- `templates/customers/addresses.json`
- `templates/customers/order.json`
- Corresponding `sections/main-*.liquid` for each

---

## Journey 5: Password Reset

### Steps
1. Customer clicks "Forgot password?" on login page
2. Enters email address
3. Receives reset email from Shopify
4. Clicks link in email → lands on reset password page
5. Enters new password
6. Successfully logs in with new password

### What Must Work
- "Forgot password?" link triggers `recover_customer_password` form
- Success message shows after form submission
- Reset link in email resolves to a working page
- Password reset form submits and redirects to login

### Required Files
- `templates/customers/reset_password.json`
- `sections/main-reset-password.liquid` with `reset_customer_password` form tag

---

## Journey 6: Account Activation (Merchant-Created Customers)

### Steps
1. Merchant creates customer in Shopify admin
2. Customer receives activation email
3. Clicks activation link → lands on activate account page
4. Creates password
5. Successfully logs in

### What Must Work
- Activation link resolves to a working page
- Form accepts password + password confirmation
- "Decline Invitation" option works
- Successful activation redirects to account or login

### Required Files
- `templates/customers/activate_account.json`
- `sections/main-activate-account.liquid` with `activate_customer_password` form tag

---

## Journey 7: Gift Card Redemption

### Steps
1. Customer receives gift card (purchased by someone else, or from merchant)
2. Opens gift card email
3. Clicks "View gift card" link
4. Sees gift card with code, balance, QR code
5. Copies code or adds to Apple Wallet
6. Uses code at checkout

### What Must Work
- Gift card page renders (uses `gift_card.liquid`, NOT `.json`)
- Balance displays correctly
- Code is copyable
- QR code generates
- "Add to Apple Wallet" link works (if available)
- Print button works

### Required Files
- `templates/gift_card.liquid` (MUST be `.liquid` format)

---

## Journey 8: Blog Reading

### Steps
1. Customer navigates to blog (from menu or link)
2. Sees blog listing with articles
3. Clicks an article
4. Reads article content
5. Navigates to next/previous article or back to blog

### What Must Work
- Blog listing shows articles with excerpts and images
- Article page shows full content with author/date
- Navigation between articles works
- Blog handle in code matches admin blog handle

### Common Conversion Failures
- Code references `blogs['journal']` but blog handle is different
- Blog listing section falls back to `/blogs/news` hardcoded URL
- Article images don't render (wrong image handling)

### Required Files
- `templates/blog.json`
- `templates/article.json`
- `sections/main-blog.liquid`
- `sections/main-article.liquid`

---

## Journey Verification Matrix

Use this matrix during post-deployment verification:

| Journey | Status | Blocker? | Notes |
|---------|--------|----------|-------|
| 1. Browse → Buy | | Yes | |
| 2. Search → Find → Buy | | Yes | |
| 3. Collection Filtering | | Yes | |
| 4. Registration → Login → Account | | Yes | |
| 5. Password Reset | | Yes | |
| 6. Account Activation | | Yes | |
| 7. Gift Card Redemption | | If gift cards sold | |
| 8. Blog Reading | | If blog exists | |

All "Yes" blockers must pass before going live.
