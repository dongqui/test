import React, { memo, useEffect, useRef, MutableRefObject, RefObject } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames/bind';
import MiddleBar from 'containers/MiddleBar';
import { fnSetAllInitialTrackList } from 'utils/TP/New';
import { d3ScaleLinear } from 'types/TP';
import * as dopeSheetActions from 'actions/dopeSheet';
import ChannelList from './ChannelList';
import TimeEditor from './TimeEditor';
import styles from './index.module.scss';
import { storeCurrentVisualizedData } from 'lib/store';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimelinePanel: React.FC<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentXAxisPosition, prevXScale } = props;
  const dispatch = useDispatch();
  const prevModelKey = useRef('');
  const prevLayerCount = useRef(0);
  const isStoredDopeSheetData = useRef(false);
  const panelWrapperRef = useRef<HTMLDivElement>(null);

  // To Do...apollo -> redux
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  useEffect(() => {
    const isClearedModel = prevModelKey.current && !currentVisualizedData;
    // 모델 삭제
    if (isClearedModel) {
      dispatch(dopeSheetActions.clearAll());
      isStoredDopeSheetData.current = false;
      prevModelKey.current = '';
      prevLayerCount.current = 0;
    } else if (currentVisualizedData) {
      const { baseLayer, layers, key } = currentVisualizedData;
      const isChangedModel = isStoredDopeSheetData.current && prevModelKey.current !== key;
      const isInitialVisualized = !isStoredDopeSheetData.current;
      if (isChangedModel) {
        const [trackList, lastBoneOfLayers] = fnSetAllInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(dopeSheetActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
        prevLayerCount.current = layers.length;
      } else if (isInitialVisualized) {
        const [trackList, lastBoneOfLayers] = fnSetAllInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(dopeSheetActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
        isStoredDopeSheetData.current = true;
      }
    }
  }, [currentVisualizedData, dispatch]);

  return (
    <>
      <div className={cx('panel')}>
        <MiddleBar
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentXAxisPosition={currentXAxisPosition}
          prevXScale={prevXScale}
        />
        <div id="timeline-wrapper" className={cx('wrapper')} ref={panelWrapperRef}>
          <ChannelList />
          <TimeEditor
            currentTimeRef={currentTimeRef}
            currentTimeIndexRef={currentTimeIndexRef}
            currentXAxisPosition={currentXAxisPosition}
            prevXScale={prevXScale}
          />
        </div>
      </div>
    </>
  );
};

export default memo(TimelinePanel);
