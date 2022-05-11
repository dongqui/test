import { ComponentStory, ComponentMeta } from '@storybook/react';
import _FilledButton from './';
import { Fragment } from 'react';

export default {
  component: _FilledButton,
  argTypes: {
    size: {
      description: 'small option 만 가능',
      control: false,
    },
    dataCy: {
      description: '개발용 parameter',
      control: false,
    },
  },
} as ComponentMeta<typeof _FilledButton>;

const Template: ComponentStory<typeof _FilledButton> = (args) => <_FilledButton {...args} />;
export const FilledButton = Template.bind({});

FilledButton.args = {
  text: 'Button',
  fullSize: false,
  disabled: false,
  color: 'primary',
  size: 'small',
};
