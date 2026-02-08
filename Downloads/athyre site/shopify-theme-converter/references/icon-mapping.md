# Icon Mapping Reference

This document maps React/Lucide icon imports to their Liquid snippet equivalents.

---

## Quick Usage

**React (Before):**
```jsx
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';

<ArrowRight className="w-4 h-4" />
<Heart className="w-6 h-6 text-red-500" />
```

**Liquid (After):**
```liquid
{% render 'icon-arrow-right', class: 'w-4 h-4' %}
{% render 'icon-heart', class: 'w-6 h-6 text-red-500' %}
```

---

## Complete Mapping Table

### Navigation Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `ArrowRight` | `{% render 'icon-arrow-right' %}` | |
| `ArrowLeft` | `{% render 'icon-arrow-left' %}` | |
| `ArrowUp` | `{% render 'icon-arrow-up' %}` | |
| `ArrowDown` | `{% render 'icon-arrow-down' %}` | |
| `ChevronRight` | `{% render 'icon-chevron-right' %}` | |
| `ChevronLeft` | `{% render 'icon-chevron-left' %}` | |
| `ChevronUp` | `{% render 'icon-chevron-up' %}` | |
| `ChevronDown` | `{% render 'icon-chevron-down' %}` | |
| `ExternalLink` | `{% render 'icon-external-link' %}` | |
| `Home` | `{% render 'icon-home' %}` | |

### Action Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Check` | `{% render 'icon-check' %}` | Simple checkmark |
| `CheckCircle` / `CheckCircle2` | `{% render 'icon-check-circle' %}` | Circled checkmark |
| `X` | `{% render 'icon-x' %}` | Close/dismiss |
| `XCircle` | `{% render 'icon-close' %}` | Alias for X |
| `Plus` | `{% render 'icon-plus' %}` | |
| `Minus` | `{% render 'icon-minus' %}` | |
| `Trash` / `Trash2` | `{% render 'icon-trash' %}` | |
| `Edit` / `Pencil` | `{% render 'icon-edit' %}` | |
| `Copy` | `{% render 'icon-copy' %}` | |
| `Share` / `Share2` | `{% render 'icon-share' %}` | |
| `Download` | `{% render 'icon-download' %}` | |
| `Upload` | `{% render 'icon-upload' %}` | |
| `RefreshCw` / `RotateCw` | `{% render 'icon-refresh' %}` | |

### E-commerce Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `ShoppingBag` | `{% render 'icon-shopping-bag' %}` | Primary cart icon |
| `ShoppingCart` | `{% render 'icon-shopping-cart' %}` | Alternative cart |
| `Heart` | `{% render 'icon-heart' %}` | Wishlist (outline) |
| `HeartFilled` | `{% render 'icon-heart-filled' %}` | Wishlist (filled) |
| `Star` | `{% render 'icon-star' %}` | Rating (outline) |
| `StarFilled` | `{% render 'icon-star-filled' %}` | Rating (filled) |
| `Gift` | `{% render 'icon-gift' %}` | |
| `Truck` | `{% render 'icon-truck' %}` | Shipping |
| `Tag` | `{% render 'icon-tag' %}` | Price/sale |
| `Percent` | `{% render 'icon-percent' %}` | Discount |
| `Ticket` | `{% render 'icon-ticket' %}` | Coupon |
| `TrendingUp` | `{% render 'icon-trending-up' %}` | Popular/trending |

### UI Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Search` | `{% render 'icon-search' %}` | |
| `Menu` | `{% render 'icon-menu' %}` | Hamburger menu |
| `Filter` | `{% render 'icon-filter' %}` | |
| `User` | `{% render 'icon-user' %}` | Account |
| `Settings` / `Cog` | `{% render 'icon-settings' %}` | |
| `Info` | `{% render 'icon-info' %}` | |
| `AlertTriangle` | `{% render 'icon-alert-triangle' %}` | Warning |
| `AlertCircle` | `{% render 'icon-alert-circle' %}` | Error |
| `Eye` | `{% render 'icon-eye' %}` | Show password |
| `EyeOff` | `{% render 'icon-eye-off' %}` | Hide password |
| `Lock` | `{% render 'icon-lock' %}` | Secure |
| `Globe` | `{% render 'icon-globe' %}` | Language/region |
| `Image` | `{% render 'icon-image' %}` | |
| `Video` | `{% render 'icon-video' %}` | |

### Contact Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Mail` | `{% render 'icon-mail' %}` | Email |
| `Phone` | `{% render 'icon-phone' %}` | |
| `MapPin` | `{% render 'icon-map-pin' %}` | Location |
| `MessageSquare` / `MessageCircle` | `{% render 'icon-message-square' %}` | Chat |
| `Clock` | `{% render 'icon-clock' %}` | Hours/time |

### Social Media Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Instagram` | `{% render 'icon-instagram' %}` | |
| `Facebook` | `{% render 'icon-facebook' %}` | |
| `Twitter` | `{% render 'icon-twitter' %}` | |
| `Pinterest` | `{% render 'icon-pinterest' %}` | |
| `Youtube` | `{% render 'icon-youtube' %}` | |
| `Linkedin` | `{% render 'icon-linkedin' %}` | |
| N/A (custom) | `{% render 'icon-tiktok' %}` | TikTok (custom SVG) |

### Media Controls

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Play` | `{% render 'icon-play' %}` | |
| `Pause` | `{% render 'icon-pause' %}` | |

### Misc Icons

| Lucide Import | Liquid Snippet | Notes |
|---------------|----------------|-------|
| `Leaf` | `{% render 'icon-leaf' %}` | Eco/sustainability |

---

## Passing Classes

All icon snippets accept a `class` parameter for styling:

```liquid
{% comment %} Basic usage {% endcomment %}
{% render 'icon-heart' %}

{% comment %} With Tailwind classes {% endcomment %}
{% render 'icon-heart', class: 'w-6 h-6' %}

{% comment %} With color {% endcomment %}
{% render 'icon-heart', class: 'w-6 h-6 text-red-500' %}

{% comment %} With hover states (use parent wrapper) {% endcomment %}
<button class="group">
  {% render 'icon-heart', class: 'w-6 h-6 group-hover:text-red-500 transition-colors' %}
</button>
```

---

## Adding New Icons

If you need an icon not in this list:

1. Find the SVG on [Lucide Icons](https://lucide.dev/icons/)
2. Create `snippets/icon-{name}.liquid`
3. Use this template:

```liquid
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="{{ class }}" aria-hidden="true">
  <!-- paste SVG paths here -->
</svg>
```

4. Add the mapping to this document

---

## Heroicons Alternative

If your source uses Heroicons instead of Lucide:

| Heroicons Import | Liquid Equivalent |
|------------------|-------------------|
| `ArrowRightIcon` | `{% render 'icon-arrow-right' %}` |
| `XMarkIcon` | `{% render 'icon-x' %}` |
| `Bars3Icon` | `{% render 'icon-menu' %}` |
| `MagnifyingGlassIcon` | `{% render 'icon-search' %}` |
| `ShoppingBagIcon` | `{% render 'icon-shopping-bag' %}` |
| `UserIcon` | `{% render 'icon-user' %}` |

Most Heroicons have direct Lucide equivalents. The SVG paths differ slightly but the visual appearance is similar.

---

## Bulk Detection Script

Find all icon imports in a React project:

```bash
grep -roh "import.*from 'lucide-react'" ./src | \
  sed "s/.*{ \(.*\) }.*/\1/" | \
  tr ',' '\n' | \
  tr -d ' ' | \
  sort -u
```

Then check each against this mapping table.
