import { fnCheckSelectedTrackList, fnSelectTrackList } from './index';
import { TPDopeSheet, TPLastBone } from 'types/TP';

interface Params {
  clickedTrackList: number[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type Return = [Partial<TPDopeSheet>[], number[]] | false;

/**
 * 트랙에다가 ctrl key와 함께 마우스 좌클릭을 할 경우, 클릭 한 트랙에 선택 효과를 적용시키는 함수입니다.
 * - 선택한 트랙 리스트가 비어있을 경우 -> 클릭한 트랙에 선택 효과 적용. 선택한 트랙 리스트에 클릭한 트랙 추가
 * - 같은 레이어 아래에 클릭한 리스트가 있는 경우 -> 클릭한 트랙에 선택 효과 적용. 선택한 트랙 리스트에 클릭한 트랙 누적
 * - 다른 레이어에서 클릭한 리스트가 있는 경우 -> 에러 모달창 발생
 * - 본인 트랙에 선택 효과가 적용 된 상태에서 ctrl 클릭 할 경우 -> 선택 효과 제거. 선택한 트랙 리스트에 클릭한 트랙 제거
 *
 * @param clickedTrackList - 선택 효과가 적용 된 트랙 리스트
 * @param lastBoneList - layer의 마지막 bone을 저장하는 리스트
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

const fnClickTrackToCtrlKey = ({ clickedTrackList, lastBoneList, trackIndex }: Params): Return => {
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  // 선택 된 트랙이 없을 경우
  if (!clickedTrackList.length) {
    const [updatedList, newClickedList] = fnSelectTrackList({
      isSelected: true,
      lastBoneList,
      trackIndex,
    });
    updatedTrackList.push(...updatedList);
    newClickedTrackList.push(...newClickedList);
  }
  // 선택 된 트랙이 있을 경우
  else {
    const selectedTrackList = fnCheckSelectedTrackList({
      clickedTrackList,
      lastBoneList,
      trackIndex,
    });
    if (selectedTrackList) {
      const [updatedList, newClickedList] = selectedTrackList;
      updatedTrackList.push(...updatedList);
      newClickedTrackList.push(...newClickedList);
    } else {
      return false;
    }
  }

  return [updatedTrackList, newClickedTrackList];
};

export default fnClickTrackToCtrlKey;
