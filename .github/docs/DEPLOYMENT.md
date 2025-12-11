# Deployment Guide

This document describes how to deploy the i17e application to GitHub Pages.

## GitHub Variables Configuration

### Setting up API_BASE_URL

The application requires the API base URL to be configured via GitHub Variables or Secrets.

#### Option 1: Using GitHub Variables (Recommended)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click on the **Variables** tab
4. Click **New repository variable**
5. Set:
   - **Name**: `API_BASE_URL`
   - **Value**: Your API Gateway URL (e.g., `https://your-api-id.execute-api.us-east-1.amazonaws.com`)
6. Click **Add variable**

#### Option 2: Using GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click on the **Secrets** tab
4. Click **New repository secret**
5. Set:
   - **Name**: `API_BASE_URL`
   - **Value**: Your API Gateway URL
6. Click **Add secret**

### Variable Priority

The deployment workflow checks for the API URL in this order:
1. GitHub Variables (`vars.API_BASE_URL`)
2. GitHub Secrets (`secrets.API_BASE_URL`)
3. Default fallback URL (if neither is set)

## Deployment Process

The deployment is automated via GitHub Actions and triggers on:
- Pushes to `main` branch
- Pushes to `develop` branch
- Manual workflow dispatch

### Workflow Steps

1. **Checkout** - Gets the latest code
2. **Setup Node.js** - Installs Node.js 21
3. **Configure API URL** - Injects the API_BASE_URL from GitHub variables into the build
4. **Build** - Compiles the Angular application for production
5. **404 Hack** - Copies index.html to 404.html for client-side routing
6. **Deploy** - Pushes the built files to the target repository

### Skipping CI

To skip the CI build, include one of these tags in your commit message:
- `[skip ci]`
- `[ci skip]`
- `[skip-ci]`
- `[ci-skip]`

## Local Development

For local development, the API URL is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://your-dev-api-url.com'
};
```

You can update this file with your local or development API URL.

## Production Build

To build for production locally:

```bash
npm run build -- --configuration production
```

This will use `src/environments/environment.prod.ts` which contains the placeholder that gets replaced during CI/CD.

## Troubleshooting

### API calls failing after deployment

1. Verify the `API_BASE_URL` variable is set correctly in GitHub
2. Check the deployment logs to see what URL was injected
3. Inspect the built JavaScript files to verify the URL was replaced

### Environment file not being replaced

1. Ensure the `fileReplacements` configuration is correct in `angular.json`
2. Verify you're building with `--configuration production`
3. Check that both environment files exist in `src/environments/`

## Related Files

- `.github/workflows/to_pages.yml` - Deployment workflow
- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration template
- `projects/core-services/src/lib/config/api.config.ts` - API configuration
