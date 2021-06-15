import React, {
  Fragment,
  FunctionComponent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useAlertModal } from 'components/Modal/AlertModal';
import {
  fnGetBinarySearch,
  fnGetBoneTrackIndex,
  fnGetLayerTrackIndex,
  fnUpdateSelectedTrackList,
} from 'utils/TP/trackUtils';
import { TP_TRACK_INDEX } from 'utils/const';
import { UpdatedTrack } from 'types/TP';
import * as timelineActions from 'actions/timeline';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import useContextMenu from 'hooks/common/useContextMenu';
import { FormModal } from 'components/Modal';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as contextmenuInfoActions from 'actions/contextmenuInfo';

const cx = classNames.bind(styles);

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

const TrackItem: FunctionComponent<Props> = (props) => {
  const {
    isIncluded,
    isLocked,
    isPointedDownArrow,
    isSelected,
    isTransformTrack,
    layerKey,
    trackIndex,
    trackName,
  } = props;
  const dispatch = useDispatch();
  const trackItemRef = useRef<HTMLLIElement>(null);
  const trackList = useSelector((state) => state.timeline.trackList);
  const lastBoneOfLayers = useSelector((state) => state.timeline.lastBoneOfLayers);
  const prevSelectedIndices = useSelector((state) => state.timeline.selectedTrackIndices);
  const currentClickedTrack = useSelector((state) => state.timeline.currentClickedTrack);
  const currentVisualizedData = useSelector<currentVisualizedDataActions.CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );
  const { getConfirm } = useAlertModal();

  // 멀티 키 컨트롤러
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
      case TP_TRACK_INDEX.SUMMARY: {
        const layerTrackList = _.map(lastBoneOfLayers, (lastBone) => ({
          trackIndex: lastBone.layerIndex,
          isShowed: !isPointedDownArrow,
        }));
        updatedTrackList.push(...layerTrackList);
        break;
      }
      case TP_TRACK_INDEX.LAYER: {
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
            currentBoneIndex += 10; // 3 -> 13 -> 23 -> 33(bone index는 끝자리가 3으로 끝남)
          }
        }
        break;
      }
      case TP_TRACK_INDEX.BONE: {
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
    const nextTrackList = produce(trackList, (draft) => {
      _.forEach(updatedTrackList, ({ isShowed, isPointedDownArrow, trackIndex }) => {
        if (trackIndex) {
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: trackIndex,
            key: 'trackIndex',
          });
          if (_.isBoolean(isPointedDownArrow)) {
            draft[targetIndex].isPointedDownArrow = isPointedDownArrow;
          } else if (_.isBoolean(isShowed)) {
            draft[targetIndex].isShowed = isShowed;
          }
        }
      });
    });
    const currentClickedTrack = { trackIndex, isPointedDownArrow: !isPointedDownArrow };
    dispatch(
      timelineActions.clickTrackArrowButton({
        trackList: nextTrackList,
        currentClickedTrack,
      }),
    );
  }, [dispatch, trackList, isPointedDownArrow, lastBoneOfLayers, trackIndex]);

  // 트랙 선택 state 변경
  const setSelectedTrackList = useCallback(
    (updatedTrackList: UpdatedTrack<'isSelected'>[], selectedTrackIndices: number[]) => {
      const state = {
        trackList,
        selectedTrackIndices,
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
        draft.selectedTrackIndices = selectedTrackIndices;
      });
      dispatch(timelineActions.clickTrackBody(nextState));
    },
    [dispatch, trackList],
  );

  // 트랙 클릭
  const handleClickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const { nodeName } = event.target as Element;
      const isNotClickableNode = nodeName !== 'LI' && nodeName !== 'P';
      const isMutipleSelected = event.ctrlKey || event.metaKey || multiKeyController.ctrl.pressed;
      if (isNotClickableNode || trackName === 'Summary') return;
      if (isMutipleSelected) {
        for (let index = 0; index < prevSelectedIndices.length; index += 1) {
          const targetTrackIndex = prevSelectedIndices[index];
          const targetLayerIndex = fnGetLayerTrackIndex({ trackIndex: targetTrackIndex });
          const myLayerIndex = fnGetLayerTrackIndex({ trackIndex });
          const isNotSameLayer = targetLayerIndex !== myLayerIndex;
          const isClickedMe = prevSelectedIndices[index] === trackIndex;
          if (isNotSameLayer) {
            const confirmed = getConfirm({
              title: 'Cannot select or edit multiple layers at the same time.',
            });
            if (confirmed) return false;
          } else if (isClickedMe) {
            const remainder = trackIndex % 10;
            const [deselectedTrackList, deselectedIndices] = fnUpdateSelectedTrackList({
              isSelected: false,
              lastBoneOfLayers,
              trackIndex,
            });
            if (remainder !== TP_TRACK_INDEX.LAYER) {
              const layerIndex = fnGetLayerTrackIndex({ trackIndex });
              const isTransformTrack =
                remainder === TP_TRACK_INDEX.POSITION ||
                remainder === TP_TRACK_INDEX.ROTATION ||
                remainder === TP_TRACK_INDEX.SCALE;
              deselectedIndices.push(layerIndex);
              deselectedTrackList.push({
                isSelected: false,
                trackIndex: layerIndex,
              });
              if (isTransformTrack) {
                const boneIndex = fnGetBoneTrackIndex({ trackIndex });
                deselectedIndices.push(boneIndex);
                deselectedTrackList.push({
                  isSelected: false,
                  trackIndex: boneIndex,
                });
              }
            }
            const sortedIndices = _.sortBy(deselectedIndices);
            const filteredIndices = _.filter(prevSelectedIndices, (index) => {
              const targetIndex = fnGetBinarySearch({
                collection: sortedIndices,
                index,
              });
              return targetIndex === -1;
            });
            setSelectedTrackList(deselectedTrackList, filteredIndices);
            return; // layer가 다른 트랙인 경우 이후 로직을 처리하지 않고 return
          }
        }
        // 위 반복문에서 return되지 않은 경우, 기존 트랙 리스트에다가 방금 클릭한 트랙에 선택 효과 적용
        const [selectedTrackList, selectedIndices] = fnUpdateSelectedTrackList({
          isSelected: true,
          lastBoneOfLayers,
          trackIndex,
        });
        const nextSelectedIndices = new Set<number>();
        _.forEach([...prevSelectedIndices, ...selectedIndices], (index) => {
          nextSelectedIndices.add(index);
        });
        setSelectedTrackList(selectedTrackList, [...nextSelectedIndices]);
      } else if (!isMutipleSelected) {
        const deselectedTrackList = _.map(prevSelectedIndices, (index) => ({
          trackIndex: index,
          isSelected: false,
        }));
        const [selectedTrackList, selectedIndices] = fnUpdateSelectedTrackList({
          isSelected: true,
          lastBoneOfLayers,
          trackIndex,
        });
        setSelectedTrackList([...deselectedTrackList, ...selectedTrackList], selectedIndices);
      }
    },
    [
      multiKeyController.ctrl.pressed,
      trackName,
      lastBoneOfLayers,
      trackIndex,
      prevSelectedIndices,
      setSelectedTrackList,
      getConfirm,
    ],
  );

  // 잠금 버튼 클릭
  const handleclickLockButton = useCallback(() => {
    const updatedTrackList: UpdatedTrack<'isLocked'>[] = [];
    const remainder = trackIndex % 10;
    switch (remainder) {
      case TP_TRACK_INDEX.LAYER: {
        const targetIndex = fnGetBinarySearch({
          collection: lastBoneOfLayers,
          index: trackIndex,
          key: 'layerIndex',
        });
        const lastBone = lastBoneOfLayers[targetIndex];
        const lastTransformIndex = lastBone.lastBoneIndex + 3;
        let currentTrackIndex = lastBone.layerIndex + 1;
        updatedTrackList.push({
          trackIndex,
          isLocked: !isLocked,
        });
        while (currentTrackIndex <= lastTransformIndex) {
          updatedTrackList.push({
            trackIndex: currentTrackIndex,
            isLocked: !isLocked,
          });
          const nextTrackIndex = currentTrackIndex % 10 === TP_TRACK_INDEX.SCALE ? 7 : 1; // 6 -> 13, 16 -> 23
          currentTrackIndex += nextTrackIndex;
        }
        break;
      }
      case TP_TRACK_INDEX.BONE: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        if (isLocked === true) {
          updatedTrackList.push({
            trackIndex: layerIndex,
            isLocked: false,
          });
        }
        updatedTrackList.push({
          trackIndex: trackIndex,
          isLocked: !isLocked,
        });
        for (
          let transformIndex = trackIndex + 1;
          transformIndex <= trackIndex + 3;
          transformIndex += 1
        ) {
          updatedTrackList.push({
            trackIndex: transformIndex,
            isLocked: !isLocked,
          });
        }
        break;
      }
      default: {
        if (isLocked === false) {
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
    const nextTrackList = produce(trackList, (draft) => {
      _.forEach(updatedTrackList, ({ isLocked, trackIndex }) => {
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        draft[targetIndex].isLocked = isLocked;
      });
    });
    dispatch(timelineActions.clickTrackLockButton({ trackList: nextTrackList }));
  }, [dispatch, trackList, isLocked, lastBoneOfLayers, trackIndex]);

  // 랜더링 제외 버튼 클릭
  const handleClickRenderingButton = useCallback(() => {
    const updatedTrackList: UpdatedTrack<'isIncluded' | 'trackIndex' | 'trackName'>[] = [];
    const remainder = trackIndex % 10;
    switch (remainder) {
      case TP_TRACK_INDEX.LAYER: {
        const targetLayerIndex = fnGetBinarySearch({
          collection: lastBoneOfLayers,
          index: trackIndex,
          key: 'layerIndex',
        });
        const lastTransformIndex = lastBoneOfLayers[targetLayerIndex].lastBoneIndex + 3;
        const startIndex = fnGetBinarySearch({
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const endIndex = fnGetBinarySearch({
          collection: trackList,
          index: lastTransformIndex,
          key: 'trackIndex',
        });
        for (let index = startIndex; index <= endIndex; index += 1) {
          updatedTrackList.push({
            isIncluded: isIncluded ? false : true,
            trackIndex: trackList[index].trackIndex,
            trackName: trackList[index].trackName,
          });
        }
        break;
      }
      case TP_TRACK_INDEX.BONE: {
        if (isIncluded === true) {
          const layerIndex = fnGetLayerTrackIndex({ trackIndex });
          const targetLayerIndex = fnGetBinarySearch({
            collection: trackList,
            index: layerIndex,
            key: 'trackIndex',
          });
          updatedTrackList.push({
            isIncluded: false,
            trackIndex: trackList[targetLayerIndex].trackIndex,
            trackName: trackList[targetLayerIndex].trackName,
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
        if (isIncluded === true) {
          const layerTrack = 0;
          const boneTrack = 1;
          _.forEach([layerTrack, boneTrack], (index) => {
            const parentTrackIndex =
              index === layerTrack
                ? fnGetLayerTrackIndex({ trackIndex })
                : fnGetBoneTrackIndex({ trackIndex });
            const targetParentIndex = fnGetBinarySearch({
              collection: trackList,
              index: parentTrackIndex,
              key: 'trackIndex',
            });
            updatedTrackList.push({
              isIncluded: false,
              trackIndex: trackList[targetParentIndex].trackIndex,
              trackName: trackList[targetParentIndex].trackName,
            });
          });
        }
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: trackIndex,
          key: 'trackIndex',
        });
        updatedTrackList.push({
          isIncluded: !isIncluded,
          trackIndex: trackList[targetIndex].trackIndex,
          trackName: trackList[targetIndex].trackName,
        });
        break;
      }
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
      timelineActions.clickTrackCheckButton({
        trackList: nextTrackList,
      }),
    );
    dispatch(
      currentVisualizedDataActions.excludeTrack({ layerKey, updatedState: updatedTrackList }),
    );
  }, [dispatch, isIncluded, lastBoneOfLayers, layerKey, trackIndex, trackList]);

  // 레이어 삭제
  const handleDeleteLayer = useCallback(async () => {
    const confirmed = await getConfirm({
      title: 'Are you sure you want to delete this layer?',
    });
    if (confirmed) {
      const layerIndex = fnGetLayerTrackIndex({ trackIndex });
      const targetIndex = fnGetBinarySearch({
        collection: trackList,
        index: layerIndex,
        key: 'trackIndex',
      });
      const layerKey = trackList[targetIndex].layerKey;
      const filteredTrackList = trackList.filter((track) => layerKey !== track.layerKey);
      const filteredTrackIndices = prevSelectedIndices.filter(
        (index) => _.floor(trackIndex / 10000) !== _.floor(index / 10000),
      );
      const filteredLastBoneOfLayers = lastBoneOfLayers.filter(
        (lastBone) => layerKey !== lastBone.layerKey,
      );
      dispatch(currentVisualizedDataActions.deleteLayer({ layerKey }));
      dispatch(
        timelineActions.deleteLayer({
          lastBoneOfLayers: filteredLastBoneOfLayers,
          trackList: filteredTrackList,
          selectedTrackIndices: filteredTrackIndices,
        }),
      );
    }
  }, [getConfirm, trackIndex, trackList, lastBoneOfLayers, prevSelectedIndices, dispatch]);

  const [isShowedFormModal, setIsShowedFormModal] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');

  // 레이어 이름 변경 input에 blur 적용
  const handleInputBlur = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLayerName(event.target.value);
  }, []);

  // 레이어 이름 변경 모달 닫기
  const handleModalClose = useCallback(() => {
    setIsShowedFormModal(false);
  }, []);

  // layer 트랙 컨텍스트 메뉴 출력
  const contextMenuInfo = useSelector((state) => state.contextmenuInfo);
  const handleLayerTrackContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      e?.preventDefault();
      dispatch(
        contextmenuInfoActions.setContextmenuInfo({
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
                setIsShowedFormModal(true);
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'delete':
                handleDeleteLayer();
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'select':
                if (e) {
                  if (isSelected) {
                    multiKeyController.ctrl.pressed = true;
                    handleClickTrackBody(e as any);
                    multiKeyController.ctrl.pressed = false;
                  } else {
                    handleClickTrackBody(e as any);
                  }
                }
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'lock':
                handleclickLockButton();
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'include':
                handleClickRenderingButton();
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              default:
                break;
            }
          },
        }),
      );
    },
    [
      dispatch,
      trackIndex,
      isSelected,
      isLocked,
      isIncluded,
      contextMenuInfo,
      handleDeleteLayer,
      handleclickLockButton,
      handleClickRenderingButton,
      multiKeyController.ctrl,
      handleClickTrackBody,
    ],
  );

  // base 트랙 컨텍스트 메뉴 출력
  const handleBoneTransformTrackContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      e?.preventDefault();
      dispatch(
        contextmenuInfoActions.setContextmenuInfo({
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
                    handleClickTrackBody(e as any);
                    multiKeyController.ctrl.pressed = false;
                  } else {
                    handleClickTrackBody(e as any);
                  }
                }
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'lock':
                handleclickLockButton();
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              case 'include':
                handleClickRenderingButton();
                dispatch(
                  contextmenuInfoActions.setContextmenuInfo({ ...contextMenuInfo, isShow: false }),
                );
                break;
              default:
                break;
            }
          },
        }),
      );
    },
    [
      dispatch,
      isSelected,
      isLocked,
      isIncluded,
      contextMenuInfo,
      handleclickLockButton,
      handleClickRenderingButton,
      multiKeyController.ctrl,
      handleClickTrackBody,
    ],
  );

  // 분기 별 컨텍스트 메뉴 출력
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
  useContextMenu({ targetRef: trackItemRef, event: handleTrackContextMenu });

  // 작성한 레이어 이름 전달
  const handleSubmitLayerName = useCallback(() => {
    setIsShowedFormModal(false);
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
      const targetIndex = fnGetBinarySearch({
        collection: trackList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const layerKey = trackList[targetIndex].layerKey;
      const nextTrackList = produce(trackList, (draft) => {
        draft[targetIndex].trackName = newLayerName;
        draft[targetIndex].renderedTrackName = newLayerName;
      });
      dispatch(timelineActions.setLayerName({ trackList: nextTrackList }));
      dispatch(currentVisualizedDataActions.setLayerName({ layerKey, newLayerName }));
    }
  }, [newLayerName, currentVisualizedData?.layers, getConfirm, trackList, trackIndex, dispatch]);

  const classes = cx(
    'track-body',
    {
      'layer-selected': isSelected && trackIndex % 10 === TP_TRACK_INDEX.LAYER,
      'bone-selected': isSelected && trackIndex % 10 === TP_TRACK_INDEX.BONE,
      'transform-selected':
        isSelected &&
        (trackIndex % 10 === TP_TRACK_INDEX.POSITION ||
          trackIndex % 10 === TP_TRACK_INDEX.ROTATION ||
          trackIndex % 10 === TP_TRACK_INDEX.SCALE),
    },
    {
      'summary-track': trackIndex % 10 === TP_TRACK_INDEX.SUMMARY,
      'layer-track': trackIndex % 10 === TP_TRACK_INDEX.LAYER,
      'bone-track': trackIndex % 10 === TP_TRACK_INDEX.BONE,
    },
  );

  if (currentClickedTrack.trackIndex !== 0) {
    const remainder = trackIndex % 10;
    const isSummaryTrack = currentClickedTrack.trackIndex === TP_TRACK_INDEX.SUMMARY;
    const isClosedTrack = !currentClickedTrack.isPointedDownArrow;
    switch (remainder) {
      case TP_TRACK_INDEX.SUMMARY:
      case TP_TRACK_INDEX.LAYER: {
        break;
      }
      case TP_TRACK_INDEX.BONE: {
        if (isClosedTrack && isSummaryTrack) return null;
        break;
      }
      default: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        const isLayerTrack = layerIndex === currentClickedTrack.trackIndex;
        if (isClosedTrack && (isSummaryTrack || isLayerTrack)) return null;
        break;
      }
    }
  }

  return (
    <li className={classes} onClick={handleClickTrackBody} aria-hidden="true" ref={trackItemRef}>
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
        {trackIndex !== TP_TRACK_INDEX.SUMMARY && (
          <Fragment>
            <IconWrapper
              className={cx('track-icon', 'lock')}
              icon={isLocked ? SvgPath.LockClose : SvgPath.LockOpen}
              hasFrame={false}
              onClick={handleclickLockButton}
            />
            <div className={cx('check-box-wrapper')}>
              <IconWrapper
                className={cx('track-icon', 'check', { checked: isIncluded })}
                icon={SvgPath.Check}
                hasFrame={false}
                onClick={handleClickRenderingButton}
              />
            </div>
          </Fragment>
        )}
      </div>
      {isShowedFormModal && (
        <FormModal
          isOpen={isShowedFormModal}
          onClose={handleModalClose}
          onOutsideClose={handleModalClose}
          onSubmit={handleSubmitLayerName} // 현재 modal submit 이 안 먹음
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

export default memo(TrackItem);
