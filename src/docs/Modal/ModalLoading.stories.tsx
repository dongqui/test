import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ModalLoading, ModalLoadingProps } from '../../components/Modal/ModalLoading';

export default {
  title: 'Component API/Container/Modal/ModalLoading',
  component: ModalLoading,
  args: {},
} as Meta;

const Template: Story<ModalLoadingProps> = (args) => <ModalLoading {...args} />;

export const Default = Template.bind({});
Default.args = {};
