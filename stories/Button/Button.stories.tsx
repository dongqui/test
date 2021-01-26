import React from 'react';
import '../common.css';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { Button, ButtonProps } from '../../components/Button/Button';

export default {
  title: 'Component/Button',
  component: Button,
  argTypes: {
    backgroundColor: {
      control: {
        type: 'color',
      },
    },
    onClick: { action: 'clicked' },
  },
  args: {},
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: 10,
  height: 3,
  fontSize: 130,
};
