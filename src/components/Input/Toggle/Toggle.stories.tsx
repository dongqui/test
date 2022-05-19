import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _Toggle from './';

export default {
  component: _Toggle,
  // TODO: add argTypes if any
  argTypes: {
    onChange: {
      control: false,
    },
  },
} as ComponentMeta<typeof _Toggle>;

const Template: ComponentStory<typeof _Toggle> = (args) => {
  return (
    <Fragment>
      <_Toggle {...args} />
    </Fragment>
  );
};
export const Toggle = Template.bind({});

// TODO: add default props
Toggle.args = {
  defaultChecked: false,
  disabled: false,
};
