import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ProgressiveBar, ProgressiveBarProps } from '../../components/ProgressiveBar';

export default {
  title: 'Component API/Container/ProgressiveBar',
  component: ProgressiveBar,
  args: {},
} as Meta;

const Template: Story<ProgressiveBarProps> = (args) => <ProgressiveBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
