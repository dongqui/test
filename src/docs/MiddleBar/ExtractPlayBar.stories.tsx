import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ExtractPlayBar, ExtractPlayBarProps } from '../../containers/extract/ExtractPlayBar';

export default {
  title: 'Component API/Container/ExtractPlayBar',
  component: ExtractPlayBar,
  args: {},
} as Meta;

const Template: Story<ExtractPlayBarProps> = (args) => <ExtractPlayBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
