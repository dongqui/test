import { useCallback, useMemo, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { BoneTrack } from 'types/TP/track';
import { clickTrackBody, ClickBoneTrackBody } from 'actions/trackList';
import { useSelector } from 'reducers';
import { getBoneTrackIndex } from 'utils/TP';

import CaretButton from './CaretButton';
import { PropertyTrackItem } from '../index';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const BoneTrackItem: FunctionComponent<BoneTrack> = (props) => {
  const { isSelected, isPointedDownCaret, trackName, trackNumber, trackType } = props;
  const dispatch = useDispatch();
  const propertyTrackList = useSelector((state) => state.trackList.propertyTrackList);

  // 자식이 될 transform track list 필터링
  const childrenProperty = useMemo(() => {
    let index = 0;
    while (index < propertyTrackList.length) {
      const boneIndex = getBoneTrackIndex(propertyTrackList[index].trackNumber);
      if (boneIndex === trackNumber) {
        const startIndex = index - 1 === -1 ? 0 : index;
        return propertyTrackList.slice(startIndex, index + 3);
      }
      index += 3;
    }
    return [];
  }, [trackNumber, propertyTrackList]);

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      event.stopPropagation(); // layer 트랙에 클릭 효과 전파를 방지
      const { nodeName } = event.target as Element;
      if (nodeName === 'DIV') {
        const eventType = event.ctrlKey ? 'multipleClick' : 'leftClick';
        const payload: ClickBoneTrackBody = { trackNumber, eventType, trackType: 'bone' };
        dispatch(clickTrackBody(payload));
      }
    },
    [trackNumber, dispatch],
  );

  return (
    <li className={cx('bone-track')} onClick={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected })}>
        <CaretButton
          isPointedDownCaret={isPointedDownCaret}
          trackNumber={trackNumber}
          trackType={trackType}
        />
        <span className={cx('track-name')}>{trackName}</span>
      </div>
      <ul>
        {isPointedDownCaret &&
          childrenProperty.map((transformTrack) => (
            <PropertyTrackItem key={transformTrack.trackName} {...transformTrack} />
          ))}
      </ul>
    </li>
  );
};

export default BoneTrackItem;
