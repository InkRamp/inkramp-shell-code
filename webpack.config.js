const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'shell',

  // useful for remote. Not used in prod
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  // Expose shared services for MFEs
  exposes: {
    './RoleService': './src/app/services/role.service.ts',
    './DummyDataService': './src/app/services/dummy-data.service.ts',
    './MfeLoaderService': './src/app/services/mfe-loader.service.ts',
    './Models': './src/app/models/index.ts',
  },

});
