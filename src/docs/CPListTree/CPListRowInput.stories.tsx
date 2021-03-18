import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPListRowInput, CPListRowInputProps } from 'containers/CPListTree/CPListRowInput';

export default {
  title: 'Component API/Container/CPListTree/CPListRowInput',
  component: CPListRowInput,
  args: {},
} as Meta;

const Template: Story<CPListRowInputProps> = (args) => <CPListRowInput {...args} />;

export const Default = Template.bind({});
Default.args = {};
