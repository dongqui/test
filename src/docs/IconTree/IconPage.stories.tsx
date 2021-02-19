import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { IconPage as IconPageComponent, IconPageProps } from '../../components/IconTree/IconPage';
import { rem } from 'utils';
import { LIBRARYPANEL_INFO } from 'styles/common';

export default {
  title: 'Component API/Component/IconTree/IconPage',
  component: IconPageComponent,
  args: {},
} as Meta;

const Template: Story<IconPageProps> = (args) => <IconPageComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: LIBRARYPANEL_INFO.widthRem,
  height: rem(48),
};
