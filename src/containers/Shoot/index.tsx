import React, { FunctionComponent, memo, useCallback, useRef } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';
import * as api from 'utils/common/api';
import { useReactiveVar } from '@apollo/client';
import { ContextMenu } from 'components/New_ContextMenu';
import MainPage from './MainPage';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import {
  storeContextMenuInfo,
  storeLpData,
  storeModalInfo,
  storePageInfo,
  storeRecordingData,
} from 'lib/store';
import { FILE_TYPES, LPDataType, MODAL_TYPES, PAGE_NAMES } from 'types';
import { BaseModal } from 'components/New_Modal';
import ExtractPage from 'containers/extract';
import RecordPage from 'containers/record';
import { STANDARD_TIME_UNIT } from 'utils/const';
import { ROOT_FOLDER_NAME } from 'types/LP';
import fnQuaternionToEulerTracks from 'utils/common/fnQuaternionToEulerTracks';
import Html from 'components/New_Typography/Html';
import { Headline } from 'components/New_Typography';

const ShootPage: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const recordingData = useReactiveVar(storeRecordingData);
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
      {_.isEqual(pageInfo.page, PAGE_NAMES.extract) && <ExtractPage />}
      {_.isEqual(pageInfo.page, PAGE_NAMES.record) && <RecordPage />}
    </main>
  );
};

export default memo(ShootPage);
