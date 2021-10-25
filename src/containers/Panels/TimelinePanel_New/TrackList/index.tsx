import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';

import { createTrackList, changeTrackScrollTop } from 'actions/trackList';
import { useSelector } from 'reducers';
import { LayerTrackItem } from './TrackItem';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TrackList = () => {
  const dispatch = useDispatch();
  const trackListRef = useRef<HTMLUListElement>(null);
  const layerTrackList = useSelector((state) => state.trackList.layerTrackList);

  const throttledThing = _.throttle(() => {
    const trackListDOM = trackListRef.current;
    const params = { scrollTop: trackListDOM!.scrollTop };
    dispatch(changeTrackScrollTop(params));
  }, 10);

  const scrollTrackList = useCallback(() => {
    throttledThing();
  }, [throttledThing]);

  // 테스트 용도
  useEffect(() => {
    dispatch(
      createTrackList({
        trackList: [
          {
            layerId: 'Base',
            trackName: 'Base',
          },
          {
            layerId: 'Layer2',
            trackName: 'Layer2',
          },
          {
            layerId: 'Layer3',
            trackName: 'Layer3',
          },
        ],
      }),
    );
  }, [dispatch]);

  return (
    <ul className={cx('track-list')} ref={trackListRef} onScroll={scrollTrackList}>
      {layerTrackList.map((props) => (
        <LayerTrackItem key={props.layerId} {...props} />
      ))}
    </ul>
  );
};

export default TrackList;
