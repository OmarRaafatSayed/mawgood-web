# Mobile UI Fixes Bugfix Design

## Overview

Three distinct mobile UI bugs affect the storefront's usability on small screens. The fixes are
surgical and scoped to four files, with no changes to desktop layout or behavior.

1. **Bottom Nav Overlap** — The spacer `<div>` below the fixed bottom navbar uses CSS `padding-bottom`
   to account for `safe-area-inset-bottom`, but padding does not increase an element's height in the
   default box model. The spacer stays at 68 px on devices with a home indicator, hiding the last
   content items behind the nav bar.

2. **Filter Button Broken** — In `AlgoliaProductsListing`, the `<Drawer.Trigger>` is rendered as a
   sibling of `<Drawer>` rather than a descendant of it, so it has no drawer context to open.
   Additionally, `AlgoliaProductSidebar` initializes `isMobile = false` and only attaches a `resize`
   listener without an immediate check on mount, so the sidebar always renders in desktop mode on
   first paint inside the drawer.

3. **Mobile Layout Padding** — The products page wraps its content in `<main className="container">`
   with no horizontal padding class, causing headings and the product grid to touch screen edges on
   mobile.

The general fix strategy is: correct the spacer height calculation, restructure the `<Drawer>` tree
so the trigger is inside the context, add an immediate `isMobile` check on mount, and add `px-4` to
the products page container for mobile viewports.

---

## Glossary

- **Bug_Condition (C)**: The set of runtime states that trigger one of the three bugs.
- **Property (P)**: The desired observable behavior when the bug condition holds after the fix is applied.
- **Preservation**: Existing desktop and non-affected mobile behaviors that must remain identical before and after the fix.
- **safe-area-inset-bottom**: A CSS environment variable that returns the height of the device's home indicator / gesture bar (non-zero on modern iPhones and some Android devices).
- **Spacer**: The `<div className="lg:hidden w-full">` rendered after `<nav>` in `BottomNavbar.tsx` that pushes page content above the fixed nav bar.
- **Drawer context**: The React context provided by `<Drawer>` from `@medusajs/ui`; `<Drawer.Trigger>` only works when rendered as a descendant of `<Drawer>`.
- **isMobile**: Local state in `AlgoliaProductSidebar` that controls whether the component renders a modal-based filter button or an inline accordion list.
- **ProductsListing**: The inner component inside `AlgoliaProductsListing.tsx` that renders the product grid and the filter trigger button.

---

## Bug Details

### Bug 1 — Bottom Nav Overlap

The spacer element that reserves space for the fixed bottom navbar uses `paddingBottom` to add
`env(safe-area-inset-bottom)`, but CSS padding does not contribute to an element's `height` value
when `box-sizing: content-box` is in effect (the browser default). The spacer therefore always
measures 68 px, regardless of the device's safe-area inset.

**Formal Specification:**

```
FUNCTION isBottomNavOverlapCondition(viewport, spacer)
  INPUT: viewport — { width: number, safeAreaInsetBottom: number }
          spacer  — { heightPx: number }
  OUTPUT: boolean

  RETURN viewport.width < 1024
         AND spacer.heightPx < (68 + viewport.safeAreaInsetBottom)
END FUNCTION
```

**Examples:**

- iPhone 14 (safeAreaInsetBottom = 34 px): spacer renders at 68 px → last list item hidden by 34 px ✗
- Android with gesture nav (safeAreaInsetBottom = 24 px): spacer renders at 68 px → 24 px of content hidden ✗
- Desktop (width ≥ 1024 px): spacer is hidden via `lg:hidden` → no overlap ✓
- Device with no home indicator (safeAreaInsetBottom = 0): spacer at 68 px → no overlap ✓ (not a bug case)

---

### Bug 2 — Filter Trigger Outside Drawer Context

In `ProductsListing` (inside `AlgoliaProductsListing.tsx`), the JSX structure is:

```
<div>                          ← root
  <Trigger asChild>            ← ❌ no Drawer ancestor here
    <button>Filter</button>
  </Trigger>
  ...product grid...
  <Drawer>                     ← Drawer starts here, too late
    <Content>...</Content>
  </Drawer>
</div>
```

`<Drawer.Trigger>` reads a context value set by `<Drawer>`; because the trigger is rendered before
and outside the `<Drawer>` wrapper, the context is `undefined` and tapping the button does nothing.

