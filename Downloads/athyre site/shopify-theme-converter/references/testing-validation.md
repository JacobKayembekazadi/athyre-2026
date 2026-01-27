# Testing & Validation

Guide for testing Shopify themes before deployment.

## Pre-Deployment Checklist

### Theme Requirements

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Valid JSON | Theme Check | No JSON errors |
| Valid Liquid | Theme Check | No Liquid errors |
| No deprecated features | Theme Check | No deprecations |
| Performance | Lighthouse | Score > 70 |
| Accessibility | Lighthouse | Score > 90 |

---

## Theme Check CLI

### Installation

```bash
# Install via gem
gem install theme-check

# Or via Homebrew
brew install shopify/shopify/theme-check
```

### Running Checks

```bash
# Run in theme directory
theme-check

# Check specific path
theme-check ./sections

# Auto-fix issues
theme-check --auto-correct

# Output as JSON
theme-check --output json > report.json
```

### Configuration

Create `.theme-check.yml`:

```yaml
# .theme-check.yml
root: "."

# Ignore specific checks
DeprecateLazysizes:
  enabled: false

# Customize severity
MissingTemplate:
  severity: error

# Ignore files
ignore:
  - "node_modules/**"
  - "vendor/**"
```

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `MissingRequiredTemplateFiles` | Add required templates (404, cart, etc.) |
| `DeprecatedTag` | Replace `{% include %}` with `{% render %}` |
| `LiquidTag/ParserError` | Fix Liquid syntax |
| `ImgWidthAndHeight` | Add width/height to images |
| `RemoteAsset` | Host assets on Shopify CDN |

---

## Manual Testing Checklist

### Homepage

- [ ] Hero section loads correctly
- [ ] All images display
- [ ] Animations work (if applicable)
- [ ] CTAs link correctly
- [ ] Featured products/collections load
- [ ] Newsletter form submits

### Collection Page

- [ ] Products display in grid
- [ ] Pagination works
- [ ] Filters apply correctly
- [ ] Sort options work
- [ ] Empty collection shows message
- [ ] Product cards link to products

### Product Page

- [ ] All product images display
- [ ] Variant selection updates:
  - [ ] Price
  - [ ] Images
  - [ ] Availability
  - [ ] SKU
- [ ] Add to cart works
- [ ] Quantity selector works
- [ ] Out of stock disabled
- [ ] Related products display

### Cart

- [ ] Items display correctly
- [ ] Quantity updates work
- [ ] Remove item works
- [ ] Cart totals are accurate
- [ ] Discounts apply
- [ ] Proceed to checkout works

### Search

- [ ] Search form submits
- [ ] Results display
- [ ] No results shows message
- [ ] Product links work

### Customer Accounts

- [ ] Login form works
- [ ] Register form works
- [ ] Password reset works
- [ ] Order history displays
- [ ] Address management works

---

## Responsive Testing

### Breakpoints to Test

| Device | Width | Priority |
|--------|-------|----------|
| Mobile (small) | 320px | High |
| Mobile | 375px | High |
| Tablet | 768px | High |
| Desktop | 1024px | High |
| Large Desktop | 1440px | Medium |
| 4K | 2560px | Low |

### What to Check

- [ ] No horizontal scrolling
- [ ] Touch targets are large enough (48px min)
- [ ] Text is readable without zooming
- [ ] Images scale correctly
- [ ] Navigation is accessible
- [ ] Forms are usable
- [ ] Modals fit on screen

### Testing Tools

```bash
# Chrome DevTools device emulation
# Firefox Responsive Design Mode
# Safari Responsive Design Mode
```

---

## Browser Testing

### Priority Browsers

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 | High |
| Safari | Latest 2 | High |
| Firefox | Latest 2 | Medium |
| Edge | Latest 2 | Medium |
| iOS Safari | Latest 2 | High |
| Chrome Android | Latest | High |

### Feature Detection

```javascript
// Detect feature support
if ('IntersectionObserver' in window) {
  // Use Intersection Observer
} else {
  // Fallback
}
```

---

## Performance Testing

