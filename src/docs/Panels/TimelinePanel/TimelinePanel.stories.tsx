import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  TimelinePanel as TimelinePanelComponent,
  TimelinePanelProps,
} from '../../../components/Panels/TimelinePanel';

export default {
  title: 'Panels/TimelinePanel',
  component: TimelinePanelComponent,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<TimelinePanelProps> = (args) => <TimelinePanelComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: 1920,
  height: 1080,
};
