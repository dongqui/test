import React from 'react';
import { ModelCircle } from '../../components/Icons';
import { Story, Meta } from '@storybook/react/types-6-0';
import { TreeView } from '../../components/Tree';

export default {
  title: 'Component API/Component/Tree',
  component: TreeView,
  args: {},
} as Meta;

const Template: Story<{}> = (args) => <TreeView {...args} />;

export const TreeViews = Template.bind({});
TreeViews.args = {
  prefix: <ModelCircle fillColor="#fff" />,
  fileName: 'motion5',
};
