import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ContextmeneuProps, Contextmenu } from '../../components/Contextmenu';

export default {
  title: 'Component API/Component/Contextmenu',
  component: Contextmenu,
  args: {},
} as Meta;

const Template: Story<ContextmeneuProps> = (args) => <Contextmenu {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: '10%',
  height: '3rem',
};
