import { Fragment, useState, useRef, MutableRefObject } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { FilledButton } from 'components/New_Button';
import useContextMenu from 'hooks/common/useContextMenu';
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

  const targetRef = useRef(null);
  const innerRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

  const handleContextMenu = ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
    console.log(top, left, e);
  };

  useContextMenu({ targetRef, event: handleContextMenu });

  const position = { top: '30px', left: '30px' };

  return (
    <div style={{ position: 'relative', width: '500px', height: '500px' }} ref={targetRef}>
      <Component innerRef={innerRef} list={list} onSelect={handleSelect} position={position} />
    </div>
  );
};

export const ContextMenu = Template.bind({});
ContextMenu.args = {};
