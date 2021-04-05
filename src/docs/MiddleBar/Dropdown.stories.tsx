import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Dropdown, DropdownProps } from 'containers/MiddleBar/Dropdown';

export default {
  title: 'Component API/Container/PlayBar/Dropdown',
  component: Dropdown,
  args: {},
} as Meta;

const Template: Story<DropdownProps> = (args) => <Dropdown {...args} />;

export const Default = Template.bind({});
Default.args = {};
