import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { IconPage as IconPageComponent, IconPageProps } from '../../containers/IconTree/IconPage';

export default {
  title: 'Component API/Container/IconTree/IconPage',
  component: IconPageComponent,
  args: {},
} as Meta;

const Template: Story<IconPageProps> = (args) => <IconPageComponent {...args} />;

export const Default = Template.bind({});
Default.args = {};
