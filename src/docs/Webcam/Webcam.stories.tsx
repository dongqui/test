import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Webcam, WebcamProps } from 'containers/Webcam';

export default {
  title: 'Component API/Container/Webcam',
  component: Webcam,
  args: {},
} as Meta;

const Template: Story<WebcamProps> = (args) => <Webcam {...args} />;

export const Default = Template.bind({});
Default.args = {};
