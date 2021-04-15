import { useReactiveVar } from '@apollo/client';
import { storeBarPositionX, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { Indicator } from './Indicator';
import * as S from './PlayBarStyles';
import { PlayBox } from './PlayBox';

export interface ExtractPlayBarProps {}

const ExtractPlayBarComponent: React.FC<ExtractPlayBarProps> = ({}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const barPositionX = useReactiveVar(storeBarPositionX);
  const now = useMemo(
    () => (recordingData.duration * (barPositionX / window.innerWidth)).toFixed(1),
    [recordingData.duration, barPositionX],
  );
  const start = useMemo(
    () => (recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth)).toFixed(1),
    [recordingData.duration, recordingData.rangeBoxInfo.x],
  );
  const end = useMemo(
    () =>
      (
        recordingData.duration *
        ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth)
      ).toFixed(1),
    [recordingData.duration, recordingData.rangeBoxInfo.width, recordingData.rangeBoxInfo.x],
  );
  return (
    <S.PlayBarWrapper>
      <S.PlayBarIndicatorWrapper>
        <Indicator end={end} now={now} start={start} />
      </S.PlayBarIndicatorWrapper>
      <S.PlayBarPlayBoxWrapper>
        <PlayBox />
      </S.PlayBarPlayBoxWrapper>
      <S.SelectWrapper>
        {/* <ModeSelect
          data={[
            {
              isSelected: true,
              key: 'edit',
              mode: 'edit',
            },
            {
              isSelected: false,
              key: 'camera',
              mode: 'camera',
            },
          ]}
          onSelect={() => {}}
        /> */}
      </S.SelectWrapper>
    </S.PlayBarWrapper>
  );
};
export const ExtractPlayBar = React.memo(ExtractPlayBarComponent);
