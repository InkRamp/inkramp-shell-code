const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto', eager: false }),
    // zone.js must be eager so it is published to the shared scope before any MFE
    // is resolved, guaranteeing a single zone.js instance across shell and all MFEs.
    // A second zone.js instance would cause async operations in MFEs to run outside
    // Angular's zone, silently breaking change detection.
    'zone.js': { singleton: true, strictVersion: false, requiredVersion: 'auto', eager: true },
    '@org/core-services': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@opensourcekd/ng-common-libs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
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
