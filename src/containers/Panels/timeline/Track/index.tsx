import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { ContextMenu } from 'components/New_ContextMenu';
import {
  storeTPSelectedTrackList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeTPUpdateDopeSheetList,
  storeTPCurrnetClickedTrack,
} from 'lib/store';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch, fnClickTrackToCtrlKey, fnClickTrackToMouse } from 'utils/TP/trackUtils';
import styles from './index.module.scss';

interface TrackProps {
  childrenTrackList: TPTrackName[];
  isOpenedParent: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft: number; // 트랙 좌측 패딩 값
  trackIndex: number;
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  childrenTrackList,
  isOpenedParent = false,
  title,
  paddingLeft,
  trackIndex,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isClickedArrowButton, setIsClickedArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const clickedTrackList = useReactiveVar(storeTPSelectedTrackList);

  // 트랙 클릭
  const clickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const clickedTrack = event.target as Element;
      if (clickedTrack.nodeName === 'DIV' || clickedTrack.nodeName === 'P') {
        if (title !== 'Summary') {
          if (event.ctrlKey || event.metaKey) {
            const clickTrackToCtrlKey = fnClickTrackToCtrlKey({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            if (clickTrackToCtrlKey) {
              const [updatedTrackList, newClickedTrackList] = clickTrackToCtrlKey;
              storeTPSelectedTrackList(newClickedTrackList);
              storeTPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
            } else {
              alert('다른 레이어를 클릭');
            }
          } else {
            const [updatedTrackList, newClickedTrackList] = fnClickTrackToMouse({
              clickedTrackList,
              lastBoneList,
              trackIndex,
            });
            storeTPSelectedTrackList(newClickedTrackList);
            storeTPUpdateDopeSheetList({ updatedList: updatedTrackList, status: 'isSelected' });
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
          storeTPUpdateDopeSheetList({ updatedList, status: 'isClickedParentTrack' });
          break;
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
          storeTPUpdateDopeSheetList({
            updatedList: updatedTrackList,
            status: 'isClickedParentTrack',
          });
          break;
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
          storeTPUpdateDopeSheetList({
            updatedList: updatedTrackList,
            status: 'isClickedParentTrack',
          });
          break;
        }
        default: {
          break;
        }
      }
      storeTPCurrnetClickedTrack({
        trackIndex,
        isClickedArrow: !prev,
      });
      return !prev;
    });
  }, [lastBoneList, trackIndex]);

  // 트랙 별 좌측 padding left 값 설정
  const calcPaddingLeft = useMemo(
    () => (trackIndex: number) => {
      const remainder = trackIndex % 10;
      switch (remainder) {
        case TP_TRACK_INDEX.LAYER:
          return 32;
        case TP_TRACK_INDEX.BONE_A:
        case TP_TRACK_INDEX.BONE_B:
          return 48;
        default:
          return 84;
      }
    },
    [],
  );

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('track context menu event : ', title, trackIndex); // 우클릭 이벤트 구현 시 console.log 없앨 예정
    },
    [title, trackIndex],
  );

  // 수정불가 버튼 클릭
  const clickLockButton = useCallback(() => {}, []);

  // 랜더링 제외 버튼 클릭
  const clickRenderingButton = useCallback(() => {}, []);

  // 트랙 선택 효과 변경
  useEffect(() => {
    const targetIndex = fnGetBinarySearch({
      collection: dopeSheetList,
      index: trackIndex,
      key: 'trackIndex',
    });
    const targetTrack = dopeSheetList[targetIndex];
    setIsSelected(targetTrack?.isSelected);
  }, [dopeSheetList, trackIndex]);

  // 자식 트랙 opened 변경
  useEffect(() => {
    setIsClickedArrowButton(isOpenedParent);
  }, [isOpenedParent]);

  return (
    <>
      <div className={cx('track-wrapper')}>
        <div
          className={cx('track-body', { selected: isSelected })}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={clickTrackBody}
          onContextMenu={clickRightMouse}
          aria-hidden="true"
        >
          {childrenTrackList.length ? (
            <IconWrapper
              className={cx('track-button', 'arrow-button', { opened: isClickedArrowButton })}
              icon={SvgPath.CaretDown}
              hasFrame={false}
              onClick={clickArrowButton}
            />
          ) : (
            ''
          )}
          <p>{title}</p>
          <div className={cx('track-icon-wrapper')}>
            <IconWrapper
              className={cx('track-button', 'lock')}
              icon={SvgPath.LockClose}
              hasFrame={false}
              onClick={clickLockButton}
            />
            <IconWrapper
              className={cx('track-button', 'check')}
              icon={SvgPath.LockClose}
              hasFrame={false}
              onClick={clickRenderingButton}
            />
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
                paddingLeft={calcPaddingLeft(trackIndex)}
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
