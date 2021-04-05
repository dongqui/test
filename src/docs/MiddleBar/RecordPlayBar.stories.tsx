import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { RecordPlayBar, RecordPlayBarProps } from 'containers/record/RecordPlayBar';

export default {
  title: 'Component API/Container/RecordPlayBar',
  component: RecordPlayBar,
  args: {},
} as Meta;

const Template: Story<RecordPlayBarProps> = (args) => <RecordPlayBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
