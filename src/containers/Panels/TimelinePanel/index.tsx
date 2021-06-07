import React, {
  memo,
  useEffect,
  useRef,
  Fragment,
  FunctionComponent,
  MutableRefObject,
  RefObject,
} from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames/bind';
import MiddleBar from 'containers/MiddleBar';
import { useSelector } from 'reducers';
import { fnSetInitialTrackList } from 'utils/TP/trackUtils';
import { d3ScaleLinear } from 'types/TP';
import * as timelineActions from 'actions/timeline';
import { CurrentVisualizedData } from 'actions/currentVisualizedData';
import TrackList from './TrackList';
import TimeEditor from './TimeEditor';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentPlayBarTime: MutableRefObject<number>;
  dopeSheetScale: React.MutableRefObject<d3ScaleLinear | null>;
}

const TimelinePanel: FunctionComponent<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentPlayBarTime, dopeSheetScale } = props;
  const dispatch = useDispatch();
  const prevModelKey = useRef('');
  const isStoredTrackListData = useRef(false);
  const currentVisualizedData = useSelector<CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );

  useEffect(() => {
    const isClearedModel = prevModelKey.current && !currentVisualizedData;
    if (isClearedModel) {
      dispatch(timelineActions.clearAll());
      isStoredTrackListData.current = false;
      prevModelKey.current = '';
    } else if (currentVisualizedData) {
      const { baseLayer, layers, key } = currentVisualizedData;
      const isChangedModel = isStoredTrackListData.current && prevModelKey.current !== key;
      const isInitialVisualized = !isStoredTrackListData.current;
      if (isChangedModel) {
        const [trackList, lastBoneOfLayers] = fnSetInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(timelineActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
      } else if (isInitialVisualized) {
        const [trackList, lastBoneOfLayers] = fnSetInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(timelineActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
        isStoredTrackListData.current = true;
      }
    }
  }, [currentVisualizedData, dispatch]);

  // dope sheet에 커서를 올리고 wheel을 굴릴 때 TP 스크롤 방지
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const trackListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleWheelTimelineWrapper = (event: WheelEvent) => {
      if (!trackListRef.current?.contains(event.target as Node)) {
        event.preventDefault();
      }
    };
    timelineWrapperRef.current?.addEventListener('wheel', handleWheelTimelineWrapper);
  }, []);

  return (
    <div className={cx('panel')}>
      <MiddleBar
        currentTimeRef={currentTimeRef}
        currentTimeIndexRef={currentTimeIndexRef}
        currentPlayBarTime={currentPlayBarTime}
        dopeSheetScale={dopeSheetScale}
      />
      <div id="timeline-wrapper" className={cx('wrapper')} ref={timelineWrapperRef}>
        <TrackList trackListRef={trackListRef} />
        <TimeEditor
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentPlayBarTime={currentPlayBarTime}
          dopeSheetScale={dopeSheetScale}
        />
      </div>
    </div>
  );
};

export default memo(TimelinePanel);
