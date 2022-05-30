import { create } from '@storybook/theming';
import { addons } from '@storybook/addons';

import logo from './static/Horizontal_Primary.png';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Plask',
    brandImage: logo,
  }),
});
