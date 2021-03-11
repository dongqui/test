import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { TimeBar, TimeBarProps } from 'components/TimeBar';

export default {
  title: 'Component API/Container/TimeBar',
  component: TimeBar,
  args: {},
} as Meta;

const Template: Story<TimeBarProps> = (args) => <TimeBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
