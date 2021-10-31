import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';

import { Repository, Common } from './index';

type TransformKeyframes = Pick<AllKeyframes, 'transformKeyframes'>;
type SelectedTransformKeyframes = Pick<AllSelectedKeyframes, 'selectedTransformKeyframes'>;

class TransformKeyframesRepository extends Common implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    super();
    this.state = state;
  }

  private updateTransformKeyframes = (next: SelectedTransformKeyframes) => {
    const { transformKeyframes, selectedTransformKeyframes } = this.state;
    return produce(transformKeyframes, (draft) => {
      selectedTransformKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(transformKeyframes, selectedKeyframe);
        const keyframes = transformKeyframes[trackIndex].keyframes;
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(keyframes, time);
          const transformKeyframe = draft[trackIndex].keyframes[timeIndex];
          transformKeyframe.isSelected = false;
        });
      });
      next.selectedTransformKeyframes.forEach((selectedKeyframe) => {
        const trackIndex = this.findTrackIndex(transformKeyframes, selectedKeyframe);
        const keyframes = transformKeyframes[trackIndex].keyframes;
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(keyframes, time);
          const transformKeyframe = draft[trackIndex].keyframes[timeIndex];
          transformKeyframe.isSelected = true;
        });
      });
    });
  };

  public updateKeyframes = (next: SelectedTransformKeyframes): TransformKeyframes => {
    const transformKeyframes = this.updateTransformKeyframes(next);
    return { transformKeyframes };
  };

  public updateState = (newValues: Partial<KeyframesState>) => {
    return this.updateStateObject(this.state, newValues);
  };
}

export default TransformKeyframesRepository;
