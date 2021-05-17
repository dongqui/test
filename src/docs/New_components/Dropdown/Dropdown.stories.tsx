import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/Dropdown/Dropdown';

export default {
  title: 'Component API/Component/Dropdown',
  component: Component,
  args: {},
} as Meta;

const Template: Story<Props> = ({}) => {
  const list = [
    {
      key: 'item1',
      value: 'One',
      isSelected: true,
    },
    {
      key: 'item2',
      value: 'Two',
      isSelected: false,
    },
    {
      key: 'item3',
      value: 'Three',
      isSelected: false,
    },
  ];

  const handleSelect = (key: string, value: string) => {
    console.log(key, value);
  };

  return <Component list={list} onSelect={handleSelect} />;
};

export const Dropdown = Template.bind({});
Dropdown.args = {};
