// config-overrides.js
const { override, addWebpackPlugin } = require('customize-cra');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = override(
  (config) => {
    // Remove CRA's default GenerateSW plugin
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'GenerateSW'
    );

    // Add Workbox plugin to handle service worker generation
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|js|css|html)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      })
    );
    return config;
  }
);
