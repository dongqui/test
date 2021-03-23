import React, { useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import { TPLastBoneTrackIndexList } from 'lib/store';
import { TPUpdateDopeSheetList } from 'lib/store';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import styles from './index.module.scss';

interface TrackProps {
  childrenTrackList: TPTrackName[];
  // children?: React.ReactNode;
  defaultChildrenTrackOpened: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  // isLeafTrack?: boolean; // 말단 트랙 확인(말단 트랙인 경우 true)
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft?: number; // 트랙 좌측 패딩 값
  trackIndex: number;
}

const cx = classNames.bind(styles);

const TP_TRACK_INDEX = {
  SUMMARY: 1,
  LAYER: 2,
  BONE_A: 3,
  BONE_B: 7,
};

const Track: React.FC<TrackProps> = ({
  childrenTrackList,
  // children,
  defaultChildrenTrackOpened = false,
  // isLeafTrack = false,
  title,
  paddingLeft = 10,
  trackIndex,
}) => {
  const [toggleArrowButton, setToggleArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneTrackIndexList = useReactiveVar(TPLastBoneTrackIndexList);

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
            isClickedParentTrackArrowBtn: !prev,
            // isShowed: !prev,
          });
          return !prev;
        }
        // Layer 트랙 화살표 클릭
        case TP_TRACK_INDEX.LAYER: {
          let index = 3;
          while (index <= lastBoneTrackIndexList[0].lastBoneTrackIndex) {
            updatedTrackList.push({
              trackIndex: index,
              isClickedParentTrackArrowBtn: !prev,
              // isShowed: !prev,
            });
            index += index % 10 === 3 ? 4 : 6;
          }
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
              isClickedParentTrackArrowBtn: !prev,
              // isShowed: !prev,
            });
          }
          return !prev;
        }
        default: {
          return !prev;
        }
      }
    });
    TPUpdateDopeSheetList(updatedTrackList);
  }, [lastBoneTrackIndexList, trackIndex]);

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 자식 트랙 open 여부 변경
  useEffect(() => {
    setToggleArrowButton(defaultChildrenTrackOpened);
  }, [defaultChildrenTrackOpened]);

  return (
    <>
      <div className={cx('track-wrapper')} onContextMenu={clickRightMouse}>
        <div className={cx('track-body')} style={{ paddingLeft: `${paddingLeft}px` }}>
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
        </div>
        <div
          className={cx('children-track-list')}
          style={{ display: toggleArrowButton ? 'block' : 'none' }}
        >
          {childrenTrackList?.map((child) => {
            const { childrenTrackList, defaultChildrenTrackOpened, name, trackIndex } = child;
            return (
              <Track
                key={name}
                childrenTrackList={childrenTrackList}
                defaultChildrenTrackOpened={defaultChildrenTrackOpened}
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

export default Track;
