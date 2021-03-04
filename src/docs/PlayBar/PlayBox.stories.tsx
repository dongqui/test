import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { PlayBox, PlayBoxProps } from 'components/PlayBar/PlayBox';

export default {
  title: 'Component API/Component/PlayBar/PlayBox',
  component: PlayBox,
  args: {},
} as Meta;

const Template: Story<PlayBoxProps> = (args) => <PlayBox {...args} />;

export const Default = Template.bind({});
Default.args = {};
