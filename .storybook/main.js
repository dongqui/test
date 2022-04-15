const path = require('path');

module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: '@storybook/preset-scss',
      options: {
        cssLoaderOptions: {
          modules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        },
        sassLoaderOptions: {
          sassOptions: {
            includePaths: [path.join(__dirname, '../src')],
          }
        },
      }
    },
  ],
  framework: "@storybook/react",
  staticDirs: [path.join(__dirname, '../public')],
  webpackFinal: async (config) => {
    // ref:
    // https://github.com/storybookjs/storybook/issues/10990#issuecomment-1000787368
    // https://webpack.js.org/loaders/css-loader/#url
    for (let rule of config.module.rules) {
      if (rule.use && rule.use.length > 0) {
        for (let use of rule.use) {
          if (use.loader && use.loader.includes("/css-loader/")) {
            use.options = {
              ...use.options,
              url: (url, resourcePath) => !url.startsWith("/"),
            };
          }
        }
      }
    }

    return config;
  }
}
