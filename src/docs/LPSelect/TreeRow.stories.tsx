import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { LPSelect, LPSelectProps } from 'components/LPSelect';

export default {
  title: 'Component API/Component/LPSelect',
  component: LPSelect,
  args: {},
} as Meta;

const Template: Story<LPSelectProps> = (args) => <LPSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};