**Formal Specification:**

```
FUNCTION isFilterTriggerBrokenCondition(tree)
  INPUT: tree — React component tree of ProductsListing
  OUTPUT: boolean

  RETURN EXISTS node IN tree WHERE node.type = Trigger
         AND NOT EXISTS ancestor IN ancestors(node) WHERE ancestor.type = Drawer
END FUNCTION
```

**Examples:**

- Mobile user taps Filter button → drawer does not open ✗
- Desktop user (button hidden via `md:hidden`) → no visible effect, but structural bug still present ✗
- After fix, Trigger is inside Drawer → tapping opens the drawer ✓

---

### Bug 3 — AlgoliaProductSidebar isMobile Never True on Mount

`AlgoliaProductSidebar` initializes `isMobile` to `false` and only updates it via a `resize` event
listener. On first render (including when the drawer opens), `isMobile` is always `false`, so the
desktop accordion layout renders inside the drawer instead of the mobile layout.

**Formal Specification:**

```
FUNCTION isMobileDetectionBrokenCondition(sidebar)
  INPUT: sidebar — { isMobileState: boolean, windowInnerWidth: number }
  OUTPUT: boolean

  RETURN sidebar.windowInnerWidth < 768
         AND sidebar.isMobileState = false
         AND sidebar.mountCompleted = true
END FUNCTION
```

**Examples:**

- Mobile (width = 390 px), first render: `isMobile = false` → desktop layout shown inside drawer ✗
- Mobile, user resizes to 800 px then back to 390 px: `isMobile` eventually becomes `true` ✓ (but only after resize)
- Desktop (width = 1280 px), first render: `isMobile = false` → correct desktop layout ✓

---

### Bug 4 — Products Page Missing Mobile Padding

The products page renders `<main className="container">` with no horizontal padding utility for
mobile. The `container` class in Tailwind sets `max-width` and centers the element but does not add
horizontal padding by default (unless configured in `tailwind.config`).

**Formal Specification:**

```
FUNCTION isMobilePaddingMissingCondition(page)
  INPUT: page — { viewportWidth: number, containerClasses: string[] }
  OUTPUT: boolean

  RETURN page.viewportWidth < 768
         AND NOT ("px-4" IN page.containerClasses OR paddingInline > 0)
END FUNCTION
```

**Examples:**

- Mobile (width = 375 px): heading and grid flush against screen edge ✗
- Desktop (width = 1280 px): `container` class provides centering; no edge-touching ✓
- After fix, `px-4` added with `md:px-0` override: mobile has padding, desktop unchanged ✓

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Desktop viewport (≥ 1024 px): bottom navbar remains hidden; standard header navigation continues to render.
- Desktop viewport: filter sidebar renders inline on the left of the product grid without a drawer.
- Desktop viewport: products page layout has no extra horizontal padding from the mobile fix.
- All filter interactions (price, size, color, condition, vendor) continue to update the product listing via search params on both desktop and mobile.
- Bottom navbar active route highlighting (`#F36418`) and cart item count badge continue to work correctly.
- All existing mouse/touch interactions on desktop are unaffected.

**Scope:**

All inputs that do NOT satisfy any of the four bug conditions above must produce identical behavior
before and after the fix. Specifically:

- Any viewport ≥ 1024 px (desktop) is entirely unaffected.
- Filter interactions on desktop (inline sidebar) are unaffected.
- Cart and wishlist badge counts are unaffected.
- Navigation active-state logic is unaffected.

---

## Hypothesized Root Cause

### Bug 1 — Spacer Height

The developer intended `paddingBottom: 'env(safe-area-inset-bottom, 0px)'` to extend the spacer's
visual height. However, CSS `padding` adds space *inside* the element's border box but does not
change the element's `height` property when an explicit `height` is set via inline style. The
correct approach is to use `calc(68px + env(safe-area-inset-bottom, 0px))` as the `height` value,
or to use `min-height` with the same calc expression.

### Bug 2 — Drawer Trigger Context

The `<Drawer>` component from `@medusajs/ui` uses React context to connect `<Drawer.Trigger>` to
`<Drawer.Content>`. The developer placed the `<Trigger>` button at the top of the JSX for visual
layout reasons, then added the `<Drawer>` wrapper at the bottom around only the `<Content>`. Because
React context flows downward through the tree, the trigger — being outside the `<Drawer>` subtree —
never receives the context value and cannot open the drawer.

