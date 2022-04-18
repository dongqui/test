import _TextButton from './TextButton';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Buttons',
  component: _TextButton,
} as ComponentMeta<typeof _TextButton>;

const Template: ComponentStory<typeof _TextButton> = (args) => <_TextButton {...args} />;
export const TextButton = Template.bind({});

TextButton.args = {
  color: 'primary',
  size: 'small',
  text: 'Button',
  fullSize: false,
};
