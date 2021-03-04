import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ModeSelect, ModeSelectProps } from 'components/PlayBar/ModeSelect';

export default {
  title: 'Component API/Component/PlayBar/ModeSelect',
  component: ModeSelect,
  args: {},
} as Meta;

const Template: Story<ModeSelectProps> = (args) => <ModeSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};
