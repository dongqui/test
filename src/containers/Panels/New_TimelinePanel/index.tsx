import React, { memo, useEffect, useRef, MutableRefObject, RefObject } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames/bind';
import MiddleBar from 'containers/MiddleBar';
import { fnSetAllInitialTrackList } from 'utils/TP/New';
import { d3ScaleLinear } from 'types/TP';
import * as timelineActions from 'actions/timeline';
import TrackList from './TrackList';
import TimeEditor from './TimeEditor';
import styles from './index.module.scss';
import { storeCurrentVisualizedData } from 'lib/store';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentPlayBarTime: MutableRefObject<number>;
  dopeSheetScale: React.MutableRefObject<d3ScaleLinear | null>;
}

const TimelinePanel: React.FC<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentPlayBarTime, dopeSheetScale } = props;
  const dispatch = useDispatch();
  const prevModelKey = useRef('');
  const isStoredDopeSheetData = useRef(false);

  // To Do...apollo -> redux
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  useEffect(() => {
    const isClearedModel = prevModelKey.current && !currentVisualizedData;
    if (isClearedModel) {
      dispatch(timelineActions.clearAll());
      isStoredDopeSheetData.current = false;
      prevModelKey.current = '';
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
        dispatch(timelineActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
      } else if (isInitialVisualized) {
        const [trackList, lastBoneOfLayers] = fnSetAllInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(timelineActions.setTrackList({ trackList, lastBoneOfLayers }));
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
          currentPlayBarTime={currentPlayBarTime}
          dopeSheetScale={dopeSheetScale}
        />
        <div id="timeline-wrapper" className={cx('wrapper')}>
          <TrackList />
          <TimeEditor
            currentTimeRef={currentTimeRef}
            currentTimeIndexRef={currentTimeIndexRef}
            currentPlayBarTime={currentPlayBarTime}
            dopeSheetScale={dopeSheetScale}
          />
        </div>
      </div>
    </>
  );
};

export default memo(TimelinePanel);
