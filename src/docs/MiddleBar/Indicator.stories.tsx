import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Indicator, IndicatorProps } from 'containers/MiddleBar/Indicator';

export default {
  title: 'Component API/Container/PlayBar/Indicator',
  component: Indicator,
  args: {},
} as Meta;

const Template: Story<IndicatorProps> = (args) => <Indicator {...args} />;

export const Default = Template.bind({});
Default.args = {};