### Bug 3 — isMobile Initialization

The developer used `useState(false)` as a safe SSR default (since `window` is not available during
server-side rendering). The `useEffect` correctly adds a `resize` listener, but omits an immediate
call to `handleResize()` (or equivalent) inside the effect body. As a result, the state is never
synchronized with the actual window width until the user physically resizes the browser.

### Bug 4 — Missing px-4

The products page was likely built targeting desktop first. The `container` class was assumed to
provide sufficient spacing, but on narrow viewports the container has no horizontal padding, causing
content to sit flush against the screen edges.

---

## Correctness Properties

Property 1: Bug Condition — Spacer Accounts for Safe Area Inset

_For any_ mobile viewport (width < 1024 px) where `env(safe-area-inset-bottom)` is non-zero, the
fixed `BottomNavbar` component SHALL render a spacer whose total height equals
`68px + env(safe-area-inset-bottom)`, ensuring no page content is obscured by the fixed nav bar.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition — Filter Drawer Opens on Tap

_For any_ mobile viewport where the user taps the Filter button in `AlgoliaProductsListing`, the
fixed component SHALL open the `<Drawer>` panel, because `<Drawer.Trigger>` is rendered as a
descendant of `<Drawer>` and therefore has access to the drawer context.

**Validates: Requirements 2.3**

---

Property 3: Bug Condition — Sidebar Detects Mobile on Mount

_For any_ initial render of `AlgoliaProductSidebar` where `window.innerWidth < 768`, the fixed
component SHALL set `isMobile = true` immediately after mount (before any resize event), causing the
mobile filter layout to render correctly inside the drawer.

**Validates: Requirements 2.4**

---

Property 4: Bug Condition — Products Page Has Mobile Padding

_For any_ mobile viewport (width < 768 px), the fixed products page SHALL apply horizontal padding
(`px-4`) to the main container so that headings and the product grid do not touch the screen edges.

**Validates: Requirements 2.5**

---

Property 5: Preservation — Desktop Layout Unchanged

_For any_ viewport where width ≥ 1024 px, the fixed code SHALL produce exactly the same rendered
output as the original code: bottom navbar hidden, filter sidebar inline, products page without
extra horizontal padding, and all filter/navigation interactions behaving identically.

**Validates: Requirements 3.1, 3.2, 3.3, 3.7**

---

Property 6: Preservation — Mobile Interactions Unchanged

_For any_ mobile interaction that does NOT involve the four bug conditions (e.g., tapping nav items,
cart badge display, active route highlighting, filter param updates inside the drawer), the fixed
code SHALL produce the same behavior as the original code.

**Validates: Requirements 3.4, 3.5, 3.6**

---

## Fix Implementation

### Changes Required

**File 1: `storefront/src/components/cells/BottomNavbar/BottomNavbar.tsx`**

**Function/Element**: Spacer `<div>` at the bottom of the component return.

**Specific Changes:**

1. **Spacer height calculation**: Replace the inline style
   `{ height: '68px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }`
   with `{ height: 'calc(68px + env(safe-area-inset-bottom, 0px))' }`.
   This makes the element's actual height grow with the safe-area inset instead of adding invisible
   internal padding.

2. **Nav bar height consistency** (optional but recommended): Apply the same `calc(...)` to the
   `<nav>` element's `height` style so the nav bar itself also grows on devices with a home
   indicator, keeping the content area inside the nav vertically centered.

---

**File 2: `storefront/src/components/sections/ProductListing/AlgoliaProductsListing.tsx`**

**Component**: `ProductsListing`

**Specific Changes:**

1. **Wrap entire listing in `<Drawer>`**: Move the `<Drawer>` opening tag to wrap the entire
   `ProductsListing` return JSX, so both `<Trigger>` and `<Content>` are descendants of the same
   `<Drawer>` context provider.

2. **Remove orphaned `<Drawer>` at bottom**: Delete the `<Drawer>` wrapper that currently wraps
   only `<Content>` at the bottom of the JSX — it will be replaced by the outer wrapper from step 1.

3. **Keep `<Trigger>` in place**: The `<Trigger asChild>` button can remain where it is visually
   (top of the listing), since it will now be inside the `<Drawer>` context.

