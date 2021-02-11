import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Icon as IconComponent, IconProps } from '../../components/IconTree/Icon';

export default {
  title: 'Component API/Component/IconTree',
  component: IconComponent,
  args: {},
} as Meta;

const Template: Story<IconProps> = (args) => (
  <div style={{ backgroundColor: 'black' }}>
    <IconComponent {...args} />
  </div>
);

export const Icon = Template.bind({});
Icon.args = {
  width: '8%',
  height: '8rem',
};
