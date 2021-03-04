import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ModeSelect, ModeSelectProps } from 'containers/PlayBar/ModeSelect';
import { LayerSelect, LayerSelectProps } from 'containers/PlayBar/LayerSelect';

export default {
  title: 'Component API/Container/PlayBar/LayerSelect',
  component: LayerSelect,
  args: {},
} as Meta;

const Template: Story<LayerSelectProps> = (args) => <LayerSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};
