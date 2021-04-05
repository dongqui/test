import React, { memo, useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import {
  TPCurrentClidkedTracks,
  TPDopeSheetList,
  TPLastBoneList,
  TPUpdateDopeSheetList,
} from 'lib/store';
import { TPTrackName, TPDopeSheet, TPLastBone } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import styles from './index.module.scss';

interface TrackProps {
  childrenTrackList: TPTrackName[];
  isOpenedParent: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  isSelectedParent?: boolean;
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft?: number; // 트랙 좌측 패딩 값
  trackIndex: number;
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  childrenTrackList,
  isOpenedParent = false,
  isSelectedParent = false,
  title,
  paddingLeft = 10,
  trackIndex,
}) => {
  // const [isSelected, setIsSelected] = useState(false);
  const [isSelected, setIsSelected] = useState(isSelectedParent);
  const [isClickedArrowButton, setIsClickedArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneList = useReactiveVar(TPLastBoneList);
  const dopeSheetList = useReactiveVar(TPDopeSheetList);
  const currentClidkedTracks = useReactiveVar(TPCurrentClidkedTracks);

  const fnSelectTrackToClick = ({
    trackIndex,
    lastBoneList,
    currentClidkedTracks,
  }: {
    trackIndex: number;
    lastBoneList: TPLastBone[];
    currentClidkedTracks: number[];
  }) => {
    // 이전에 선택 된 트랙이 없을 경우
    if (!currentClidkedTracks.length) {
      return 'No track selected';
    }
  };

  const fnSelectTrackToCtrlClick = () => {};

  // 트랙 클릭
  const clickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const clickedTarget = event.target as Element;
      if (clickedTarget.nodeName === 'DIV' || clickedTarget.nodeName === 'SPAN') {
        if (title === 'Summary') return; // Summary 트랙 클릭 시 아무 반응 없음
        const remainder = trackIndex % 10;
        const updatedTrackList: Partial<TPDopeSheet>[] = [];

        if (event.ctrlKey) {
          switch (remainder) {
            // Layer 트랙 클릭
            case TP_TRACK_INDEX.LAYER: {
              break;
            }
            // Bone 트랙 클릭
            case TP_TRACK_INDEX.BONE_A:
            case TP_TRACK_INDEX.BONE_B: {
              break;
            }
            // Transform 트랙 클릭
            default: {
              break;
            }
          }
        } else {
          switch (remainder) {
            // Layer 트랙 클릭
            case TP_TRACK_INDEX.LAYER: {
              break;
            }
            // Bone 트랙 클릭
            case TP_TRACK_INDEX.BONE_A:
            case TP_TRACK_INDEX.BONE_B: {
              break;
            }
            // Transform 트랙 클릭
            default: {
              break;
            }
          }
        }
        // if (currentClidkedTracks.length === 0) {
        //   const targetLayer = _.find(
        //     lastBoneList,
        //     (lastBone) => lastBone.layerIdnex === trackIndex,
        //   );
        //   let currentIndex = trackIndex;
        //   updatedTrackList.push({ trackIndex: currentIndex, isSelected: true });
        //   while (currentIndex <= (targetLayer?.lastBoneIndex as number) + 3) {
        //     currentIndex += 1;
        //   }
        //   console.log('updatedTrackList', updatedTrackList);
        // }
      }
    },
    [title, trackIndex],
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
            trackIndex: lastBone.layerIdnex,
            isClickedParentTrack: !prev,
          }));
          TPUpdateDopeSheetList({ updatedList, status: 'isClickedParentTrack' });
          return !prev;
        }
        // Layer 트랙 화살표 클릭
        case TP_TRACK_INDEX.LAYER: {
          const layerTrack = _.find(lastBoneList, (lastBone) => lastBone.layerIdnex === trackIndex);
          let curBoneIndex = (layerTrack?.layerIdnex as number) + 1;
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

  // 자식 트랙 open 여부 변경
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
          {childrenTrackList.length && (
            <button
              className={cx('track-button', 'arrow-button', { opened: isClickedArrowButton })}
              onClick={clickArrowButton}
            >
              <ArrowRight width="0.75rem" height="0.75rem" viewBox={'0 0 4 8'} />
            </button>
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
          {childrenTrackList?.map((child) => {
            const { childrenTrackList, isOpenedChildrenTrack, name, trackIndex } = child;
            return (
              <Track
                key={name}
                childrenTrackList={childrenTrackList}
                isOpenedParent={isOpenedChildrenTrack}
                isSelectedParent={isSelected}
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
