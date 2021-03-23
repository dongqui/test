import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { sleep } from 'utils/common/sleep';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const onClick = useCallback(async () => {
    if (!recordingData.isRecording) {
      for (const count of [5, 4, 3, 2, 1]) {
        storeRecordingData({ ...recordingData, count });
        await sleep(1000);
      }
      storeRecordingData({
        ...recordingData,
        isRecording: !recordingData.isRecording,
        count: undefined,
      });
    }
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
