import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const onClick = useCallback(() => {
    RECORDING_DATA({ ...recordingData, isRecording: !recordingData.isRecording });
  }, [recordingData]);
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper onClick={onClick}>
        {recordingData.isRecording ? <SquareIcon /> : <CircleIcon fillColor="#E85757" />}
      </S.PlayBoxIconWrapper>
    </S.PlayBoxWrapper>
  );
};
export const PlayBox = React.memo(PlayBoxComponent);
