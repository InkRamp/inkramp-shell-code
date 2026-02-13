const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

// Get all shared dependencies
const sharedDeps = shareAll({ 
  singleton: true, 
  strictVersion: false, 
  requiredVersion: 'auto', 
  eager: false 
});

// Remove @opensourcekd/ng-common-libs from sharing so it gets bundled directly
// This is needed because the library exports are not being properly resolved in Module Federation
delete sharedDeps['@opensourcekd/ng-common-libs'];

module.exports = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...sharedDeps,
    '@org/core-services': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
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
