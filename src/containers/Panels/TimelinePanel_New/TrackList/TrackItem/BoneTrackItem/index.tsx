import { useCallback, useMemo, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { BoneTrack } from 'types/TP_New/track';
import { clickTrackBody, ClickBoneTrackBody } from 'actions/trackList';
import { useSelector } from 'reducers';
import { getBoneTrackIndex } from 'utils/TP';

import CaretButton from './CaretButton';
import { TransformTrackItem } from '../index';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const BoneTrackItem: FunctionComponent<BoneTrack> = (props) => {
  const { isSelected, isPointedDownCaret, trackName, boneIndex } = props;
  const dispatch = useDispatch();
  const transformTrackList = useSelector((state) => state.trackList.transformTrackList);

  // 자식이 될 transform track list 필터링
  const childrenTrackList = useMemo(() => {
    let index = 0;
    while (index < transformTrackList.length) {
      const parentIndex = getBoneTrackIndex(transformTrackList[index].transformIndex);
      if (parentIndex === boneIndex) {
        const start = index - 1 === -1 ? 0 : index;
        return transformTrackList.slice(start, index + 9);
      }
      index += 9;
    }
    return [];
  }, [boneIndex, transformTrackList]);

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      event.stopPropagation(); // layer 트랙에 클릭 효과 전파를 방지
      if ((event.target as Element).nodeName !== 'DIV') return;
      const payload: ClickBoneTrackBody = {
        boneIndex,
        isMultipleClicked: event.ctrlKey,
        isRightClicked: false,
        isSelectedAll: false,
        isShowedContextMenu: false,
      };
      dispatch(clickTrackBody(payload));
    },
    [boneIndex, dispatch],
  );

  return (
    <li className={cx('bone-track')} onClick={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected })}>
        <CaretButton isPointedDownCaret={isPointedDownCaret} boneIndex={boneIndex} />
        <span className={cx('track-name')}>{trackName}</span>
      </div>
      <ul>
        {isPointedDownCaret &&
          childrenTrackList.map((transformTrack) => (
            <TransformTrackItem key={transformTrack.trackName} {...transformTrack} />
          ))}
      </ul>
    </li>
  );
};

export default BoneTrackItem;
