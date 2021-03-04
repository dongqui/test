import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ModeSelect, ModeSelectProps } from 'components/PlayBar/ModeSelect';
import { LayerSelect, LayerSelectProps } from 'components/PlayBar/LayerSelect';

export default {
  title: 'Component API/Component/PlayBar/LayerSelect',
  component: LayerSelect,
  args: {},
} as Meta;

const Template: Story<LayerSelectProps> = (args) => <LayerSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};
