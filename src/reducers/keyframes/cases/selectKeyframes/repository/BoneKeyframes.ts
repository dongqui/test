import produce from 'immer';

import { EditorTrack, ClusteredKeyframe } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';
class BoneKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): EditorTrack[] => {
    const { boneKeyframes, selectedBoneKeyframes } = this.state;
    return produce(boneKeyframes, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(boneKeyframes, trackNumber, 'trackNumber');
        const keyframes = boneKeyframes[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(boneKeyframes, trackNumber, 'trackNumber');
        const keyframes = boneKeyframes[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default BoneKeyframesRepository;
