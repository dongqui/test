import { ComponentStory, ComponentMeta } from '@storybook/react';
import _FilledButton from './';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Buttons',
  component: _FilledButton,
} as ComponentMeta<typeof _FilledButton>;

const Template: ComponentStory<typeof _FilledButton> = (args) => <_FilledButton {...args} />;
export const FilledButton = Template.bind({});

FilledButton.args = {
  color: 'primary',
  size: 'small',
  text: 'Button',
  fullSize: false,
};
