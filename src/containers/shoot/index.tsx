import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import styled from '@emotion/styled';
import { useReactiveVar } from '@apollo/client';
import { Contextmenu } from 'components/Contextmenu';
import MainPage from './MainPage';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { CONTEXTMENU_INFO, MAIN_DATA, MODAL_INFO, STORE_DATA_NAMES } from 'lib/store';
import { GRAY200 } from 'styles/constants/common';
import { Modal } from 'components/Modal';
import { css } from '@emotion/react';

interface ContextMenuWrapperProps {
  top: string;
  left: string;
}
interface ModalWrapperProps {
  active: boolean;
}

const ContextMenuWrapper = styled.div<ContextMenuWrapperProps>`
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 1000;
`;
const ModalWrapper = styled.div<ModalWrapperProps>`
  position: absolute;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  ${(props) =>
    props.active &&
    css`
      background-color: rgba(0, 0, 0, 0.5);
    `}
`;

interface Props {}

const ShootPage: NextPage<Props> = () => {
  const contextMenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const modalInfo = useReactiveVar(MODAL_INFO);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      CONTEXTMENU_INFO({ ...contextMenuInfo, isShow: false });
      MODAL_INFO({ ...modalInfo, isShow: false, msg: '' });
    },
  });

  const [isServer, setIsServer] = useState(true);

  useEffect(() => {
    if (window) {
      setIsServer(false);
    }
  }, []);

  return (
    <main>
      {contextMenuInfo.isShow && (
        <ContextMenuWrapper
          ref={contextMenuRef}
          top={`${contextMenuInfo.top}px`}
          left={`${contextMenuInfo.left}px`}
        >
          <Contextmenu
            width="8rem"
            height="3rem"
            backgroundColor={GRAY200}
            data={contextMenuInfo.data}
            onClick={contextMenuInfo.onClick}
          />
        </ContextMenuWrapper>
      )}
      {modalInfo.isShow && (
        <ModalWrapper active={modalInfo.isShow}>
          <Modal msg={modalInfo.msg} />
        </ModalWrapper>
      )}
      {!isServer && <MainPage />}
    </main>
  );
};

export default ShootPage;
