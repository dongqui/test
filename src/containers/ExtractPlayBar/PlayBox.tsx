import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { PauseIcon } from 'components/Icons/generated2/PauseIcon';
import { PlayForwardIcon } from 'components/Icons/generated2/PlayForwardIcon';
import { PlayIcon } from 'components/Icons/generated2/PlayIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { MODAL_TYPES } from 'types';
import { MODAL_INFO, RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { ExtractIcon } from '../../components/Icons/generated2/ExtractIcon';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const play = useCallback(() => {
    RECORDING_DATA({ ...recordingData, isPlaying: true });
    setTimeout(() => {
      RECORDING_DATA({ ...recordingData, isPlaying: false });
    }, 1000 * recordingData.duration);
  }, [recordingData]);
  const pause = useCallback(() => {
    RECORDING_DATA({ ...recordingData, isPlaying: false });
  }, [recordingData]);
  const extractVideo = useCallback(() => {
    MODAL_INFO({
      isShow: true,
      type: MODAL_TYPES.input,
      msg: '모션의 이름을 입력해주세요.',
    });
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
          <S.PlayBoxIconWrapper onClick={play}>
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
