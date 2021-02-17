const path = require('path');

module.exports = {
  webpackFinal: async (config, { configType }) => {
    config.resolve.modules = [
      path.resolve(__dirname, '..', 'src'),
      'node_modules',
    ],
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '..', 'src'),
    });
    return config;
  },
  "stories": [
    "../src/docs/**/**/*.stories.mdx",
    "../src/docs/**/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}