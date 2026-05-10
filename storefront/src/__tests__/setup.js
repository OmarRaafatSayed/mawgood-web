// Jest setup file
// Extend expect with jest-dom matchers
require('@testing-library/jest-dom')

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useParams: jest.fn(() => ({ locale: 'en' })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
    getAll: jest.fn(() => []),
    has: jest.fn(() => false),
    entries: jest.fn(() => []),
    forEach: jest.fn(),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    toString: jest.fn(() => ''),
  })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key) => key),
  useLocale: jest.fn(() => 'en'),
}))

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react')
  return function MockLink({ href, children, ...props }) {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock next/script
jest.mock('next/script', () => {
  const React = require('react')
  return function MockScript() {
    return null
  }
})

// Suppress console errors for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Suppress known React/Next.js warnings in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
        args[0].includes('ReactDOM.render') ||
        args[0].includes('act('))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
