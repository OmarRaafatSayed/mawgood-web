/**
 * Bug Condition Exploration Tests — Mobile UI Fixes
 *
 * These tests MUST FAIL on unfixed code — failure confirms the bugs exist.
 * DO NOT fix the code when these tests fail.
 *
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — set up before importing components
// ---------------------------------------------------------------------------

// Mock useCartContext
jest.mock('@/components/providers', () => ({
  useCartContext: jest.fn(() => ({
    cart: { items: [] },
    onAddToCart: jest.fn(),
    addToCart: jest.fn(),
    removeCartItem: jest.fn(),
    updateCartItem: jest.fn(),
    refreshCart: jest.fn(),
    isUpdating: false,
    isAddingItem: false,
    isUpdatingItem: false,
    isRemovingItem: false,
  })),
}))

// Mock LocalizedLink
jest.mock('@/components/molecules/LocalizedLink/LocalizedLink', () => {
  return function MockLocalizedLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock icons
jest.mock('@/icons', () => ({
  HomeIcon: () => <svg data-testid="home-icon" />,
  SearchIcon: () => <svg data-testid="search-icon" />,
  CartIcon: () => <svg data-testid="cart-icon" />,
  ProfileIcon: () => <svg data-testid="profile-icon" />,
  HeartIcon: () => <svg data-testid="heart-icon" />,
  StoreIcon: () => <svg data-testid="store-icon" />,
  FilterIcon: () => <svg data-testid="filter-icon" />,
}))

// Mock @medusajs/ui Drawer — we need a real context-based implementation
// to test Bug 2 (Trigger outside Drawer context)
let drawerOpen = false
const DrawerContext = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
} | null>(null)

jest.mock('@medusajs/ui', () => {
  const React = require('react')
  const DrawerCtx = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null)

  const MockDrawer = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <DrawerCtx.Provider value={{ open, setOpen }}>
        <div data-testid="drawer-root">{children}</div>
      </DrawerCtx.Provider>
    )
  }

  const MockTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    const ctx = React.useContext(DrawerCtx)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: () => {
          if (ctx) {
            ctx.setOpen(true)
          }
          // If ctx is null, clicking does nothing — this is the bug condition
        },
        'data-has-drawer-context': ctx !== null ? 'true' : 'false',
      })
    }
    return (
      <button
        onClick={() => ctx && ctx.setOpen(true)}
        data-has-drawer-context={ctx !== null ? 'true' : 'false'}
      >
        {children}
      </button>
    )
  }

  const MockContent = ({ children }: { children: React.ReactNode }) => {
    const ctx = React.useContext(DrawerCtx)
    if (!ctx?.open) return null
    return <div data-testid="drawer-content">{children}</div>
  }

  const MockHeader = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-header">{children}</div>
  )
  const MockTitle = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-title">{children}</div>
  )
  const MockBody = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-body">{children}</div>
  )

  MockDrawer.displayName = 'Drawer'
  MockTrigger.displayName = 'Drawer.Trigger'
  MockContent.displayName = 'Drawer.Content'
  MockHeader.displayName = 'Drawer.Header'
  MockTitle.displayName = 'Drawer.Title'
  MockBody.displayName = 'Drawer.Body'

  return {
    Drawer: Object.assign(MockDrawer, {
      Trigger: MockTrigger,
      Content: MockContent,
      Header: MockHeader,
      Title: MockTitle,
      Body: MockBody,
    }),
    Button: ({ children, onClick, className }: any) => (
      <button onClick={onClick} className={className}>{children}</button>
    ),
    Chip: ({ value, selected, onSelect, className }: any) => (
      <button onClick={() => onSelect?.(value)} className={className} data-selected={selected}>
        {value}
      </button>
    ),
    Input: ({ placeholder, onChange, value, onBlur, type, className }: any) => (
      <input
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        onBlur={onBlur}
        type={type}
        className={className}
      />
    ),
    StarRating: ({ rate }: any) => <div data-testid="star-rating">{rate}</div>,
  }
})

// Mock AlgoliaProductSidebar for ProductsListing tests (Bug 2)
jest.mock('@/components/organisms/ProductSidebar/AlgoliaProductSidebar', () => ({
  AlgoliaProductSidebar: ({ facets }: any) => (
    <div data-testid="algolia-product-sidebar">Sidebar</div>
  ),
}))

// Mock other organisms/molecules used in ProductsListing
jest.mock('@/components/organisms', () => ({
  AlgoliaProductSidebar: ({ facets }: any) => (
    <div data-testid="algolia-product-sidebar">Sidebar</div>
  ),
  ProductListingActiveFilters: () => <div data-testid="active-filters" />,
  ProductsPagination: () => <div data-testid="pagination" />,
  ProductListingSkeleton: () => <div data-testid="skeleton" />,
}))

jest.mock('@/components/molecules', () => ({
  ProductListingLoadingView: () => <div data-testid="loading-view" />,
  ProductListingNoResultsView: () => <div data-testid="no-results-view" />,
  ProductListingProductsView: ({ products }: any) => (
    <div data-testid="products-view">{products.length} products</div>
  ),
  Accordion: ({ heading, children }: any) => (
    <div data-testid={`accordion-${heading}`}>
      <div>{heading}</div>
      {children}
    </div>
  ),
  FilterCheckboxOption: ({ label, checked, onCheck }: any) => (
    <label>
      <input type="checkbox" checked={checked} onChange={() => onCheck?.(label)} />
      {label}
    </label>
  ),
  Modal: ({ heading, children, onClose }: any) => (
    <div data-testid="modal" role="dialog">
      <div>{heading}</div>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  ),
}))

jest.mock('@/components/organisms/ProductListingSkeleton/ProductListingSkeleton', () => ({
  ProductListingSkeleton: () => <div data-testid="skeleton" />,
}))

// Mock hooks
jest.mock('@/hooks/useFilters', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    updateFilters: jest.fn(),
    isFilterActive: jest.fn(() => false),
  })),
}))

jest.mock('@/hooks/useUpdateSearchParams', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}))

jest.mock('@/hooks/useGetAllSearchParams', () => ({
  __esModule: true,
  default: jest.fn(() => ({ allSearchParams: {} })),
}))

// Mock lib helpers
jest.mock('@/lib/helpers/get-faced-filters', () => ({
  getFacedFilters: jest.fn(() => ''),
}))

jest.mock('@/lib/helpers/locale-mapping', () => ({
  getCountryFromLocale: jest.fn(() => 'US'),
}))

jest.mock('@/lib/data/products', () => ({
  searchProducts: jest.fn(() =>
    Promise.resolve({
      products: [{ id: '1', title: 'Test Product' }],
      facets: {},
      nbHits: 1,
      nbPages: 1,
    })
  ),
}))

// Mock VendorFilter cell
jest.mock('@/components/cells', () => ({
  VendorFilter: () => <div data-testid="vendor-filter" />,
  BottomNavbar: jest.requireActual('@/components/cells').BottomNavbar,
}))

// ---------------------------------------------------------------------------
// Import components AFTER mocks
// ---------------------------------------------------------------------------
import { BottomNavbar } from '@/components/cells/BottomNavbar/BottomNavbar'

// We import ProductsListing indirectly via AlgoliaProductsListing
// but we need the inner ProductsListing — we'll test via AlgoliaProductsListing
// Actually, ProductsListing is not exported, so we test via the file directly.
// We'll re-import the module to get the named export.

// ---------------------------------------------------------------------------
// Bug 1 — Spacer Height
// ---------------------------------------------------------------------------

describe('Bug 1 — Spacer Height: BottomNavbar spacer does not account for safe-area-inset-bottom', () => {
  /**
   * Validates: Requirements 1.1
   *
   * The spacer <div className="lg:hidden w-full"> uses:
   *   style={{ height: '68px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
   *
   * This means the spacer's HEIGHT is always 68px regardless of safe-area-inset-bottom.
   * The correct fix would be: style={{ height: 'calc(68px + env(safe-area-inset-bottom, 0px))' }}
   *
   * EXPECTED TO FAIL on unfixed code:
   * - The spacer height style is '68px' instead of 'calc(68px + env(safe-area-inset-bottom, 0px))'
   *
   * Counterexample: Spacer height is 68px when safeAreaInsetBottom = 34px;
   * last content item hidden by 34px.
   */
  it('spacer height should be calc(68px + env(safe-area-inset-bottom, 0px)) to account for safe area inset', () => {
    render(<BottomNavbar />)

    // Find the spacer div — it has className "lg:hidden w-full" and is NOT the nav
    // The spacer is the second element after the nav
    const allDivs = document.querySelectorAll('div.lg\\:hidden.w-full')
    
    // If no div found with that exact class combo, look for the spacer by its style
    let spacerDiv: Element | null = null
    
    if (allDivs.length > 0) {
      spacerDiv = allDivs[0]
    } else {
      // Fallback: find by inline style height
      const allElements = document.querySelectorAll('[style]')
      for (const el of allElements) {
        const style = (el as HTMLElement).style
        if (style.height === '68px' && el.tagName === 'DIV') {
          spacerDiv = el
          break
        }
      }
    }

    expect(spacerDiv).not.toBeNull()

    const spacerStyle = (spacerDiv as HTMLElement).style

    // ASSERTION: The spacer height should use calc() to include safe-area-inset-bottom
    // On UNFIXED code, height is '68px' — this assertion WILL FAIL
    // On FIXED code, height will be 'calc(68px + env(safe-area-inset-bottom, 0px))'
    expect(spacerStyle.height).toBe('calc(68px + env(safe-area-inset-bottom, 0px))')
  })

  it('spacer should NOT have paddingBottom as the mechanism for safe-area compensation (padding does not increase height)', () => {
    render(<BottomNavbar />)

    const allDivs = document.querySelectorAll('div.lg\\:hidden.w-full')
    let spacerDiv: Element | null = allDivs.length > 0 ? allDivs[0] : null

    if (!spacerDiv) {
      const allElements = document.querySelectorAll('[style]')
      for (const el of allElements) {
        const style = (el as HTMLElement).style
        if (style.height === '68px' && el.tagName === 'DIV') {
          spacerDiv = el
          break
        }
      }
    }

    expect(spacerDiv).not.toBeNull()

    const spacerStyle = (spacerDiv as HTMLElement).style

    // ASSERTION: The spacer should NOT rely on paddingBottom for height compensation
    // On UNFIXED code, paddingBottom is 'env(safe-area-inset-bottom, 0px)' — this WILL FAIL
    // On FIXED code, paddingBottom should be empty/absent
    expect(spacerStyle.paddingBottom).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Bug 2 — Filter Trigger Outside Drawer Context
// ---------------------------------------------------------------------------

describe('Bug 2 — Filter Trigger Outside Drawer Context: tapping Filter button does not open drawer', () => {
  /**
   * Validates: Requirements 1.3
   *
   * In ProductsListing (AlgoliaProductsListing.tsx), the <Trigger asChild> is rendered
   * OUTSIDE the <Drawer> context. The <Drawer> only wraps <Content>, not <Trigger>.
   *
   * EXPECTED TO FAIL on unfixed code:
   * - The Filter button has data-has-drawer-context="false"
   * - Clicking the Filter button does NOT show drawer content
   *
   * Counterexample: Tapping Filter button produces no visible drawer;
   * Trigger has no Drawer ancestor.
   */
  beforeEach(() => {
    // Reset modules to get fresh state
    jest.clearAllMocks()
  })

  it('Filter button should have access to Drawer context (Trigger must be inside Drawer)', async () => {
    // We need to render the actual ProductsListing component
    // Since it's not exported, we test via the module
    const { AlgoliaProductsListing } = require('@/components/sections/ProductListing/AlgoliaProductsListing')

    // Restore the real AlgoliaProductSidebar mock for this test
    await act(async () => {
      render(
        <AlgoliaProductsListing
          locale="en"
          currency_code="usd"
        />
      )
    })

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Find the Filter button (the Trigger asChild button)
    const filterButton = document.querySelector('[data-has-drawer-context]')

    // ASSERTION: The Filter button should have drawer context
    // On UNFIXED code, data-has-drawer-context="false" — this WILL FAIL
    // On FIXED code, data-has-drawer-context="true"
    expect(filterButton).not.toBeNull()
    expect(filterButton?.getAttribute('data-has-drawer-context')).toBe('true')
  })

  it('clicking Filter button should open the drawer content', async () => {
    const { AlgoliaProductsListing } = require('@/components/sections/ProductListing/AlgoliaProductsListing')

    await act(async () => {
      render(
        <AlgoliaProductsListing
          locale="en"
          currency_code="usd"
        />
      )
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Drawer content should not be visible initially
    expect(screen.queryByTestId('drawer-content')).toBeNull()

    // Find and click the Filter button
    const filterButton = document.querySelector('[data-has-drawer-context]') as HTMLElement
    expect(filterButton).not.toBeNull()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    // ASSERTION: Drawer content should be visible after clicking Filter
    // On UNFIXED code, drawer does NOT open (Trigger has no context) — this WILL FAIL
    // On FIXED code, drawer opens and content is visible
    expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Bug 3 — isMobile Never True on Mount
// ---------------------------------------------------------------------------

describe('Bug 3 — isMobile Never True on Mount: AlgoliaProductSidebar renders desktop layout on mobile viewport', () => {
  /**
   * Validates: Requirements 1.4
   *
   * AlgoliaProductSidebar initializes isMobile = false and only updates via resize event.
   * On first render with window.innerWidth = 390, isMobile stays false.
   *
   * EXPECTED TO FAIL on unfixed code:
   * - The component renders the desktop accordion layout (no modal/button)
   * - isMobile is false on mount even when window.innerWidth = 390
   *
   * Counterexample: AlgoliaProductSidebar renders desktop accordion layout
   * on 390px viewport on first paint.
   */

  // We need to import the REAL AlgoliaProductSidebar (not the mock)
  // So we need to reset the mock for this describe block
  let RealAlgoliaProductSidebar: React.ComponentType<{ facets: Record<string, any[]> }>

  beforeAll(() => {
    // Get the real module (bypassing the mock)
    jest.unmock('@/components/organisms/ProductSidebar/AlgoliaProductSidebar')
    jest.unmock('@/components/organisms')
    // Re-require the real component
    RealAlgoliaProductSidebar = require('@/components/organisms/ProductSidebar/AlgoliaProductSidebar').AlgoliaProductSidebar
  })

  afterAll(() => {
    // Restore mocks
    jest.mock('@/components/organisms/ProductSidebar/AlgoliaProductSidebar', () => ({
      AlgoliaProductSidebar: ({ facets }: any) => (
        <div data-testid="algolia-product-sidebar">Sidebar</div>
      ),
    }))
  })

  it('should render mobile layout (Filters button) when window.innerWidth = 390 on mount', () => {
    // Set window.innerWidth to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 390,
    })

    const mockFacets = {
      'variants.size': [],
      'variants.color': [],
      'variants.condition': [],
    }

    render(<RealAlgoliaProductSidebar facets={mockFacets} />)

    // ASSERTION: On mobile viewport (390px), the component should render the mobile layout
    // which shows a "Filters" button (not the desktop accordion list)
    // On UNFIXED code, isMobile = false on mount, so desktop layout renders — this WILL FAIL
    // On FIXED code, isMobile = true on mount, so mobile layout (Filters button) renders

    // The mobile layout renders a Button with text "Filters"
    const filtersButton = screen.queryByText('Filters')
    expect(filtersButton).toBeInTheDocument()
  })

  it('should NOT render desktop accordion list when window.innerWidth = 390 on mount (without resize event)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 390,
    })

    const mockFacets = {
      'variants.size': [],
      'variants.color': [],
      'variants.condition': [],
    }

    render(<RealAlgoliaProductSidebar facets={mockFacets} />)

    // ASSERTION: Desktop accordion layout should NOT be visible on 390px viewport
    // On UNFIXED code, desktop layout IS rendered (isMobile = false) — this WILL FAIL
    // On FIXED code, desktop layout is NOT rendered (isMobile = true)

    // The desktop layout renders VendorFilter directly (not inside a modal)
    // We check that the vendor-filter is NOT directly visible (it would be inside a modal on mobile)
    const vendorFilter = screen.queryByTestId('vendor-filter')
    // On unfixed code: vendor-filter IS visible (desktop layout)
    // On fixed code: vendor-filter is NOT visible until Filters button is clicked
    expect(vendorFilter).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Bug 4 — Products Page Missing Mobile Padding
// ---------------------------------------------------------------------------

describe('Bug 4 — Products Page Missing Mobile Padding: main element has no px-4 on mobile', () => {
  /**
   * Validates: Requirements 1.5
   *
   * The products page renders <main className="container"> with no horizontal padding.
   * On mobile (375px), content touches screen edges.
   *
   * EXPECTED TO FAIL on unfixed code:
   * - <main> does not have 'px-4' class
   * - <main> has no horizontal padding
   *
   * Counterexample: <main> has zero horizontal padding on 375px viewport;
   * content touches screen edges.
   */

  it('products page main element should have px-4 class for mobile padding', () => {
    // We test the static structure of the AllProducts page component
    // Since it's a server component with async data fetching, we test the
    // className directly by inspecting the source

    // Read the actual className from the component source
    // The bug is that <main className="container"> has no px-4
    // The fix would be <main className="container px-4 md:px-0">

    // We render a simplified version that mirrors the actual main element
    const MainElement = () => (
      // This mirrors the CURRENT (unfixed) code: <main className="container">
      <main className="container">
        <h1>All Products</h1>
      </main>
    )

    render(<MainElement />)

    const mainEl = document.querySelector('main')
    expect(mainEl).not.toBeNull()

    // ASSERTION: main should have px-4 class for mobile padding
    // On UNFIXED code, main only has 'container' class — this WILL FAIL
    // On FIXED code, main has 'container px-4 md:px-0'
    expect(mainEl).toHaveClass('px-4')
  })

  it('products page main element className should include px-4 (source code check)', () => {
    // Direct source code inspection: read the actual className from the page component
    // This is a deterministic test that checks the source directly

    const fs = require('fs')
    const path = require('path')

    const pageFilePath = path.join(
      __dirname,
      '../../app/[locale]/(main)/products/page.tsx'
    )

    const source = fs.readFileSync(pageFilePath, 'utf-8')

    // ASSERTION: The main element should have px-4 in its className
    // On UNFIXED code: <main className="container"> — no px-4 — this WILL FAIL
    // On FIXED code: <main className="container px-4 md:px-0">
    expect(source).toMatch(/<main[^>]*className="[^"]*px-4[^"]*"/)
  })
})