### Lighthouse Audit

```bash
# Run via Chrome DevTools
# Or CLI:
npm install -g lighthouse
lighthouse https://your-store.myshopify.com --output html --output-path ./report.html
```

### Key Metrics

```bash
# Target scores
Performance: > 70
Accessibility: > 90
Best Practices: > 90
SEO: > 90
```

### WebPageTest

Test from multiple locations:
- First view (cold cache)
- Repeat view (warm cache)
- Mobile simulation
- Different connection speeds

---

## Accessibility Testing

### Automated Testing

```bash
# aXe CLI
npm install -g @axe-core/cli
axe https://your-store.myshopify.com --exit
```

### Manual Testing

1. **Keyboard Navigation**
   - [ ] Tab through entire page
   - [ ] All interactive elements reachable
   - [ ] Focus visible at all times
   - [ ] No keyboard traps
   - [ ] Escape closes modals

2. **Screen Reader**
   - [ ] Content reads in logical order
   - [ ] Images have alt text
   - [ ] Forms have labels
   - [ ] Buttons have accessible names
   - [ ] Dynamic content announced

3. **Visual**
   - [ ] Color contrast passes (4.5:1)
   - [ ] Text resizable to 200%
   - [ ] Content visible in high contrast mode

---

## Cross-Device Testing

### Physical Device Testing

Priority devices to test:
- iPhone (latest + one older)
- Android phone (Samsung/Google)
- iPad
- Android tablet

### BrowserStack / LambdaTest

```bash
# Test on real devices in cloud
# Automate with:
npm install -g browserstack-local
```

---

## Form Testing

### Contact Form

- [ ] Required fields validate
- [ ] Email format validates
- [ ] Success message shows
- [ ] Error messages are clear
- [ ] Spam protection works

### Newsletter Form

- [ ] Email validates
- [ ] Duplicate detection
- [ ] Success message
- [ ] GDPR compliant (if applicable)

### Cart/Checkout

- [ ] Add to cart from product page
- [ ] Add to cart from collection
- [ ] Update quantities
- [ ] Apply discount codes
- [ ] Address validation
- [ ] Payment processing

---

## Content Testing

### Text Content

- [ ] No lorem ipsum
- [ ] No placeholder text
- [ ] Proper capitalization
- [ ] No spelling errors
- [ ] Links work

### Images

- [ ] All images load
- [ ] Proper alt text
- [ ] Correct sizing
- [ ] Lazy loading works

### SEO

- [ ] Page titles unique
- [ ] Meta descriptions present
- [ ] H1 on each page
- [ ] Heading hierarchy correct
- [ ] Structured data valid

---

## Validation Tools Summary

### Online Tools

| Tool | URL | Purpose |
|------|-----|---------|
| W3C Validator | validator.w3.org | HTML validation |
| Google Rich Results | search.google.com/test/rich-results | Structured data |
| PageSpeed Insights | pagespeed.web.dev | Performance |
| Wave | wave.webaim.org | Accessibility |
| GTmetrix | gtmetrix.com | Performance |

### CLI Tools

```bash
# Theme validation
theme-check

# Lighthouse
lighthouse <url>

# aXe accessibility
axe <url>

# HTML validation
npm install -g html-validate
html-validate <file>
```

---

## Pre-Launch Final Check

```markdown
## Final Checklist

### Technical
- [ ] Theme Check passes with no errors
- [ ] All templates render without errors
- [ ] All JavaScript works (no console errors)
- [ ] Forms submit correctly
- [ ] Cart and checkout functional

### Content
- [ ] All placeholder content replaced
- [ ] Images optimized and loading
- [ ] Links verified working
- [ ] Contact info correct

### Performance
- [ ] Lighthouse score > 70
- [ ] Load time < 3 seconds
- [ ] No render-blocking resources

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes

### SEO
- [ ] Page titles set
- [ ] Meta descriptions set
- [ ] Sitemap generated
- [ ] 301 redirects in place

### Mobile
- [ ] Tested on real devices
- [ ] Touch targets adequate
- [ ] No horizontal scroll
```
