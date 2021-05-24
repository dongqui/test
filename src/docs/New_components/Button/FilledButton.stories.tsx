import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/Button/FilledButton';

export default {
  title: 'Component API/Component/Button',
  component: Component,
  args: {},
} as Meta;

const Template: Story<Props> = (args) => {
  const handleClick = () => {
    console.log('onClick');
  };

  return (
    <Component onClick={handleClick} {...args}>
      Text
    </Component>
  );
};

export const FilledButton = Template.bind({});
FilledButton.args = {};
