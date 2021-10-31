import { FunctionComponent, memo, useEffect, useState, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { getNumberFromPx } from '../../../utils/common';
import ImageList from './ImageList';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as recordingDataActions from 'actions/recordingData';
import * as barPositionXActions from 'actions/barPositionX';
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
  const recordingData = useSelector((state) => state.recordingData);

  const dispatch = useDispatch();

  const [rangeRate, setRangeRate] = useState(0);

  useEffect(() => {
    if (!recordingData.rangeBoxInfo.width) {
      setRangeRate(100);
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          rangeBoxInfo: {
            ...recordingData.rangeBoxInfo,
            width: window.innerWidth,
          },
        }),
      );
    }
  }, [dispatch, recordingData, recordingData.rangeBoxInfo.width]);

  useEffect(() => {
    const handleResize = () => {
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          rangeBoxInfo: {
            ...recordingData.rangeBoxInfo,
            width: (window.innerWidth * rangeRate) / 100,
          },
        }),
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, rangeRate, recordingData, recordingData.rangeBoxInfo.width]);

  const barPositionX = useSelector((state) => state.barPositionX.x);
  const handleDrag = useCallback(
    (e, data) => {
      dispatch(
        recordingDataActions.setRecordingData({
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
        }),
      );
      dispatch(
        barPositionXActions.setBarPositionX({
          x: coordinateBarX({
            barX: barPositionX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        }),
      );
    },
    [barPositionX, dispatch, recordingData],
  );
  const handleResize: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          rangeBoxInfo: {
            ...recordingData.rangeBoxInfo,
            width: getNumberFromPx(ref.style.width),
            x: coordinateX({ x: position.x }),
            y: position.y,
            barX: coordinateBarX({
              barX: barPositionX,
              x: recordingData.rangeBoxInfo.x,
              width: recordingData.rangeBoxInfo.width,
            }),
          },
        }),
      );
      dispatch(
        barPositionXActions.setBarPositionX({
          x: coordinateBarX({
            barX: barPositionX,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        }),
      );

      const currentRate = Number(
        Math.round((getNumberFromPx(ref.style.width) / window.innerWidth) * 100),
      );

      setRangeRate(currentRate);
    },
    [barPositionX, dispatch, recordingData],
  );
  const handleDragBar: RndDragCallback = useCallback(
    (e, data) => {
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          rangeBoxInfo: {
            ...recordingData.rangeBoxInfo,
            barX: coordinateBarX({
              barX: data.x,
              x: recordingData.rangeBoxInfo.x,
              width: recordingData.rangeBoxInfo.width,
            }),
          },
        }),
      );
      dispatch(
        barPositionXActions.setBarPositionX({
          x: coordinateBarX({
            barX: data.x,
            x: recordingData.rangeBoxInfo.x,
            width: recordingData.rangeBoxInfo.width,
          }),
        }),
      );
    },
    [dispatch, recordingData],
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
