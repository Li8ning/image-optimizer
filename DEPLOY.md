# Deployment Guide

This guide covers deploying the Image Optimizer Web App to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm
- Git repository initialized

## Build for Production

Before deploying, build the production-ready assets:

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment experience for Vite apps.

#### Automatic Deployment

1. Push your code to a GitHub repository
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Select your repository
5. Vercel automatically detects:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Vercel Configuration

Create `vercel.json` in the root directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 2. Netlify

Netlify also offers excellent support for static sites.

#### Automatic Deployment

1. Push your code to a GitHub repository
2. Visit [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Select your Git provider and repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

#### Netlify Configuration

Create `netlify.toml` in the root directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Required for WebAssembly SharedArrayBuffer
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

### 3. GitHub Pages

#### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: vite
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Manual Deployment

```bash
npm run build
npx gh-pages -d dist
```

### 4. Cloudflare Pages

1. Push your code to GitHub/GitLab
2. Visit [Cloudflare Dashboard](https://dash.cloudflare.com/pages)
3. Click "Create a project" > "Connect to Git"
4. Select your repository
5. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click "Deploy"

### 5. AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 6. Docker

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebAssembly headers for SharedArrayBuffer
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
}
```

Build and run:

```bash
docker build -t img-optimizer .
docker run -p 80:80 img-optimizer
```

## Environment Variables

The application doesn't require environment variables for basic functionality. All processing happens client-side.

For advanced configurations, you can create a `.env` file:

```env
# Optional: Analytics endpoint
VITE_ANALYTICS_ENDPOINT=

# Optional: Error reporting
VITE_ERROR_REPORTING_ENDPOINT=
```

## Troubleshooting

### WebAssembly Not Loading

If WebAssembly modules fail to load, ensure proper CORS headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### SharedArrayBuffer Errors

The app requires `SharedArrayBuffer` for WebAssembly multi-threading. Some hosting platforms may need additional configuration:

- **Vercel**: Works out of the box
- **Netlify**: Add headers in `netlify.toml` (shown above)
- **Cloudflare Pages**: Add headers in `_headers` file:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

### Large Image Processing

For very large images, processing happens in chunks to avoid browser memory limits. If you encounter memory issues:

1. Process images individually
2. Use lower quality settings
3. Clear browser cache and reload

## Performance Optimization

### CDN Caching

Configure your CDN to cache static assets:

```
/assets/* → Cache for 1 year
/index.html → Cache for 0 (no cache)
```

### Compression

Ensure your hosting provider enables Gzip/Brotli compression for:
- `.js` files
- `.css` files
- `.html` files

### Image Optimization

The WASM modules are already optimized. No additional optimization needed.

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings for performance monitoring.

### Error Tracking

Consider integrating an error tracking service like Sentry for production monitoring.

## Security Considerations

1. **Content Security Policy**: Configure CSP headers to allow WASM execution
2. **CORS**: Already configured for cross-origin isolation
3. **HTTPS**: Always use HTTPS in production

## Support

If you encounter deployment issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/img-optimizer/issues)
3. Open a new issue if needed
