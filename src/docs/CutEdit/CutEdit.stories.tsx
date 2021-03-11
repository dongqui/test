import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CutEdit, CutEditProps } from 'containers/CutEdit';

export default {
  title: 'Component API/Container/CutEdit',
  component: CutEdit,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<CutEditProps> = (args) => <CutEdit {...args} />;

export const Default = Template.bind({});
Default.args = {};
