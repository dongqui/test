import React, { useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { useSelector } from 'reducers';
import * as timelineActions from 'actions/timeline';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import { IconWrapper, SvgPath } from 'components/Icon';
import { SearchInput } from 'components/Input';
import { AlertModalProvider } from 'components/Modal/AlertModal';
import fnGetSmallestNewNumber from 'utils/common/fnGetSmallestNewNumber';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import { TP_TRACK_INDEX } from 'utils/const';
import {
  fnGetBinarySearch,
  fnGetBoneTrackIndex,
  fnGetLayerTrackIndex,
  fnSetNewLayerTrack,
} from 'utils/TP/trackUtils';
import { UpdatedTrack } from 'types/TP';
import TrackItem from './TrackItem';
import styles from './index.module.scss';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const INPUT_DEBOUNCE_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const dispatch = useDispatch();
  const prevInputText = useRef('');
  const trackList = useSelector((state) => state.timeline.trackList);
  const lastBoneOfLayers = useSelector((state) => state.timeline.lastBoneOfLayers);
  const { skeletonHelper } = useSelector((state) => state.renderingData);
  const currentVisualizedData = useSelector<currentVisualizedDataActions.CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );

  // debouned가 적용 된 track input 갱신
  const debouncedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        const loweredInput = _.toLower(_.trim(inputText));
        const isEqualPrevInputText = _.isEqual(prevInputText.current, loweredInput);
        const isClearedInputText = _.isEmpty(loweredInput) && !_.isEmpty(prevInputText.current);
        if (_.isEmpty(trackList) || isEqualPrevInputText) return;
        if (isClearedInputText) {
          const nextTrackList = produce(trackList, (draft) => {
            _.forEach(draft, (track) => {
              track.isFiltered = true;
              track.isShowed = false;
              track.isPointedDownArrow = false;
            });
            draft[0].isShowed = true; // Summary 트랙
            draft[0].isPointedDownArrow = true; // Summary 트랙
            _.forEach(lastBoneOfLayers, (layer) => {
              const layerIndex = fnGetBinarySearch({
                collection: trackList,
                index: layer.layerIndex,
                key: 'trackIndex',
              });
              draft[layerIndex].isShowed = true;
            });
          });
          dispatch(timelineActions.searchTrackList({ trackList: nextTrackList }));
          return; // 입력 된 검색어를 지울 경우, 트랙 리스트를 초기 상태로 전환. return으로 이후에 있는 로직은 종료
        }
        const updatedtrackList: Partial<
          UpdatedTrack<'isFiltered' | 'isShowed' | 'isPointedDownArrow'>
        >[] = [];
        const alreadyVisitedList = Array(trackList.length).fill(false) as boolean[];
        const checkAlreadyVisited = (comparedIndex: number, myIndex: number) => {
          const isParentTrack = comparedIndex < myIndex;
          const isMyTrack = comparedIndex === myIndex;
          const targetIndex = fnGetBinarySearch({
            collection: trackList,
            index: comparedIndex,
            key: 'trackIndex',
          });
          if (!alreadyVisitedList[targetIndex]) {
            alreadyVisitedList[targetIndex] = true;
            updatedtrackList.push({
              trackIndex: comparedIndex,
              isFiltered: true,
              isPointedDownArrow: isParentTrack ? true : undefined, // 자신의 조상 트랙은 화살표를 아래로 향함
              isShowed: isParentTrack || isMyTrack ? true : undefined, // 조상 or 본인 트랙인 경우 화면에 보이도록 함
            });
          }
        };
        for (let reverseIndex = trackList.length - 1; 0 <= reverseIndex; reverseIndex -= 1) {
          const targetTrackName = _.toLower(trackList[reverseIndex].renderedTrackName);
          const targetIndex = trackList[reverseIndex].trackIndex;
          const remainder = targetIndex % 10;
          if (_.includes(targetTrackName, loweredInput)) {
            switch (remainder) {
              case TP_TRACK_INDEX.SUMMARY: {
                checkAlreadyVisited(targetIndex, targetIndex);
                _.forEach(lastBoneOfLayers, (layer) => {
                  const lastTransformIndex = layer.lastBoneIndex + 3;
                  let currentTrackIndex = layer.layerIndex;
                  while (currentTrackIndex <= lastTransformIndex) {
                    checkAlreadyVisited(currentTrackIndex, targetIndex);
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
                checkAlreadyVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                checkAlreadyVisited(targetIndex, targetIndex);
                while (currentTrackIndex <= lastTransformIndex) {
                  checkAlreadyVisited(currentTrackIndex, targetIndex);
                  if (currentTrackIndex % 10 === 0) currentTrackIndex += 2;
                  currentTrackIndex += 1;
                }
                break;
              }
              case TP_TRACK_INDEX.BONE_A:
              case TP_TRACK_INDEX.BONE_B: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex: targetIndex });
                checkAlreadyVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                checkAlreadyVisited(layerIndex, targetIndex);
                checkAlreadyVisited(targetIndex, targetIndex);
                for (
                  let transformIndex = targetIndex + 1;
                  transformIndex <= targetIndex + 3;
                  transformIndex += 1
                ) {
                  checkAlreadyVisited(transformIndex, targetIndex);
                }
                break;
              }
              default: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex: targetIndex });
                const boneIndex = fnGetBoneTrackIndex({ trackIndex: targetIndex });
                checkAlreadyVisited(TP_TRACK_INDEX.SUMMARY, targetIndex);
                checkAlreadyVisited(layerIndex, targetIndex);
                checkAlreadyVisited(boneIndex, targetIndex);
                checkAlreadyVisited(targetIndex, targetIndex);
                break;
              }
            }
          }
        }
        const nextTrackList = produce(trackList, (draft) => {
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
            if (_.isBoolean(track.isFiltered)) {
              draft[targetIndex].isFiltered = track.isFiltered;
            }
            if (_.isBoolean(track.isPointedDownArrow)) {
              draft[targetIndex].isPointedDownArrow = track.isPointedDownArrow;
            }
            if (_.isBoolean(track.isShowed)) {
              draft[targetIndex].isShowed = track.isShowed;
            }
          });
        });
        dispatch(timelineActions.searchTrackList({ trackList: nextTrackList }));
        prevInputText.current = loweredInput;
      }, INPUT_DEBOUNCE_TIME),
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
      const newLayerIndex = lastBoneOfLayers[lastBoneOfLayers.length - 1].layerIndex + 10000;
      const visualizedDataKey = trackList[0].visualizedDataKey;
      const [newTPLayer, lastBone] = fnSetNewLayerTrack({
        layer: newLayer.tracks,
        layerIndex: newLayerIndex,
        layerKey: newLayer.key,
        layerName: newLayer.name,
        visualizedDataKey: visualizedDataKey,
      });
      const prevState = {
        trackList,
        lastBoneOfLayers,
      };
      const nextState = produce(prevState, (draft) => {
        _.forEach(newTPLayer, (track) => {
          draft.trackList.push(track);
        });
        draft.lastBoneOfLayers.push(lastBone);
      });
      dispatch(currentVisualizedDataActions.addNewLayer({ newLayer }));
      dispatch(timelineActions.addNewLayer(nextState));
    }
  }, [skeletonHelper, currentVisualizedData, dispatch, lastBoneOfLayers, trackList]);

  // 트랙 리스트 우클릭 시 컨텍스트 메뉴 출력 방지
  const handleTrackListContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const isEmptyTrackList = _.isEmpty(trackList);

  return (
    <AlertModalProvider>
      <div className={cx('wrapper')} onContextMenu={handleTrackListContextMenu} ref={trackListRef}>
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
            onClick={clickLayerButton}
          />
        </div>
        <ul className={cx('list')}>
          {!isEmptyTrackList &&
            _.map(trackList, (track) => {
              const {
                isFiltered,
                isIncluded,
                isLocked,
                isPointedDownArrow,
                isSelected,
                isShowed,
                isTransformTrack,
                layerKey,
                renderedTrackName,
                trackIndex,
              } = track;
              const key = `${trackIndex}_${renderedTrackName}`;
              return (
                isFiltered &&
                isShowed && (
                  <TrackItem
                    key={key}
                    isIncluded={isIncluded}
                    isLocked={isLocked}
                    isPointedDownArrow={isPointedDownArrow}
                    isSelected={isSelected}
                    isTransformTrack={isTransformTrack}
                    layerKey={layerKey}
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

export default TrackList;
