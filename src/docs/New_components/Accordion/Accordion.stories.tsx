import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/New_Accordion/Accordion';

export default {
  title: 'Component API/Component/New_Accordion',
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
  ];

  // const handleSelect = (key: string, value: string) => {
  //   console.log(key, value);
  // };

  return <Component />;
};

export const Accordion = Template.bind({});
Accordion.args = {};
