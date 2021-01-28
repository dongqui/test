const withPWA = require('next-pwa');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: false });
const withSass = require('@zeit/next-sass');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = withBundleAnalyzer(withPWA({
  distDir: '_next',
  pwa: {
    disable: process.env.NEXT_PUBLIC_IS_DEV === 'true',
    dest: 'pwa',
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  webpack(config, options) {
    const { dev, isServer } = options;

    if (dev && isServer) {
      config.plugins.push(new ForkTsCheckerWebpackPlugin({
        logger: {
          infrastructure: 'console',
        },
        eslint: {
          enabled: true,
          files: './src/**/*.{js,jsx,ts,tsx}'
        },
      }));
    }

    return config;
  },
}));

module.exports = withSass({
  cssModules: true,
});