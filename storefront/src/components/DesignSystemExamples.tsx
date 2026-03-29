/**
 * STOREFRONT DESIGN SYSTEM - COMPONENT EXAMPLES
 * ==============================================
 * Practical examples using the new Primary Gradient colors
 */

import React from 'react'

// ============================================
// 1. PRIMARY BUTTONS
// ============================================

export const PrimaryButton = () => (
  <button className="bg-action hover:bg-action-hover active:bg-action-pressed text-action-on-primary px-6 py-3 rounded-full font-medium transition-colors">
    Add to Cart
  </button>
)

export const GradientButton = () => (
  <button className="bg-primary-gradient hover:bg-primary-gradient-hover text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all">
    Shop Now
  </button>
)

export const SecondaryButton = () => (
  <button className="bg-action-secondary hover:bg-action-secondary-hover text-primary px-6 py-3 rounded-full font-medium transition-colors">
    Learn More
  </button>
)

// ============================================
// 2. HERO SECTIONS
// ============================================

export const HeroWithGradient = () => (
  <section className="bg-primary-gradient text-action-on-primary py-20 px-8">
    <h1 className="heading-xl mb-4">Welcome to Our Store</h1>
    <p className="text-lg mb-8">Discover amazing products with great deals</p>
    <button className="bg-primary-dark hover:bg-neutral-1000 text-white px-8 py-4 rounded-full">
      Start Shopping
    </button>
  </section>
)

export const HeroWithSolidOrange = () => (
  <section className="bg-action text-action-on-primary py-20 px-8">
    <h1 className="heading-xl mb-4">Special Offer</h1>
    <p className="text-lg mb-8">Limited time only - Save up to 50%</p>
    <button className="bg-white text-action hover:bg-neutral-25 px-8 py-4 rounded-full">
      Shop Sale
    </button>
  </section>
)

// ============================================
// 3. PRODUCT CARDS
// ============================================

export const ProductCard = () => (
  <div className="bg-primary border border-primary rounded-md p-6 shadow-sm hover:shadow-md transition-shadow">
    <img src="/product.jpg" alt="Product" className="w-full h-48 object-cover rounded-md mb-4" />
    <h3 className="text-primary heading-sm mb-2">Product Name</h3>
    <p className="text-secondary text-md mb-4">High quality product description</p>
    <div className="flex items-center justify-between">
      <span className="text-action font-bold text-xl">$99.99</span>
      <button className="bg-action hover:bg-action-hover text-action-on-primary px-4 py-2 rounded-full">
        Add to Cart
      </button>
    </div>
  </div>
)

export const ProductCardWithGradientAccent = () => (
  <div className="bg-primary border-t-4 border-action rounded-md p-6 shadow-sm">
    <div className="bg-primary-gradient w-full h-2 rounded-full mb-4"></div>
    <h3 className="text-primary heading-sm mb-2">Featured Product</h3>
    <p className="text-secondary text-md mb-4">Special edition item</p>
    <button className="bg-primary-gradient text-white w-full py-3 rounded-full">
      Buy Now
    </button>
  </div>
)

// ============================================
// 4. NAVIGATION BAR
// ============================================

export const Navbar = () => (
  <nav className="bg-primary border-b border-primary shadow-sm">
    <div className="container mx-auto flex items-center justify-between py-4">
      <div className="text-action font-bold text-2xl">StoreLogo</div>
      <div className="flex gap-6">
        <a href="#" className="text-primary hover:text-action transition-colors">Home</a>
        <a href="#" className="text-primary hover:text-action transition-colors">Products</a>
        <a href="#" className="text-primary hover:text-action transition-colors">About</a>
      </div>
      <button className="bg-action hover:bg-action-hover text-action-on-primary px-6 py-2 rounded-full">
        Sign In
      </button>
    </div>
  </nav>
)

export const NavbarWithGradient = () => (
  <nav className="bg-primary-gradient text-action-on-primary shadow-lg">
    <div className="container mx-auto flex items-center justify-between py-4">
      <div className="font-bold text-2xl">StoreLogo</div>
      <div className="flex gap-6">
        <a href="#" className="hover:opacity-80 transition-opacity">Home</a>
        <a href="#" className="hover:opacity-80 transition-opacity">Products</a>
        <a href="#" className="hover:opacity-80 transition-opacity">About</a>
      </div>
      <button className="bg-white text-action hover:bg-neutral-25 px-6 py-2 rounded-full">
        Sign In
      </button>
    </div>
  </nav>
)

// ============================================
// 5. CALL-TO-ACTION SECTIONS
// ============================================

export const CTASection = () => (
  <section className="bg-action text-action-on-primary py-16 px-8 rounded-lg">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
      <p className="text-lg mb-8">Join thousands of satisfied customers today</p>
      <div className="flex gap-4 justify-center">
        <button className="bg-primary-dark hover:bg-neutral-1000 text-white px-8 py-4 rounded-full">
          Get Started
        </button>
        <button className="bg-white text-action hover:bg-neutral-25 px-8 py-4 rounded-full">
          Learn More
        </button>
      </div>
    </div>
  </section>
)

export const CTAWithGradient = () => (
  <section className="bg-primary-gradient-vertical text-action-on-primary py-20 px-8">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="heading-xl mb-6">Limited Time Offer</h2>
      <p className="text-xl mb-10">Get 30% off your first purchase</p>
      <button className="bg-white text-action hover:bg-neutral-25 px-12 py-5 rounded-full text-lg font-bold shadow-xl">
        Claim Your Discount
      </button>
    </div>
  </section>
)

