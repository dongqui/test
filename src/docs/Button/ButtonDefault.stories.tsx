import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ButtonDefault, ButtonDefaultProps } from 'components/Buttons/ButtonDefault';

export default {
  title: 'Component API/Component/Button/ButtonDefault',
  component: ButtonDefault,
  args: {},
} as Meta;

const Template: Story<ButtonDefaultProps> = (args) => <ButtonDefault {...args} />;

export const Default = Template.bind({});
Default.args = {};
