import { ComponentMeta, ComponentStory } from '@storybook/react';
import _GhostButton from './';

export default {
  component: _GhostButton,
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
} as ComponentMeta<typeof _GhostButton>;

const Template: ComponentStory<typeof _GhostButton> = (args) => <_GhostButton {...args} />;
export const GhostButton = Template.bind({});

GhostButton.args = {
  text: 'Button',
  fullSize: false,
  disabled: false,
  color: 'default',
  size: 'small',
};
