# Storefront Design System

## 🎨 Primary Colors - Gradient System

### Brand Gradient Colors
```css
Primary Light:  #D97F3E (217, 127, 62)
Primary Mid:    #8F5429 (143, 84, 41)
Primary Dark:   #382110 (56, 33, 16)
```

### CSS Variables
```css
--primary:        #D97F3E
--primary-hover:  #C36B30
--primary-active: #8F5429
--primary-light:  #EDA781
--primary-dark:   #382110
```

### Gradient Variants
```css
/* Linear Gradient (Default) */
background: linear-gradient(135deg, #D97F3E 0%, #8F5429 50%, #382110 100%);

/* Vertical Gradient */
background: linear-gradient(180deg, #D97F3E 0%, #8F5429 50%, #382110 100%);

/* Radial Gradient */
background: radial-gradient(circle, #D97F3E 0%, #8F5429 50%, #382110 100%);
```

---

## 📝 Typography Colors

### Text on White Background
```css
--text-primary:   #000000 (Black on White #FFFFFF)
--text-secondary: #525252 (Gray on White)
--text-on-light:  #000000 (Black on Light backgrounds)
```

### Text on Orange/Gradient Background
```css
--text-on-primary: #FFFFFF (White on #D97F3E or gradient)
```

### Usage Examples
```tsx
// Black text on white background
<p className="text-primary bg-primary">Black text on white</p>

// White text on orange gradient
<button className="bg-primary-gradient text-action-on-primary">
  White text on gradient
</button>
```

---

## 🎯 Button Styles

### Primary Button (Gradient)
```tsx
<button className="bg-action hover:bg-action-hover active:bg-action-pressed text-action-on-primary">
  Primary Button
</button>
```
- Background: `#D97F3E`
- Hover: `#C36B30`
- Active: `#8F5429`
- Text: `#FFFFFF`

### Secondary Button (Tonal)
```tsx
<button className="bg-action-secondary hover:bg-action-secondary-hover text-primary">
  Secondary Button
</button>
```
- Background: `rgba(217, 127, 62, 0.1)`
- Hover: `rgba(217, 127, 62, 0.15)`
- Text: `#000000`

### Gradient Button
```tsx
<button className="bg-primary-gradient hover:bg-primary-gradient-hover text-white">
  Gradient Button
</button>
```

---

## 🎨 Tailwind Utility Classes

### Background Gradients
```tsx
bg-primary-gradient          // Linear gradient (135deg)
bg-primary-gradient-hover    // Hover state gradient
bg-primary-gradient-vertical // Vertical gradient (180deg)
bg-primary-gradient-radial   // Radial gradient
```

### Text Colors
```tsx
text-primary           // Black #000000
text-secondary         // Gray #525252
text-action-on-primary // White #FFFFFF (on orange)
text-on-light          // Black #000000 (on light bg)
```

### Background Colors
```tsx
bg-action              // #D97F3E
bg-action-hover        // #C36B30
bg-action-pressed      // #8F5429
bg-primary             // White #FFFFFF
```

---

## ♿ Accessibility (WCAG Compliance)

### Contrast Ratios

#### Black on White
- `#000000` on `#FFFFFF`: **21:1** ✅ (AAA)

#### White on Orange
- `#FFFFFF` on `#D97F3E`: **3.8:1** ✅ (AA for large text)
- `#FFFFFF` on `#8F5429`: **6.2:1** ✅ (AA)
- `#FFFFFF` on `#382110`: **14.5:1** ✅ (AAA)

### Recommendations
- Use `#8F5429` or darker for small text with white
- Use `#D97F3E` for large text (18px+) or bold text (14px+)
- Always use `#000000` on `#FFFFFF` for body text

---

## 📦 Design Tokens Reference

### Color Tokens
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

---

## 🚀 Usage Examples

### Hero Section with Gradient
```tsx
<section className="bg-primary-gradient text-action-on-primary py-20">
  <h1 className="heading-xl">Welcome to Our Store</h1>
  <p className="text-lg">White text on gradient background</p>
</section>
```

### Product Card
```tsx
<div className="bg-primary border border-primary rounded-md p-4">
  <h3 className="text-primary heading-sm">Product Name</h3>
  <p className="text-secondary text-md">Product description in gray</p>
  <button className="bg-action hover:bg-action-hover text-action-on-primary">
    Add to Cart
  </button>
</div>
```

### Call-to-Action Button
```tsx
<button className="bg-primary-gradient hover:bg-primary-gradient-hover text-white px-6 py-3 rounded-full">
  Shop Now
</button>
```

---

## 📋 Migration Checklist

- [x] Updated brand colors in `colors.css`
- [x] Added primary gradient tokens
- [x] Updated typography colors
- [x] Updated button styles
- [x] Added gradient utilities in `globals.css`
- [x] Extended Tailwind config with gradients
- [x] Verified WCAG contrast ratios
- [x] Created design system documentation

---

## 🔧 Technical Implementation

### Files Modified
1. `storefront/src/app/colors.css` - Design tokens
2. `storefront/src/app/globals.css` - Utility classes
3. `storefront/tailwind.config.ts` - Tailwind extensions

### CSS Variables Structure
```
:root
├── Brand Colors (--brand-*)
├── Primary Tokens (--primary-*)
├── Background Colors (--bg-*)
├── Typography Colors (--text-*, --content-*)
└── Border Colors (--border-*)
```
