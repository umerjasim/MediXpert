// // craco.config.js
// const WorkboxPlugin = require('workbox-webpack-plugin');

// module.exports = {
//   webpack: {
//     plugins: [
//       new WorkboxPlugin.GenerateSW({
//         clientsClaim: true,
//         skipWaiting: true,
//         exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
//         runtimeCaching: [
//           {
//             urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|js|css|html)$/,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'assets',
//               expiration: {
//                 maxEntries: 50,
//                 maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
//               },
//             },
//           },
//         ],
//       }),
//     ],
//     configure: (webpackConfig) => {
//       // Remove CRA's default GenerateSW plugin
//       webpackConfig.plugins = webpackConfig.plugins.filter(
//         (plugin) => plugin.constructor.name !== 'GenerateSW'
//       );
//       return webpackConfig;
//     },
//   },
// };


const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/service-worker.ts', // Your custom service worker
        swDest: 'service-worker.js',
      }),
    ],
    configure: (webpackConfig) => {
      // Remove CRA's default GenerateSW plugin if it exists
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'GenerateSW'
      );
      return webpackConfig;
    },
  },
};
