import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { PauseIcon } from 'components/Icons/generated2/PauseIcon';
import { PlayForwardIcon } from 'components/Icons/generated2/PlayForwardIcon';
import { PlayIcon } from 'components/Icons/generated2/PlayIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { ExtractIcon } from '../../components/Icons/generated2/ExtractIcon';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const play = useCallback(() => {
    RECORDING_DATA({ ...recordingData, isPlay: true });
  }, [recordingData]);
  const pause = useCallback(() => {
    RECORDING_DATA({ ...recordingData, isPlay: false });
  }, [recordingData]);
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper>
        <CircleIcon />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <SquareIcon />
      </S.PlayBoxIconWrapper>
      {recordingData.isPlay ? (
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
      <S.PlayBoxIconWrapper>
        <ExtractIcon />
      </S.PlayBoxIconWrapper>
    </S.PlayBoxWrapper>
  );
};
export const PlayBox = React.memo(PlayBoxComponent);
