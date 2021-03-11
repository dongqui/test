import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { PlayBar, PlayBarProps } from 'containers/RecordPlayBar';

export default {
  title: 'Component API/Container/RecordPlayBar',
  component: PlayBar,
  args: {},
} as Meta;

const Template: Story<PlayBarProps> = (args) => <PlayBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
