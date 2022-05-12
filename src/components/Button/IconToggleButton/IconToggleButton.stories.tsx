import { ComponentMeta, ComponentStory } from '@storybook/react';
import _IconToggleButton from './';

import { SvgPath } from 'components/Icon';

export default {
  component: _IconToggleButton,
  argTypes: {
    variant: {
      description: '추후 다른 variant 추가 시 활성',
      control: false,
    },
    defaultState: {
      description: '개발 시 사용',
      control: false,
    },
  },
} as ComponentMeta<typeof _IconToggleButton>;

const Template: ComponentStory<typeof _IconToggleButton> = (args) => <_IconToggleButton {...args} />;
export const IconToggleButton = Template.bind({});

IconToggleButton.args = {
  disabled: false,
  icon: SvgPath.Search,
  type: 'primary',
};
