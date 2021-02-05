import React from 'react';
import { ModelCircle } from '../../components/Icons';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { TreeRow, TreeRowProps } from '../../components/Tree';

export default {
  title: 'Component API/Component/Tree',
  component: TreeRow,
  args: {},
} as Meta;

const Template: Story<TreeRowProps> = (args) => <TreeRow {...args} />;

export const Row = Template.bind({});
Row.args = {
  prefix: <ModelCircle fillColor="#fff" />,
  fileName: 'motion5',
  clicked: true,
};
