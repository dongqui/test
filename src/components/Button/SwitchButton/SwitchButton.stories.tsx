import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _SwitchButton from './';

export default {
  component: _SwitchButton,
  // TODO: add argTypes if any
  argTypes: {},
} as ComponentMeta<typeof _SwitchButton>;

const Template: ComponentStory<typeof _SwitchButton> = (args) => {
  return (
    <Fragment>
      <_SwitchButton {...args} />
    </Fragment>
  );
};
export const SwitchButton = Template.bind({});

// TODO: add default props
SwitchButton.args = {
  options: [
    {
      content: 'option1',
      onClick: (e?: MouseEvent, index?: number, content?: string) => {
        console.log({ index, content });
      },
    },
    {
      content: 'option2',
      onClick: (e?: MouseEvent, index?: number, content?: string) => {
        console.log({ index, content });
      },
    },
    {
      content: 'option3',
      onClick: (e?: MouseEvent, index?: number, content?: string) => {
        console.log({ index, content });
      },
    },
  ],
  type: 'primary',
  disabled: false,
  fullSize: false,
};
