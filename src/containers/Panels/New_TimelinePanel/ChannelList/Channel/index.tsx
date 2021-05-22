import React, { FunctionComponent, memo, useCallback, useEffect, useMemo } from 'react';
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
  isLocked: boolean;
  isPointedDownArrow: boolean;
  isSelected: boolean;
  isTransformTrack: boolean;
  trackIndex: number;
  trackName: string;
}

const Track: FunctionComponent<Props> = ({
  isLocked,
  isPointedDownArrow,
  isSelected,
  isTransformTrack,
  trackIndex,
  trackName,
}) => {
  const { getConfirm } = useAlertModal();
  const dispatch = useDispatch();
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const lastBoneOfLayers = useSelector((state) => state.dopeSheet.lastBoneOfLayers);
  const selectedChannels = useSelector((state) => state.dopeSheet.selectedChannels);
  const currentClickedChannel = useSelector((state) => state.dopeSheet.currentClickedChannel);
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
    dispatch(
      dopeSheetActions.clickTrackArrowButton({
        trackList: nextState,
        currentClickedChannel: {
          trackIndex,
          isPointedDownArrow: !isPointedDownArrow,
        },
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
            if (!_.isUndefined(isSelected)) {
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
  const handleClickLockButton = useCallback(() => {
    const remainder = trackIndex % 10;
    const updatedTrackList: Required<UpdatedTrack<'isLocked'>>[] = [];
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
    <li
      className={classes}
      onClick={handleClickTrackBody}
      aria-hidden="true"
      //  ref={trackRef}
    >
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
              onClick={handleClickLockButton}
            />
          </>
        )}
      </div>
    </li>
  );
};

export default memo(Track);
