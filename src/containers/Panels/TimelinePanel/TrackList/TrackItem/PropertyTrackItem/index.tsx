import { useCallback, useMemo, useEffect, useRef, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { PropertyTrack } from 'types/TP/track';
import { clickTrackBody, ClickPropertyTrackBody } from 'actions/trackList';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PropertyTrackItem: FunctionComponent<React.PropsWithChildren<PropertyTrack>> = (props) => {
  const { isSelected, trackName, trackNumber } = props;
  const dispatch = useDispatch();
  const trackItemRef = useRef<HTMLLIElement>(null);

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  // 컨텍스트 메뉴 리스트
  const contextMenuList = useMemo(
    () => [
      {
        label: isSelected ? 'Unselect' : 'Select',
        disabled: isSelected,
        onClick: () => {
          const payload: ClickPropertyTrackBody = { trackNumber, eventType: isSelected ? 'multipleClick' : 'leftClick', trackType: 'property' };
          dispatch(clickTrackBody(payload));
        },
      },
      {
        label: 'Select All',
        onClick: () => {
          const payload: ClickPropertyTrackBody = { trackNumber, eventType: 'selectAll', trackType: 'property' };
          dispatch(clickTrackBody(payload));
        },
      },
      {
        label: 'Unselect All',
        onClick: () => {
          const payload: ClickPropertyTrackBody = { trackNumber, eventType: 'unselectAll', trackType: 'property' };
          dispatch(clickTrackBody(payload));
        },
      },
    ],
    [dispatch, isSelected, trackNumber],
  );

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      event.stopPropagation(); // bone, layer 트랙에 클릭 효과 전파를 방지
      onContextMenuClose();
      const { nodeName } = event.target as Element;
      if (nodeName === 'DIV') {
        const eventType = event.ctrlKey || event.metaKey ? 'multipleClick' : 'leftClick';
        const payload: ClickPropertyTrackBody = { trackNumber, eventType, trackType: 'property' };
        dispatch(clickTrackBody(payload));
      }
    },
    [dispatch, onContextMenuClose, trackNumber],
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
    <li className={cx('property-track')} ref={trackItemRef} onClick={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected })}>
        <div className={cx('track-name')}>{trackName}</div>
      </div>
    </li>
  );
};

export default PropertyTrackItem;
