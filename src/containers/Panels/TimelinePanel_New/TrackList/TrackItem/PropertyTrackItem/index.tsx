import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { PropertyTrack } from 'types/TP_New/track';
import { clickTrackBody, ClickPropertyTrackBody } from 'actions/trackList';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PropertyTrackItem: FunctionComponent<PropertyTrack> = (props) => {
  const { isSelected, trackName, trackNumber } = props;
  const dispatch = useDispatch();

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      event.stopPropagation(); // bone, layer 트랙에 클릭 효과 전파를 방지
      const { nodeName } = event.target as Element;
      if (nodeName === 'DIV') {
        const eventType = event.ctrlKey ? 'multipleClick' : 'leftClick';
        const payload: ClickPropertyTrackBody = { trackNumber, eventType, trackType: 'property' };
        dispatch(clickTrackBody(payload));
      }
    },
    [dispatch, trackNumber],
  );

  return (
    <li className={cx('property-track')} onClick={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected })}>
        <span className={cx('track-name')}>{trackName}</span>
      </div>
    </li>
  );
};

export default PropertyTrackItem;
