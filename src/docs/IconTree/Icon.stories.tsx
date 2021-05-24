import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Icon as IconComponent, IconProps } from 'containers/Panels/LibraryPanel/IconTree/Icon';
import { rem } from 'utils/rem';
import { FILE_TYPES } from 'types';

export default {
  title: 'Component API/Container/IconTree/Icon',
  component: IconComponent,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<IconProps> = (args) => (
  <div style={{ backgroundColor: 'black' }}>
    <IconComponent {...args} />
  </div>
);

export const Default = Template.bind({});
export const Folder = Template.bind({});
Default.args = {};
Folder.args = {};
