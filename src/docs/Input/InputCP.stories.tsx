import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { InputCP, InputCPProps } from '../../components/Input/InputCP';

export default {
  title: 'Component API/Component/Input/InputCP',
  component: InputCP,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<InputCPProps> = (args) => <InputCP {...args} />;

export const Default = Template.bind({});
Default.args = {};
