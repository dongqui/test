const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
// 증복된 라이브러리를 체크하기 위한 checker (빌드 시에만 활성화시켜 확인)
// const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: false });

module.exports = withBundleAnalyzer({
  distDir: '_next',
  webpack(config, options) {
    const { dev, isServer } = options;

    if (dev && isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          logger: {
            infrastructure: 'console',
          },
          eslint: {
            enabled: true,
            files: './src/**/*.{js,jsx,ts,tsx}',
          },
        }),
      );
    }

    config.plugins.push(
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            [
              'svgo',
              {
                plugins: [
                  {
                    removeViewBox: false
                  }
                ]
              }
            ]
          ]
        }
      })
    )

    // 증복된 라이브러리를 체크하기 위한 checker
    // config.plugins.push(new DuplicatePackageCheckerPlugin());

    return config;
  },
});