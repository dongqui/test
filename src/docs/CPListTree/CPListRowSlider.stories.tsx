import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPListRowSlider, CPListRowSliderProps } from 'containers/CPListTree/CPListSlider';

export default {
  title: 'Component API/Container/CPListTree/CPListRowSlider',
  component: CPListRowSlider,
  args: {},
} as Meta;

const Template: Story<CPListRowSliderProps> = (args) => <CPListRowSlider {...args} />;

export const Default = Template.bind({});
Default.args = {};
