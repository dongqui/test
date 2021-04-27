import React, { FunctionComponent, memo, useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { ContextMenu } from 'components/New_ContextMenu';
import MainPage from './MainPage';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { storeContextMenuInfo, storeModalInfo, storePageInfo } from 'lib/store';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import { BaseModal } from 'components/New_Modal';
import ExtractPage from 'containers/extract';
import RecordPage from 'containers/record';
import Html from 'components/New_Typography/Html';
import { Headline } from 'components/New_Typography';

interface Props {}

const Shoot: FunctionComponent<Props> = () => {
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);

  const handleClose = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
    },
  });

  useEffect(() => {
    if (window) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('contextmenu', handleContextMenu);

      return () => {
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [contextMenuInfo.isShow]);

  return (
    <main>
      {contextMenuInfo.isShow && (
        <ContextMenu
          innerRef={contextMenuRef}
          position={{
            top: `${contextMenuInfo.top}px`,
            left: `${contextMenuInfo.left}px`,
          }}
          onSelect={contextMenuInfo.onClick}
          list={contextMenuInfo.data}
        />
      )}
      {modalInfo.isShow && (
        <>
          {_.isEqual(modalInfo.type, MODAL_TYPES.alert) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.loading) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
        </>
      )}
      {_.isEqual(pageInfo.page, PAGE_NAMES.shoot) && <MainPage />}
      {_.includes([PAGE_NAMES.extract, PAGE_NAMES.record], pageInfo.page) && <ExtractPage />}
    </main>
  );
};

export default memo(Shoot);
