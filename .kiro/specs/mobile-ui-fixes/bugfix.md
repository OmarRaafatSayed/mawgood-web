# Bugfix Requirements Document

## Introduction

The storefront mobile experience has three interconnected UI bugs affecting the Bottom Navigation bar, the Filter button/sidebar, and the general product listing layout on mobile screens. These issues make the mobile storefront difficult to use: content is hidden behind the bottom nav, the filter drawer cannot be opened, and product content touches screen edges. The fix must restore correct mobile behavior without affecting the desktop layout.

---

## Bug Analysis

### Current Behavior (Defect)

**Bottom Navigation Overlap**

1.1 WHEN a user scrolls to the bottom of any page on a mobile viewport (< 1024px) THEN the system renders the bottom navigation bar overlapping page content because the spacer `<div>` height does not account for `env(safe-area-inset-bottom)` correctly, causing the last content items to be hidden behind the nav bar.

1.2 WHEN the bottom navigation bar is rendered THEN the system places it without a visible backdrop/shadow separation, making it visually cluttered and hard to distinguish from page content.

**Filter Button Not Working**

1.3 WHEN a user taps the "تصفية" / Filter button (`<Trigger asChild>`) on a mobile viewport in `AlgoliaProductsListing` THEN the system does not open the filter drawer because the `<Trigger>` is rendered outside its parent `<Drawer>` component context — the `<Drawer>` wrapper is placed after the product grid instead of wrapping the entire listing, so the trigger has no associated drawer to open.

1.4 WHEN the `AlgoliaProductSidebar` is rendered inside the `<Drawer.Body>` on mobile THEN the system renders the sidebar in its desktop mode (no mobile detection on first render) because `isMobile` state is initialized to `false` and the `resize` listener never fires on mount, so the sidebar shows the desktop filter layout inside the drawer instead of the mobile filter layout.

**General Mobile Layout**

1.5 WHEN the products page is rendered on a mobile viewport THEN the system renders the product grid and page headings without horizontal padding, causing content to touch the screen edges.

---

### Expected Behavior (Correct)

**Bottom Navigation Overlap**

2.1 WHEN a user scrolls to the bottom of any page on a mobile viewport THEN the system SHALL render a spacer element whose height equals the bottom nav height plus `env(safe-area-inset-bottom)`, ensuring no page content is hidden behind the nav bar.

2.2 WHEN the bottom navigation bar is rendered THEN the system SHALL display a clear visual separator (box-shadow or border) between the nav bar and the page content so the nav is visually distinct.

**Filter Button Working**

2.3 WHEN a user taps the Filter button on a mobile viewport THEN the system SHALL open the `<Drawer>` panel containing the filter sidebar, because the `<Trigger>` is rendered inside the same `<Drawer>` context that wraps the entire listing component.

2.4 WHEN the filter drawer is opened on mobile THEN the system SHALL render the `AlgoliaProductSidebar` in its correct mobile/drawer mode, showing filter accordions directly (not a nested "Filters" button), because `isMobile` is initialized correctly via `useEffect` with an immediate check on mount.

**General Mobile Layout**

2.5 WHEN the products page is rendered on a mobile viewport THEN the system SHALL apply horizontal padding (`px-4`) to the product grid container and page heading so content does not touch screen edges.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user views the storefront on a desktop viewport (≥ 1024px) THEN the system SHALL CONTINUE TO hide the bottom navigation bar and show the standard desktop header navigation.

3.2 WHEN a user views the products page on a desktop viewport THEN the system SHALL CONTINUE TO display the filter sidebar inline on the left side of the product grid without a drawer.

3.3 WHEN a user interacts with any filter (price, size, color, condition, vendor) on desktop THEN the system SHALL CONTINUE TO update the product listing correctly via search params.

3.4 WHEN a user interacts with any filter inside the mobile drawer THEN the system SHALL CONTINUE TO update the product listing correctly via search params, identical to desktop behavior.

3.5 WHEN the bottom navigation bar is rendered on mobile THEN the system SHALL CONTINUE TO highlight the active route icon and label with the brand color (`#F36418`).

3.6 WHEN the cart has items THEN the system SHALL CONTINUE TO display the correct item count badge on the cart icon in the bottom navigation.

3.7 WHEN the products page is rendered on desktop THEN the system SHALL CONTINUE TO display the product grid without the extra `px-4` mobile padding (desktop layout is unaffected).

---

## Bug Condition Pseudocode

### Bug Condition Functions

```pascal
FUNCTION isBottomNavOverlapCondition(viewport)
  INPUT: viewport width in pixels
  OUTPUT: boolean
  RETURN viewport.width < 1024 AND spacer.height < (navHeight + safeAreaInsetBottom)
END FUNCTION

FUNCTION isFilterTriggerBrokenCondition(component)
  INPUT: AlgoliaProductsListing component tree
  OUTPUT: boolean
  // Trigger is outside Drawer context when Drawer wraps only Content, not Trigger
  RETURN Trigger.isOutsideDrawerContext = true
END FUNCTION

FUNCTION isMobileDetectionBrokenCondition(sidebar)
  INPUT: AlgoliaProductSidebar on first render
  OUTPUT: boolean
  RETURN sidebar.isMobile = false AND window.innerWidth < 768
END FUNCTION
```

### Fix Checking Properties

```pascal
// Property: Bottom Nav Overlap Fix
FOR ALL viewport WHERE isBottomNavOverlapCondition(viewport) DO
  result ← renderLayout'(viewport)
  ASSERT spacer.height >= navHeight + safeAreaInsetBottom
  ASSERT lastContentItem.isVisible = true
END FOR

// Property: Filter Trigger Fix
FOR ALL component WHERE isFilterTriggerBrokenCondition(component) DO
  result ← renderAlgoliaProductsListing'(component)
  ASSERT Trigger.isInsideDrawerContext = true
  ASSERT tapFilterButton() OPENS drawer
END FOR

// Property: Mobile Detection Fix
FOR ALL sidebar WHERE isMobileDetectionBrokenCondition(sidebar) DO
  result ← renderAlgoliaProductSidebar'(sidebar)
  ASSERT sidebar.isMobile = true ON MOUNT when window.innerWidth < 768
END FOR
```

### Preservation Checking

```pascal
// Property: Preservation — Desktop layout unchanged
FOR ALL viewport WHERE viewport.width >= 1024 DO
  ASSERT F(viewport) = F'(viewport)  // desktop nav, inline sidebar, no padding changes
END FOR
```
