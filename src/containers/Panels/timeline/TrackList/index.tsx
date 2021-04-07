import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { storeTPTrackNameList, storeTPDopeSheetList, storeTPUpdateDopeSheetList, storeTPLastBoneList } from 'lib/store';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { SearchInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import Track from '../Track';
import styles from './index.module.scss';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const storeTrackNameList = useReactiveVar(storeTPTrackNameList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const [trackList, setTrackList] = useState<TPTrackName[]>([]);
  const prevTrackInput = useRef('');

  // debouned가 적용 된 track input 갱신
  const changeDebounedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        // 트랙 리스트가 없는 상태에서 검색하는 경우(아무 동작을 시키지 않음)
        if (!storeTrackNameList.length) return;
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
          setTrackList(storeTrackNameList);
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
          trackList: storeTrackNameList,
        });
        prevTrackInput.current = trimInput;
        storeTPUpdateDopeSheetList({ updatedList: filteredDopeSheetList, status: 'isFiltered' });
        setTrackList(filterResult);
      }, DEBOUNCED_TIME),
    [storeTrackNameList, dopeSheetList],
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
    if (!storeTrackNameList.length) return;
    const { layerIndex } = lastBoneList[lastBoneList.length - 1];
    const jump = 10000 * lastBoneList.length;
    let curBoneIndex = 0;

    // 트랙 네임 리스트 갱신
    const updatedTrackNameList = produce(storeTrackNameList, (draft) => {
      const summaryTrackChildren = draft[0].childrenTrackList;
      const baseLayerChildren = summaryTrackChildren[0].childrenTrackList;
      const createdLayer = _.map(baseLayerChildren, (boneTrack) => {
        return {
          ...boneTrack,
          trackIndex: boneTrack.trackIndex + jump,
          childrenTrackList: _.map(boneTrack.childrenTrackList, (transformTrack, index) => {
            const transformIndex = transformTrack.trackIndex + jump;
            if (index === 2 && curBoneIndex < transformIndex) {
              curBoneIndex = transformIndex;
            }
            return { ...transformTrack, trackIndex: transformIndex };
          }),
        };
      });

      // 레이어 추가
      summaryTrackChildren.push({
        name: 'Layer1', // 이름 명명 적용 예정
        isOpenedChildrenTrack: false,
        childrenTrackList: createdLayer,
        trackIndex: layerIndex + 10000,
      });
    });

    // Dope Sheet 리스트 갱신
    const lastBaseBoneIndex = _.findIndex(
      dopeSheetList,
      (dopeSheet) => dopeSheet.trackIndex === lastBoneList[0].lastBoneIndex,
    );
    const updatedDopeSheetList: TPDopeSheet[] = [];
    for (let index = 1; index <= lastBaseBoneIndex + 3; index += 1) {
      updatedDopeSheetList.push({
        trackIndex: dopeSheetList[index].trackIndex + jump,
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isClickedParentTrack: index === 1 ? dopeSheetList[1].isClickedParentTrack : false,
        isFiltered: true, // 상황에 맞춰서 구현해야 됨
        times: [],
      });
    }

    // 추가 된 레이어의 마지막 bone index 저장
    const lastBone = {
      layerIndex: layerIndex + 10000,
      lastBoneIndex: curBoneIndex - 3,
    };

    storeTPTrackNameList(updatedTrackNameList);
    storeTPLastBoneList([...lastBoneList, lastBone]);
    storeTPDopeSheetList([...dopeSheetList, ...updatedDopeSheetList]);
  }, [dopeSheetList, lastBoneList, storeTrackNameList]);

  // 최초 Track List 적용
  useEffect(() => {
    if (!storeTrackNameList.length) return;
    setTrackList(storeTrackNameList);
  }, [storeTrackNameList]);

  const isEmptyTrack = _.isEmpty(trackList);

  return (
    <>
      <div className={cx('wrapper')} ref={trackListRef}>
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
            {_.map(trackList, (track, i) => {
              const { childrenTrackList, isOpenedChildrenTrack, name, trackIndex } = track;
              const key = `${name}_${i}`;
              return (
                <Track
                  key={key}
                  childrenTrackList={childrenTrackList}
                  isOpenedParent={isOpenedChildrenTrack}
                  paddingLeft={10}
                  title={name}
                  trackIndex={trackIndex}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default TrackList;
