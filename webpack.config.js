const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto', 
      eager: false 
    }),
    // Make @org/core-services eager so it's available immediately for the shell's own use
    '@org/core-services': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      eager: true
    }
  },

  // Expose shared services for MFEs from core-services library
  exposes: {
    './RoleService': './projects/core-services/src/lib/role.service.ts',
    './DummyDataService': './projects/core-services/src/lib/dummy-data.service.ts',
    './MfeLoaderService': './projects/core-services/src/lib/mfe-loader.service.ts',
    './EventBusService': './projects/core-services/src/lib/event-bus.service.ts',
    './Models': './projects/core-services/src/lib/models/roles.model.ts',
    './DataModels': './projects/core-services/src/lib/models/data.model.ts',
    './MfeModels': './projects/core-services/src/lib/models/mfe.model.ts',
  },

});
