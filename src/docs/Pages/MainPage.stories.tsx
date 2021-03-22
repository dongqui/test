import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import MainPage from 'containers/Shoot/MainPage';

export default {
  title: 'Pages/MainPage',
  component: MainPage,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story = (args) => <MainPage {...args} />;

export const Default = Template.bind({});
// Default.args = {
//   width: '100%',
//   height: '60rem',
// };
