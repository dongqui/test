import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import MiddleBar, { Props } from 'containers/MiddleBar';

export default {
  title: 'Component API/Container/PlayBar/PlayBar',
  component: MiddleBar,
  args: {},
} as Meta;

const Template: Story<Props> = (args) => {
  return <MiddleBar {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
