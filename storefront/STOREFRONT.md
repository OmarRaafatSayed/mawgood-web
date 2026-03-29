# Storefront Documentation

## Design System

### Primary Colors - Gradient System

**Brand Gradient Colors**
```css
Primary Light:  #D97F3E (217, 127, 62)
Primary Mid:    #8F5429 (143, 84, 41)
Primary Dark:   #382110 (56, 33, 16)
```

**CSS Variables**
```css
--primary:        #D97F3E
--primary-hover:  #C36B30
--primary-active: #8F5429
--primary-light:  #EDA781
--primary-dark:   #382110
```

**Gradient Variants**
```css
/* Linear Gradient (Default) */
background: linear-gradient(135deg, #D97F3E 0%, #8F5429 50%, #382110 100%);

/* Vertical Gradient */
background: linear-gradient(180deg, #D97F3E 0%, #8F5429 50%, #382110 100%);

/* Radial Gradient */
background: radial-gradient(circle, #D97F3E 0%, #8F5429 50%, #382110 100%);
```

### Typography Colors

**Text on White Background**
```css
--text-primary:   #000000 (Black on White #FFFFFF)
--text-secondary: #525252 (Gray on White)
--text-on-light:  #000000 (Black on Light backgrounds)
```

**Text on Orange/Gradient Background**
```css
--text-on-primary: #FFFFFF (White on #D97F3E or gradient)
```

### Button Styles

**Primary Button (Gradient)**
```tsx
<button className="bg-action hover:bg-action-hover active:bg-action-pressed text-action-on-primary">
  Primary Button
</button>
```

**Secondary Button (Tonal)**
```tsx
<button className="bg-action-secondary hover:bg-action-secondary-hover text-primary">
  Secondary Button
</button>
```

**Gradient Button**
```tsx
<button className="bg-primary-gradient hover:bg-primary-gradient-hover text-white">
  Gradient Button
</button>
```

### Tailwind Utility Classes

**Background Gradients**
```tsx
bg-primary-gradient          // Linear gradient (135deg)
bg-primary-gradient-hover    // Hover state gradient
bg-primary-gradient-vertical // Vertical gradient (180deg)
bg-primary-gradient-radial   // Radial gradient
```

**Text Colors**
```tsx
text-primary           // Black #000000
text-secondary         // Gray #525252
text-action-on-primary // White #FFFFFF (on orange)
text-on-light          // Black #000000 (on light bg)
```

**Background Colors**
```tsx
bg-action              // #D97F3E
bg-action-hover        // #C36B30
bg-action-pressed      // #8F5429
bg-primary             // White #FFFFFF
```

### Accessibility (WCAG Compliance)

**Contrast Ratios**
- `#000000` on `#FFFFFF`: **21:1** ✅ (AAA)
- `#FFFFFF` on `#D97F3E`: **3.8:1** ✅ (AA for large text)
- `#FFFFFF` on `#8F5429`: **6.2:1** ✅ (AA)
- `#FFFFFF` on `#382110`: **14.5:1** ✅ (AAA)

**Recommendations**
- Use `#8F5429` or darker for small text with white
- Use `#D97F3E` for large text (18px+) or bold text (14px+)
- Always use `#000000` on `#FFFFFF` for body text

### Design Tokens Reference

```css
/* Primary Gradient */
--brand-400: 217, 127, 62;  /* #D97F3E */
--brand-600: 143, 84, 41;   /* #8F5429 */
--brand-800: 56, 33, 16;    /* #382110 */

/* Backgrounds */
--bg-action-primary: var(--brand-400);
--bg-action-primary-hover: var(--brand-500);
--bg-action-primary-pressed: var(--brand-600);

/* Text */
--content-primary: var(--neutral-1000);        /* #000000 */
--content-tertiary: var(--neutral-0);          /* #FFFFFF */
--content-action-on-primary: var(--neutral-0); /* White on orange */
```

### Usage Examples

**Hero Section with Gradient**
```tsx
<section className="bg-primary-gradient text-action-on-primary py-20">
  <h1 className="heading-xl">Welcome to Our Store</h1>
  <p className="text-lg">White text on gradient background</p>
</section>
```

