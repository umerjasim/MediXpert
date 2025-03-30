const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (webpackConfig.plugins) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => !(plugin instanceof WorkboxWebpackPlugin.InjectManifest)
        );
      }
      return webpackConfig;
    },
  },
};
