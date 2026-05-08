# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Mobile UI Bugs (Spacer Height, Filter Trigger, isMobile Mount, Mobile Padding)
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope each property to the concrete failing case(s) to ensure reproducibility

  **Bug 1 — Spacer Height:**
  - Render `BottomNavbar` with a mocked `env(safe-area-inset-bottom)` of 34 px (iPhone 14)
  - Query the spacer `<div className="lg:hidden w-full">` and assert its computed height equals `calc(68px + 34px) = 102px`
  - Run on UNFIXED code — spacer height will be 68 px regardless of safe-area inset
  - Document counterexample: "Spacer height is 68 px when safeAreaInsetBottom = 34 px; last content item hidden by 34 px"

  **Bug 2 — Filter Trigger Outside Drawer Context:**
  - Render `ProductsListing` (inside `AlgoliaProductsListing.tsx`) with mock facets on a mobile viewport
  - Simulate a tap on the Filter button (`<Trigger asChild>`)
  - Assert the drawer content (`<Content>`) becomes visible
  - Run on UNFIXED code — drawer will not open because `<Trigger>` is outside `<Drawer>` context
  - Document counterexample: "Tapping Filter button produces no visible drawer; Trigger has no Drawer ancestor"

  **Bug 3 — isMobile Never True on Mount:**
  - Render `AlgoliaProductSidebar` with `window.innerWidth = 390` (no resize event fired)
  - Assert `isMobile = true` immediately after mount
  - Assert the mobile layout (modal/button) is rendered, not the desktop accordion list
  - Run on UNFIXED code — `isMobile` stays `false` on first render
  - Document counterexample: "AlgoliaProductSidebar renders desktop accordion layout on 390 px viewport on first paint"

  **Bug 4 — Products Page Missing Mobile Padding:**
  - Render the `AllProducts` page on a 375 px viewport
  - Query the `<main>` element and assert it has `px-4` class or `paddingInline >= 16px`
  - Run on UNFIXED code — `<main className="container">` has zero horizontal padding on mobile
  - Document counterexample: "`<main>` has zero horizontal padding on 375 px viewport; content touches screen edges"

  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop Layout Unchanged Across All Non-Buggy Viewports
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for desktop viewports (≥ 1024 px) and non-affected mobile states

  **Observation steps (run on unfixed code first):**
  - Observe: `BottomNavbar` on viewport ≥ 1024 px renders with `lg:hidden` — nav and spacer are not visible
  - Observe: `AlgoliaProductSidebar` on `window.innerWidth = 1280` renders the inline accordion list (not a modal button)
  - Observe: `AllProducts` `<main>` on viewport ≥ 768 px has no `px-4` class
  - Observe: Cart badge displays correct count before and after any change
  - Observe: Active route highlighting uses `#F36418` for the active nav item

  **Property-based tests to write:**
  - For all viewport widths in `[1024, 2560]`: assert `BottomNavbar` nav and spacer are hidden (`lg:hidden` applied)
  - For all `window.innerWidth` values in `[768, 2560]`: assert `AlgoliaProductSidebar` renders the desktop accordion list (isMobile = false)
  - For all viewport widths in `[768, 2560]`: assert `AllProducts` `<main>` does not have extra horizontal padding from the mobile fix
  - For any cart state with N items: assert cart badge in `BottomNavbar` displays N (or "9+") — identical before and after fix
  - For any pathname: assert the active nav item is highlighted with `#F36418` — identical before and after fix

  - Verify all preservation tests PASS on UNFIXED code before proceeding
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

