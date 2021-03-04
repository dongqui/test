import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ListRow, ListRowProps } from 'containers/ListTree/ListRow';

export default {
  title: 'Component API/Container/ListView/ListRow',
  component: ListRow,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<ListRowProps> = (args) => <ListRow {...args} />;

export const Default = Template.bind({});
Default.args = {};
