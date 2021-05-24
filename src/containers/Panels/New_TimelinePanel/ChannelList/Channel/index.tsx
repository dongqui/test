import React, { FunctionComponent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useAlertModal } from 'components/Modal/AlertModal';
import {
  fnGetBinarySearch,
  fnGetBoneTrackIndex,
  fnGetLayerTrackIndex,
  fnUpdateIsSelected,
} from 'utils/TP/New';
import { TP_TRACK_INDEX } from 'utils/const';
import { UpdatedTrack } from 'types/TP';
import * as dopeSheetActions from 'actions/dopeSheet';
import styles from './index.module.scss';
import { storeContextMenuInfo, storeCurrentVisualizedData } from 'lib/store';
import { CurrentVisualizedDataType } from 'types';
import useContextMenu from 'hooks/common/useContextMenu';
import { useReactiveVar } from '@apollo/client';
import { FormModal } from 'components/Modal';
import { BaseInput } from 'components/Input';

const cx = classNames.bind(styles);

const {
  SUMMARY,
  LAYER,
  BONE_A,
  BONE_B,
  POSITION_A,
  POSITION_B,
  ROTATION_A,
  ROTATION_B,
  SCALE_A,
  SCALE_B,
} = TP_TRACK_INDEX;

interface Props {
  isIncluded: boolean;
  isLocked: boolean;
  isPointedDownArrow: boolean;
  isSelected: boolean;
  isTransformTrack: boolean;
  layerKey: string;
  trackIndex: number;
  trackName: string;
}

