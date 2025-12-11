# API Configuration Testing Guide

This document explains how to test and verify the API configuration system.

## Overview

The API configuration system uses environment-specific files that get replaced during the build process:
- **Development**: Uses `src/environments/environment.ts` with local/dev API URL
- **Production**: Uses `src/environments/environment.prod.ts` which gets its URL from GitHub variables

## Testing Locally

### 1. Test Development Build

```bash
# Update src/environments/environment.ts with your dev API URL
# Then build for development
npm run build -- --configuration development

# Verify the dev URL is in the build
grep -r "apiBaseUrl" dist/i17e/*.js
```

### 2. Test Production Build (without GitHub Actions)

```bash
# Manually replace the placeholder in environment.prod.ts
API_URL="https://your-test-api.com"
sed -i "s|#{API_BASE_URL}#|$API_URL|g" src/environments/environment.prod.ts

# Build for production
npm run build -- --configuration production

# Verify the URL was injected
grep -r "$API_URL" dist/i17e/*.js

# Reset the file
git checkout src/environments/environment.prod.ts
```

### 3. Test Runtime Configuration Update

Create a test file `test-api-config.ts`:

```typescript
import { updateApiConfig, getApiConfig, API_CONFIG } from '@org/core-services';

// Test 1: Check initial config
console.log('Initial config:', getApiConfig());
console.log('Initial API_CONFIG:', API_CONFIG);

// Test 2: Update configuration
const newUrl = 'https://new-api-url.com';
updateApiConfig({ baseUrl: newUrl });

// Test 3: Verify both references see the update
console.log('After update - getApiConfig():', getApiConfig());
console.log('After update - API_CONFIG:', API_CONFIG);
console.log('URLs match:', getApiConfig().baseUrl === API_CONFIG.baseUrl);
console.log('Same object reference:', getApiConfig() === API_CONFIG);
```

## Testing in CI/CD

### 1. Set up GitHub Variable

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions** → **Variables**
3. Create variable:
   - Name: `API_BASE_URL`
   - Value: `https://your-production-api.com`

### 2. Trigger Deployment

Push to main or develop branch:

```bash
git push origin main
```

### 3. Verify in Workflow Logs

Check the GitHub Actions logs for the "Configure API URL from GitHub Variables" step:

```
Using API Base URL: https://your-production-api.com
Updated environment.prod.ts:
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-production-api.com'
};
```

### 4. Verify in Deployed Application

1. Open browser developer tools
2. Navigate to the deployed application
3. Check the Network tab for API calls
4. Verify they're going to the correct API base URL

Or check the built JavaScript:

```bash
# After deployment, check the deployed files
curl https://opensourcekd.github.io/i17e/main.*.js | grep -o 'apiBaseUrl:"[^"]*"'
```

## Common Test Scenarios

### Scenario 1: No GitHub Variable Set

**Expected**: Uses default fallback URL

```bash
# In workflow:
API_URL="${{ vars.API_BASE_URL || secrets.API_BASE_URL || 'https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com' }}"
# Results in: https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com
```

### Scenario 2: Variable Set in GitHub

**Expected**: Uses the configured variable

```bash
# In workflow:
API_URL="${{ vars.API_BASE_URL }}"
# Results in: https://your-configured-api.com
```

### Scenario 3: Secret Set Instead of Variable

**Expected**: Uses the secret value

```bash
# In workflow:
API_URL="${{ secrets.API_BASE_URL }}"
# Results in: https://your-secret-api.com
```

### Scenario 4: Both Variable and Secret Set

**Expected**: Variable takes precedence

```bash
# In workflow:
API_URL="${{ vars.API_BASE_URL || secrets.API_BASE_URL }}"
# Results in: vars.API_BASE_URL value
```

## Troubleshooting

### Issue: API calls going to wrong URL

**Check**:
1. Verify GitHub variable is set correctly
2. Check workflow logs for "Using API Base URL: ..."
3. Inspect built JavaScript files for the API URL
4. Verify environment.prod.ts was properly replaced

**Solution**:
```bash
# Check the workflow log
# Look for the "Configure API URL" step output

# Manually verify the built files
grep -r "apiBaseUrl" dist/i17e/*.js
```

### Issue: Placeholder still in production build

**Check**:
- Is the sed command running in the workflow?
- Is the file path correct in the workflow?

**Solution**:
```bash
# Verify the sed command works locally
sed -i "s|#{API_BASE_URL}#|TEST_URL|g" src/environments/environment.prod.ts
cat src/environments/environment.prod.ts
git checkout src/environments/environment.prod.ts
```

### Issue: Configuration not updating at runtime

**Check**:
- Are you using `API_CONFIG` or `getApiConfig()`?
- Both should work, but verify object reference is maintained

**Solution**:
```typescript
// Test that both see the same object
console.log(API_CONFIG === getApiConfig()); // Should be true

// Update and verify
updateApiConfig({ baseUrl: 'https://test.com' });
console.log(API_CONFIG.baseUrl); // Should be https://test.com
```

## Verification Checklist

- [ ] Development build uses correct dev URL
- [ ] Production build replaces placeholder correctly
- [ ] GitHub variable/secret is set
- [ ] Workflow logs show correct URL being injected
- [ ] API calls in deployed app go to correct endpoint
- [ ] Runtime configuration updates work correctly
- [ ] All references (API_CONFIG, getApiConfig()) see updates

## References

- [Deployment Guide](./DEPLOYMENT.md)
- [API Contracts](./API_CONTRACTS.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
