import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { PauseIcon } from 'components/Icons/generated2/PauseIcon';
import { PlayForwardIcon } from 'components/Icons/generated2/PlayForwardIcon';
import { PlayIcon } from 'components/Icons/generated2/PlayIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import { storeModalInfo, storePageInfo, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { ExtractIcon } from '../../../components/Icons/generated2/ExtractIcon';
import * as S from './PlayBarStyles';
import fnKillThread from 'utils/common/fnKillSetInterval';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const play = useCallback(() => {
    storeRecordingData({ ...recordingData, isPlaying: true });
  }, [recordingData]);
  const pause = useCallback(() => {
    storeRecordingData({ ...recordingData, isPlaying: false });
  }, [recordingData]);
  const extractVideo = useCallback(() => {
    storeModalInfo({
      isShow: true,
      type: MODAL_TYPES.input,
      msg: 'Please enter the name of the motion.',
    });
  }, []);
  const backToHome = useCallback(() => {
    fnKillThread();
    storePageInfo({ page: PAGE_NAMES.shoot });
  }, []);
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper>
        <CircleIcon />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <SquareIcon />
      </S.PlayBoxIconWrapper>
      {recordingData.isPlaying ? (
        <S.PlayBoxIconDoubleWrapper onClick={pause}>
          <PauseIcon />
        </S.PlayBoxIconDoubleWrapper>
      ) : (
        <>
          <S.PlayBoxIconWrapper onClick={backToHome}>
            <PlayForwardIcon />
          </S.PlayBoxIconWrapper>
          <S.PlayBoxIconWrapper onClick={play}>
            <PlayIcon />
          </S.PlayBoxIconWrapper>
        </>
      )}
      <S.PlayBoxIconWrapper onClick={extractVideo}>
        <ExtractIcon />
      </S.PlayBoxIconWrapper>
    </S.PlayBoxWrapper>
  );
};
export const PlayBox = React.memo(PlayBoxComponent);
