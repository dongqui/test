import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { PlayBar, PlayBarProps } from 'containers/PlayBar';

export default {
  title: 'Component API/Container/PlayBar/PlayBar',
  component: PlayBar,
  args: {},
} as Meta;

const Template: Story<PlayBarProps> = (args) => {
  return <PlayBar {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
