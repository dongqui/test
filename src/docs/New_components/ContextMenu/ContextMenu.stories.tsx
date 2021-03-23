import { Fragment, useState, useRef } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { FilledButton } from 'components/New_Button';
import { useContextmenu } from 'hooks/common/useContextmenu';
import Component, { Props } from 'components/New_ContextMenu/ContextMenu';

export default {
  title: 'Component API/Component/New_ContextMenu',
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

  const [isOpen, setIsOpen] = useState(false);

  const targetRef = useRef(null);

  const test = () => {
    console.log('???');
  };

  useContextmenu({ targetRef, event: test });

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  // return <Component list={list} onSelect={handleSelect} />;
  return (
    <div ref={targetRef}>
      <FilledButton onClick={handleOpen}>Click</FilledButton>
      {/* {isOpen && <Component list={[]} onSelect={handleSelect} position={} />} */}
    </div>
  );
};

export const ContextMenu = Template.bind({});
ContextMenu.args = {};
