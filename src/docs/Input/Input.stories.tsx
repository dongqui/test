import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Input, InputChildProps, InputProps, InputWrapperProps } from '../../components/Input';

export default {
  title: 'Component API/Component/Input/Default',
  component: Input,
  argTypes: {
    backgroundColor: {
      control: {
        type: 'color',
      },
    },
  },
  args: {},
} as Meta;

const Template: Story<InputProps & InputWrapperProps & InputChildProps> = (args) => (
  <Input {...args} />
);

export const Default = Template.bind({});
Default.args = {
  width: '5rem',
  height: '2.5rem',
  backgroundColor: `var(--gray400)`,
  borderRadius: 4,
  prefix: 'X',
};