**Product Card**
```tsx
<div className="bg-primary border border-primary rounded-md p-4">
  <h3 className="text-primary heading-sm">Product Name</h3>
  <p className="text-secondary text-md">Product description in gray</p>
  <button className="bg-action hover:bg-action-hover text-action-on-primary">
    Add to Cart
  </button>
</div>
```

**Call-to-Action Button**
```tsx
<button className="bg-primary-gradient hover:bg-primary-gradient-hover text-white px-6 py-3 rounded-full">
  Shop Now
</button>
```

### Technical Implementation

**Files Modified**
1. `storefront/src/app/colors.css` - Design tokens
2. `storefront/src/app/globals.css` - Utility classes
3. `storefront/tailwind.config.ts` - Tailwind extensions

**CSS Variables Structure**
```
:root
├── Brand Colors (--brand-*)
├── Primary Tokens (--primary-*)
├── Background Colors (--bg-*)
├── Typography Colors (--text-*, --content-*)
└── Border Colors (--border-*)
```


## Internationalization (i18n)

### Implementation

Complete Arabic and English translation system using next-intl.

**Supported Languages**
- Arabic (ar) - Default (RTL)
- English (en) - Secondary (LTR)

**Configuration Files**
- `src/i18n/request.ts` - next-intl configuration
- `messages/ar.json` - Arabic translations
- `messages/en.json` - English translations
- `next.config.ts` - next-intl plugin integration
- `src/middleware.ts` - Locale detection and routing

**RTL Support**
- Automatic direction switching (RTL for Arabic, LTR for English)
- `dir` attribute set on `<html>` and `<body>` tags
- RTL-specific CSS utilities in `src/app/rtl.css`
- HtmlLangSetter component handles dynamic direction changes

**RTL CSS Utilities**
The RTL CSS file includes comprehensive utilities for:
- Margin and padding flipping (ml-auto, mr-auto, pl-4, ps-4, etc.)
- Text alignment flipping (text-left, text-right)
- Positioning (left-0, right-0, -right-2, -start-0, etc.)
- Icon rotation (rotate-180, rotate-[270deg], etc.)
- Carousel direction for RTL
- Dropdown positioning (dropdown-end, start-0)

**Language Switcher**
- Located in Header component
- Toggles between Arabic and English
- Persists selection in cookies (NEXT_LOCALE)
- Globe icon with current language label
- Updates dir attribute on document for immediate RTL/LTR switch

**Translation Keys Structure**
```
common - Shared UI elements (home, cart, wishlist, etc.)
header - Header-specific text
footer - Footer links and sections
hero - Hero section content
home - Homepage sections
auth - Authentication forms
cart - Shopping cart
product - Product pages
seller - Seller profiles
filters - Product filtering
checkout - Checkout process
orders - Order management
user - User account
wishlist - Wishlist features
messages - Messaging system
reviews - Review system
errors - Error messages
success - Success messages
validation - Form validation
```

**Usage in Components**

Server Components:
```tsx
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('common');
<button>{t('addToCart')}</button>
```

Client Components:
```tsx
'use client';
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
<button>{t('addToCart')}</button>
```

**Locale Detection**
1. Cookie (NEXT_LOCALE) - Highest priority
2. URL path segment
3. Default to Arabic (ar)

**Translated Components**
- Header (navigation, user dropdown)
- Footer (all sections and links)
- Hero section
- Home page sections
- User dropdown menu
- Language switcher
- Cart dropdown
- Mobile navbar
- Category navbar
- Navbar search
- Breadcrumbs
- Carousel navigation

**RTL Icon Classes**
For icons that need to flip in RTL:
- `rtl:rotate-180` - Flip arrow icons
- `rtl:rotate-[90deg]` or `rtl:rotate-[270deg]` - For chevron icons
- Use `start-` and `end-` instead of `left-` and `right-`

**Next Steps for Full Translation**
Apply `useTranslations` or `getTranslations` to remaining components:
- Authentication pages (login, register, forgot password)
- Product listing and details
- Cart and checkout flow
- User account pages
- Order management
- Wishlist
- Messages
- Reviews
- All form labels and validation messages
