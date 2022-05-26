import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _Toggle from './';
import _NewToggle from './newToggle';
import './Toggle.stories.module.scss';

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
      <div>
        <h2 style={{ userSelect: 'none' }}>react-switch Toggle component</h2>
        <_Toggle {...args} />
      </div>
      <br />
      <div>
        <h2 style={{ userSelect: 'none' }}>custom Toggle component</h2>
        <_NewToggle {...args} />
      </div>
    </Fragment>
  );
};
export const Toggle = Template.bind({});

// TODO: add default props
Toggle.args = {
  defaultChecked: false,
  disabled: false,
};
