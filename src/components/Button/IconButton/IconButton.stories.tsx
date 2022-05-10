import { ComponentMeta, ComponentStory } from '@storybook/react';
import _IconButton from './';

import { SvgPath } from 'components/Icon';

export default {
  title: 'Buttons',
  component: _IconButton,
} as ComponentMeta<typeof _IconButton>;

const Template: ComponentStory<typeof _IconButton> = (args) => <_IconButton {...args} />;
export const IconButton = Template.bind({});

IconButton.args = {
  type: 'default',
  disabled: false,
  icon: SvgPath.Search,
};
