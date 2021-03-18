import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPListRowSelect, CPListRowSelectProps } from 'containers/CPListTree/CPListRowSelect';

export default {
  title: 'Component API/Container/CPListTree/CPListRowSelect',
  component: CPListRowSelect,
  args: {},
} as Meta;

const Template: Story<CPListRowSelectProps> = (args) => <CPListRowSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};
