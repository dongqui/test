import React, { memo, useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import {
  TPClickedTrackList,
  TPDopeSheetList,
  TPLastBoneList,
  TPUpdateDopeSheetList,
} from 'lib/store';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch, fnClickTrackToCtrlKey, fnClickTrackToMouse } from 'utils/TP/trackUtils';
import styles from './index.module.scss';

interface TrackProps {
  childrenTrackList: TPTrackName[];
  isOpenedParent: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft?: number; // 트랙 좌측 패딩 값
  trackIndex: number;
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  childrenTrackList,
  isOpenedParent = false,
  title,
  paddingLeft = 10,
  trackIndex,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isClickedArrowButton, setIsClickedArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneList = useReactiveVar(TPLastBoneList);
  const dopeSheetList = useReactiveVar(TPDopeSheetList);
  const clickedTrackList = useReactiveVar(TPClickedTrackList);

  // 트랙 클릭
  const clickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const clickedTrack = event.target as Element;
      if (clickedTrack.nodeName === 'DIV' || clickedTrack.nodeName === 'SPAN') {
        if (title !== 'Summary') {
          if (event.ctrlKey) {
            const clickTrackToCtrlKey = fnClickTrackToCtrlKey({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            if (clickTrackToCtrlKey) {
              const [updatedTrackList, newClickedTrackList] = clickTrackToCtrlKey;
              TPClickedTrackList(newClickedTrackList);
              TPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
            } else {
              alert('다른 레이어를 클릭');
            }
          } else {
            const [updatedTrackList, newClickedTrackList] = fnClickTrackToMouse({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            TPClickedTrackList(newClickedTrackList);
            TPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
          }
        }
      }
    },
    [clickedTrackList, lastBoneList, title, trackIndex],
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
            isClickedParentTrack: !prev,
          }));
          TPUpdateDopeSheetList({ updatedList, status: 'isClickedParentTrack' });
          return !prev;
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
              isClickedParentTrack: !prev,
            });
            if (curBoneIndex % 10 === TP_TRACK_INDEX.BONE_A) {
              curBoneIndex += 4; // 3 -> 7
            } else if (curBoneIndex % 10 === TP_TRACK_INDEX.BONE_B) {
              curBoneIndex += 6; // 7 -> 3
            }
          }
          TPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isClickedParentTrack' });
          return !prev;
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
              isClickedParentTrack: !prev,
            });
          }
          TPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isClickedParentTrack' });
          return !prev;
        }
        default: {
          return !prev;
        }
      }
    });
  }, [lastBoneList, trackIndex]);

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 트랙 선택 효과 변경
  useEffect(() => {
    const targetIndex = fnGetBinarySearch({
      collection: dopeSheetList,
      index: trackIndex,
      key: 'trackIndex',
    });
    const targetTrack = dopeSheetList[targetIndex];
    setIsSelected(targetTrack.isSelected);
  }, [dopeSheetList, trackIndex]);

  // 자식 트랙 opened 변경
  useEffect(() => {
    setIsClickedArrowButton(isOpenedParent);
  }, [isOpenedParent]);

  return (
    <>
      <div className={cx('track-wrapper')} onContextMenu={clickRightMouse}>
        <div
          className={cx('track-body', { selected: isSelected })}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={clickTrackBody}
          aria-hidden="true"
        >
          {childrenTrackList.length ? (
            <button
              className={cx('track-button', 'arrow-button', { opened: isClickedArrowButton })}
              onClick={clickArrowButton}
            >
              <ArrowRight width="0.75rem" height="0.75rem" viewBox={'0 0 4 8'} />
            </button>
          ) : (
            ''
          )}
          <span>{title}</span>
          <div className={cx('track-icon-wrapper')}>
            {/* To Do...
              아이콘 적용
             */}
          </div>
        </div>
        <div
          className={cx('children-track-list')}
          style={{ display: isClickedArrowButton ? 'block' : 'none' }}
        >
          {childrenTrackList?.map((childTrack) => {
            const { childrenTrackList, isOpenedChildrenTrack, name, trackIndex } = childTrack;
            return (
              <Track
                key={name}
                childrenTrackList={childrenTrackList}
                isOpenedParent={isOpenedChildrenTrack}
                paddingLeft={paddingLeft + 10}
                title={name}
                trackIndex={trackIndex}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default memo(Track);