- [x] 3. Fix all four mobile UI bugs

  - [x] 3.1 Fix spacer height in `BottomNavbar.tsx`
    - File: `storefront/src/components/cells/BottomNavbar/BottomNavbar.tsx`
    - Replace spacer inline style `{ height: '68px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }` with `{ height: 'calc(68px + env(safe-area-inset-bottom, 0px))' }`
    - Optionally apply the same `calc(...)` to the `<nav>` element's `height` style for consistency
    - Remove the `paddingBottom` property from the spacer — it is no longer needed
    - _Bug_Condition: isBottomNavOverlapCondition(viewport, spacer) — viewport.width < 1024 AND spacer.heightPx < (68 + safeAreaInsetBottom)_
    - _Expected_Behavior: spacer.height = calc(68px + env(safe-area-inset-bottom, 0px)); lastContentItem.isVisible = true_
    - _Preservation: Desktop viewport ≥ 1024 px — spacer and nav remain hidden via lg:hidden; no change to desktop layout_
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 3.2 Restructure `<Drawer>` in `AlgoliaProductsListing.tsx` so `<Trigger>` is inside context
    - File: `storefront/src/components/sections/ProductListing/AlgoliaProductsListing.tsx`
    - Move the `<Drawer>` opening tag to wrap the entire `ProductsListing` return JSX (outside the root `<div className="py-4">`)
    - Remove the orphaned `<Drawer>` wrapper that currently wraps only `<Content>` at the bottom of the JSX
    - Keep `<Trigger asChild>` in its current visual position (top of listing) — it will now be inside the `<Drawer>` context
    - Keep `<Content>`, `<Header>`, `<Title>`, and `<Body>` in their current positions inside the new outer `<Drawer>`
    - Resulting structure: `<Drawer>` → `<div className="py-4">` → `<Trigger asChild>` (top) … `<Content>` (bottom)
    - _Bug_Condition: isFilterTriggerBrokenCondition(tree) — Trigger exists in tree AND no Drawer ancestor_
    - _Expected_Behavior: Trigger.isInsideDrawerContext = true; tapFilterButton() OPENS drawer_
    - _Preservation: Desktop viewport — Trigger button is hidden via md:hidden; inline sidebar continues to render; no drawer shown on desktop_
    - _Requirements: 2.3, 3.2, 3.3_

  - [x] 3.3 Add immediate `isMobile` check on mount in `AlgoliaProductSidebar.tsx`
    - File: `storefront/src/components/organisms/ProductSidebar/AlgoliaProductSidebar.tsx`
    - Inside the existing `useEffect`, call `handleResize()` once immediately before attaching the `resize` event listener
    - This ensures `isMobile` is set to the correct value on first render without waiting for a resize event
    - Since `AlgoliaProductSidebar` is only used inside `<Drawer.Body>` on mobile in this spec, optionally simplify the component by removing the `isMobile` / `isOpen` state and always rendering the accordion list directly — confirm no other usages require the self-contained mobile button before removing
    - _Bug_Condition: isMobileDetectionBrokenCondition(sidebar) — sidebar.windowInnerWidth < 768 AND sidebar.isMobileState = false AND sidebar.mountCompleted = true_
    - _Expected_Behavior: sidebar.isMobile = true ON MOUNT when window.innerWidth < 768; mobile filter layout renders correctly inside drawer_
    - _Preservation: Desktop viewport (window.innerWidth ≥ 768) — isMobile = false on mount; inline accordion list renders as before_
    - _Requirements: 2.4, 3.2, 3.4_

  - [x] 3.4 Add `px-4 md:px-0` mobile padding to products page
    - File: `storefront/src/app/[locale]/(main)/products/page.tsx`
    - Change `<main className="container">` to `<main className="container px-4 md:px-0">`
    - Verify the `md:px-0` override ensures desktop layout is unaffected (no extra padding on viewports ≥ 768 px)
    - _Bug_Condition: isMobilePaddingMissingCondition(page) — page.viewportWidth < 768 AND "px-4" NOT IN page.containerClasses_
    - _Expected_Behavior: main.paddingInline >= 16px on mobile; headings and product grid do not touch screen edges_
    - _Preservation: Desktop viewport ≥ 768 px — md:px-0 overrides px-4; container layout unchanged_
    - _Requirements: 2.5, 3.7_

  - [x] 3.5 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Mobile UI Bugs Fixed
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior for all four bugs
    - Re-run all four bug condition tests from step 1 against the fixed code
    - **EXPECTED OUTCOME**: All four tests PASS (confirms all bugs are fixed)
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop Layout Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2 against the fixed code
    - **EXPECTED OUTCOME**: All preservation tests PASS (confirms no regressions)
    - Confirm desktop nav hidden, inline sidebar, no extra padding, cart badge, and active route highlighting all behave identically to unfixed code on desktop viewports

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm all tests pass
  - Verify no TypeScript or lint errors are introduced by the changes
  - Confirm the four bug condition tests (task 1) now pass
  - Confirm all preservation tests (task 2) still pass
  - Ask the user if any questions arise before closing the spec
