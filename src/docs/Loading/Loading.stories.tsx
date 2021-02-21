import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Loading, LoadingProps } from 'components/Loading';

export default {
  title: 'Component API/Component/Loading',
  component: Loading,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<LoadingProps> = (args) => <Loading {...args} />;

export const Default = Template.bind({});
Default.args = {};
