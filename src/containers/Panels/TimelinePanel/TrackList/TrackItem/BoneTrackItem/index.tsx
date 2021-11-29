import { useCallback, useMemo, useEffect, useRef, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { BoneTrack } from 'types/TP/track';
import { clickTrackBody, ClickBoneTrackBody } from 'actions/trackList';
import { useSelector } from 'reducers';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { getBoneTrackIndex } from 'utils/TP';

import CaretButton from './CaretButton';
import { PropertyTrackItem } from '../index';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const BoneTrackItem: FunctionComponent<BoneTrack> = (props) => {
  const { isSelected, isPointedDownCaret, trackName, trackNumber, trackType } = props;
  const dispatch = useDispatch();
  const trackItemRef = useRef<HTMLLIElement>(null);
  const propertyTrackList = useSelector((state) => state.trackList.propertyTrackList);

  const { onContextMenuOpen } = useContextMenu();

  // 컨텍스트 메뉴 리스트
  const contextMenuList = useMemo(
    () => [
      {
        label: isSelected ? 'Unselect' : 'Select',
        disabled: isSelected,
        onClick: () => {
          const payload: ClickBoneTrackBody = { trackNumber, eventType: isSelected ? 'multipleClick' : 'leftClick', trackType: 'bone' };
          dispatch(clickTrackBody(payload));
        },
      },
      {
        label: 'Select All',
        onClick: () => {
          const payload: ClickBoneTrackBody = { trackNumber, eventType: 'selectAll', trackType: 'bone' };
          dispatch(clickTrackBody(payload));
        },
      },
      {
        label: 'Unselect All',
        onClick: () => {
          const payload: ClickBoneTrackBody = { trackNumber, eventType: 'unselectAll', trackType: 'bone' };
          dispatch(clickTrackBody(payload));
        },
      },
    ],
    [dispatch, isSelected, trackNumber],
  );

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

  // 키프레임 컨텍스트 메뉴 설정
  useEffect(() => {
    const currentRef = trackItemRef.current;
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const isContains = trackItemRef.current?.contains(event.target as Node);
      if (isContains) onContextMenuOpen({ top: event.clientY, left: event.clientX, menu: contextMenuList });
    };
    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);
      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [contextMenuList, onContextMenuOpen]);

  return (
    <li className={cx('bone-track')} ref={trackItemRef} onMouseDown={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected })}>
        <CaretButton isPointedDownCaret={isPointedDownCaret} trackNumber={trackNumber} trackType={trackType} />
        <div className={cx('track-name')}>{trackName}</div>
      </div>
      <ul>
        {isPointedDownCaret &&
          propertyTrackList.map(
            (propertyTrack) => getBoneTrackIndex(propertyTrack.trackNumber) === trackNumber && <PropertyTrackItem key={propertyTrack.trackName} {...propertyTrack} />,
          )}
      </ul>
    </li>
  );
};

export default BoneTrackItem;
