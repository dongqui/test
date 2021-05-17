import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import Shoot from 'containers/Shoot';

export default {
  title: 'Pages/MainPage',
  component: Shoot,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story = (args) => <Shoot {...args} />;

export const Default = Template.bind({});
// Default.args = {
//   width: '100%',
//   height: '60rem',
// };
