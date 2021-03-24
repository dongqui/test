import React, { useEffect, useRef } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import styled from '@emotion/styled';
import { useReactiveVar } from '@apollo/client';
import { Contextmenu } from 'components/Contextmenu';
import MainPage from './MainPage';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { storeContextMenuInfo, storeModalInfo } from 'lib/store';
import { GRAY200 } from 'styles/constants/common';
import { MODAL_TYPES } from 'types';
import { fnKillSetInterval } from 'utils/common/fnKillSetInterval';
import { BaseModal } from 'components/New_Modal';
import { ModalInner } from 'docs/New_components/Modal/BaseModal.stories';
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

interface Props {}

const ShootPage: NextPage<Props> = () => {
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);
  const modalRef = useRef<HTMLDivElement | any>(null);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
      storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
    },
  });
  useEffect(() => {
    fnKillSetInterval();
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
        <>
          {_.isEqual(modalInfo.type, MODAL_TYPES.alert) && (
            <BaseModal hasCloseIcon onClose={() => {}} theme="dark">
              <ModalInner>{modalInfo.msg}</ModalInner>
            </BaseModal>
          )}
        </>
      )}
      <MainPage />
    </main>
  );
};

export default ShootPage;
