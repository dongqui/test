import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';

import { changeTrackScrollTop } from 'actions/trackList';
import { useSelector } from 'reducers';

import Box from 'components/Layout/Box';
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

  return (
    <Box id="TrackList" noResize>
      <ul className={cx('track-list')} ref={trackListRef} onScroll={scrollTrackList}>
        {layerTrackList.map((layerTrack) => (
          <LayerTrackItem key={layerTrack.trackId} {...layerTrack} />
        ))}
      </ul>
    </Box>
  );
};

export default TrackList;
