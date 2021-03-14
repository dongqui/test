import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/Dropdown/Dropdown';

export default {
  title: 'Component API/Component/New_Dropdown',
  component: Component,
  args: {},
} as Meta;

const Template: Story<Props> = (args) => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {};