// ============================================
// 6. BADGES & TAGS
// ============================================

export const Badge = () => (
  <span className="bg-action text-action-on-primary px-3 py-1 rounded-full text-sm font-medium">
    New
  </span>
)

export const GradientBadge = () => (
  <span className="bg-primary-gradient text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
    Featured
  </span>
)

export const OutlineBadge = () => (
  <span className="border-2 border-action text-action px-3 py-1 rounded-full text-sm font-medium">
    Sale
  </span>
)

// ============================================
// 7. FORMS & INPUTS
// ============================================

export const FormExample = () => (
  <form className="bg-primary p-8 rounded-lg shadow-md max-w-md">
    <h3 className="text-primary heading-md mb-6">Contact Us</h3>
    
    <div className="mb-4">
      <label className="text-primary label-md mb-2 block">Name</label>
      <input 
        type="text" 
        className="w-full px-4 py-3 border border-primary rounded-md focus:border-action focus:outline-none focus:ring-2 focus:ring-action/20"
        placeholder="Your name"
      />
    </div>
    
    <div className="mb-6">
      <label className="text-primary label-md mb-2 block">Email</label>
      <input 
        type="email" 
        className="w-full px-4 py-3 border border-primary rounded-md focus:border-action focus:outline-none focus:ring-2 focus:ring-action/20"
        placeholder="your@email.com"
      />
    </div>
    
    <button className="bg-action hover:bg-action-hover text-action-on-primary w-full py-3 rounded-md font-medium">
      Submit
    </button>
  </form>
)

// ============================================
// 8. ALERTS & NOTIFICATIONS
// ============================================

export const SuccessAlert = () => (
  <div className="bg-positive text-positive-on-primary p-4 rounded-md flex items-center gap-3">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span>Item added to cart successfully!</span>
  </div>
)

export const InfoAlert = () => (
  <div className="bg-action text-action-on-primary p-4 rounded-md flex items-center gap-3">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    <span>Free shipping on orders over $50</span>
  </div>
)

// ============================================
// 9. FOOTER
// ============================================

export const Footer = () => (
  <footer className="bg-primary-dark text-action-on-primary py-12 px-8">
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h4 className="font-bold text-lg mb-4">About Us</h4>
        <p className="text-sm opacity-90">Your trusted online store for quality products</p>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:opacity-80">Products</a></li>
          <li><a href="#" className="hover:opacity-80">About</a></li>
          <li><a href="#" className="hover:opacity-80">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-4">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:opacity-80">FAQ</a></li>
          <li><a href="#" className="hover:opacity-80">Shipping</a></li>
          <li><a href="#" className="hover:opacity-80">Returns</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-4">Newsletter</h4>
        <input 
          type="email" 
          placeholder="Your email" 
          className="w-full px-4 py-2 rounded-md text-primary mb-2"
        />
        <button className="bg-action hover:bg-action-hover text-action-on-primary w-full py-2 rounded-md">
          Subscribe
        </button>
      </div>
    </div>
    <div className="container mx-auto mt-8 pt-8 border-t border-white/20 text-center text-sm opacity-80">
      © 2024 Your Store. All rights reserved.
    </div>
  </footer>
)

// ============================================
// 10. PRICING CARDS
// ============================================

export const PricingCard = () => (
  <div className="bg-primary border-2 border-primary rounded-lg p-8 hover:border-action transition-colors">
    <h3 className="text-primary heading-md mb-2">Basic Plan</h3>
    <div className="mb-6">
      <span className="text-action text-4xl font-bold">$29</span>
      <span className="text-secondary">/month</span>
    </div>
    <ul className="space-y-3 mb-8 text-primary">
      <li className="flex items-center gap-2">
        <span className="text-action">✓</span> Feature 1
      </li>
      <li className="flex items-center gap-2">
        <span className="text-action">✓</span> Feature 2
      </li>
      <li className="flex items-center gap-2">
        <span className="text-action">✓</span> Feature 3
      </li>
    </ul>
    <button className="bg-action hover:bg-action-hover text-action-on-primary w-full py-3 rounded-full">
      Get Started
    </button>
  </div>
)

export const FeaturedPricingCard = () => (
  <div className="bg-primary-gradient text-action-on-primary rounded-lg p-8 shadow-xl transform scale-105">
    <div className="bg-white text-action px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
      Most Popular
    </div>
    <h3 className="heading-md mb-2">Pro Plan</h3>
    <div className="mb-6">
      <span className="text-5xl font-bold">$79</span>
      <span className="opacity-90">/month</span>
    </div>
    <ul className="space-y-3 mb-8">
      <li className="flex items-center gap-2">
        <span>✓</span> All Basic features
      </li>
      <li className="flex items-center gap-2">
        <span>✓</span> Premium support
      </li>
      <li className="flex items-center gap-2">
        <span>✓</span> Advanced analytics
      </li>
    </ul>
    <button className="bg-white text-action hover:bg-neutral-25 w-full py-3 rounded-full font-bold">
      Get Started
    </button>
  </div>
)

export default {
  PrimaryButton,
  GradientButton,
  SecondaryButton,
  HeroWithGradient,
  ProductCard,
  Navbar,
  CTASection,
  Badge,
  FormExample,
  Footer,
  PricingCard,
}
