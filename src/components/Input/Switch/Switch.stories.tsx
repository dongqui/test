import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _SwitchButton from './';

export default {
  component: _SwitchButton,
  // TODO: add argTypes if any
  argTypes: {
    onChange: {
      control: false,
    },
    className: {
      control: false,
    },
  },
} as ComponentMeta<typeof _SwitchButton>;

const Template: ComponentStory<typeof _SwitchButton> = (args) => {
  return (
    <Fragment>
      <div>
        <_SwitchButton {...args} />
      </div>
    </Fragment>
  );
};
export const SwitchButton = Template.bind({});

// TODO: add default props
SwitchButton.args = {
  options: [
    {
      key: 'opt1',
      label: 'single',
      value: 0,
    },
    {
      key: 'opt2',
      label: 'multi',
      value: 1,
    },
  ],
  type: 'primary',
  disabled: false,
  fullSize: false,
  defaultKey: 'opt2',
  onChange: (key) => console.log(key),
};
