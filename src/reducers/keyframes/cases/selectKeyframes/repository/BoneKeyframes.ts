import produce from 'immer';

import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): TimeEditorTrack[] => {
    const { boneTrackList, selectedBoneKeyframes } = this.state;
    return produce(boneTrackList, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, keyframes } = selectedKeyframe;
        const trackIndex = findElementIndex(boneTrackList, trackNumber, 'trackNumber');
        const boneKeyframes = boneTrackList[trackIndex].keyframes;
        keyframes.forEach(({ time }) => {
          const keyframeIndex = findElementIndex(boneKeyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, keyframes } = selectedKeyframe;
        const trackIndex = findElementIndex(boneTrackList, trackNumber, 'trackNumber');
        const boneKeyframes = boneTrackList[trackIndex].keyframes;
        keyframes.forEach(({ time }) => {
          const keyframeIndex = findElementIndex(boneKeyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default BoneKeyframesRepository;
