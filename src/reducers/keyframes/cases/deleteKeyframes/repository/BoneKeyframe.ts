import produce from 'immer';

import { Keyframe } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

type BoneKeyframes = Pick<AllKeyframes, 'boneKeyframes'>;
type SelectedBoneKeyframes = Pick<AllSelectedKeyframes, 'selectedBoneKeyframes'>;

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private findTrackIndex = (trackIndex: number) => {
    const { boneKeyframes } = this.state;
    return boneKeyframes.findIndex((keyframe) => keyframe.trackIndex === trackIndex);
  };

  private findKeyframeIndex = (tarckIndex: number, time: number) => {
    const { boneKeyframes } = this.state;
    const boneTrack = boneKeyframes[tarckIndex];
    const keyframeIndex = getBinarySearch<Keyframe>({
      collection: boneTrack.keyframes,
      index: time,
      key: 'timeIndex',
    });
    return keyframeIndex;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteBoneKeyframes = () => {
    const { boneKeyframes, selectedBoneKeyframes } = this.state;
    return produce(boneKeyframes, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(selectedKeyframe.trackIndex as number);
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findKeyframeIndex(trackIndex, time);
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
    });
  };

  // 선택 된 bone keyframes 리스트 초기화
  public clearSeletedKeyframes = (): SelectedBoneKeyframes => {
    return {
      selectedBoneKeyframes: [],
    };
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (): BoneKeyframes => {
    return {
      boneKeyframes: this.deleteBoneKeyframes(),
    };
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default BoneKeyframeRepository;
