// const withPWA = require('next-pwa');
const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// 증복된 라이브러리를 체크하기 위한 checker (빌드 시에만 활성화시켜 확인)
// const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: false });

module.exports = withBundleAnalyzer({
  distDir: '_next',
  // pwa: {
  //   disable: true,
  //   dest: 'pwa',
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  sassLoader: {
    includePaths: path.join(__dirname, 'src'),
  },
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

    /**
     * 번들사이즈를 줄이기 위해
     * moment의 locales 중 필요한 언어만 가져오기 위한 설정
     */
    config.plugins.push(
      new webpack.ContextReplacementPlugin(
        /moment[/\\]locale$/,
        /ko/,
      ),
    );

    // 증복된 라이브러리를 체크하기 위한 checker
    // config.plugins.push(new DuplicatePackageCheckerPlugin());

    return config;
  },
});