import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CPTitle } from 'containers/CPListTree/CPTitle';
import { CPTitleProps } from '../../containers/CPListTree/CPTitle';

export default {
  title: 'Component API/Container/CPListTree/CPTitle',
  component: CPTitle,
  args: {},
} as Meta;

const Template: Story<CPTitleProps> = (args) => <CPTitle {...args} />;

export const Default = Template.bind({});
Default.args = {};
