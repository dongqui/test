import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import produce from 'immer';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import {
  storeTPSelectedTrackList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeTPUpdateDopeSheetList,
  storeTPCurrnetClickedTrack,
  storeCurrentVisualizedData,
  storeContextMenuInfo,
  storeModalInfo,
} from 'lib/store';
import { CurrentVisualizedDataType, MODAL_TYPES } from 'types';
import { TPTrackName, TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import {
  fnClickLockButton,
  fnClickRenderingButton,
  fnClickTrackToCtrlKey,
  fnClickTrackToMouse,
  fnGetBinarySearch,
} from 'utils/TP/trackUtils';
import styles from './index.module.scss';
import useContextMenu from 'hooks/common/useContextMenu';
import { FormModal } from 'components/New_Modal';
import { BaseInput } from 'components/New_Input';
import { useConfirmModal } from 'components/New_Modal/ConfirmModal';

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
  const [isLocked, setIsLocked] = useState(false);
  const [isIncluded, setisIncluded] = useState(true);
  const [isClickedArrowButton, setIsClickedArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const clickedTrackList = useReactiveVar(storeTPSelectedTrackList);
  const trackRef = useRef<HTMLDivElement>(null);

  const [showsModal, setShowsModal] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const modalInfo = useReactiveVar(storeModalInfo);

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

  const multiKeyController = useMemo(
    () => ({
      ctrl: { pressed: false },
    }),
    [],
  );

  // 트랙 클릭
  const clickTrackBody = useCallback(
    (event: React.MouseEvent<Element>) => {
      const clickedTrack = event.target as Element;
      if (clickedTrack.nodeName === 'DIV' || clickedTrack.nodeName === 'P') {
        if (title !== 'Summary') {
          if (event.ctrlKey || event.metaKey || multiKeyController.ctrl.pressed) {
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
    [clickedTrackList, lastBoneList, multiKeyController.ctrl.pressed, title, trackIndex],
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

  // 수정불가 버튼 클릭
  const clickLockButton = useCallback(() => {
    const updatedDopeSheetList = fnClickLockButton({ dopeSheetList, lastBoneList, trackIndex });
    storeTPUpdateDopeSheetList({
      updatedList: updatedDopeSheetList,
      status: 'isLocked',
    });
  }, [dopeSheetList, lastBoneList, trackIndex]);

  // 랜더링 제외 버튼 클릭
  const clickRenderingButton = useCallback(() => {
    const state = storeCurrentVisualizedData();
    if (state) {
      const [updatedDopeSheetList, updatedState] = fnClickRenderingButton({
        dopeSheetList,
        lastBoneList,
        trackIndex,
      });
      const targetIndex = fnGetBinarySearch({
        collection: dopeSheetList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const targetTrack = dopeSheetList[targetIndex];
      if (targetTrack.layerKey === 'baseLayer') {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          _.forEach(updatedState, (updated) => {
            const transformIndex = _.findIndex(
              draft.baseLayer,
              (currentVisualizedData) => currentVisualizedData.name === updated.name,
            );
            draft.baseLayer[transformIndex].isIncluded = updated.isIncluded;
          });
        });
        storeCurrentVisualizedData(nextState);
      } else {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          const targetLayer = _.find(draft.layers, (layer) => layer.key === targetTrack.layerKey);
          if (targetLayer) {
            _.forEach(updatedState, (updated) => {
              const transformIndex = _.findIndex(
                targetLayer.tracks,
                (currentVisualizedData) => currentVisualizedData.name === updated.name,
              );
              targetLayer.tracks[transformIndex].isIncluded = updated.isIncluded;
            });
          }
        });
        storeCurrentVisualizedData(nextState);
      }
      storeTPUpdateDopeSheetList({
        updatedList: updatedDopeSheetList,
        status: 'isIncluded',
      });
    }
  }, [dopeSheetList, lastBoneList, trackIndex]);

  // 트랙 선택 효과 변경
  useEffect(() => {
    if (dopeSheetList && trackIndex) {
      const targetIndex = fnGetBinarySearch({
        collection: dopeSheetList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const targetTrack = dopeSheetList[targetIndex];
      setIsSelected(targetTrack?.isSelected);
      setIsLocked(targetTrack?.isLocked);
      setisIncluded(targetTrack?.isIncluded);
    }
  }, [dopeSheetList, trackIndex]);

  // 자식 트랙 opened 변경
  useEffect(() => {
    setIsClickedArrowButton(isOpenedParent);
  }, [isOpenedParent]);

  // 레이어 이름 변경 함수 호출
  const updateLayerName = useCallback(() => {
    setShowsModal(true);
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('newLayerName: ', newLayerName);
    setShowsModal(false);
    if (
      newLayerName === '' ||
      _.map(currentVisualizedData?.layers, (layer) => layer.name).includes(newLayerName)
    ) {
      storeModalInfo({
        ...modalInfo,
        isShow: true,
        type: MODAL_TYPES.alert,
        msg: '이미 존재하는 레이어 이름입니다.',
      });
    } else {
      const state = storeCurrentVisualizedData();
      if (state) {
        const targetIndex = fnGetBinarySearch({
          collection: dopeSheetList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = dopeSheetList[targetIndex];
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          const targetLayer = _.find(draft.layers, (layer) => layer.key === curTrack.layerKey);
          if (targetLayer) targetLayer.name = newLayerName;
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [currentVisualizedData?.layers, dopeSheetList, modalInfo, newLayerName, trackIndex]);

  const handleModalClose = () => {
    setShowsModal(false);
  };

  const handleInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLayerName(event.target.value);
  };

  const { getConfirm } = useConfirmModal();

  // 레이어 삭제 함수 호출
  const deleteLayer = useCallback(async () => {
    const confirmed = await getConfirm({
      title: '레이어를 삭제하시겠습니까?',
    });
    if (confirmed) {
      const state = storeCurrentVisualizedData();
      if (state) {
        const targetIndex = fnGetBinarySearch({
          collection: dopeSheetList,
          index: trackIndex,
          key: 'trackIndex',
        });
        const curTrack = dopeSheetList[targetIndex];
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          draft.layers = _.filter(draft.layers, (layer) => layer.key !== curTrack.layerKey);
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [dopeSheetList, getConfirm, trackIndex]);

  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);

  let handleTrackContextMenu = ({
    top,
    left,
    e,
  }: {
    top: number;
    left: number;
    e?: MouseEvent;
  }) => {};

  switch (trackIndex % 10) {
    // layer 트랙
    case 2:
      handleTrackContextMenu = ({
        top,
        left,
        e,
      }: {
        top: number;
        left: number;
        e?: MouseEvent;
      }) => {
        e?.preventDefault();
        storeContextMenuInfo({
          isShow: true,
          top,
          left,
          data: [
            {
              key: 'edit',
              value: 'Edit Name',
              isSelected: false,
              isDisabled: trackIndex === 2,
            },
            {
              key: 'delete',
              value: 'Delete Layer',
              isSelected: false,
              isDisabled: trackIndex === 2,
            },
            {
              key: 'select',
              value: isSelected ? 'Unselect' : 'Select',
              isSelected: false,
            },
            {
              key: 'lock',
              value: isLocked ? 'Unlock' : 'Lock',
              isSelected: false,
            },
            {
              key: 'include',
              value: isIncluded ? 'Exclude' : 'Include',
              isSelected: false,
            },
          ],
          onClick: (key) => {
            switch (key) {
              case 'edit':
                updateLayerName();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'delete':
                deleteLayer();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'select':
                if (e) {
                  if (isSelected) {
                    multiKeyController.ctrl.pressed = true;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    clickTrackBody(e);
                    multiKeyController.ctrl.pressed = false;
                  } else {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    clickTrackBody(e);
                  }
                }
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'lock':
                clickLockButton();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'include':
                clickRenderingButton();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              default:
                break;
            }
          },
        });
      };
      break;
    // Bone 및 Transform 트랙
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 0:
      handleTrackContextMenu = ({
        top,
        left,
        e,
      }: {
        top: number;
        left: number;
        e?: MouseEvent;
      }) => {
        e?.preventDefault();
        storeContextMenuInfo({
          isShow: true,
          top,
          left,
          data: [
            {
              key: 'select',
              value: isSelected ? 'Unselect' : 'Select',
              isSelected: false,
            },
            {
              key: 'lock',
              value: isLocked ? 'Unlock' : 'Lock',
              isSelected: false,
            },
            {
              key: 'include',
              value: isIncluded ? 'Exclude' : 'Include',
              isSelected: false,
            },
          ],
          onClick: (key) => {
            switch (key) {
              case 'select':
                if (e) {
                  if (isSelected) {
                    multiKeyController.ctrl.pressed = true;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    clickTrackBody(e);
                    multiKeyController.ctrl.pressed = false;
                  } else {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    clickTrackBody(e);
                  }
                }
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'lock':
                clickLockButton();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              case 'include':
                clickRenderingButton();
                storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
                break;
              default:
                break;
            }
          },
        });
      };
      break;
    default:
      break;
  }

  useContextMenu({ targetRef: trackRef, event: handleTrackContextMenu });

  const classes = cx('track-body', {
    'layer-selected': isSelected && trackIndex % 10 === 2,
    'bone-selected': isSelected && (trackIndex % 10 === 3 || trackIndex % 10 === 7),
    'transform-selected':
      isSelected &&
      (trackIndex % 10 === 4 ||
        trackIndex % 10 === 5 ||
        trackIndex % 10 === 6 ||
        trackIndex % 10 === 8 ||
        trackIndex % 10 === 9 ||
        trackIndex % 10 === 0),
  });

  return (
    <>
      <div className={cx('track-wrapper')}>
        <div
          className={classes}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={clickTrackBody}
          aria-hidden="true"
          ref={trackRef}
        >
          {childrenTrackList.length ? (
            <IconWrapper
              className={cx('track-icon', 'arrow-button', { opened: isClickedArrowButton })}
              icon={SvgPath.CaretDown}
              hasFrame={false}
              onClick={clickArrowButton}
            />
          ) : (
            ''
          )}
          <p className={cx({ locked: isLocked })}>{title}</p>
          <div className={cx('track-icon-wrapper', { locked: isLocked })}>
            {trackIndex !== 1 && (
              <>
                <IconWrapper
                  className={cx('track-icon', 'lock')}
                  icon={isLocked ? SvgPath.LockOpen : SvgPath.LockClose}
                  hasFrame={false}
                  onClick={clickLockButton}
                />
                <div className={cx('check-wrapper')}>
                  <IconWrapper
                    className={cx('track-icon', 'check', { rendered: isIncluded })}
                    icon={SvgPath.Check}
                    hasFrame={false}
                    onClick={clickRenderingButton}
                  />
                </div>
              </>
            )}
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
        {showsModal && (
          <FormModal
            isOpen={showsModal}
            onClose={handleModalClose}
            onOutsideClose={handleModalClose}
            onSubmit={handleSubmit} // 현재 modal submit 이 안 먹음
            title="레이어 이름을 입력해주세요"
            text={{
              submit: '확인',
              cancel: '취소',
            }}
          >
            <BaseInput
              className={cx('form-name')}
              placeholder="레이어 이름"
              onBlur={handleInputBlur}
              fullSize
            />
          </FormModal>
        )}
      </div>
    </>
  );
};

export default Track;
// export default memo(Track);
