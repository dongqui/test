import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import { clickTrackBody, ClickLayerTrackBody } from 'actions/trackList';
import { LayerTrack } from 'types/TP/track';
import { IconWrapper, SvgPath } from 'components/Icon';

import CaretButton from './CaretButton';
import MuteButton from './MuteButton';
import { BoneTrackItem } from '../index';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LayerTrackItem: FunctionComponent<LayerTrack> = (props) => {
  const { isMuted, isSelected, isPointedDownCaret, trackName, layerId, trackType } = props;
  const dispatch = useDispatch();

  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      const { nodeName } = event.target as Element;
      if (nodeName === 'DIV') {
        const payload: ClickLayerTrackBody = {
          layerId,
          eventType: 'leftClick',
          trackType: 'layer',
        };
        dispatch(clickTrackBody(payload));
      }
    },
    [dispatch, layerId],
  );

  return (
    <li className={cx('layer-track')} onClick={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected, muted: isMuted })}>
        <CaretButton
          isPointedDownCaret={isPointedDownCaret}
          layerId={layerId}
          trackType={trackType}
        />
        <IconWrapper className={cx('layer-icon')} icon={SvgPath.Layer} />
        <span className={cx('track-name')}>{trackName}</span>
        <MuteButton trackName={trackName} isMuted={isMuted} />
      </div>
      <ul>
        {isSelected &&
          isPointedDownCaret &&
          boneTrackList.map((boneTrack) => (
            <BoneTrackItem key={boneTrack.trackName} {...boneTrack} />
          ))}
      </ul>
    </li>
  );
};

export default LayerTrackItem;
