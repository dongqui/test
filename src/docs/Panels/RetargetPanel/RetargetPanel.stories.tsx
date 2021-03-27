import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RetargetPanel, RetargetPanelProps } from 'containers/Panels/RetargetPanel';

export default {
  title: 'Panels/Retarget/RetargetPanel',
  component: RetargetPanel,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<RetargetPanelProps> = (args) => <RetargetPanel {...args} />;

export const Default = Template.bind({});
