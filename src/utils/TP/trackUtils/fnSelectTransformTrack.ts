import { TPDopeSheet } from 'types/TP';

/**
 * 클릭한 transform 트랙에 선택 효과를 적용하는 함수입니다.
 *
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

interface Params {
  trackIndex: number;
}

type Return = [Partial<TPDopeSheet>[], number[]];

const fnSelectTransformTrack = ({ trackIndex }: Params): Return => {
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  // 새로 선택 효과 적용시킬 리스트에 track index 추가
  newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected: true,
  });

  return [updatedTrackList, newClickedTrackList];
};

export default fnSelectTransformTrack;
