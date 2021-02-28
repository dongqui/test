import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Indicator, IndicatorProps } from 'components/PlayBar/Indicator';

export default {
  title: 'Component API/Component/PlayBar/Indicator',
  component: Indicator,
  args: {},
} as Meta;

const Template: Story<IndicatorProps> = (args) => <Indicator {...args} />;

export const Default = Template.bind({});
Default.args = {};
