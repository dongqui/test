import React, { memo, useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import { TPUpdateDopeSheetList, TPLastBoneTrackIndexList } from 'lib/store';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import styles from './index.module.scss';

interface TrackProps {
  childrenTrackList: TPTrackName[];
  isOpenedChildrenTrack: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft?: number; // 트랙 좌측 패딩 값
  trackIndex: number;
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  childrenTrackList,
  isOpenedChildrenTrack = false,
  title,
  paddingLeft = 10,
  trackIndex,
}) => {
  const [toggleArrowButton, setToggleArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneTrackIndexList = useReactiveVar(TPLastBoneTrackIndexList);

  // 트랙 클릭
  const clickTrackBody = useCallback(() => {}, []);

  // 화살표 버튼 클릭
  const clickToggleArrowButton = useCallback(() => {
    const remainder = trackIndex % 10;
    const updatedTrackList: Partial<TPDopeSheet>[] = [];
    setToggleArrowButton((prev) => {
      switch (remainder) {
        // Summary 트랙 화살표 클릭
        case TP_TRACK_INDEX.SUMMARY: {
          updatedTrackList.push({
            trackIndex: trackIndex + 1,
            isClickedParentTrack: !prev,
          });
          TPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isClickedParentTrack' });
          return !prev;
        }
        // Layer 트랙 화살표 클릭
        case TP_TRACK_INDEX.LAYER: {
          let boneTrackIndex = 3;
          const clickedLayerIndex = _.findIndex(
            lastBoneTrackIndexList,
            (lastBoneTrackIndex) => lastBoneTrackIndex.layerIdnex === trackIndex,
          );
          while (boneTrackIndex <= lastBoneTrackIndexList[0].lastBoneTrackIndex) {
            updatedTrackList.push({
              trackIndex: boneTrackIndex,
              isClickedParentTrack: !prev,
            });
            if (boneTrackIndex % 10 === TP_TRACK_INDEX.BONE_A) {
              boneTrackIndex += 4; // 3 -> 7
            } else if (boneTrackIndex % 10 === TP_TRACK_INDEX.BONE_B) {
              boneTrackIndex += 6; // 7 -> 3
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
  }, [lastBoneTrackIndexList, trackIndex]);

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 자식 트랙 open 여부 변경
  useEffect(() => {
    setToggleArrowButton(isOpenedChildrenTrack);
  }, [isOpenedChildrenTrack]);

  return (
    <>
      <div className={cx('track-wrapper')} onContextMenu={clickRightMouse}>
        <button
          className={cx('track-body')}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={clickTrackBody}
        >
          {childrenTrackList.length && (
            <button
              className={cx('track-button', 'arrow-button', { opened: toggleArrowButton })}
              onClick={clickToggleArrowButton}
            >
              <ArrowRight width="0.75rem" height="0.75rem" viewBox={'0 0 4 8'} />
            </button>
          )}
          <span>{title}</span>
          <div className={cx('track-button-wrapper')}>
            {/* To Do...
              아이콘 3종 적용
             */}
          </div>
        </button>
        <div
          className={cx('children-track-list')}
          style={{ display: toggleArrowButton ? 'block' : 'none' }}
        >
          {childrenTrackList?.map((child) => {
            const { childrenTrackList, isOpenedChildrenTrack, name, trackIndex } = child;
            return (
              <Track
                key={name}
                childrenTrackList={childrenTrackList}
                isOpenedChildrenTrack={isOpenedChildrenTrack}
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
