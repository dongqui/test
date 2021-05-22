import React, { useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { useSelector } from 'reducers';
import * as dopeSheetActions from 'actions/dopeSheet';
import { IconWrapper, SvgPath } from 'components/Icon';
import { SearchInput } from 'components/Input';
import { AlertModalProvider } from 'components/Modal/AlertModal';
import fnGetSmallestNewNumber from 'utils/common/fnGetSmallestNewNumber';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch, fnGetBoneTrackIndex, fnGetLayerTrackIndex } from 'utils/TP/New';
import { CurrentVisualizedDataType } from 'types';
import { UpdatedTrack } from 'types/TP';
import Channel from './Channel';
import styles from './index.module.scss';
import { storeCurrentVisualizedData, storeSkeletonHelper } from 'lib/store';

type Pick = 'isFiltered' | 'isShowed' | 'isPointedDownArrow';

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const ChannelList: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const lastBoneOfLayers = useSelector((state) => state.dopeSheet.lastBoneOfLayers);
  const prevInputText = useRef('');

  // To Do... apollo -> redux
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  // debouned가 적용 된 track input 갱신
  const debouncedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        const loweredInput = _.toLower(_.trim(inputText));
        const isEqualPrevInputText = prevInputText.current === loweredInput;
        const isClearedInputText = _.isEmpty(loweredInput) && !isEqualPrevInputText;
        const updatedtrackList: Partial<UpdatedTrack<Pick>>[] = [];
        const visited = Array(trackList.length).fill(true);

        if (_.isEmpty(trackList) || isEqualPrevInputText) return;
        if (isClearedInputText) {
          const nextState = produce(trackList, (draft) => {
            _.forEach(draft, (track) => {
              track.isFiltered = true;
              track.isShowed = false;
              track.isPointedDownArrow = false;
            });
            draft[0].isShowed = true;
            draft[0].isPointedDownArrow = true;
            _.forEach(lastBoneOfLayers, (layer) => {
              const layerIndex = fnGetBinarySearch({
                collection: trackList,
                index: layer.layerIndex,
                key: 'trackIndex',
              });
              draft[layerIndex].isShowed = true;
            });
          });
          dispatch(dopeSheetActions.searchTrackList({ trackList: nextState }));
          return;
        }

        const checkVisited = (target: number, self: number) => {
          const isAncestorTrack = target < self;
          const isChildTrack = self < target;
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: target,
            key: 'trackIndex',
          });
          if (visited[targetIndex]) {
            visited[targetIndex] = false;
            updatedtrackList.push({
              trackIndex: target,
              isFiltered: true,
              isPointedDownArrow: isAncestorTrack ? true : undefined,
              isShowed: isChildTrack ? undefined : true,
            });
          }
        };
        for (let reverseIndex = trackList.length - 1; 0 <= reverseIndex; reverseIndex -= 1) {
          const targetTrackName = _.toLower(trackList[reverseIndex].renderedTrackName);
          const targetIndex = trackList[reverseIndex].trackIndex;
          const remainder = targetIndex % 10;
          if (_.includes(targetTrackName, loweredInput)) {
            checkVisited(targetIndex, targetIndex);
            switch (remainder) {
              case TP_TRACK_INDEX.SUMMARY: {
                _.forEach(lastBoneOfLayers, (layer) => {
                  const lastTransformIndex = layer.lastBoneIndex + 3;
                  let currentTrackIndex = layer.layerIndex;
                  while (currentTrackIndex <= lastTransformIndex) {
                    checkVisited(currentTrackIndex, targetIndex);
                    if (currentTrackIndex % 10 === 0) currentTrackIndex += 2;
                    currentTrackIndex += 1;
                  }
                });
                break;
              }
              case TP_TRACK_INDEX.LAYER: {
                const layerIndex = fnGetBinarySearch({
                  collection: lastBoneOfLayers,
                  index: targetIndex,
                  key: 'layerIndex',
                });
                const lastTransformIndex = lastBoneOfLayers[layerIndex].lastBoneIndex + 3;
                let currentTrackIndex = targetIndex + 1;
                checkVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                while (currentTrackIndex <= lastTransformIndex) {
                  checkVisited(currentTrackIndex, targetIndex);
                  if (currentTrackIndex % 10 === 0) currentTrackIndex += 2;
                  currentTrackIndex += 1;
                }
                break;
              }
              case TP_TRACK_INDEX.BONE_A:
              case TP_TRACK_INDEX.BONE_B: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex: targetIndex });
                checkVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                checkVisited(layerIndex, targetIndex);
                for (
                  let transformIndex = targetIndex + 1;
                  transformIndex <= targetIndex + 3;
                  transformIndex += 1
                ) {
                  checkVisited(transformIndex, targetIndex);
                }
                break;
              }
              default: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex: targetIndex });
                const boneIndex = fnGetBoneTrackIndex({ trackIndex: targetIndex });
                checkVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                checkVisited(layerIndex, targetIndex);
                checkVisited(boneIndex, targetIndex);
                break;
              }
            }
          }
        }
        const nextState = produce(trackList, (draft) => {
          _.forEach(draft, (track) => {
            track.isFiltered = false;
            track.isShowed = false;
            track.isPointedDownArrow = false;
          });
          _.forEach(updatedtrackList, (track) => {
            const targetIndex = fnGetBinarySearch({
              collection: trackList,
              index: track.trackIndex || -1,
              key: 'trackIndex',
            });
            if (targetIndex === -1) return;
            if (!_.isUndefined(track.isFiltered)) {
              draft[targetIndex].isFiltered = track.isFiltered;
            }
            if (!_.isUndefined(track.isPointedDownArrow)) {
              draft[targetIndex].isPointedDownArrow = track.isPointedDownArrow;
            }
            if (!_.isUndefined(track.isShowed)) {
              draft[targetIndex].isShowed = track.isShowed;
            }
          });
        });
        dispatch(dopeSheetActions.searchTrackList({ trackList: nextState }));
        prevInputText.current = loweredInput;
      }, DEBOUNCED_TIME),
    [dispatch, lastBoneOfLayers, trackList],
  );

  // 트랙 인풋 텍스트 변경
  const handleChangeTrackInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedTrackInput(event.target.value);
    },
    [debouncedTrackInput],
  );

  // 레이어 버튼 클릭
  const clickLayerButton = useCallback(() => {
    if (skeletonHelper && currentVisualizedData) {
      const layerNameRegex = /^Layer[0-9]+/;
      const defaultTypeNames = currentVisualizedData.layers
        .map((layer) => layer.name.match(layerNameRegex))
        .filter((res) => !_.isNull(res));
      const defaultTypeOrders = defaultTypeNames.map((item) =>
        parseInt(item ? item[0].split('Layer')[1] : '1'),
      );
      const nextOrder = fnGetSmallestNewNumber([0, ...defaultTypeOrders]);
      const newLayer = fnGetNewLayer({ name: `Layer${nextOrder}`, bones: skeletonHelper.bones });
      const state = storeCurrentVisualizedData();
      if (state) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          draft?.layers.push(newLayer);
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [skeletonHelper, currentVisualizedData]);

  const isEmptyTrackList = _.isEmpty(trackList);

  const handleTrackListContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <AlertModalProvider>
      <div
        className={cx('wrapper')}
        // ref={channelListRef}
        // onContextMenu={handleTrackListContextMenu}
      >
        <div className={cx('search-wrapper')}>
          <SearchInput
            className={cx('search-joint')}
            placeholder="Search Joints"
            onChange={handleChangeTrackInput}
          />
          <IconWrapper
            className={cx('layer')}
            icon={SvgPath.Layer}
            hasFrame={false}
            // onClick={clickLayerButton}
          />
        </div>
        <ul className={cx('list')}>
          {!isEmptyTrackList &&
            _.map(trackList, (track) => {
              const {
                isFiltered,
                isLocked,
                isPointedDownArrow,
                isSelected,
                isShowed,
                isTransformTrack,
                renderedTrackName,
                trackIndex,
              } = track;
              const key = `${trackIndex}_${renderedTrackName}`;
              return (
                isFiltered &&
                isShowed && (
                  <Channel
                    key={key}
                    isLocked={isLocked}
                    isPointedDownArrow={isPointedDownArrow}
                    isSelected={isSelected}
                    isTransformTrack={isTransformTrack}
                    trackIndex={trackIndex}
                    trackName={renderedTrackName}
                  />
                )
              );
            })}
        </ul>
      </div>
    </AlertModalProvider>
  );
};

export default ChannelList;
