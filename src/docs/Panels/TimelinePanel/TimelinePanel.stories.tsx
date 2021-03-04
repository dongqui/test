import React from 'react';
import '../../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import TimelinePanel, { TimelinePanelProps } from 'components/Panels/TimelinePanel';

export default {
  title: 'Panels/TimelinePanel',
  component: TimelinePanel,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<TimelinePanelProps> = (args) => <TimelinePanel {...args} />;

export const Default = Template.bind({});
// Default.args = {
//   width: 1920,
//   height: 1080,
// };
