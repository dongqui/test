import { FunctionComponent, Fragment, memo, useCallback, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { TimeBar } from 'components/TimeBar';
import { storeBarPositionX, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { getNumberValue } from '../../../hooks/RP/useResizeRP';
import * as S from './CutEdit.styles';
import { CutImages } from './CutImages';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

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

const CutEditComponent: FunctionComponent = () => {
  const recordingData = useReactiveVar(storeRecordingData);

  // useEffect(() => {
  //   if (!recordingData.rangeBoxInfo.width) {
  //     storeRecordingData({
  //       ...recordingData,
  //       rangeBoxInfo: {
  //         ...recordingData.rangeBoxInfo,
  //         width: window.innerWidth * 0.9,
  //       },
  //     });
  //   }
  // }, [recordingData, recordingData.rangeBoxInfo.width]);

  const barPositionX = useReactiveVar(storeBarPositionX);
  const handleDrag = useCallback(
    (e, data) => {
      storeRecordingData({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          x: coordinateX({ x: data.x }),
          barX: coordinateBarX({
            barX: barPositionX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        },
      });
      storeBarPositionX(
        coordinateBarX({
          barX: barPositionX,
          x: recordingData.rangeBoxInfo.x,
          width: recordingData.rangeBoxInfo.width,
        }),
      );
    },
    [barPositionX, recordingData],
  );
  const handleResize: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      storeRecordingData({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          width: getNumberValue(ref.style.width),
          x: coordinateX({ x: position.x }),
          y: position.y,
          barX: coordinateBarX({
            barX: barPositionX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        },
      });
      storeBarPositionX(
        coordinateBarX({
          barX: barPositionX,
          x: recordingData.rangeBoxInfo.x,
          width: recordingData.rangeBoxInfo.width,
        }),
      );
    },
    [barPositionX, recordingData],
  );
  const handleDragBar: RndDragCallback = useCallback(
    (e, data) => {
      storeRecordingData({
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
      storeBarPositionX(
        coordinateBarX({
          barX: data.x,
          x: recordingData.rangeBoxInfo.x,
          width: recordingData.rangeBoxInfo.width,
        }),
      );
    },
    [recordingData],
  );

  return (
    <div className={cx('wrapper')}>
      <Rnd
        dragAxis="x"
        enableResizing={false}
        position={{ x: barPositionX, y: recordingData.rangeBoxInfo.y }}
        style={{ zIndex: 100, cursor: 'pointer' }}
        onDrag={handleDragBar}
      >
        {/* <IconWrapper className={cx('icon-playbar')} icon={SvgPath.PlayBar} hasFrame={false} /> */}
        {/* <TimeBar /> */}
        <div className={cx('timebar')}>
          <div className={cx('inner')} />
        </div>
      </Rnd>
      <Rnd
        disableDragging
        enableResizing={false}
        size={{ width: recordingData.rangeBoxInfo.x, height: recordingData.rangeBoxInfo.height }}
        position={{ x: 0, y: 0 }}
        style={{ backgroundColor: `rgba(0, 0, 0, ${S.OPACITY})` }}
      />
      <Rnd
        dragAxis="x"
        enableResizing={{ right: true, left: true }}
        size={{
          // width: recordingData.rangeBoxInfo.width,
          width: recordingData.rangeBoxInfo.width,
          height: recordingData.rangeBoxInfo.height,
        }}
        position={{ x: recordingData.rangeBoxInfo.x, y: recordingData.rangeBoxInfo.y }}
        onResize={handleResize}
        onDrag={handleDrag}
        style={{ overflow: 'hidden', border: '1px solid white', borderRadius: '12px' }}
      >
        <div className={cx('range-inner')}>
          <div className={cx(['arrow-wrapper', 'left'])}>
            <IconWrapper
              className={cx(['triangle', 'left'])}
              icon={SvgPath.LineLeftTriangle}
              hasFrame={false}
            />
          </div>
          <div className={cx(['arrow-wrapper', 'right'])}>
            <IconWrapper
              className={cx(['triangle', 'right'])}
              icon={SvgPath.LineLeftTriangle}
              hasFrame={false}
            />
          </div>
        </div>
      </Rnd>
      <Rnd
        disableDragging
        enableResizing={false}
        size={{
          width: STANDARD_WIDTH - recordingData.rangeBoxInfo.x - recordingData.rangeBoxInfo.width,
          height: recordingData.rangeBoxInfo.height,
        }}
        position={{
          x: recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width,
          y: 0,
        }}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${S.OPACITY})`,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      />
      <CutImages />
    </div>
  );
};

export default memo(CutEditComponent);
