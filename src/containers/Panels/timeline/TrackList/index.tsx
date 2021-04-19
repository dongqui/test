import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { CurrentVisualizedDataType } from 'types';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPUpdateDopeSheetList,
  storeCurrentVisualizedData,
  storeSkeletonHelper,
} from 'lib/store';
import fnGetSmallestNewNumber from 'utils/common/fnGetSmallestNewNumber';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import { SearchInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import Track from '../Track';
import styles from './index.module.scss';
import { AlertModalProvider } from 'components/New_Modal/AlertModal';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const trackNameList = useReactiveVar(storeTPTrackNameList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
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
        const trimInput = _.toLower(_.trim(inputText));

        // 이전 검색 텍스트와 현재 검색 텍스트가 같은 경우(아무 동작을 시키지 않음)
        if (prevTrackInput.current === trimInput) return;

        // 이전 검색 텍스트가 있으면서, 현재 검색 텍스트가 비어있는 경우(디폴트 트랙 리스트로 갱신)
        if (prevTrackInput.current !== trimInput && !trimInput) {
          const resetDopeSheetList: Partial<TPDopeSheet>[] = _.map(
            dopeSheetList,
            ({ trackIndex }) => ({
              trackIndex,
              isFiltered: true,
            }),
          );
          resetDopeSheetList[0].isClickedParentTrack = true;
          storeTPUpdateDopeSheetList({ updatedList: resetDopeSheetList, status: 'isFiltered' });
          setFilteredTrackList(trackNameList);
          return;
        }

        // Dope Sheet에서 필터링 적용시킬 리스트
        const filteredDopeSheetList: Partial<TPDopeSheet>[] = _.map(
          dopeSheetList,
          ({ trackIndex }) => ({
            trackIndex,
            isFiltered: false,
          }),
        );

        // 필터링 인덱스 찾기
        const searchTargetIndex = ({ targetIndex }: { targetIndex: number }) => {
          const index = fnGetBinarySearch({
            collection: filteredDopeSheetList,
            index: targetIndex,
            key: 'trackIndex',
          });
          filteredDopeSheetList[index].isFiltered = true;
          filteredDopeSheetList[index].isClickedParentTrack = true;
        };

        // 재귀를 걸어서 텍스트에 만족하는 트랙 필터링
        const recursiveTrackSearch = ({ trackList }: { trackList: TPTrackName[] }) => {
          const renewChildrenTrackList: TPTrackName[] = []; // 재귀가 끝날 때 리턴시킬 트랙 리스트
          _.forEach(trackList, ({ name, childrenTrackList, trackIndex }) => {
            const lowerTrackName = _.toLower(name);
            // 트랙 이름에 inputText가 포함되면 현재 트랙 추가, 이후 하위 트랙 재귀
            if (_.includes(lowerTrackName, trimInput)) {
              searchTargetIndex({ targetIndex: trackIndex });
              renewChildrenTrackList.push({
                isOpenedChildrenTrack: true,
                name,
                trackIndex,
                childrenTrackList: recursiveTrackSearch({
                  trackList: childrenTrackList,
                }),
              });
            } else {
              // 하위 트랙 재귀
              const childrenRecursive = recursiveTrackSearch({
                trackList: childrenTrackList,
              });
              // 재귀 결과가 있는 경우
              if (childrenRecursive.length) {
                searchTargetIndex({ targetIndex: trackIndex });
                renewChildrenTrackList.push({
                  isOpenedChildrenTrack: true,
                  name,
                  trackIndex,
                  childrenTrackList: childrenRecursive,
                });
              }
            }
          });
          return renewChildrenTrackList;
        };

        // 필터링 리스트 갱신
        const filterResult = recursiveTrackSearch({
          trackList: trackNameList,
        });
        prevTrackInput.current = trimInput;
        storeTPUpdateDopeSheetList({ updatedList: filteredDopeSheetList, status: 'isFiltered' });
        setFilteredTrackList(filterResult);
      }, DEBOUNCED_TIME),
    [trackNameList, dopeSheetList],
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
        {!isEmptyTrack && (
          <div className={cx('list')}>
            {_.map(filteredTrackList, (track, i) => {
              const { childrenTrackList, isOpenedChildrenTrack, name, trackIndex } = track;
              const key = `${name}_${i}`;
              return (
                <Track
                  key={key}
                  childrenTrackList={childrenTrackList}
                  isOpenedParent={isOpenedChildrenTrack}
                  paddingLeft={18.5}
                  trackName={name}
                  trackIndex={trackIndex}
                />
              );
            })}
          </div>
        )}
      </div>
    </AlertModalProvider>
  );
};

export default TrackList;
