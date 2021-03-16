import { useReactiveVar } from '@apollo/client';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { Indicator } from './Indicator';
import { ModeSelect } from './ModeSelect';
import * as S from './PlayBarStyles';
import { PlayBox } from './PlayBox';

export interface PlayBarProps {}

const PlayBarComponent: React.FC<PlayBarProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const now = useMemo(
    () => (recordingData.duration * (recordingData.rangeBoxInfo.barX / STANDARD_WIDTH)).toFixed(1),
    [recordingData.duration, recordingData.rangeBoxInfo.barX],
  );
  const start = useMemo(
    () => (recordingData.duration * (recordingData.rangeBoxInfo.x / STANDARD_WIDTH)).toFixed(1),
    [recordingData.duration, recordingData.rangeBoxInfo.x],
  );
  const end = useMemo(
    () =>
      (
        recordingData.duration *
        ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / STANDARD_WIDTH)
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
        <ModeSelect
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
        />
      </S.SelectWrapper>
    </S.PlayBarWrapper>
  );
};
export const PlayBar = React.memo(PlayBarComponent);
