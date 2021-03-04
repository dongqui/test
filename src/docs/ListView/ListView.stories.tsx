import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ListView, ListViewProps } from 'containers/ListTree/ListView';

export default {
  title: 'Component API/Container/ListView/ListView',
  component: ListView,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<ListViewProps> = (args) => <ListView {...args} />;

export const Default = Template.bind({});
Default.args = {};
