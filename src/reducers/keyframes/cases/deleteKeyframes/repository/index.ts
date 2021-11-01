import { TrackIdentifier } from 'types/TP';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';

type ClusteredKeyframes = ClusteredKeyframe<TrackIdentifier>[];
type ReturnValues = TimeEditorTrack<TrackIdentifier> | TimeEditorTrack<TrackIdentifier>[];

export interface Repository {
  /**
   * @description 선택 된 키프레임 중에서 isDeleted를 true로 변경
   */
  deleteSeletedKeyframes(transformKeyframes?: TimeEditorTrack<TrackIdentifier>[]): ReturnValues;

  /**
   * @description 선택 된 키프레임 리스트를 초기화
   */
  clearSeletedKeyframes(): ClusteredKeyframes;

  updateStateObject(newValues: Partial<KeyframesState>): KeyframesState;
}
