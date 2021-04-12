import _ from 'lodash';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnSelectBoneTrack, fnSelectLayerTrack, fnSelectTransformTrack } from './index';
import { TPDopeSheet, TPLastBone } from 'types/TP';

interface FnClickTrackToMouse {
  clickedTrackList: number[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type Return = [Partial<TPDopeSheet>[], number[]];

/**
 * 마우스 좌클릭을 했을 때, 클릭 한 트랙에 선택 효과를 적용시키는 함수입니다.
 * - 클릭한 트랙 리스트가 있을 경우 -> 선택 효과 제거
 * - 클릭한 트랙 리스트와 하위 트랙에 선택 효과 적용
 *
 * @param clickedTrackList - 선택 효과가 적용 된 트랙 리스트
 * @param lastBoneList - layer의 마지막 bone을 저장하는 리스트
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

const fnClickTrackToMouse = ({
  clickedTrackList,
  lastBoneList,
  trackIndex,
}: FnClickTrackToMouse): Return => {
  const remainder = trackIndex % 10;
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  // 선택 적용 된 트랙들이 있는 경우, isSelected를 false로
  if (clickedTrackList.length) {
    const deselect = _.map(clickedTrackList, (track) => ({
      trackIndex: track,
      isSelected: false,
    }));
    updatedTrackList.push(...deselect);
  }

  switch (remainder) {
    // Layer 트랙 클릭
    case TP_TRACK_INDEX.LAYER: {
      const [updatedList, newClickedList] = fnSelectLayerTrack({
        lastBoneList,
        trackIndex,
        isSelected: true,
      });
      updatedTrackList.push(...updatedList);
      newClickedTrackList.push(...newClickedList);
      break;
    }
    // Bone 트랙 클릭
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      const [updatedList, newClickedList] = fnSelectBoneTrack({ trackIndex, isSelected: true });
      updatedTrackList.push(...updatedList);
      newClickedTrackList.push(...newClickedList);
      break;
    }
    // Transform 트랙 클릭
    default: {
      const [updatedList, newClickedList] = fnSelectTransformTrack({
        trackIndex,
        isSelected: true,
      });
      updatedTrackList.push(...updatedList);
      newClickedTrackList.push(...newClickedList);
      break;
    }
  }

  return [updatedTrackList, newClickedTrackList];
};

export default fnClickTrackToMouse;
