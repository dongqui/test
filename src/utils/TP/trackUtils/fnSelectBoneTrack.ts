import { TPDopeSheet } from 'types/TP';
interface Params {
  trackIndex: number;
  isSelected: boolean;
}

type Return = [Partial<TPDopeSheet>[], number[]];

/**
 * 클릭한 bone 트랙과 하위 트랙에 선택 효과를 적용하는 함수입니다.
 *
 * @param trackIndex - 클릭 한 트랙 index
 * @param isSelected - 선택 효과를 줄 경우 true. 선택 효과를 해제 할 경우 false
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

const fnSelectBoneTrack = ({ trackIndex, isSelected }: Params): Return => {
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  // 클릭 한 bone 트랙에 선택 효과 적용
  if (trackIndex) newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected,
  });

  // 하위 transform 트랙에도 선택 효과 적용
  for (let transformIndex = trackIndex + 1; transformIndex <= trackIndex + 3; transformIndex += 1) {
    updatedTrackList.push({
      trackIndex: transformIndex,
      isSelected,
    });
    if (trackIndex) newClickedTrackList.push(transformIndex);
  }

  return [updatedTrackList, newClickedTrackList];
};

export default fnSelectBoneTrack;
