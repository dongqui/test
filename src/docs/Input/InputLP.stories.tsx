import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { InputLP, InputLPProps } from '../../components/Input/InputLP';
import { rem } from 'utils';

export default {
  title: 'Component API/Component/Input/InputLP',
  component: InputLP,
  args: {},
} as Meta;

const Template: Story<InputLPProps> = (args) => <InputLP {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: rem(206),
  height: rem(32),
};
Default.parameters = {
  docs: {
    description: {
      story: 'some story **markdown**',
    },
  },
};
