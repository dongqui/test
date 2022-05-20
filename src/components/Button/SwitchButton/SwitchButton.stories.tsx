import { Fragment, MouseEvent } from 'react';
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
      <div>
        <_SwitchButton {...args} />
      </div>
      <br />
      <div>
        <_SwitchButton
          {...args}
          options={[
            {
              content: 'longlongoption1',
              onClick: (e?: MouseEvent, index?: number, content?: string) => {
                console.log({ index, content });
              },
            },
            {
              content: 'so2',
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
            {
              content: 'longlongoption1',
              onClick: (e?: MouseEvent, index?: number, content?: string) => {
                console.log({ index, content });
              },
            },
            {
              content: 'ssdf4sda6f54s56df46as54fd654fo2',
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
          ]}
        />
      </div>
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
