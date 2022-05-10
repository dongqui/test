import { ComponentMeta, ComponentStory } from '@storybook/react';
import _OutlineButton from './';

export default {
  title: 'Buttons',
  component: _OutlineButton,
  argTypes: {
    size: {
      description: 'small option 만 가능',
      control: false,
    },
  },
} as ComponentMeta<typeof _OutlineButton>;

const Template: ComponentStory<typeof _OutlineButton> = (args) => <_OutlineButton {...args} />;
export const OutlineButton = Template.bind({});

OutlineButton.args = {
  text: 'Button',
  fullSize: false,
  disabled: false,
  bolderColor: 'default',
  textColor: 'light',
  size: 'small',
};
