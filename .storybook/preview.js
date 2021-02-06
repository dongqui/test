import { addParameters } from '@storybook/react';
import { themes } from '@storybook/theming';
import '../src/styles/core.scss';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: themes.light,
    // page: null,
  },
}

addParameters({
  previewTabs: {
    canvas: {
      // hidden: true,
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