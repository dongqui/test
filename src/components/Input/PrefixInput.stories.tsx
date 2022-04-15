import _PrefixInput from './PrefixInput';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Inputs',
  component: _PrefixInput,
} as ComponentMeta<typeof _PrefixInput>;

const Template: ComponentStory<typeof _PrefixInput> = (args) => <_PrefixInput {...args} />;
export const PrefixInput = Template.bind({});

PrefixInput.args = {
  color: 'primary',
  placeholder: 'placeholder',
  value: '',
  prefix: 'pre',
};
