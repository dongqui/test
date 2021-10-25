import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';

import { Repository, Common } from './index';

type BoneKeyframes = Pick<AllKeyframes, 'boneKeyframes'>;
type SelectedBoneKeyframes = Pick<AllSelectedKeyframes, 'selectedBoneKeyframes'>;

class BoneKeyframesRepository extends Common implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    super();
    this.state = state;
  }

  private updateBoneKeyframes = (next: SelectedBoneKeyframes) => {
    const { boneKeyframes, selectedBoneKeyframes } = this.state;
    return produce(boneKeyframes, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(boneKeyframes, selectedKeyframe);
        const keyframes = boneKeyframes[trackIndex].keyframes;
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(keyframes, time);
          const transformKeyframe = draft[trackIndex].keyframes[timeIndex];
          transformKeyframe.isSelected = false;
        });
      });
      next.selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(boneKeyframes, selectedKeyframe);
        const keyframes = boneKeyframes[trackIndex].keyframes;
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(keyframes, time);
          const transformKeyframe = draft[trackIndex].keyframes[timeIndex];
          transformKeyframe.isSelected = true;
        });
      });
    });
  };

  public updateKeyframes = (next: SelectedBoneKeyframes): BoneKeyframes => {
    const boneKeyframes = this.updateBoneKeyframes(next);
    return { boneKeyframes };
  };

  public updateState = (newValues: Partial<KeyframesState>) => {
    return this.updateStateObject(this.state, newValues);
  };
}

export default BoneKeyframesRepository;
