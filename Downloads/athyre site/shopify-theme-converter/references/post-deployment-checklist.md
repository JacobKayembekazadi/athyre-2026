# Post-Deployment Verification Checklist

## Purpose

Going from "files uploaded" to "store is production-ready" requires verifying real customer flows against live data. This checklist catches the issues that file-level validation cannot — content mismatches, broken flows, mobile issues, and performance problems.

**This is Phase 9 of the conversion workflow.** It is NOT optional.

---

## Pre-Verification Setup

- [ ] Theme is uploaded to a **development store** (not live)
- [ ] Sample products are created (at least 3, with variants and images)
- [ ] At least one collection exists with products
- [ ] Blog exists with at least one article
- [ ] Key pages exist (About, Contact, any referenced in footer)
- [ ] Navigation menus are configured (main menu + footer)
- [ ] Customer accounts are enabled

---

## 1. Critical User Journeys (MUST PASS)

### Journey 1: Product Discovery → Purchase

- [ ] Homepage loads with correct hero/featured content
- [ ] Click a product → product page loads with images, price, variants
- [ ] Select a variant → price updates, correct variant selected
- [ ] Click "Add to Cart" → cart drawer opens with correct item
- [ ] Navigate to cart page → item displays correctly
- [ ] Click "Checkout" → redirects to Shopify checkout

### Journey 2: Collection Browsing

- [ ] Collection page loads with products
- [ ] Filters work (price, color, size — whatever is configured)
- [ ] Sort works (price low-high, new arrivals, etc.)
- [ ] Pagination or infinite scroll works
- [ ] Collection banner/header displays correctly

### Journey 3: Search

- [ ] Search icon/bar is accessible from any page
- [ ] Typing shows predictive search results
- [ ] Search results page displays matches
- [ ] "No results" state works for nonsense queries

### Journey 4: Customer Account

- [ ] Login page loads and form submits
- [ ] Registration page loads and form submits
- [ ] Account page shows order history (or "no orders" message)
- [ ] Address management works (add/edit/delete)
- [ ] Password reset flow completes end-to-end
- [ ] Account activation link (if tested) reaches activate_account page

### Journey 5: Gift Card (if applicable)

- [ ] Gift card product page loads
- [ ] After purchase, gift card page renders (uses `gift_card.liquid`)
- [ ] Gift card code displays and "Copy" button works
- [ ] QR code displays

---

## 2. Navigation & Links

- [ ] All main menu links go to valid pages (no 404s)
- [ ] All footer links go to valid pages (no 404s)
- [ ] Logo links to homepage
- [ ] Breadcrumbs show correct hierarchy
- [ ] "Continue Shopping" links work from cart/empty states
- [ ] Blog links go to correct blog (verify handle matches)

### Handle Verification

Run the content binding extractor and verify every handle:

```bash
node scripts/extract_handle_references.js ./deployment-package/theme
```

- [ ] Every blog handle referenced in code exists in admin
- [ ] Every page handle referenced in code exists in admin
- [ ] Every collection handle referenced in code exists in admin
- [ ] Every menu handle referenced in code exists in admin
- [ ] No hardcoded URL paths that should use Liquid objects

---

## 3. Mobile Responsiveness

Test on a real device or Chrome DevTools mobile emulation (iPhone 14, Galaxy S21).

- [ ] Header: logo, menu icon, cart icon all visible and tappable
- [ ] Mobile menu opens and closes, all links work
- [ ] Hero section: text is readable, CTA is tappable
- [ ] Product page: images swipe, variant buttons are tappable
- [ ] Cart drawer: items visible, quantity controls work
- [ ] Footer: all sections stack vertically, links are tappable
- [ ] No horizontal scroll on any page
- [ ] Text is minimum 16px on mobile (no zoom required)
- [ ] Touch targets are minimum 44x44px

---

## 4. Browser Console Check

Open DevTools Console on every major page and check for:

- [ ] No Liquid errors (look for `Liquid error:` in rendered HTML)
- [ ] No 404 errors for assets (JS, CSS, images)
- [ ] No JavaScript errors in console
- [ ] No mixed content warnings (HTTP resources on HTTPS page)
- [ ] No CORS errors

---

## 5. Performance (Lighthouse)

Run Lighthouse in Chrome DevTools → Lighthouse tab → Mobile → Performance.

- [ ] Performance score > 60 (target > 80)
- [ ] First Contentful Paint < 2.5s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.25
- [ ] No render-blocking resources that can be deferred
- [ ] Images are lazy-loaded (except above-the-fold)
- [ ] No unused JavaScript > 100KB

---

## 6. Accessibility

- [ ] Skip to content link works (Tab key from top of page)
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible for keyboard navigation
- [ ] ARIA labels on interactive elements (cart button, menu toggle)

---

## 7. SEO & Meta

- [ ] `<title>` tag is unique per page
- [ ] `<meta name="description">` exists on key pages
- [ ] Canonical URLs are set
- [ ] Open Graph tags render (check with Facebook Sharing Debugger)
- [ ] JSON-LD structured data is present (Product, BreadcrumbList)

---

## 8. Theme-Specific Features

- [ ] Cookie consent banner appears on first visit
- [ ] Newsletter popup/form works
- [ ] Wishlist functionality works (add/remove/persist)
- [ ] Recently viewed products populate after viewing products
- [ ] Announcement bar displays (if configured)
- [ ] Localization selector works (if multi-market)

---

## 9. Edge Cases

- [ ] Empty cart state looks correct
- [ ] Empty collection state shows appropriate message
- [ ] 404 page renders correctly (visit /pages/nonexistent)
- [ ] Password page renders (if store is password-protected)
- [ ] Product with no images displays gracefully
- [ ] Very long product titles don't break layout
- [ ] Products with 1 variant don't show variant selector

---

## Sign-Off

| Check Category | Status | Notes |
|---------------|--------|-------|
| Critical User Journeys | Pass / Fail | |
| Navigation & Links | Pass / Fail | |
| Mobile Responsiveness | Pass / Fail | |
| Browser Console | Pass / Fail | |
| Performance | Score: __ | |
| Accessibility | Pass / Fail | |
| SEO & Meta | Pass / Fail | |
| Theme Features | Pass / Fail | |
| Edge Cases | Pass / Fail | |

**Verified by:** ________________
**Date:** ________________
**Ready for production:** Yes / No