const Track: FunctionComponent<Props> = ({
  isIncluded,
  isLocked,
  isPointedDownArrow,
  isSelected,
  isTransformTrack,
  layerKey,
  trackIndex,
  trackName,
}) => {
  const { getConfirm } = useAlertModal();
  const dispatch = useDispatch();
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const lastBoneOfLayers = useSelector((state) => state.dopeSheet.lastBoneOfLayers);
  const selectedChannels = useSelector((state) => state.dopeSheet.selectedChannels);
  const currentClickedChannel = useSelector((state) => state.dopeSheet.currentClickedChannel);
  const channelRef = useRef<HTMLLIElement>(null);
  const multiKeyController = useMemo(
    () => ({
      ctrl: { pressed: false },
    }),
    [],
  );

  // 화살표 버튼 클릭
  const handleClickArrowButton = useCallback(() => {
    const remainder = trackIndex % 10;
    const updatedTrackList: Partial<UpdatedTrack<'isPointedDownArrow' | 'isShowed'>>[] = [];
    updatedTrackList.push({
      trackIndex,
      isPointedDownArrow: !isPointedDownArrow,
    });
    switch (remainder) {
      case SUMMARY: {
        const layerTrackList = _.map(lastBoneOfLayers, (lastBone) => ({
          trackIndex: lastBone.layerIndex,
          isShowed: !isPointedDownArrow,
        }));
        updatedTrackList.push(...layerTrackList);
        break;
      }
      case LAYER: {
        const layerIndex = fnGetBinarySearch({
          collection: lastBoneOfLayers,
          index: trackIndex,
          key: 'layerIndex',
        });
        const layerTrack = lastBoneOfLayers[layerIndex];
        if (layerTrack) {
          let currentBoneIndex = layerTrack.layerIndex + 1;
          while (currentBoneIndex <= layerTrack.lastBoneIndex) {
            updatedTrackList.push({
              trackIndex: currentBoneIndex,
              isShowed: !isPointedDownArrow,
            });
            if (currentBoneIndex % 10 === BONE_A) {
              currentBoneIndex += 4; // 3 -> 7
            } else if (currentBoneIndex % 10 === BONE_B) {
              currentBoneIndex += 6; // 7 -> 3
            }
          }
        }
        break;
      }
      case BONE_A:
      case BONE_B: {
        for (
          let transformIndex = trackIndex;
          transformIndex < trackIndex + 3;
          transformIndex += 1
        ) {
          updatedTrackList.push({
            trackIndex: transformIndex + 1,
            isShowed: !isPointedDownArrow,
          });
        }
        break;
      }
      default: {
        break;
      }
    }
    const nextState = produce(trackList, (draft) => {
      _.forEach(updatedTrackList, ({ isShowed, isPointedDownArrow, trackIndex }) => {
        if (trackIndex) {
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: trackIndex,
            key: 'trackIndex',
          });
          if (!_.isUndefined(isPointedDownArrow)) {
            draft[targetIndex].isPointedDownArrow = isPointedDownArrow;
          } else if (!_.isUndefined(isShowed)) {
            draft[targetIndex].isShowed = isShowed;
          }
        }
      });
    });
    const currentClickedChannel = { trackIndex, isPointedDownArrow: !isPointedDownArrow };
    dispatch(
      dopeSheetActions.clickTrackArrowButton({
        trackList: nextState,
        currentClickedChannel,
      }),
    );
  }, [dispatch, trackList, isPointedDownArrow, lastBoneOfLayers, trackIndex]);

  // 트랙 클릭
  const handleClickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const { nodeName } = event.target as Element;
      const isNotClickablehNode = nodeName !== 'LI' && nodeName !== 'DIV' && nodeName !== 'P';
      const isMutipleSelected = event.ctrlKey || event.metaKey || multiKeyController.ctrl.pressed;
      const dispatchClickTrackBody = (
        updatedTrackList: UpdatedTrack<'isSelected'>[],
        selectedIndexes: number[],
      ) => {
        const state = {
          trackList,
          selectedChannels,
        };
        const nextState = produce(state, (draft) => {
          _.forEach(updatedTrackList, ({ trackIndex, isSelected }) => {
            const targetIndex = fnGetBinarySearch({
              collection: trackList,
              index: trackIndex,
              key: 'trackIndex',
            });
            if (targetIndex !== -1 && !_.isUndefined(isSelected)) {
              draft.trackList[targetIndex].isSelected = isSelected;
            }
          });
          draft.selectedChannels = selectedIndexes;
        });
        dispatch(dopeSheetActions.clickTrackBody(nextState));
      };

      if (isNotClickablehNode || trackName === 'Summary') return;
      if (isMutipleSelected) {
        for (let index = 0; index < selectedChannels.length; index += 1) {
          const targetIndex = selectedChannels[index];
          const targetLayerIndex = fnGetLayerTrackIndex({ trackIndex: targetIndex });
          const trackLayerIndex = fnGetLayerTrackIndex({ trackIndex });
          const isNotSameLayer = targetLayerIndex !== trackLayerIndex;
          const isClickedSelf = selectedChannels[index] === trackIndex;

          if (isNotSameLayer) {
            const confirmed = getConfirm({
              title: 'Cannot select or edit multiple layers at the same time.',
            });
            if (confirmed) return false;
          } else if (isClickedSelf) {
            const remainder = trackIndex % 10;
            const [deselected, deselectedIndexes] = fnUpdateIsSelected({
              isSelected: false,
              lastBoneOfLayers,
              trackIndex,
            });
            if (remainder !== LAYER) {
              const layerIndex = fnGetLayerTrackIndex({ trackIndex });
              const isTransformTrack = remainder !== BONE_A && remainder !== BONE_B;
              deselectedIndexes.push(layerIndex);
              deselected.push({
                trackIndex: layerIndex,
                isSelected: false,
              });
              if (isTransformTrack) {
                const boneIndex = fnGetBoneTrackIndex({ trackIndex });
                deselectedIndexes.push(boneIndex);
                deselected.push({
                  trackIndex: boneIndex,
                  isSelected: false,
                });
              }
            }
            const filteredIndexes = _.filter(selectedChannels, (index) => {
              const result = fnGetBinarySearch({
                collection: _.sortBy(deselectedIndexes),
                index,
              });
              return result === -1;
            });
            dispatchClickTrackBody(deselected, filteredIndexes);
            return;
          }
        }
        const [selected, selectedIndexes] = fnUpdateIsSelected({
          isSelected: true,
          lastBoneOfLayers,
          trackIndex,
        });
        dispatchClickTrackBody(selected, selectedIndexes);
      } else if (!isMutipleSelected) {
        const deselected = _.map(selectedChannels, (index) => ({
          trackIndex: index,
          isSelected: false,
        }));
        const [selected, selectedIndexes] = fnUpdateIsSelected({
          isSelected: true,
          lastBoneOfLayers,
          trackIndex,
        });
        dispatchClickTrackBody([...deselected, ...selected], selectedIndexes);
      }
    },
    [
      dispatch,
      trackList,
      getConfirm,
      lastBoneOfLayers,
      multiKeyController.ctrl.pressed,
      selectedChannels,
      trackIndex,
      trackName,
    ],
  );

  // 잠금 버튼 클릭
  const handleclickLockButton = useCallback(() => {
    const remainder = trackIndex % 10;
    const updatedTrackList: UpdatedTrack<'isLocked'>[] = [];
    switch (remainder) {
      case LAYER: {
        const targetIndex = fnGetBinarySearch({
          collection: lastBoneOfLayers,
          index: trackIndex,
          key: 'layerIndex',
        });
        const lastBone = lastBoneOfLayers[targetIndex];
        const lastTransformIndex = lastBone.lastBoneIndex + 3;
        let currentIndex = lastBone.layerIndex + 1;
        updatedTrackList.push({
          trackIndex,
          isLocked: !isLocked,
        });
        while (currentIndex <= lastTransformIndex) {
          updatedTrackList.push({
            trackIndex: currentIndex,
            isLocked: !isLocked,
          });
          currentIndex += 1;
          if ((currentIndex - 1) % 10 === 0) currentIndex += 2;
        }
        break;
      }
      case BONE_A:
      case BONE_B: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        if (isLocked) {
          updatedTrackList.push({
            trackIndex: layerIndex,
            isLocked: false,
          });
        }
        for (let index = trackIndex; index <= trackIndex + 3; index += 1) {
          updatedTrackList.push({
            trackIndex: index,
            isLocked: !isLocked,
          });
        }
        break;
      }
      default: {
        if (!isLocked) {
          updatedTrackList.push({
            trackIndex,
            isLocked: true,
          });
        } else {
          const layerIndex = fnGetLayerTrackIndex({ trackIndex });
          const boneIndex = fnGetBoneTrackIndex({ trackIndex });
          updatedTrackList.push({
            trackIndex: layerIndex,
            isLocked: false,
          });
          updatedTrackList.push({
            trackIndex: boneIndex,
            isLocked: false,
          });
          updatedTrackList.push({
            trackIndex,
            isLocked: false,
          });
        }
        break;
      }
    }
    const nextState = produce(trackList, (draft) => {
      _.forEach(updatedTrackList, ({ isLocked, trackIndex }) => {
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        draft[targetIndex].isLocked = isLocked;
      });
    });
    dispatch(dopeSheetActions.clickTrackLockButton({ trackList: nextState }));
  }, [dispatch, trackList, isLocked, lastBoneOfLayers, trackIndex]);

  // 랜더링 제외 버튼 클릭
  const handleClickRenderingButton = useCallback(() => {
    const state = storeCurrentVisualizedData();
    if (state) {
      const updatedTrackList: UpdatedTrack<'isIncluded' | 'trackIndex' | 'trackName'>[] = [];
      const remainder = trackIndex % 10;
      switch (remainder) {
        case LAYER: {
          const targetLastBoneIndex = fnGetBinarySearch({
            collection: lastBoneOfLayers,
            index: trackIndex,
            key: 'layerIndex',
          });
          const lastBone = lastBoneOfLayers[targetLastBoneIndex];
          const lastTransformIndex = lastBone.lastBoneIndex + 3;
          let currentTrackIndex = trackIndex;
          let trackListIndex = fnGetBinarySearch({
            collection: trackList,
            index: trackIndex,
            key: 'trackIndex',
          });
          while (currentTrackIndex <= lastTransformIndex) {
            updatedTrackList.push({
              isIncluded: isIncluded ? false : true,
              trackIndex: trackList[trackListIndex].trackIndex,
              trackName: trackList[trackListIndex].trackName,
            });
            currentTrackIndex += 1;
            trackListIndex += 1;
            if ((currentTrackIndex - 1) % 10 === 0) currentTrackIndex += 2;
          }
          break;
        }
        case BONE_A:
        case BONE_B: {
          if (isIncluded) {
            const layerIndex = fnGetLayerTrackIndex({ trackIndex });
            const targetIndex = fnGetBinarySearch({
              collection: trackList,
              index: layerIndex,
              key: 'trackIndex',
            });
            updatedTrackList.push({
              isIncluded: false,
              trackIndex: trackList[targetIndex].trackIndex,
              trackName: trackList[targetIndex].trackName,
            });
          }
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: trackIndex,
            key: 'trackIndex',
          });
          for (let index = targetIndex; index <= targetIndex + 3; index += 1) {
            updatedTrackList.push({
              isIncluded: isIncluded ? false : true,
              trackIndex: trackList[index].trackIndex,
              trackName: trackList[index].trackName,
            });
          }
          break;
        }
        default: {
          if (isIncluded) {
            _.forEach([0, 1], (index) => {
              const parentTrackIndex =
                index === 0
                  ? fnGetLayerTrackIndex({ trackIndex })
                  : fnGetBoneTrackIndex({ trackIndex });
              const targetIndex = fnGetBinarySearch({
                collection: trackList,
                index: parentTrackIndex,
                key: 'trackIndex',
              });
              updatedTrackList.push({
                isIncluded: false,
                trackIndex: trackList[targetIndex].trackIndex,
                trackName: trackList[targetIndex].trackName,
              });
            });
          }
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: trackIndex,
            key: 'trackIndex',
          });
          updatedTrackList.push({
            isIncluded: isIncluded ? false : true,
            trackIndex: trackList[targetIndex].trackIndex,
            trackName: trackList[targetIndex].trackName,
          });
          break;
        }
      }
      if (layerKey === 'baseLayer') {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          _.forEach(updatedTrackList, (updated) => {
            const transformIndex = _.findIndex(
              draft.baseLayer,
              (currentVisualizedData) => currentVisualizedData.name === updated.trackName,
            );
            if (transformIndex !== -1) {
              draft.baseLayer[transformIndex].isIncluded = updated.isIncluded;
            }
          });
        });
        storeCurrentVisualizedData(nextState);
      } else {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          const targetLayer = _.find(draft.layers, (layer) => layer.key === layerKey);
          if (targetLayer) {
            _.forEach(updatedTrackList, (updated) => {
              const transformIndex = _.findIndex(
                targetLayer.tracks,
                (currentVisualizedData) => currentVisualizedData.name === updated.trackName,
              );
              if (transformIndex !== -1) {
                targetLayer.tracks[transformIndex].isIncluded = updated.isIncluded;
              }
            });
          }
        });
        storeCurrentVisualizedData(nextState);
      }
      const nextTrackList = produce(trackList, (draft) => {
        _.forEach(updatedTrackList, (track) => {
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: track.trackIndex,
            key: 'trackIndex',
          });
          draft[targetIndex].isIncluded = track.isIncluded;
        });
      });
      dispatch(
        dopeSheetActions.clickTrackCheckButton({
          trackList: nextTrackList,
        }),
      );
    }
  }, [dispatch, isIncluded, lastBoneOfLayers, layerKey, trackIndex, trackList]);

  // 레이어 이름 변경 함수 호출
  const [showsModal, setShowsModal] = useState(false);
  const updateLayerName = useCallback(() => {
    setShowsModal(true);
  }, []);

  // 레이어 삭제
  const deleteLayer = useCallback(async () => {
    const confirmed = await getConfirm({
      title: 'Are you sure you want to delete this layer?',
    });
    if (confirmed) {
      const state = storeCurrentVisualizedData();
      if (state) {
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = trackList[targetIndex];
        if (curTrack) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            draft.layers = _.filter(draft.layers, (layer) => layer.key !== curTrack.layerKey);
          });
          storeCurrentVisualizedData(nextState);
          const layerIndex = fnGetLayerTrackIndex({ trackIndex });
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: layerIndex,
            key: 'trackIndex',
          });
          const layerKey = trackList[targetIndex].layerKey;
          const prevState = {
            trackList,
            lastBoneOfLayers,
          };
          const nextTrackList = produce(prevState, (draft) => {
            const filteredTrackList = draft.trackList.filter(
              (track) => layerKey !== track.layerKey,
            );
            const filteredLastBoneOfLayers = draft.lastBoneOfLayers.filter(
              (lastBone) => layerKey !== lastBone.layerKey,
            );
            draft.trackList = filteredTrackList;
            draft.lastBoneOfLayers = filteredLastBoneOfLayers;
          });
          dispatch(dopeSheetActions.deleteLayer(nextTrackList));
        }
      }
    }
  }, [getConfirm, trackList, trackIndex, lastBoneOfLayers, dispatch]);

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
                  handleClickTrackBody(e);
                  multiKeyController.ctrl.pressed = false;
                } else {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  handleClickTrackBody(e);
                }
              }
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'lock':
              handleclickLockButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'include':
              handleClickRenderingButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            default:
              break;
          }
        },
      });
    },
    [
      handleclickLockButton,
      handleClickRenderingButton,
      handleClickTrackBody,
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
                  handleClickTrackBody(e);
                  multiKeyController.ctrl.pressed = false;
                } else {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  handleClickTrackBody(e);
                }
              }
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'lock':
              handleclickLockButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            case 'include':
              handleClickRenderingButton();
              storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
              break;
            default:
              break;
          }
        },
      });
    },
    [
      handleclickLockButton,
      handleClickRenderingButton,
      handleClickTrackBody,
      contextMenuInfo,
      isIncluded,
      isLocked,
      isSelected,
      multiKeyController.ctrl,
    ],
  );

  // 컨텍스트 메뉴 로직
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

  // 컨텍스트 메뉴 생성 custom hooks
  useContextMenu({ targetRef: channelRef, event: handleTrackContextMenu });

  const [newLayerName, setNewLayerName] = useState('');
  const handleModalClose = () => {
    setShowsModal(false);
  };

  const handleInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLayerName(event.target.value);
  };

  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const handleSubmit = useCallback(() => {
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
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = trackList[targetIndex];
        if (curTrack) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            const targetLayer = _.find(draft.layers, (layer) => layer.key === curTrack.layerKey);
            if (targetLayer) targetLayer.name = newLayerName;
          });
          storeCurrentVisualizedData(nextState);
          const nextTrackList = produce(trackList, (draft) => {
            draft[targetIndex].trackName = newLayerName;
            draft[targetIndex].renderedTrackName = newLayerName;
          });
          dispatch(dopeSheetActions.modifyLayerName({ trackList: nextTrackList }));
        }
      }
    }
  }, [newLayerName, currentVisualizedData?.layers, getConfirm, trackList, trackIndex, dispatch]);

  const classes = cx(
    'track-body',
    {
      'layer-selected': isSelected && trackIndex % 10 === LAYER,
      'bone-selected': isSelected && (trackIndex % 10 === BONE_A || trackIndex % 10 === BONE_B),
      'transform-selected':
        isSelected &&
        (trackIndex % 10 === POSITION_A ||
          trackIndex % 10 === ROTATION_A ||
          trackIndex % 10 === SCALE_A ||
          trackIndex % 10 === POSITION_B ||
          trackIndex % 10 === ROTATION_B ||
          trackIndex % 10 === SCALE_B),
    },
    {
      'summary-track': trackIndex % 10 === SUMMARY,
      'layer-track': trackIndex % 10 === LAYER,
      'bone-track': trackIndex % 10 === BONE_A || trackIndex % 10 === BONE_B,
    },
  );

  if (currentClickedChannel.trackIndex !== 0) {
    const remainder = trackIndex % 10;
    const isSummaryTrack = currentClickedChannel.trackIndex === TP_TRACK_INDEX.SUMMARY;
    const isClosed = !currentClickedChannel.isPointedDownArrow;
    switch (remainder) {
      case TP_TRACK_INDEX.SUMMARY:
      case TP_TRACK_INDEX.LAYER: {
        break;
      }
      case TP_TRACK_INDEX.BONE_A:
      case TP_TRACK_INDEX.BONE_B: {
        if (isSummaryTrack && isClosed) {
          return null;
        }
        break;
      }
      default: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        const isLayerTrack = layerIndex === currentClickedChannel.trackIndex;
        if (isClosed && (isSummaryTrack || isLayerTrack)) {
          return null;
        }
        break;
      }
    }
  }

  return (
    <li className={classes} onClick={handleClickTrackBody} aria-hidden="true" ref={channelRef}>
      {!isTransformTrack && (
        <IconWrapper
          className={cx('track-icon', 'arrow', { 'point-down': isPointedDownArrow })}
          icon={SvgPath.CaretDown}
          hasFrame={false}
          onClick={handleClickArrowButton}
        />
      )}
      <p className={cx({ locked: isLocked })}>{trackName}</p>
      <div className={cx('right-icons', { locked: isLocked })}>
        {trackIndex !== SUMMARY && (
          <>
            <IconWrapper
              className={cx('track-icon', 'lock')}
              icon={isLocked ? SvgPath.LockClose : SvgPath.LockOpen}
              hasFrame={false}
              onClick={handleclickLockButton}
            />
            <div className={cx('check-wrapper')}>
              <IconWrapper
                className={cx('track-icon', 'check', { checked: isIncluded })}
                icon={SvgPath.Check}
                hasFrame={false}
                onClick={handleClickRenderingButton}
              />
            </div>
          </>
        )}
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
            autoFocus={true}
            fullSize
          />
        </FormModal>
      )}
    </li>
  );
};

export default memo(Track);
