import { useCallback, useMemo, useEffect, useRef, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import * as trackListActions from 'actions/trackList';
import { LayerTrack } from 'types/TP/track';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { IconWrapper, SvgPath } from 'components/Icon';

import CaretButton from './CaretButton';
import MuteButton from './MuteButton';
import { BoneTrackItem } from '../index';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LayerTrackItem: FunctionComponent<LayerTrack> = (props) => {
  const { isMuted, isSelected, isPointedDownCaret, trackName, trackId, trackType } = props;
  const dispatch = useDispatch();
  const trackItemRef = useRef<HTMLLIElement>(null);
  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  const { onContextMenuOpen } = useContextMenu();
  const { onModalOpen, onModalClose } = useBaseModal();

  // 컨텍스트 메뉴 리스트
  const contextMenuList = useMemo(
    () => [
      {
        label: 'Select',
        disabled: isSelected,
        separator: true,
        onClick: () => {
          const payload: trackListActions.ClickLayerTrackBody = { eventType: 'leftClick', trackId, trackType: 'layer' };
          dispatch(trackListActions.clickTrackBody(payload));
          dispatch(trackListActions.changeSelectedTargets());
        },
      },
      {
        label: 'Delete Layer',
        disabled: trackName === 'Base Layer' || isSelected,
        onClick: () => {
          onModalOpen({
            title: 'Delete Layer',
            message: 'Are you sure you want to delete a animation layer?<br />This will delete all keyframes in this layer',
            confirmText: 'Delete',
            onConfirm: () => {
              dispatch(trackListActions.clickDeleteLayerTrackButton({ id: trackId, name: trackName }));
              onModalClose();
            },
            cancelText: 'Cancel',
            onCancel: () => {
              onModalClose();
            },
            confirmColor: 'negative',
          });
        },
      },
    ],
    [dispatch, onModalOpen, onModalClose, isSelected, trackId, trackName],
  );

  // 트랙 클릭
  const handleTrackBodyClick = useCallback(
    (event: React.MouseEvent<Element>) => {
      const { nodeName } = event.target as Element;
      if (nodeName === 'DIV') {
        const payload: trackListActions.ClickLayerTrackBody = { trackId, eventType: 'leftClick', trackType: 'layer' };
        dispatch(trackListActions.clickTrackBody(payload));
        dispatch(trackListActions.changeSelectedTargets());
      }
    },
    [dispatch, trackId],
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
    <li className={cx('layer-track')} ref={trackItemRef} onMouseDown={handleTrackBodyClick}>
      <div className={cx('track-body', { selected: isSelected, muted: isMuted })}>
        <CaretButton isPointedDownCaret={isPointedDownCaret} trackId={trackId} trackType={trackType} />
        <IconWrapper className={cx('layer-icon')} icon={SvgPath.Layer} />
        <div className={cx('track-name')}>{trackName}</div>
        <MuteButton trackName={trackName} isMuted={isMuted} trackId={trackId} />
      </div>
      <ul>{isSelected && isPointedDownCaret && boneTrackList.map((boneTrack) => <BoneTrackItem key={boneTrack.trackName} {...boneTrack} />)}</ul>
    </li>
  );
};

export default LayerTrackItem;
