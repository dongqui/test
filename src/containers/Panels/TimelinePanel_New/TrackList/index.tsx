import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { createTrackList } from 'actions/trackList';
import { useSelector } from 'reducers';
import { LayerTrackItem } from './TrackItem';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TrackList = () => {
  const dispatch = useDispatch();
  const layerTrackList = useSelector((state) => state.trackList.layerTrackList);

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
        ],
      }),
    );
  }, [dispatch]);

  return (
    <ul className={cx('track-list')}>
      {layerTrackList.map((props) => (
        <LayerTrackItem key={props.layerId} {...props} />
      ))}
    </ul>
  );
};

export default TrackList;
