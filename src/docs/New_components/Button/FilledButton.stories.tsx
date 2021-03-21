import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/New_Button/FilledButton';

export default {
  title: 'Component API/Component/New_Button',
  component: Component,
  args: {},
} as Meta;

const Template: Story<Props> = (args) => {
  const handleClick = () => {
    alert('onClick');
  };

  return (
    <Component onClick={handleClick} {...args}>
      Text
    </Component>
  );
};

export const FilledButton = Template.bind({});
FilledButton.args = {};
