import produce from 'immer';

import { ClusteredTimes, Keyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

class TransformKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 트랙 index 찾기
  private findTrackIndex = (trackIndex: number) => {
    const { transformKeyframes } = this.state;
    return transformKeyframes.findIndex((keyframe) => keyframe.trackIndex === trackIndex);
  };

  // 키프레임 index 찾기
  private findKeyframeIndex = (tarckIndex: number, time: number) => {
    const { transformKeyframes } = this.state;
    const transformTrack = transformKeyframes[tarckIndex];
    const keyframeIndex = getBinarySearch<Keyframe>({
      collection: transformTrack.keyframes,
      index: time,
      key: 'timeIndex',
    });
    return keyframeIndex;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteTransformKeyframes = () => {
    const { transformKeyframes, selectedTransformKeyframes } = this.state;
    return produce(transformKeyframes, (draft) => {
      selectedTransformKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(selectedKeyframe.trackIndex as number);
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findKeyframeIndex(trackIndex, time);
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
    });
  };

  // 선택 된 transform keyframes 리스트 초기화
  public clearSeletedKeyframes = (): ClusteredTimes[] => {
    return [];
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (): TrackKeyframes[] => {
    return this.deleteTransformKeyframes();
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default TransformKeyframeRepository;
