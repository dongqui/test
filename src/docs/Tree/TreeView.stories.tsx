import React from 'react';
import { ModelCircle } from '../../components/Icons';
import { Story, Meta } from '@storybook/react/types-6-0';
import { TreeView, TreeViewProps } from '../../components/Tree';

export default {
  title: 'Component API/Component/Tree',
  component: TreeView,
  args: {},
} as Meta;

const Template: Story<TreeViewProps> = (args) => <TreeView {...args} />;

export const TreeViews = Template.bind({});
TreeViews.args = {};
