import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { LIBRARYPANEL_INFO } from 'styles/common';
import { Dropdown } from 'components/Dropdown';
import { DropDownProps } from '../../components/Dropdown/Dropdown';

export default {
  title: 'Component API/Component/Dropdown',
  component: Dropdown,
  args: {},
} as Meta;

const Template: Story<DropDownProps> = (args) => <Dropdown {...args} />;

export const Default = Template.bind({});
Default.args = {};
