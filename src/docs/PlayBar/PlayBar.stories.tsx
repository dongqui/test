import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Indicator, IndicatorProps } from 'components/PlayBar/Indicator';
import { PlayBar, PlayBarProps } from 'components/PlayBar';

export default {
  title: 'Component API/Component/PlayBar/PlayBar',
  component: PlayBar,
  args: {},
} as Meta;

const Template: Story<PlayBarProps> = (args) => <PlayBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
