import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { IconView as IconViewComponent, IconViewProps } from '../../components/IconTree/IconView';

export default {
  title: 'Component API/Component/IconTree',
  component: IconViewComponent,
  args: {},
} as Meta;

const Template: Story<IconViewProps> = (args) => <IconViewComponent {...args} />;

export const IconView = Template.bind({});
IconView.args = {
  width: '30%',
  height: '50rem',
};
