import { addParameters } from '@storybook/react';
import { themes } from '@storybook/theming';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: themes.light,
    page: null,
  },
}

addParameters({
  previewTabs: {
    canvas: {
      hidden: true,
    }
  },
  options: {
    showPanel: false,
    isFullscreen: false,
    storySort: undefined,
    isToolshown: true,
  },
})