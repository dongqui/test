import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ModalInput, ModalInputProps } from '../../components/Modal/ModalInput';

export default {
  title: 'Component API/Container/Modal/ModalInput',
  component: ModalInput,
  args: {},
} as Meta;

const Template: Story<ModalInputProps> = (args) => <ModalInput {...args} />;

export const Default = Template.bind({});
Default.args = {};
