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
  padding: 32px;
  text-align: center;
`;
