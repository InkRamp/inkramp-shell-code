const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name:"shell",
  // Commenting as dynamic federation in place
  // remotes: {
  //   //"mfe1": "http://localhost:3000/remoteEntry.js",    
  //   pokemon: "@http://localhost:3000/angular/remoteEntry.js",
  // },

  shared: {
    //...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true },
  },

});
