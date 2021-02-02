import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Input, InputProps, InputStyleProps } from '../../components/Input';

export default {
  title: 'Component API/Component/Input',
  component: Input,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<InputProps & InputStyleProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: '2.5rem',
  height: '1.25rem',
  backgroundColor: `var(--gray400)`,
  borderRadius: 4,
  prefix: 'X',
};
