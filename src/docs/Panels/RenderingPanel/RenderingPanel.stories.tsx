import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  RenderingPanel,
  RenderingPanelProps,
} from '../../../components/Panels/RenderingPanel/RenderingPanel';

export default {
  title: 'Panels/RenderingPanel',
  component: RenderingPanel,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<RenderingPanelProps> = (args) => <RenderingPanel {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: '100%',
  height: '30rem',
};
