import { UpdatedTrack } from 'types/TP';

interface FnSelectTransformTrack {
  isSelected: boolean;
  trackIndex: number;
}

type Return = [UpdatedTrack<'isSelected'>[], number[]];

/**
 * 클릭한 transform 트랙에 선택 효과를 적용하는 함수입니다.
 *
 * @param isSelected - 선택 효과를 줄 경우 true. 선택 효과를 해제 할 경우 false
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

const fnSelectTransformTrack = ({ isSelected, trackIndex }: FnSelectTransformTrack): Return => {
  const updatedTrackList: UpdatedTrack<'isSelected'>[] = [];
  const newClickedTrackList = [];

  // 새로 선택 효과 적용시킬 리스트에 track index 추가
  if (trackIndex) newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected,
  });

  return [updatedTrackList, newClickedTrackList];
};

export default fnSelectTransformTrack;
