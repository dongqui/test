import { useReactiveVar } from '@apollo/client';
import styled from '@emotion/styled';
import React, { useCallback, useRef } from 'react';
import { Contextmenu } from '../components/Contextmenu';
import { MainPage } from '../components/Pages/MainPage';
import { useOutsideClick } from '../hooks/common/useOutsideClick';
import { CONTEXTMENU_INFO, SCREEN_SIZE } from '../lib/store';
import { GRAY200 } from '../styles/common';
import { isClient } from '../utils';

interface ContextmenuProps {
  top: string;
  left: string;
}
const ContextmenuWrapper = styled.div<ContextmenuProps>`
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 1000;
`;
const ShootPage = () => {
  const screenSizeInfo = useReactiveVar(SCREEN_SIZE);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const contextmenuRef = useRef<HTMLDivElement | any>(null);
  useOutsideClick({
    ref: contextmenuRef,
    event: () => {
      CONTEXTMENU_INFO({ ...contextmenuInfo, isShow: false });
    },
  });
  return (
    <div style={{ position: 'relative' }}>
      {contextmenuInfo.isShow && (
        <ContextmenuWrapper
          ref={contextmenuRef}
          top={`${contextmenuInfo.top}px`}
          left={`${contextmenuInfo.left}px`}
        >
          <Contextmenu
            width="8rem"
            height="3rem"
            backgroundColor={GRAY200}
            data={contextmenuInfo.data}
            onClick={contextmenuInfo.onClick}
          />
        </ContextmenuWrapper>
      )}
      {isClient ? (
        <MainPage width={`${window.innerWidth}px`} height={`${window.innerHeight}px`} />
      ) : (
        <div>로딩중...</div>
      )}
    </div>
  );
};

export default ShootPage;
