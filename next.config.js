const withPWA = require('next-pwa');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = withPWA({
  pwa: {
    disable: process.env.NEXT_PUBLIC_IS_DEV === 'true',
    dest: 'pwa',
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  distDir: '_next',
//   webpack(config, options) {
//     const { dev, isServer } = options;
//     // Do not run type checking twice:
//     if (dev && isServer) {
//       config.plugins.push(new ForkTsCheckerWebpackPlugin());
//     }
//     return config;
//   },
  trailingSlash: true,
});
