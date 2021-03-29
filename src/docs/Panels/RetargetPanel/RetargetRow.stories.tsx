import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RetargetRowProps, RetargetRow } from 'containers/Panels/RetargetPanel/RetargetRow';

export default {
  title: 'Panels/Retarget/RetaretRow',
  component: RetargetRow,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<RetargetRowProps> = (args) => <RetargetRow {...args} />;

export const Default = Template.bind({});
