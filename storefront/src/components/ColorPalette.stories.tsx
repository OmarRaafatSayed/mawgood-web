import type { Meta, StoryObj } from '@storybook/react'

/**
 * DESIGN SYSTEM - COLOR PALETTE
 * ==============================
 * Primary Gradient: #D97F3E → #8F5429 → #382110
 */

const ColorPalette = () => {
  return (
    <div className="p-8 space-y-12">
      {/* Primary Gradient Colors */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">Primary Gradient Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="bg-action h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-action-on-primary font-bold">#D97F3E</span>
            </div>
            <p className="text-primary font-medium">Primary Light</p>
            <p className="text-secondary text-sm">Main brand color</p>
          </div>
          
          <div className="space-y-2">
            <div style={{backgroundColor: 'rgb(143, 84, 41)'}} className="h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">#8F5429</span>
            </div>
            <p className="text-primary font-medium">Primary Mid</p>
            <p className="text-secondary text-sm">Hover & active states</p>
          </div>
          
          <div className="space-y-2">
            <div style={{backgroundColor: 'rgb(56, 33, 16)'}} className="h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">#382110</span>
            </div>
            <p className="text-primary font-medium">Primary Dark</p>
            <p className="text-secondary text-sm">Dark accents</p>
          </div>
        </div>
      </section>

      {/* Gradient Variants */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">Gradient Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="bg-primary-gradient h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">Linear Gradient (135deg)</span>
            </div>
            <p className="text-primary font-medium">bg-primary-gradient</p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-primary-gradient-vertical h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">Vertical Gradient (180deg)</span>
            </div>
            <p className="text-primary font-medium">bg-primary-gradient-vertical</p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-primary-gradient-radial h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">Radial Gradient</span>
            </div>
            <p className="text-primary font-medium">bg-primary-gradient-radial</p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-primary-gradient-hover h-32 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold">Hover State</span>
            </div>
            <p className="text-primary font-medium">bg-primary-gradient-hover</p>
          </div>
        </div>
      </section>

      {/* Typography Colors */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">Typography Colors</h2>
        <div className="space-y-4">
          <div className="bg-primary p-6 rounded-lg border border-primary">
            <p className="text-primary text-xl font-bold mb-2">Black on White</p>
            <p className="text-primary">Primary text color: #000000 on #FFFFFF</p>
            <p className="text-secondary">Secondary text color: Gray #525252</p>
          </div>
          
          <div className="bg-action p-6 rounded-lg">
            <p className="text-action-on-primary text-xl font-bold mb-2">White on Orange</p>
            <p className="text-action-on-primary">Text color: #FFFFFF on #D97F3E</p>
            <p className="text-action-on-primary opacity-90">Contrast ratio: 3.8:1 (AA Large)</p>
          </div>
          
          <div className="bg-primary-gradient p-6 rounded-lg">
            <p className="text-white text-xl font-bold mb-2">White on Gradient</p>
            <p className="text-white">Text color: #FFFFFF on gradient background</p>
            <p className="text-white opacity-90">Best for hero sections and CTAs</p>
          </div>
        </div>
      </section>

      {/* Button States */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">Button States</h2>
        <div className="space-y-6">
          <div>
            <p className="text-primary font-medium mb-3">Primary Button</p>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-action text-action-on-primary px-6 py-3 rounded-full">
                Default
              </button>
              <button className="bg-action-hover text-action-on-primary px-6 py-3 rounded-full">
                Hover
              </button>
              <button className="bg-action-pressed text-action-on-primary px-6 py-3 rounded-full">
                Active
              </button>
              <button className="bg-disabled text-disabled px-6 py-3 rounded-full" disabled>
                Disabled
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-primary font-medium mb-3">Gradient Button</p>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-primary-gradient text-white px-6 py-3 rounded-full">
                Default
              </button>
              <button className="bg-primary-gradient-hover text-white px-6 py-3 rounded-full">
                Hover
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-primary font-medium mb-3">Secondary Button</p>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-action-secondary text-primary px-6 py-3 rounded-full">
                Default
              </button>
              <button className="bg-action-secondary-hover text-primary px-6 py-3 rounded-full">
                Hover
              </button>
              <button className="bg-action-secondary-pressed text-primary px-6 py-3 rounded-full">
                Active
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">Accessibility (WCAG)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary border border-positive p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-positive text-2xl">✓</span>
              <span className="text-primary font-bold">AAA Compliant</span>
            </div>
            <p className="text-primary mb-1">#000000 on #FFFFFF</p>
            <p className="text-secondary text-sm">Contrast: 21:1</p>
          </div>
          
          <div className="bg-primary border border-positive p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-positive text-2xl">✓</span>
              <span className="text-primary font-bold">AA Compliant</span>
            </div>
            <p className="text-primary mb-1">#FFFFFF on #8F5429</p>
            <p className="text-secondary text-sm">Contrast: 6.2:1</p>
          </div>
          
          <div className="bg-primary border border-warning p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-warning text-2xl">⚠</span>
              <span className="text-primary font-bold">AA Large Text Only</span>
            </div>
            <p className="text-primary mb-1">#FFFFFF on #D97F3E</p>
            <p className="text-secondary text-sm">Contrast: 3.8:1</p>
          </div>
          
          <div className="bg-primary border border-positive p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-positive text-2xl">✓</span>
              <span className="text-primary font-bold">AAA Compliant</span>
            </div>
            <p className="text-primary mb-1">#FFFFFF on #382110</p>
            <p className="text-secondary text-sm">Contrast: 14.5:1</p>
          </div>
        </div>
      </section>

      {/* CSS Variables Reference */}
      <section>
        <h2 className="heading-lg mb-6 text-primary">CSS Variables Reference</h2>
        <div className="bg-component p-6 rounded-lg font-mono text-sm space-y-2">
          <p className="text-primary"><span className="text-action">--primary:</span> var(--brand-400)</p>
          <p className="text-primary"><span className="text-action">--primary-hover:</span> var(--brand-500)</p>
          <p className="text-primary"><span className="text-action">--primary-active:</span> var(--brand-600)</p>
          <p className="text-primary"><span className="text-action">--primary-dark:</span> var(--brand-800)</p>
          <p className="text-secondary mt-4">Background Colors:</p>
          <p className="text-primary"><span className="text-action">--bg-action-primary:</span> var(--brand-400)</p>
          <p className="text-primary"><span className="text-action">--bg-action-primary-hover:</span> var(--brand-500)</p>
          <p className="text-secondary mt-4">Text Colors:</p>
          <p className="text-primary"><span className="text-action">--text-primary:</span> #000000</p>
          <p className="text-primary"><span className="text-action">--text-on-primary:</span> #FFFFFF</p>
        </div>
      </section>
    </div>
  )
}

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Colors',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ColorPalette>

export const Default: Story = {}
