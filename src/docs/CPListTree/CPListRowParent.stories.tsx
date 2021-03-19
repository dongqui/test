import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPListRowParent, CPListRowParentProps } from 'containers/CPListTree/CPListRowParent';

export default {
  title: 'Component API/Container/CPListTree/CPListRowParent',
  component: CPListRowParent,
  args: {},
} as Meta;

const Template: Story<CPListRowParentProps> = (args) => <CPListRowParent {...args} />;

export const Default = Template.bind({});
Default.args = {};
