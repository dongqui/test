import React from 'react';
import '../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RealtimePage, RealtimePageProps } from '../../components/Pages/RealtimePage';

export default {
  title: 'Pages/RealtimePage',
  component: RealtimePage,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<RealtimePageProps> = (args) => <RealtimePage {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: '100%',
  height: '60rem',
};
