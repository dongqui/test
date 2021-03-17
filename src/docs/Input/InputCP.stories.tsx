import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Input, InputCPProps } from '../../components/Input/InputCP';

export default {
  title: 'Component API/Component/Input/InputCP',
  component: Input,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<InputCPProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {};
