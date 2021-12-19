import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { TimeEditorTrack, UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // bone keyframe 추가
  addKeyframes(updatedKeyframes: UpdatedPropertyKeyframes): TimeEditorTrack[] {
    const { boneTrackList } = this.state;
    const to = updatedKeyframes.transformKeys[0].to;
    return produce(boneTrackList, (draft) => {
      draft.forEach((boneTrack) => {
        const keyframeIndex = findElementIndex(boneTrack.keyframes, to, 'time');
        if (keyframeIndex === -1) {
          boneTrack.keyframes.push({ isDeleted: false, isSelected: false, time: to });
          boneTrack.keyframes.sort((a, b) => a.time - b.time);
        } else {
          boneTrack.keyframes[keyframeIndex].isDeleted = false;
        }
      });
    });
  }
}

export default BoneKeyframeRepository;
