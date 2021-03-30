import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { ControlPanel, ControlPanelProps } from 'containers/Panels/ControlPanel/old';

export default {
  title: 'Panels/ControlPanel',
  component: ControlPanel,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<ControlPanelProps> = (args) => <ControlPanel {...args} />;

export const Default = Template.bind({});
