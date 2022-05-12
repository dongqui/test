import { ComponentStory, ComponentMeta } from '@storybook/react';
import _ToggleButton from './';

export default {
  title: 'Buttons',
  component: _ToggleButton,
  argTypes: {
    size: {
      description: 'small option 만 가능',
      control: false,
    },
    defaultState: {
      description: '개발 시 사용',
      control: false,
    },
  },
} as ComponentMeta<typeof _ToggleButton>;

const Template: ComponentStory<typeof _ToggleButton> = (args) => <_ToggleButton {...args} />;
export const ToggleButton = Template.bind({});

ToggleButton.args = {
  text: 'Button',
  fullSize: false,
  disabled: false,
  type: 'primary',
  size: 'small',
};
