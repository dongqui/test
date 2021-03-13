import { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { FilledButton } from 'components/Buttons';
import styled from '@emotion/styled';
import Component, { Props } from 'components/New_Modal/BaseModal';

export default {
  title: 'Component API/Component/New_Modal',
  component: Component,
  args: {},
} as Meta;

/**
 * ===WARN===
 * 현재 next dev에서는 정상적으로 Modal이 open 상태인 경우 button의 onClick event가 발생하지 않지만
 * 스토리북에서는 발생하는 문제가 있음
 */
const Template: Story<Props> = ({ onClose, ...args }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div id="_next">
        <FilledButton onClick={handleToggle}>Open Modal</FilledButton>
        {isModalOpen && (
          <Component onClose={handleToggle} {...args}>
            <ModalInner>BaseModal</ModalInner>
          </Component>
        )}
      </div>
      <div id="portal" />
    </>
  );
};

export const BaseModal = Template.bind({});

BaseModal.args = {
  hasCloseIcon: true,
};

const ModalInner = styled.div`
  text-align: center;
`;
