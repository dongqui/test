import { FunctionComponent, memo, Fragment, useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import { storeContextMenuInfo, storeModalInfo, storePageInfo } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { ContextMenu } from 'components/ContextMenu';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import { BaseModal } from 'components/Modal';
import { Headline, Html } from 'components/Typography';
import ShootContainer from './Shoot';
import ExtractContainer from 'containers/Extract';

const Index: FunctionComponent = () => {
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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

  const isShootMode = _.isEqual(pageInfo.page, 'shoot');

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
        <Fragment>
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
        </Fragment>
      )}
      {isShootMode ? <ShootContainer /> : <ExtractContainer />}
    </main>
  );
};

export default memo(Index);
