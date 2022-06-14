import '../src/styles/core.scss';
import '../src/styles/libraries/_font.scss';

import './globalStoryStyle.scss';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: ['Intro', 'Colors', 'Typography', 'components'],
      locales: 'en-US',
    },
  },
};
