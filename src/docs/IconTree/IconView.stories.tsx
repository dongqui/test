import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  IconView as IconViewComponent,
  IconViewProps,
} from 'containers/Panels/LibraryPanel/IconTree/IconView';

export default {
  title: 'Component API/Container/IconTree/IconView',
  component: IconViewComponent,
  args: {},
} as Meta;

const Template: Story<IconViewProps> = (args) => {
  return <IconViewComponent {...args} />;
};

export const Default = Template.bind({});
