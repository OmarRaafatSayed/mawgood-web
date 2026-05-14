<div align="center">
  <h1> Admin Panel
    <br> 
for <a href="https://github.com/mercurjs/mercur">Mercur</a> - Open Source Marketplace Platform  </h1>
  <!-- Shields.io Badges -->
  <a href="https://github.com/mercurjs/mercur/tree/main?tab=MIT-1-ov-file">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="#">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  </a>
  <a href="https://mercurjs.com/contact">
    <img alt="Support" src="https://img.shields.io/badge/support-contact%20author-blueviolet.svg" />
  </a>
</div>

## Admin Panel

Admin dashboard for Mawgood e-commerce platform built with React, Vite, and Medusa.

## 🚀 Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build:preview
```

## 📦 Production Deployment

### Important: SPA Configuration

This is a **Single Page Application (SPA)** using React Router for client-side routing. When deploying to production, you **must** configure your server to handle SPA routing correctly.

#### Using `serve` (Recommended)

```bash
# Build the application
yarn build:preview

# Serve with SPA mode enabled (IMPORTANT: use -n flag)
npx serve -s dist -l 5173 -n
```

**The `-n` flag is critical** - it enables SPA mode, which redirects all non-file requests to `index.html`, allowing React Router to handle routing.

#### Using Nginx

If using Nginx as a reverse proxy, add SPA fallback:

```nginx
server {
    listen 80;
    server_name admin.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        
        # SPA fallback - handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:5173;
    }
}
```

#### Using Docker

The Dockerfile is already configured with the `-n` flag:

```bash
docker build -t admin-panel .
docker run -p 8000:8000 admin-panel
```

### Common Issues

#### ❌ "Cannot GET /route" Error

**Cause**: Server not configured for SPA routing.

**Solution**: 
- If using `serve`: Add `-n` flag
- If using Nginx: Add SPA fallback configuration
- If using Docker: Rebuild with updated Dockerfile

#### ❌ 404 on Direct URL Access

**Cause**: Same as above - missing SPA configuration.

**Solution**: Follow the SPA configuration steps above.

## 🔧 Environment Variables

Create a `.env` file based on `.env.template`:

```env
VITE_MEDUSA_BASE=/
VITE_MEDUSA_BACKEND_URL=https://api.mawgood.cloud
VITE_MEDUSA_STOREFRONT_URL=https://mawgood.cloud
VITE_MEDUSA_PUBLISHABLE_KEY=your_key_here
```

## 📚 Scripts

- `yarn dev` - Start development server
- `yarn build` - Build library version (for package distribution)
- `yarn build:preview` - Build standalone application (for deployment)
- `yarn start` - Preview production build
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## 🏗️ Architecture

This admin panel is built on top of Medusa's admin framework with custom extensions for:
- Multi-language support (i18n)
- Custom product management
- Vendor management
- Order processing
- Customer management

## 📖 Documentation

For more details, see:
- [ADMIN_PANEL_SOLUTION.md](../ADMIN_PANEL_SOLUTION.md) - Deployment troubleshooting guide
- [Medusa Admin Documentation](https://docs.medusajs.com/admin/quickstart) for Mercur

The Admin Panel is a pivotal component of the MercurJS ecosystem, designed to provide admin with an intuitive interface to oversee their marketplace activities.

- Product Management: Add, edit, and organize products with ease.
- Order Tracking: Monitor order statuses and manage fulfillment processes.
- Store Customization: Update store details
- Sellers: manage vendor accounts
- Requests: accept or reject requests from vendors
- Attributes: manage global product attributes in the store
- Commissions: manage and inspect commissions

# Part of Mercur

<a href="https://github.com/mercurjs/mercur">Mercur</a> is an open source marketplace platform that allows you to create high-quality experiences for shoppers and vendors while having the most popular Open Source commerce platform MedusaJS as a foundation.

Mercur is a platform to start, customize, manage, and scale your marketplace for every business model with a modern technology stack.

![Mercur](https://cdn.prod.website-files.com/6790aeffc4b432ccaf1b56e5/67a1020f202572832c954ead_6b96703adfe74613f85133f83a19b1f0_Fleek%20Tilt%20-%20Readme.png)

# Quickstart

## Installation

Clone the repository

```js
git clone https://github.com/mercurjs/admin-panel.git
```

&nbsp;

Go to directory

```js
cd admin-panel
```

&nbsp;

Install dependencies

```js
npm install
```

&nbsp;

Make a .env.local file and copy the code below

```js
VITE_MEDUSA_BASE='/'
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
```

&nbsp;

Start storefront

```js
npm run dev
```

&nbsp;

## Guides

<a href="https://talkjs.com/docs/Reference/Concepts/Sessions/" target="_blank">How
to get TalkJs App ID</a>
