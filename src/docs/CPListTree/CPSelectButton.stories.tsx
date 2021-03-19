import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPSelectButton, CPSelectButtonProps } from 'containers/CPListTree/CPSelectButton';

export default {
  title: 'Component API/Container/CPListTree/CPSelectButton',
  component: CPSelectButton,
  args: {},
} as Meta;

const Template: Story<CPSelectButtonProps> = (args) => <CPSelectButton {...args} />;

export const Default = Template.bind({});
Default.args = {};
