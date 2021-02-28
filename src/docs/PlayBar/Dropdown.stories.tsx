import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Indicator, IndicatorProps } from 'components/PlayBar/Indicator';
import { Dropdown, DropdownProps } from 'components/PlayBar/Dropdown';

export default {
  title: 'Component API/Component/PlayBar/Dropdown',
  component: Dropdown,
  args: {},
} as Meta;

const Template: Story<DropdownProps> = (args) => <Dropdown {...args} />;

export const Default = Template.bind({});
Default.args = {};
