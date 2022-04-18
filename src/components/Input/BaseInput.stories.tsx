import _BaseInput from './BaseInput';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Inputs',
  component: _BaseInput,
} as ComponentMeta<typeof _BaseInput>;

const Template: ComponentStory<typeof _BaseInput> = (args) => <_BaseInput {...args} />;
export const BaseInput = Template.bind({});

BaseInput.args = {
  placeholder: 'Placeholder',
  value: '',
};
