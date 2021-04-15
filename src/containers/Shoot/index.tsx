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
  storeConfirmModalData,
} from 'lib/store';
import { FILE_TYPES, LPDataType, MODAL_TYPES, PAGE_NAMES } from 'types';
import { BaseModal, ConfirmModal } from 'components/New_Modal';
import ExtractPage from 'containers/extract';
import RecordPage from 'containers/record';
import { Modal } from 'components/Modal';
import { ModalInput } from 'components/Modal/ModalInput';
import { STANDARD_TIME_UNIT } from 'utils/const';
import { ROOT_FOLDER_NAME } from 'types/LP';
import fnQuaternionToEulerTracks from 'utils/common/fnQuaternionToEulerTracks';
import Html from 'components/New_Typography/Html';
import { Headline } from 'components/New_Typography';

const ModalWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);
`;

const ShootPage: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const recordingData = useReactiveVar(storeRecordingData);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);

  const confirmModalData = useReactiveVar(storeConfirmModalData);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      storeRecordingData({ ...recordingData, motionName: e.target.value });
    },
    [recordingData],
  );
  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      storeModalInfo({
        ...modalInfo,
        isShow: true,
        type: MODAL_TYPES.loading,
        msg: '모션 데이터를 추출중입니다.',
      });
      const { error, msg, result } = await api.uploadFileToMotionData({
        url: `${pageInfo?.videoUrl}`,
        type: `${pageInfo.extension ?? 'mp4'}`,
        id: uuidv4(),
        start: Math.round(
          (recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth)) /
            STANDARD_TIME_UNIT,
        ),
        end: Math.round(
          (recordingData.duration *
            ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) /
              window.innerWidth)) /
            STANDARD_TIME_UNIT,
        ),
        fileName: recordingData?.motionName,
      });
      if (error) {
        alert(msg);
        storeModalInfo({ ...modalInfo, isShow: false, type: MODAL_TYPES.alert });
        return false;
      }
      const key = uuidv4();
      const newData: LPDataType[] = [
        {
          key,
          type: FILE_TYPES.motion,
          name: _.isEmpty(recordingData?.motionName)
            ? 'Exported motion'
            : recordingData?.motionName,
          parentKey: ROOT_FOLDER_NAME,
          baseLayer: result?.data?.result
            ? fnQuaternionToEulerTracks({ quaternionTracks: result?.data?.result })
            : [],
          layers: [],
          isExportedMotion: true,
        },
      ];
      storeLpData(_.concat(lpData, newData));
      storePageInfo({ page: PAGE_NAMES.shoot });
      storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
    },
    [
      lpData,
      modalInfo,
      pageInfo.extension,
      pageInfo?.videoUrl,
      recordingData.duration,
      recordingData?.motionName,
      recordingData.rangeBoxInfo.width,
      recordingData.rangeBoxInfo.x,
    ],
  );
  const onClickConfirm = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);
  const onCancelLoading = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);
  const handleClose = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
    },
  });

  const { showsModal, ...confirmModalRest } = confirmModalData;

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
      {showsModal && <ConfirmModal {...confirmModalRest} />}
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
          {_.isEqual(modalInfo.type, MODAL_TYPES.confirm) && (
            <ModalWrapper>
              <Modal msg={modalInfo.msg} onClick={onClickConfirm} />
            </ModalWrapper>
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.input) && (
            <ModalWrapper>
              <ModalInput msg="모션의 이름을 입력해주세요." onChange={onChange} onClick={onClick} />
            </ModalWrapper>
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