Resulting structure:
```
<Drawer>                       ← wraps everything
  <div className="py-4">
    <div className="flex justify-between ...">
      ...count label...
      <Trigger asChild>        ← ✓ inside Drawer context
        <button>Filter</button>
      </Trigger>
    </div>
    ...product grid...
    <Content>                  ← ✓ same Drawer context
      <Header>...</Header>
      <Body>
        <AlgoliaProductSidebar facets={facets} />
      </Body>
    </Content>
  </div>
</Drawer>
```

---

**File 3: `storefront/src/components/organisms/ProductSidebar/AlgoliaProductSidebar.tsx`**

**Function**: `AlgoliaProductSidebar` component, `useEffect` hook.

**Specific Changes:**

1. **Immediate mount check**: Inside the existing `useEffect`, call `handleResize()` once
   immediately before (or after) attaching the event listener, so `isMobile` is set correctly on
   first render:

   ```ts
   useEffect(() => {
     const handleResize = () => {
       setIsMobile(window.innerWidth < 768)
     }
     handleResize()                                    // ← add this line
     window.addEventListener("resize", handleResize)
     return () => window.removeEventListener("resize", handleResize)
   }, [])
   ```

2. **Remove redundant mobile filter button**: Because `AlgoliaProductSidebar` will now only be
   rendered inside the `<Drawer.Body>` on mobile (the trigger button is in `ProductsListing`), the
   `isMobile` branch that renders a `<Button onClick={() => setIsOpen(true)}>Filters</Button>` and
   a nested `<Modal>` is no longer needed. The component can be simplified to always render the
   accordion list directly, removing the `isMobile` / `isOpen` state entirely.

   > **Note**: If `AlgoliaProductSidebar` is used in other contexts that still require the
   > self-contained mobile button, keep the `isMobile` state but ensure the mount check is added.
   > For this spec, the component is only used in `AlgoliaProductsListing`, so simplification is safe.

---

**File 4: `storefront/src/app/[locale]/(main)/products/page.tsx`**

**Component**: `AllProducts`, `<main>` element.

**Specific Changes:**

