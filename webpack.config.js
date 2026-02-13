const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const path = require('path');

const config = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto', eager: false }),
    '@org/core-services': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    // Load @opensourcekd/ng-common-libs eagerly to ensure it's available at bootstrap time
    // eager: true makes the library load immediately with the main bundle instead of lazy loading
    // This fixes the "EventBus is not a constructor" error while maintaining singleton behavior across MFEs
    '@opensourcekd/ng-common-libs': { 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto', 
      eager: true
    },
  },

  // // Expose shared services for MFEs from _temp-shared folder
  // exposes: {
  //   './RoleService': './src/_temp-shared/role.service.ts',
  //   './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
  //   './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
  //   './EventBusService': './src/_temp-shared/event-bus.service.ts',
  //   './AuthService': './src/_temp-shared/auth.service.ts',
  //   './AuthInterceptor': './src/_temp-shared/interceptors/auth.interceptor.ts',
  //   './AuthConfig': './src/_temp-shared/config/auth.config.ts',
  //   './ApiConfig': './src/_temp-shared/config/api.config.ts',
  //   './UserProfileService': './src/_temp-shared/user-profile.service.ts',
  //   './Models': './src/_temp-shared/models/roles.model.ts',
  //   './DataModels': './src/_temp-shared/models/data.model.ts',
  //   './MfeModels': './src/_temp-shared/models/mfe.model.ts',
  // },

});

// Override webpack's resolve to use the actual library implementation
// This fixes the issue where tsconfig path mapping points to .d.ts file
config.resolve = config.resolve || {};
config.resolve.alias = config.resolve.alias || {};
// Use require.resolve to handle different package installation locations (monorepos, hoisting, etc.)
config.resolve.alias['@opensourcekd/ng-common-libs'] = require.resolve('@opensourcekd/ng-common-libs').replace(/index\.(cjs|d\.ts)$/, 'index.mjs');

module.exports = config;
