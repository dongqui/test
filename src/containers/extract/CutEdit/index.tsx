import { FunctionComponent, memo, useEffect, useState, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { storeBarPositionX, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { getNumberValue } from '../../../hooks/RP/useResizeRP';
import ImageList from './ImageList';
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

  const [rangeRate, setRangeRate] = useState(0);

  useEffect(() => {
    if (!recordingData.rangeBoxInfo.width) {
      setRangeRate(100);

      storeRecordingData({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          width: window.innerWidth,
        },
      });
    }
  }, [recordingData, recordingData.rangeBoxInfo.width]);

  useEffect(() => {
    const handleResize = () => {
      storeRecordingData({
        ...recordingData,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          width: (window.innerWidth * rangeRate) / 100,
        },
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [rangeRate, recordingData, recordingData.rangeBoxInfo.width]);

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

      const currentRate = Number(
        Math.round((getNumberValue(ref.style.width) / window.innerWidth) * 100),
      );

      setRangeRate(currentRate);
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
        className={cx('timebar-dragger')}
        dragAxis="x"
        enableResizing={false}
        onDrag={handleDragBar}
        position={{ x: barPositionX, y: recordingData.rangeBoxInfo.y }}
      >
        <div className={cx('timebar')}>
          <div className={cx('inner')} />
        </div>
      </Rnd>
      <Rnd
        className={cx('overlay')}
        disableDragging
        enableResizing={false}
        size={{ width: recordingData.rangeBoxInfo.x, height: recordingData.rangeBoxInfo.height }}
      />
      <Rnd
        className={cx('range-dragger')}
        dragAxis="x"
        enableResizing={{ right: true, left: true }}
        size={{
          width: recordingData.rangeBoxInfo.width,
          height: recordingData.rangeBoxInfo.height,
        }}
        onResize={handleResize}
        onDrag={handleDrag}
        position={{ x: recordingData.rangeBoxInfo.x, y: recordingData.rangeBoxInfo.y }}
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
        className={cx('overlay')}
        disableDragging
        enableResizing={false}
        size={{
          width: window.innerWidth - recordingData.rangeBoxInfo.width,
          height: recordingData.rangeBoxInfo.height,
        }}
        position={{
          x: recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width,
          y: 0,
        }}
      />
      <ImageList />
    </div>
  );
};

export default memo(CutEditComponent);
