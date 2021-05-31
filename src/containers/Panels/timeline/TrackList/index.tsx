import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { CurrentVisualizedDataType } from 'types';
import { TPTrackName, TPTrackList } from 'types/TP';
import {
  storeTPTrackNameList,
  storeTPTrackListList,
  storeTPLastBoneList,
  storeTPUpdateDopeSheetList,
  storeCurrentVisualizedData,
  storeSkeletonHelper,
} from 'lib/store';
import { fnGetSmallestNewNumber } from 'utils/common';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import { SearchInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import Track from '../Track';
import styles from './index.module.scss';
import { AlertModalProvider } from 'components/Modal/AlertModal';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

interface RecurDopeSheet {
  trackList: TPTrackName[];
  isShowed: boolean;
}

type FilterTrackList = [TPTrackName[], boolean];

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const trackNameList = useReactiveVar(storeTPTrackNameList);
  const dopeSheetList = useReactiveVar(storeTPTrackListList);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  const [filteredTrackList, setFilteredTrackList] = useState<TPTrackName[]>([]);
  const prevTrackInput = useRef('');

  // debouned가 적용 된 track input 갱신
  const changeDebounedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        // 트랙 리스트가 없는 상태에서 검색하는 경우(아무 동작을 시키지 않음)
        if (!trackNameList.length) return;

        // 이전 검색 텍스트와 현재 검색 텍스트가 같은 경우(아무 동작을 시키지 않음)
        const trimedInput = _.toLower(_.trim(inputText));
        if (prevTrackInput.current === trimedInput) return;

        // 이전 검색 텍스트가 있으면서, 현재 검색 텍스트가 비어있는 경우(디폴트 상태로 갱신)
        if (prevTrackInput.current !== trimedInput && _.isEmpty(trimedInput)) {
          const resetDopeSheetList = produce<Partial<TPTrackList>[]>(dopeSheetList, (draft) => {
            const nextState = _.map(draft, ({ trackIndex }) => ({
              trackIndex,
              isShowed: false,
              isFiltered: true,
            }));
            _.forEach(lastBoneList, ({ layerIndex }) => {
              const targetIndex = fnGetBinarySearch({
                collection: nextState,
                index: layerIndex,
                key: 'trackIndex',
              });
              if (targetIndex !== -1) {
                nextState[targetIndex].isShowed = true;
              }
            });
            nextState[0].isShowed = true;
            return nextState;
          });
          prevTrackInput.current = '';
          storeTPUpdateDopeSheetList({ updatedList: resetDopeSheetList, status: 'isFiltered' });
          setFilteredTrackList(trackNameList);
          return;
        }

        const targetIndex = fnGetBinarySearch({
          collection: dopeSheetList,
          index: 1,
          key: 'trackIndex',
        });
        const { visualizedDataKey } = dopeSheetList[targetIndex];

        // 재귀로 트랙 리스트 필터링
        const filterTrackList = ({ trackList }: { trackList: TPTrackName[] }): FilterTrackList => {
          const filterResult: TPTrackName[] = []; // 재귀가 끝날 때 리턴시킬 트랙 리스트
          let openParentTrack = false;
          _.forEach(trackList, ({ name, childrenTrack, trackIndex }) => {
            const loweredTrackName = _.toLower(name);
            if (_.includes(loweredTrackName, trimedInput)) {
              const [__, isOpened] = filterTrackList({
                trackList: childrenTrack,
              });
              openParentTrack = true;
              filterResult.push({
                isOpenedChildrenTrack: isOpened,
                name,
                trackIndex,
                childrenTrack,
                visualizedDataKey,
              });
            } else {
              const [filteredChildren, isOpened] = filterTrackList({
                trackList: childrenTrack,
              });
              if (!_.isEmpty(filteredChildren)) {
                openParentTrack = true;
                filterResult.push({
                  isOpenedChildrenTrack: isOpened,
                  name,
                  trackIndex,
                  childrenTrack: filteredChildren,
                  visualizedDataKey,
                });
              }
            }
          });
          return [filterResult, openParentTrack];
        };

        // 필터링 된 트랙 리스트를 dope sheet에 반영
        const [filteredTrackList] = filterTrackList({ trackList: trackNameList });
        const filteredDopeSheetList = produce<Partial<TPTrackList>[]>(dopeSheetList, (draft) => {
          const nextState = _.map(draft, ({ trackIndex, isShowed }) => ({
            trackIndex,
            isShowed,
            isFiltered: false,
          }));
          const recursive = ({ trackList, isShowed }: RecurDopeSheet) => {
            _.forEach(trackList, ({ trackIndex, childrenTrack, isOpenedChildrenTrack }) => {
              const index = fnGetBinarySearch({
                collection: nextState,
                index: trackIndex,
                key: 'trackIndex',
              });
              if (index !== -1) {
                nextState[index].isFiltered = true;
                nextState[index].isShowed = isShowed;
              }
              recursive({ trackList: childrenTrack, isShowed: isOpenedChildrenTrack });
            });
          };
          recursive({
            trackList: filteredTrackList,
            isShowed: filteredTrackList[0]?.isOpenedChildrenTrack,
          });
          return nextState;
        });

        prevTrackInput.current = trimedInput;
        storeTPUpdateDopeSheetList({ updatedList: filteredDopeSheetList, status: 'isFiltered' });
        setFilteredTrackList(filteredTrackList);
      }, DEBOUNCED_TIME),
    [trackNameList, dopeSheetList, lastBoneList],
  );

  // 트랙 인풋 텍스트 변경
  const changeTrackInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeDebounedTrackInput(event.target.value);
    },
    [changeDebounedTrackInput],
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

  // 최초 Track List 적용
  useEffect(() => {
    setFilteredTrackList(trackNameList);
  }, [trackNameList]);
  const isEmptyTrack = _.isEmpty(filteredTrackList);

  const handleTrackListContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <AlertModalProvider>
      <div className={cx('wrapper')} ref={trackListRef} onContextMenu={handleTrackListContextMenu}>
        <div className={cx('search-wrapper')}>
          <SearchInput
            className={cx('search-joint')}
            placeholder="Search Joints"
            onChange={changeTrackInput}
          />
          <IconWrapper
            className={cx('layer')}
            icon={SvgPath.Layer}
            hasFrame={false}
            onClick={clickLayerButton}
          />
        </div>
        <div className={cx('list')}>
          {!isEmptyTrack &&
            _.map(filteredTrackList, (track, i) => {
              const {
                childrenTrack,
                isOpenedChildrenTrack,
                name,
                trackIndex,
                visualizedDataKey,
              } = track;
              const key = `${name}_${visualizedDataKey}`;
              return (
                <Track
                  key={key}
                  childrenTrack={childrenTrack}
                  isOpenedParent={isOpenedChildrenTrack}
                  trackName={name}
                  trackIndex={trackIndex}
                  visualizedDataKey={visualizedDataKey}
                />
              );
            })}
        </div>
      </div>
    </AlertModalProvider>
  );
};

export default TrackList;
