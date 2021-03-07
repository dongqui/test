import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Modal, ModalProps } from 'components/Modal';

export default {
  title: 'Component API/Container/Modal',
  component: Modal,
  args: {},
} as Meta;

const Template: Story<ModalProps> = (args) => <Modal {...args} />;

export const Default = Template.bind({});
Default.args = {};
