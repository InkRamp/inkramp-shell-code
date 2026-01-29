const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto', eager: false }),
  },

  // Expose shared services for MFEs from _temp-shared folder
  exposes: {
    './RoleService': './src/_temp-shared/role.service.ts',
    './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
    './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
    './EventBusService': './src/_temp-shared/event-bus.service.ts',
    './Models': './src/_temp-shared/models/roles.model.ts',
    './DataModels': './src/_temp-shared/models/data.model.ts',
    './MfeModels': './src/_temp-shared/models/mfe.model.ts',
  },

});
