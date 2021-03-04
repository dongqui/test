import React from 'react';
import '../../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  RenderingController,
  RenderingControllerProps,
} from '../../../containers/Panels/RenderingPanel/RenderingController';

export default {
  title: 'Panels/RenderingPanel',
  component: RenderingController,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<RenderingControllerProps> = (args) => <RenderingController {...args} />;

export const Default = Template.bind({});
// Default.args = {
//   width: '100%',
//   height: '50rem',
// };
