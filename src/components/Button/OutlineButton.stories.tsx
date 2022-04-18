import _OutlineButton from './OutlineButton';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Buttons',
  component: _OutlineButton,
} as ComponentMeta<typeof _OutlineButton>;

const Template: ComponentStory<typeof _OutlineButton> = (args) => <_OutlineButton {...args} />;
export const OutlineButton = Template.bind({});

OutlineButton.args = {
  size: 'small',
  bolderColor: 'default',
  textColor: 'light',
  text: 'Button',
  fullSize: false,
};
