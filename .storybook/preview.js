import { addParameters } from '@storybook/react';
import { themes } from '@storybook/theming';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: themes.dark,
    // page: null,
  },
}

addParameters({
  previewTabs: {
    canvas: {
      hidden: true,
    }
  },
  options: {
    showPanel: true,
    isFullscreen: false,
    storySort: undefined,
    isToolshown: true,
    panelPosition: 'bottom',
  },
})