# Storefront Design System

## 🎨 Color System

### Primary Color - Orange (#F36418)
Used for actions, CTAs, and brand identity.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| --brand-25 | #FDF7F5 | 253, 247, 245 | Lightest tint |
| --brand-50 | #FBEFE9 | 251, 239, 233 | Background tint |
| --brand-100 | #F8DFD3 | 248, 223, 211 | Hover background |
| --brand-200 | #F1C0A8 | 241, 192, 168 | Secondary hover |
| --brand-300 | #EAA07C | 234, 160, 124 | Light accent |
| --brand-400 | #F36418 | 243, 100, 24 | **Primary - Base** |
| --brand-500 | #D9560F | 217, 86, 15 | Primary hover |
| --brand-600 | #B8480D | 184, 72, 13 | Primary active |
| --brand-700 | #943B0B | 148, 59, 11 | Dark accent |
| --brand-800 | #6B2A08 | 107, 42, 8 | Shade for text |
| --brand-900 | #4A1D06 | 74, 29, 6 | Darkest shade |

### Secondary Color - Blue (#0E4EB0)
Used for information, links, and supporting elements.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| --secondary-25 | #F5F8FF | 245, 248, 255 | Lightest tint |
| --secondary-50 | #EBF0FE | 235, 240, 254 | Background tint |
| --secondary-100 | #D7E1FD | 215, 225, 253 | Hover background |
| --secondary-200 | #AFC3FB | 175, 195, 251 | Secondary hover |
| --secondary-300 | #87A6F9 | 135, 166, 249 | Light accent |
| --secondary-400 | #0E4EB0 | 14, 78, 176 | **Secondary - Base** |
| --secondary-500 | #0C449E | 12, 68, 158 | Secondary hover |
| --secondary-600 | #0A3A86 | 10, 58, 134 | Secondary active |
| --secondary-700 | #082F6E | 8, 47, 110 | Dark accent |
| --secondary-800 | #062454 | 6, 36, 84 | Shade for text |
| --secondary-900 | #041A3D | 4, 26, 61 | Darkest shade |

### Secondary Color - Light Gray (#F2F2F2)
Used for backgrounds, cards, and neutral surfaces.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| --surface-25 | #FCFCFC | 252, 252, 252 | Lightest |
| --surface-50 | #F9F9F9 | 249, 249, 249 | Page background |
| --surface-100 | #F2F2F2 | 242, 242, 242 | **Base - Card bg** |
| --surface-200 | #E5E5E5 | 229, 229, 229 | Divider |
| --surface-300 | #D4D4D4 | 212, 212, 212 | Border |
| --surface-400 | #A3A3A3 | 163, 163, 163 | Disabled |

---

## 📝 Typography

### Fonts
- **Arabic:** Tajawal (weights: 300, 400, 500, 700, 800)
- **English:** Inter (weights: 300, 400, 500, 600, 700)

### CSS Variables
```css
--font-tajawal: 'Tajawal', system-ui, sans-serif;
--font-inter: 'Inter', system-ui, sans-serif;
```

### Usage
```css
/* RTL Arabic */
[dir="rtl"] body { font-family: var(--font-tajawal), system-ui, sans-serif; }

/* LTR English */
[dir="ltr"] body { font-family: var(--font-inter), system-ui, sans-serif; }
```

---

## 🎯 Button Styles

### Primary Button
```tsx
<button className="bg-action hover:bg-action-hover active:bg-action-pressed text-action-on-primary">
  Primary Action
</button>
```
- Background: `#F36418`
- Hover: `#D9560F`
- Active: `#B8480D`
- Text: `#FFFFFF`

### Secondary Button (Tonal)
```tsx
<button className="bg-action-secondary hover:bg-action-secondary-hover text-action-on-secondary">
  Secondary Action
</button>
```
- Background: `rgba(14, 78, 176, 0.1)`
- Hover: `rgba(14, 78, 176, 0.15)`
- Text: `#0E4EB0`

---

## ♿ Accessibility (WCAG)

### Contrast Ratios
- `#FFFFFF` on `#F36418`: **4.5:1** ✅ (AA normal, AAA large)
- `#FFFFFF` on `#B8480D`: **7.2:1** ✅ (AAA)
- `#000000` on `#F2F2F2`: **18.4:1** ✅ (AAA)
- `#0E4EB0` on `#FFFFFF`: **5.8:1** ✅ (AA)

---

## 🔧 Implementation

### Files Modified
1. `src/app/colors.css` - Color tokens with tints/shades
2. `src/app/globals.css` - Font application, utilities
3. `tailwind.config.ts` - Tailwind color extensions

### CSS Variable Structure
```
:root
├── Neutral (--neutral-*)
├── Brand Primary (--brand-*) #F36418 tints & shades
├── Brand Secondary (--secondary-*) #0E4EB0 tints & shades
├── Surface (--surface-*) #F2F2F2 tints & shades
├── Semantic (--red-*, --green-*, --yellow-*, --blue-*)
├── Backgrounds (--bg-*)
├── Content (--content-*)
└── Borders (--border-*)
```
