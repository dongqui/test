import { TrackKeyframes, ClusteredTimes } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';

export interface Repository {
  /**
   * @description 선택 된 키프레임 중에서 isDeleted를 true로 변경
   */
  deleteSeletedKeyframes(transformKeyframes?: TrackKeyframes[]): TrackKeyframes | TrackKeyframes[];

  /**
   * @description 선택 된 키프레임 리스트를 초기화
   */
  clearSeletedKeyframes(): ClusteredTimes[];

  updateStateObject(newValues: Partial<KeyframesState>): KeyframesState;
}
