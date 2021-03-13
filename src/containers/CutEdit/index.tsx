import { useReactiveVar } from '@apollo/client';
import { TimeBar } from 'components/TimeBar';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { getNumberValue } from '../../hooks/RP/useResizeRP';
import * as S from './CutEdit.styles';
import { CutImages } from './CutImages';

export interface CutEditProps {}

const coordinateBarX = ({ barX, x, width }: { barX: number; x: number; width: number }) => {
  let result = barX;
  if (_.lt(result, x)) {
    result = x;
  }
  if (_.gt(result, x + width)) {
    result = x + width;
  }
  return result;
};
const coordinateX = ({ x }: { x: number }) => {
  let result = x;
  if (_.lt(result, 0)) {
    result = 0;
  }
  return result;
};
const CutEditComponent: React.FC<CutEditProps> = ({}) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const handleDrag = useCallback(
    (e, data) => {
      RECORDING_DATA({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          x: coordinateX({ x: data.x }),
          barX: coordinateBarX({
            barX: recordingData.rangeBoxInfo.barX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        },
      });
    },
    [recordingData],
  );
  const handleResize: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      RECORDING_DATA({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          width: getNumberValue(ref.style.width),
          x: coordinateX({ x: position.x }),
          y: position.y,
          barX: coordinateBarX({
            barX: recordingData.rangeBoxInfo.barX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        },
      });
    },
    [recordingData],
  );
  const handleDragBar: RndDragCallback = useCallback(
    (e, data) => {
      RECORDING_DATA({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          barX: coordinateBarX({
            barX: data.x,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        },
      });
    },
    [recordingData],
  );
  return (
    <S.CutEditWrapper>
      <S.CutEditCutImagesWrapper>
        <Rnd
          dragAxis="x"
          enableResizing={false}
          position={{ x: recordingData.rangeBoxInfo.barX, y: recordingData.rangeBoxInfo.y }}
          style={{ zIndex: 100, cursor: 'pointer' }}
          onDrag={handleDragBar}
        >
          <TimeBar />
        </Rnd>
        <Rnd
          disableDragging
          enableResizing={false}
          size={{ width: recordingData.rangeBoxInfo.x, height: recordingData.rangeBoxInfo.height }}
          position={{ x: 0, y: 0 }}
          style={{ backgroundColor: `rgba(0, 0, 0, ${S.OPACITY})` }}
        ></Rnd>
        <Rnd
          dragAxis="x"
          enableResizing={{ right: true, left: true }}
          size={{
            width: recordingData.rangeBoxInfo.width,
            height: recordingData.rangeBoxInfo.height,
          }}
          position={{ x: recordingData.rangeBoxInfo.x, y: recordingData.rangeBoxInfo.y }}
          onResize={handleResize}
          onDrag={handleDrag}
          style={{ border: '1px solid white' }}
        ></Rnd>
        <Rnd
          disableDragging
          enableResizing={false}
          size={{
            width: STANDARD_WIDTH - recordingData.rangeBoxInfo.x - recordingData.rangeBoxInfo.width,
            height: recordingData.rangeBoxInfo.height,
          }}
          position={{ x: recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width, y: 0 }}
          style={{
            backgroundColor: `rgba(0, 0, 0, ${S.OPACITY})`,
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
          }}
        ></Rnd>
        <CutImages />
      </S.CutEditCutImagesWrapper>
    </S.CutEditWrapper>
  );
};
export const CutEdit = React.memo(CutEditComponent);
