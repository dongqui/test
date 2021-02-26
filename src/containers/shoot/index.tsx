import React, { useRef } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import styled from '@emotion/styled';
import { useReactiveVar } from '@apollo/client';
import { useSaveLocalStorage } from 'hooks/common/useSaveLocalStorage';
import { Contextmenu } from 'components/Contextmenu';
import MainPage from './MainPage';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { CONTEXTMENU_INFO, MAIN_DATA, STORE_DATA_NAMES } from 'lib/store';
import { GRAY200 } from 'styles/common';
import { isClient } from 'utils';

interface ContextMenuProps {
  top: string;
  left: string;
}

const ContextMenuWrapper = styled.div<ContextMenuProps>`
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 1000;
`;

interface Props {}

const ShootPage: NextPage<Props> = () => {
  const contextMenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const mainData = useReactiveVar(MAIN_DATA);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      CONTEXTMENU_INFO({ ...contextMenuInfo, isShow: false });
    },
  });

  useSaveLocalStorage({ name: `${STORE_DATA_NAMES.mainData}`, state: mainData });
  // useSaveLocalStorage({ name: `${STORE_DATA_NAMES.skeletonHelpers}`, state: skeletonHelpers });

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
      {isClient && <MainPage width={`${window.innerWidth}px`} height={`${window.innerHeight}px`} />}
    </main>
  );
};

export default ShootPage;
