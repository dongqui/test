import { ComponentMeta, ComponentStory } from '@storybook/react';
import _ExpandButton from './';
import { SvgPath } from 'components/Icon';

export default {
  title: 'Buttons',
  component: _ExpandButton,
  argTypes: {
    content: {
      description: 'Text Button으로 사용 시 RAW 모드에서 "Text"로 사용',
    },
  },
} as ComponentMeta<typeof _ExpandButton>;

const Template: ComponentStory<typeof _ExpandButton> = (args) => <_ExpandButton {...args} />;
export const ExpandButton = Template.bind({});

ExpandButton.args = {
  fullSize: false,
  disabled: false,
  variant: 'default',
  content: SvgPath.EyeOpen,
};
