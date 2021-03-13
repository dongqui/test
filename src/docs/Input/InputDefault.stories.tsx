import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { rem } from 'utils/rem';
import { InputDefault, InputDefaultProps } from 'components/Input/InputDefault';

export default {
  title: 'Component API/Component/Input/InputDefault',
  component: InputDefault,
  args: {},
} as Meta;

const Template: Story<InputDefaultProps> = (args) => <InputDefault {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: rem(206),
  height: rem(32),
};