1. **Add mobile horizontal padding**: Change `<main className="container">` to
   `<main className="container px-4 md:px-0">` (or `px-4 lg:px-0` depending on the breakpoint at
   which the container's own padding kicks in). This adds 16 px of horizontal padding on mobile
   without affecting the desktop layout.

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach: first run exploratory tests against the **unfixed** code to
confirm the bugs are reproducible and to understand the exact failure mode; then run fix-checking
and preservation tests against the **fixed** code to verify correctness and no regressions.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug on the unfixed code. Confirm or refute
the root cause analysis.

**Test Plan**: Write component/unit tests that render the affected components in a JSDOM environment
(or with a mock window width) and assert the expected behavior. Run on unfixed code first to observe
failures.

**Test Cases:**

1. **Spacer Height Test** (Bug 1): Render `BottomNavbar`, query the spacer div, assert its computed
   height equals `68 + safeAreaInset`. Will fail on unfixed code because spacer height is always 68.

2. **Filter Drawer Opens Test** (Bug 2): Render `ProductsListing` with mock facets, simulate a tap
   on the Filter button, assert the drawer content is visible. Will fail on unfixed code because
   `Trigger` has no drawer context.

3. **Sidebar Mobile Detection Test** (Bug 3): Render `AlgoliaProductSidebar` with
   `window.innerWidth = 390`, assert `isMobile = true` after mount without triggering a resize
   event. Will fail on unfixed code because `isMobile` stays `false`.

4. **Products Page Padding Test** (Bug 4): Render the `AllProducts` page, query the `<main>`
   element, assert it has `px-4` (or equivalent inline padding) on a 375 px viewport. Will fail on
   unfixed code.

**Expected Counterexamples:**

- Spacer height is 68 px regardless of safe-area-inset value.
- Clicking the Filter button produces no visible drawer.
- `AlgoliaProductSidebar` renders the desktop accordion layout on a 390 px viewport on first paint.
- `<main>` has zero horizontal padding on mobile.

---

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed code produces the
expected behavior.

**Pseudocode:**

```
FOR ALL viewport WHERE isBottomNavOverlapCondition(viewport, spacer) DO
  result := renderBottomNavbar_fixed(viewport)
  ASSERT result.spacer.height = calc(68px + safeAreaInsetBottom)
END FOR

FOR ALL component WHERE isFilterTriggerBrokenCondition(component) DO
  result := renderProductsListing_fixed(component)
  ASSERT tapFilterButton(result) OPENS drawer
END FOR

FOR ALL sidebar WHERE isMobileDetectionBrokenCondition(sidebar) DO
  result := renderAlgoliaProductSidebar_fixed(sidebar)
  ASSERT result.isMobile = true ON MOUNT
END FOR

FOR ALL page WHERE isMobilePaddingMissingCondition(page) DO
  result := renderProductsPage_fixed(page)
  ASSERT result.main.paddingInline >= 16px
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed code produces
the same result as the original code.

**Pseudocode:**

```
FOR ALL viewport WHERE viewport.width >= 1024 DO
  ASSERT renderBottomNavbar_original(viewport) = renderBottomNavbar_fixed(viewport)
  ASSERT renderProductsPage_original(viewport) = renderProductsPage_fixed(viewport)
END FOR

FOR ALL sidebar WHERE sidebar.windowInnerWidth >= 768 DO
  ASSERT renderAlgoliaProductSidebar_original(sidebar) = renderAlgoliaProductSidebar_fixed(sidebar)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many viewport widths and component states automatically.
- It catches edge cases at breakpoint boundaries (e.g., exactly 768 px, 1023 px, 1024 px).
- It provides strong guarantees that desktop behavior is unchanged across all non-buggy inputs.

**Test Plan**: Observe desktop behavior on unfixed code first, then write property-based tests that
assert identical output for all desktop-width inputs.

**Test Cases:**

1. **Desktop Nav Hidden Preservation**: For any viewport ≥ 1024 px, assert `BottomNavbar` renders
   `null` / `lg:hidden` and the spacer is also hidden — identical before and after fix.

2. **Desktop Sidebar Inline Preservation**: For any viewport ≥ 768 px, assert
   `AlgoliaProductSidebar` renders the inline accordion list (not a modal button) — identical before
   and after fix.

3. **Desktop Products Page No Extra Padding**: For any viewport ≥ 768 px, assert the `<main>`
   element does not have `px-4` applied (or that `md:px-0` overrides it) — desktop layout unchanged.

4. **Filter Param Updates Preserved**: For any filter interaction (price, size, color, condition,
   vendor) on desktop, assert search params are updated identically before and after fix.

5. **Cart Badge Preserved**: For any cart state with N items, assert the cart badge in
   `BottomNavbar` displays N (or "9+") identically before and after fix.

6. **Active Route Highlighting Preserved**: For any pathname, assert the active nav item is
   highlighted with `#F36418` identically before and after fix.

---

### Unit Tests

- Test `BottomNavbar` spacer height with `safeAreaInsetBottom = 0`, `24`, and `34` px.
- Test `BottomNavbar` spacer is hidden on desktop (lg:hidden).
- Test `ProductsListing` filter button tap opens drawer (Trigger inside Drawer context).
- Test `AlgoliaProductSidebar` renders mobile layout when `window.innerWidth = 390` on mount.
- Test `AlgoliaProductSidebar` renders desktop layout when `window.innerWidth = 1280` on mount.
- Test products page `<main>` has `px-4` class on mobile viewport.
- Test products page `<main>` does not have extra padding on desktop viewport.

---

### Property-Based Tests

- Generate random viewport widths in `[320, 1023]` and assert spacer height ≥ 68 px for all.
- Generate random viewport widths in `[1024, 2560]` and assert `BottomNavbar` is hidden for all.
- Generate random `window.innerWidth` values in `[320, 767]` and assert `AlgoliaProductSidebar`
  sets `isMobile = true` on mount for all.
- Generate random `window.innerWidth` values in `[768, 2560]` and assert `AlgoliaProductSidebar`
  sets `isMobile = false` on mount for all.
- Generate random desktop viewport widths and assert products page `<main>` padding is unchanged
  (no `px-4` effect) for all.

---

### Integration Tests

- Full mobile flow: open products page on 375 px viewport → tap Filter button → drawer opens →
  select a filter → product list updates → close drawer.
- Full mobile flow: scroll to bottom of products page on iPhone-sized viewport → verify last product
  card is fully visible above the bottom navbar.
- Desktop regression: open products page on 1280 px viewport → verify inline sidebar is visible,
  no drawer, no extra padding, all filters work.
- Context switching: resize from mobile (390 px) to desktop (1280 px) → verify sidebar switches
  from mobile to desktop layout without requiring a page reload.
