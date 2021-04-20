import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import produce from 'immer';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import {
  storeTPSelectedTrackList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeTPUpdateDopeSheetList,
  storeTPCurrnetClickedTrack,
  storeCurrentVisualizedData,
  storeContextMenuInfo,
  storeModalInfo,
} from 'lib/store';
import { CurrentVisualizedDataType, MODAL_TYPES } from 'types';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import {
  fnClickLockButton,
  fnClickRenderingButton,
  fnClickTrackToCtrlKey,
  fnClickTrackToMouse,
  fnGetBinarySearch,
} from 'utils/TP/trackUtils';
import styles from './index.module.scss';
import useContextMenu from 'hooks/common/useContextMenu';
import { FormModal } from 'components/New_Modal';
import { BaseInput } from 'components/New_Input';
import { useConfirmModal } from 'components/New_Modal/ConfirmModal';
import { useAlertModal } from 'components/New_Modal/AlertModal';

interface TrackProps {
  childrenTrack: TPTrackName[];
  isOpenedParent: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  trackName: 'Summary' | 'Base' | string; // 트랙 이름
  trackIndex: number;
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  childrenTrack,
  isOpenedParent = false,
  trackName,
  trackIndex,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isIncluded, setisIncluded] = useState(true);
  const [isClickedArrowButton, setIsClickedArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const clickedTrackList = useReactiveVar(storeTPSelectedTrackList);
  const trackRef = useRef<HTMLDivElement>(null);

  const [showsModal, setShowsModal] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const modalInfo = useReactiveVar(storeModalInfo);

  const { getConfirm } = useAlertModal();
  const multiKeyController = useMemo(
    () => ({
      ctrl: { pressed: false },
    }),
    [],
  );

  // 트랙 클릭
  const clickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const clickedTrack = event.target as Element;
      if (clickedTrack.nodeName === 'DIV' || clickedTrack.nodeName === 'P') {
        if (trackName !== 'Summary') {
          if (event.ctrlKey || event.metaKey || multiKeyController.ctrl.pressed) {
            const clickTrackToCtrlKey = fnClickTrackToCtrlKey({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            if (clickTrackToCtrlKey) {
              const [updatedTrackList, newClickedTrackList] = clickTrackToCtrlKey;
              storeTPSelectedTrackList(newClickedTrackList);
              storeTPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
            } else {
              const confirmed = getConfirm({
                title: 'Cannot select or edit multiple layers at the same time.',
              });
              if (confirmed) {
                return false;
              }
            }
          } else {
            const [updatedTrackList, newClickedTrackList] = fnClickTrackToMouse({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            storeTPSelectedTrackList(newClickedTrackList);
            storeTPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
          }
        }
      }
    },
    [
      trackName,
      multiKeyController.ctrl.pressed,
      clickedTrackList,
      lastBoneList,
      trackIndex,
      getConfirm,
    ],
  );

  // 화살표 버튼 클릭
  const clickArrowButton = useCallback(() => {
    const remainder = trackIndex % 10;
    const updatedTrackList: Partial<TPDopeSheet>[] = [];
    setIsClickedArrowButton((prev) => {
      switch (remainder) {
        // Summary 트랙 화살표 클릭
        case TP_TRACK_INDEX.SUMMARY: {
          const updatedList = _.map(lastBoneList, (lastBone) => ({
            trackIndex: lastBone.layerIndex,
            isOpenedParentTrack: !prev,
          }));
          storeTPUpdateDopeSheetList({ updatedList, status: 'isOpenedParentTrack' });
          break;
        }
        // Layer 트랙 화살표 클릭
        case TP_TRACK_INDEX.LAYER: {
          const targetIndex = fnGetBinarySearch({
            collection: lastBoneList,
            index: trackIndex,
            key: 'layerIndex',
          });
          const layerTrack = lastBoneList[targetIndex];
          let curBoneIndex = (layerTrack?.layerIndex as number) + 1;
          while (curBoneIndex <= (layerTrack?.lastBoneIndex as number)) {
            updatedTrackList.push({
              trackIndex: curBoneIndex,
              isOpenedParentTrack: !prev,
            });
            if (curBoneIndex % 10 === TP_TRACK_INDEX.BONE_A) {
              curBoneIndex += 4; // 3 -> 7
            } else if (curBoneIndex % 10 === TP_TRACK_INDEX.BONE_B) {
              curBoneIndex += 6; // 7 -> 3
            }
          }
          storeTPUpdateDopeSheetList({
            updatedList: updatedTrackList,
            status: 'isOpenedParentTrack',
          });
          break;
        }
        // Bone 트랙 화살표 클릭
        case TP_TRACK_INDEX.BONE_A:
        case TP_TRACK_INDEX.BONE_B: {
          for (
            let transformIndex = trackIndex;
            transformIndex < trackIndex + 3;
            transformIndex += 1
          ) {
            updatedTrackList.push({
              trackIndex: transformIndex + 1,
              isOpenedParentTrack: !prev,
            });
          }
          storeTPUpdateDopeSheetList({
            updatedList: updatedTrackList,
            status: 'isOpenedParentTrack',
          });
          break;
        }
        default: {
          break;
        }
      }
      storeTPCurrnetClickedTrack({
        trackIndex,
        isClickedArrow: !prev,
      });
      return !prev;
    });
  }, [lastBoneList, trackIndex]);

  // 수정불가 버튼 클릭
  const clickLockButton = useCallback(() => {
    const updatedDopeSheetList = fnClickLockButton({ dopeSheetList, lastBoneList, trackIndex });
    storeTPUpdateDopeSheetList({
      updatedList: updatedDopeSheetList,
      status: 'isLocked',
    });
  }, [dopeSheetList, lastBoneList, trackIndex]);

  // 랜더링 제외 버튼 클릭
  const clickRenderingButton = useCallback(() => {
    const state = storeCurrentVisualizedData();
    if (state) {
      const [updatedDopeSheetList, updatedState] = fnClickRenderingButton({
        dopeSheetList,
        lastBoneList,
        trackIndex,
      });
      const targetIndex = fnGetBinarySearch({
        collection: dopeSheetList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const targetTrack = dopeSheetList[targetIndex];
      if (targetTrack.layerKey === 'baseLayer') {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          _.forEach(updatedState, (updated) => {
            const transformIndex = _.findIndex(
              draft.baseLayer,
              (currentVisualizedData) => currentVisualizedData.name === updated.name,
            );
            draft.baseLayer[transformIndex].isIncluded = updated.isIncluded;
          });
        });
        storeCurrentVisualizedData(nextState);
      } else {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          const targetLayer = _.find(draft.layers, (layer) => layer.key === targetTrack.layerKey);
          if (targetLayer) {
            _.forEach(updatedState, (updated) => {
              const transformIndex = _.findIndex(
                targetLayer.tracks,
                (currentVisualizedData) => currentVisualizedData.name === updated.name,
              );
              targetLayer.tracks[transformIndex].isIncluded = updated.isIncluded;
            });
          }
        });
        storeCurrentVisualizedData(nextState);
      }
      storeTPUpdateDopeSheetList({
        updatedList: updatedDopeSheetList,
        status: 'isIncluded',
      });
    }
  }, [dopeSheetList, lastBoneList, trackIndex]);

  // 트랙 선택 효과 변경
  useEffect(() => {
    if (dopeSheetList && trackIndex) {
      const targetIndex = fnGetBinarySearch({
        collection: dopeSheetList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const targetTrack = dopeSheetList[targetIndex];
      setIsSelected(targetTrack?.isSelected);
      setIsLocked(targetTrack?.isLocked);
      setisIncluded(targetTrack?.isIncluded);
    }
  }, [dopeSheetList, trackIndex]);

  // 자식 트랙 opened 변경
  useEffect(() => {
    setIsClickedArrowButton(isOpenedParent);
  }, [isOpenedParent]);

  // 레이어 이름 변경 함수 호출
  const updateLayerName = useCallback(() => {
    setShowsModal(true);
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('newLayerName: ', newLayerName);
    setShowsModal(false);
    if (newLayerName === '') {
      const confirmed = getConfirm({
        title: 'You cannot use an empty string as a name.',
      });
      if (confirmed) {
        return false;
      }
    } else if (
      newLayerName === 'Base' ||
      _.map(currentVisualizedData?.layers, (layer) => layer.name).includes(newLayerName)
    ) {
      const confirmed = getConfirm({
        title: 'There is already a layer with the same name.',
      });
      if (confirmed) {
        return false;
      }
    } else {
      const state = storeCurrentVisualizedData();
      if (state) {
        const targetIndex = fnGetBinarySearch({
          collection: dopeSheetList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = dopeSheetList[targetIndex];
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          const targetLayer = _.find(draft.layers, (layer) => layer.key === curTrack.layerKey);
          if (targetLayer) targetLayer.name = newLayerName;
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [currentVisualizedData?.layers, dopeSheetList, getConfirm, newLayerName, trackIndex]);

  const handleModalClose = () => {
    setShowsModal(false);
  };

  const handleInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLayerName(event.target.value);
  };

  // 레이어 삭제 함수 호출
  const deleteLayer = useCallback(async () => {
    const confirmed = await getConfirm({
      title: 'Are you sure you want to delete this layer?',
    });
    if (confirmed) {
      const state = storeCurrentVisualizedData();
      if (state) {
        const targetIndex = fnGetBinarySearch({
          collection: dopeSheetList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = dopeSheetList[targetIndex];
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          draft.layers = _.filter(draft.layers, (layer) => layer.key !== curTrack.layerKey);
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [dopeSheetList, getConfirm, trackIndex]);

  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);

  const handleLayerTrackContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      e?.preventDefault();
      storeContextMenuInfo({
        isShow: true,
        top,
        left,
        data: [
          {
            key: 'edit',
            value: 'Edit Name',
            isSelected: false,
            isDisabled: trackIndex === 2,
          },
          {
            key: 'delete',
            value: 'Delete Layer',
            isSelected: false,
            isDisabled: trackIndex === 2,
          },
          {
            key: 'select',
            value: isSelected ? 'Unselect' : 'Select',
            isSelected: false,
          },
          {
            key: 'lock',
            value: isLocked ? 'Unlock' : 'Lock',
            isSelected: false,
          },
          {
            key: 'include',
            value: isIncluded ? 'Exclude' : 'Include',
            isSelected: false,
          },
        ],
        onClick: (key) => {
          switch (key) {
            case 'edit':
              updateLayerName();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'delete':
              deleteLayer();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'select':
              if (e) {
                if (isSelected) {
                  multiKeyController.ctrl.pressed = true;
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  clickTrackBody(e);
                  multiKeyController.ctrl.pressed = false;
                } else {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  clickTrackBody(e);
                }
              }
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'lock':
              clickLockButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'include':
              clickRenderingButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            default:
              break;
          }
        },
      });
    },
    [
      clickLockButton,
      clickRenderingButton,
      clickTrackBody,
      contextMenuInfo,
      deleteLayer,
      isIncluded,
      isLocked,
      isSelected,
      multiKeyController.ctrl,
      trackIndex,
      updateLayerName,
    ],
  );

  const handleBoneTransformTrackContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      e?.preventDefault();
      storeContextMenuInfo({
        isShow: true,
        top,
        left,
        data: [
          {
            key: 'select',
            value: isSelected ? 'Unselect' : 'Select',
            isSelected: false,
          },
          {
            key: 'lock',
            value: isLocked ? 'Unlock' : 'Lock',
            isSelected: false,
          },
          {
            key: 'include',
            value: isIncluded ? 'Exclude' : 'Include',
            isSelected: false,
          },
        ],
        onClick: (key) => {
          switch (key) {
            case 'select':
              if (e) {
                if (isSelected) {
                  multiKeyController.ctrl.pressed = true;
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  clickTrackBody(e);
                  multiKeyController.ctrl.pressed = false;
                } else {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  clickTrackBody(e);
                }
              }
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'lock':
              clickLockButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'include':
              clickRenderingButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            default:
              break;
          }
        },
      });
    },
    [
      clickLockButton,
      clickRenderingButton,
      clickTrackBody,
      contextMenuInfo,
      isIncluded,
      isLocked,
      isSelected,
      multiKeyController.ctrl,
    ],
  );

  const handleTrackContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      e?.preventDefault();
      if (trackIndex % 10 === 1) {
        return;
      } else if (trackIndex % 10 === 2) {
        handleLayerTrackContextMenu({ top, left, e });
      } else {
        handleBoneTransformTrackContextMenu({ top, left, e });
      }
    },
    [handleBoneTransformTrackContextMenu, handleLayerTrackContextMenu, trackIndex],
  );

  useContextMenu({ targetRef: trackRef, event: handleTrackContextMenu });

  const classes = cx(
    'track-body',
    {
      'layer-selected': isSelected && trackIndex % 10 === 2,
      'bone-selected': isSelected && (trackIndex % 10 === 3 || trackIndex % 10 === 7),
      'transform-selected':
        isSelected &&
        (trackIndex % 10 === 4 ||
          trackIndex % 10 === 5 ||
          trackIndex % 10 === 6 ||
          trackIndex % 10 === 8 ||
          trackIndex % 10 === 9 ||
          trackIndex % 10 === 0),
    },
    {
      'summary-track': trackIndex % 10 === 1,
      'layer-track': trackIndex % 10 === 2,
      'bone-track': trackIndex % 10 === 3 || trackIndex % 10 === 7,
    },
  );

  return (
    <>
      <div className={cx('track-wrapper')}>
        <div className={classes} onClick={clickTrackBody} aria-hidden="true" ref={trackRef}>
          {childrenTrack.length ? (
            <IconWrapper
              className={cx('track-icon', 'arrow-button', { opened: isClickedArrowButton })}
              icon={SvgPath.CaretDown}
              hasFrame={false}
              onClick={clickArrowButton}
            />
          ) : (
            ''
          )}
          <p className={cx({ locked: isLocked })}>{trackName}</p>
          <div className={cx('track-icon-wrapper', { locked: isLocked })}>
            {trackIndex !== 1 && (
              <>
                <IconWrapper
                  className={cx('track-icon', 'lock')}
                  icon={isLocked ? SvgPath.LockClose : SvgPath.LockOpen}
                  hasFrame={false}
                  onClick={clickLockButton}
                />
                <div className={cx('check-wrapper')}>
                  <IconWrapper
                    className={cx('track-icon', 'check', { rendered: isIncluded })}
                    icon={SvgPath.Check}
                    hasFrame={false}
                    onClick={clickRenderingButton}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className={cx('children-track-list', { displayed: isClickedArrowButton })}>
          {childrenTrack?.map((childTrack) => {
            const { childrenTrack, isOpenedChildrenTrack, name, trackIndex } = childTrack;
            return (
              <Track
                key={name}
                childrenTrack={childrenTrack}
                isOpenedParent={isOpenedChildrenTrack}
                trackName={name}
                trackIndex={trackIndex}
              />
            );
          })}
        </div>
        {showsModal && (
          <FormModal
            isOpen={showsModal}
            onClose={handleModalClose}
            onOutsideClose={handleModalClose}
            onSubmit={handleSubmit} // 현재 modal submit 이 안 먹음
            title="Please enter the name of the layer."
            text={{
              submit: 'OK',
              cancel: 'Cancel',
            }}
          >
            <BaseInput
              className={cx('form-name')}
              placeholder="Layer name"
              onBlur={handleInputBlur}
              fullSize
            />
          </FormModal>
        )}
      </div>
    </>
  );
};

export default Track;
// export default memo(Track);
