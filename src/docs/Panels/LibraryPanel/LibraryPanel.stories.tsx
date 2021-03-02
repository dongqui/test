import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  LibraryPanel as LibraryPanelComponent,
  LibraryPanelProps,
} from '../../../components/Panels/LibraryPanel';
import { LIBRARYPANEL_INFO } from 'styles/common';

export default {
  title: 'Panels/LibraryPanel',
  component: LibraryPanelComponent,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<LibraryPanelProps> = (args) => <LibraryPanelComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: LIBRARYPANEL_INFO.widthRem,
  height: LIBRARYPANEL_INFO.heightRem,
};
