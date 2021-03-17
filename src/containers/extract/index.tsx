import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/Webcam';
import { CutEdit } from 'containers/CutEdit';
import { PlayBar } from 'containers/ExtractPlayBar';
import { useRouter } from 'next/dist/client/router';
import { useReactiveVar } from '@apollo/client';
import { MAIN_DATA, MODAL_INFO, RECORDING_DATA } from 'lib/store';
import { FILE_TYPES, MainDataTypes, MODAL_TYPES, PAGE_NAMES } from 'interfaces';
import { ModalLoading } from 'components/Modal/ModalLoading';
import { ModalInput } from 'components/Modal/ModalInput';
import styled from 'styled-components';
import * as api from 'utils/common/api';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { DEFAULT_FILE_URL, STANDARD_TIME_UNIT } from 'utils/const';
import { Modal } from 'components/Modal';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';

interface Props {}

const ModalWrapper = styled.div`
  position: absolute;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 40%;
  top: 40%;
  transform: translateX(-40%), translateY(-40%);
`;

const ExtractPage: NextPage<Props> = ({}) => {
  const router = useRouter();
  const mainData = useReactiveVar(MAIN_DATA);
  const modalInfo = useReactiveVar(MODAL_INFO);
  const modalRef = useRef<HTMLDivElement>(null);
  const recordingData = useReactiveVar(RECORDING_DATA);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      RECORDING_DATA({ ...recordingData, motionName: e.target.value });
    },
    [recordingData],
  );
  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      MODAL_INFO({ ...modalInfo, type: MODAL_TYPES.loading });
      const { error, msg, result } = await api.uploadFileToMotionData({
        url: `${router?.query?.videoUrl}`,
        type: `${router?.query?.extension ?? 'mp4'}`,
        id: uuidv4(),
        start: Math.round(
          (recordingData.duration * (recordingData.rangeBoxInfo.x / STANDARD_WIDTH)) /
            STANDARD_TIME_UNIT,
        ),
        end: Math.round(
          (recordingData.duration *
            ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / STANDARD_WIDTH)) /
            STANDARD_TIME_UNIT,
        ),
        fileName: recordingData?.motionName,
      });
      if (error) {
        alert(msg);
        MODAL_INFO({ ...modalInfo, isShow: false });
        return false;
      }
      const key = uuidv4();
      const newData: MainDataTypes[] = [
        {
          key,
          type: FILE_TYPES.motion,
          name: recordingData.motionName,
          parentKey: ROOT_FOLDER_NAME,
          baseLayer: result?.data?.result ?? [],
        },
      ];
      MAIN_DATA(_.concat(mainData, newData));
      router.push({
        pathname: `/${PAGE_NAMES.shoot}`,
      });
    },
    [
      mainData,
      modalInfo,
      recordingData.duration,
      recordingData.motionName,
      recordingData.rangeBoxInfo.width,
      recordingData.rangeBoxInfo.x,
      router,
    ],
  );
  const onClickConfirm = useCallback(() => {
    MODAL_INFO({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);
  const onCancelLoading = useCallback(() => {
    MODAL_INFO({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);
  return (
    <main>
      {modalInfo.isShow && (
        <ModalWrapper ref={modalRef}>
          {_.isEqual(modalInfo.type, MODAL_TYPES.alert) && (
            <Modal msg={modalInfo.msg} onClick={onClickConfirm} />
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.loading) && (
            <ModalLoading
              msg="영상에서 이미지를 추출하고 있습니다."
              totalTime={Math.round(recordingData.duration * 5)}
              isActive={true}
              onCancel={onCancelLoading}
            />
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.input) && (
            <ModalInput msg="모션의 이름을 입력해주세요." onChange={onChange} onClick={onClick} />
          )}
        </ModalWrapper>
      )}
      <S.WebcamWrapper>
        <Webcam videoUrl={`${router.query?.videoUrl ?? DEFAULT_FILE_URL}`} />
      </S.WebcamWrapper>
      <PlayBar />
      <S.CutEditWrapper>
        <CutEdit />
      </S.CutEditWrapper>
    </main>
  );
};

export default ExtractPage;
