import { useReactiveVar } from '@apollo/client';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';
import { PlayBox } from './PlayBox';

export interface RecordPlayBarProps {}

const RecordPlayBarComponent: React.FC<RecordPlayBarProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  return (
    <S.PlayBarWrapper isRecording={recordingData.isRecording ?? false}>
      <S.PlayBarPlayBoxWrapper>
        <PlayBox />
      </S.PlayBarPlayBoxWrapper>
    </S.PlayBarWrapper>
  );
};
export const RecordPlayBar = React.memo(RecordPlayBarComponent);
