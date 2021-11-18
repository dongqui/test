import produce from 'immer';

import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private createNextKeyframeValue = (time: number): Keyframe => {
    return { isSelected: true, isDeleted: false, time };
  };

  // bone track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number, selectedChildren: Map<number, number[]>): TimeEditorTrack[] => {
    const { boneTrackList } = this.state;
    return produce(boneTrackList, (draft) => {
      selectedChildren.forEach((times, boneNumber) => {
        const trackIndex = findElementIndex(draft, boneNumber, 'trackNumber');
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, time, 'time');
          const nextKeyframeValue = this.createNextKeyframeValue(time);
          if (keyframeIndex === -1) {
            draft[trackIndex].keyframes.push(nextKeyframeValue);
            draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
          } else {
            draft[trackIndex].keyframes[keyframeIndex] = nextKeyframeValue;
          }
        });
      });
    });
  };

  // 선택 된 bone keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number, selectedChildren: Map<number, number[]>): ClusteredKeyframe[] => {
    const { selectedBoneKeyframes, boneTrackList } = this.state;
    return produce(selectedBoneKeyframes, (draft) => {
      selectedChildren.forEach((times, boneNumber) => {
        let trackIndex = findElementIndex(draft, boneNumber, 'trackNumber');
        if (trackIndex === -1) {
          const boneIndex = findElementIndex(boneTrackList, boneNumber, 'trackNumber');
          const boneTrack = boneTrackList[boneIndex];
          draft.push({ keyframes: [], trackType: 'bone', trackNumber: boneTrack.trackNumber, trackId: boneTrack.trackId });
          draft.sort((a, b) => a.trackNumber - b.trackNumber);
          trackIndex = findElementIndex(draft, boneNumber, 'trackNumber');
        }
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, time, 'time');
          const nextKeyframeValue = this.createNextKeyframeValue(time);
          if (keyframeIndex === -1) {
            draft[trackIndex].keyframes.push(nextKeyframeValue);
            draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
          } else {
            draft[trackIndex].keyframes[keyframeIndex] = nextKeyframeValue;
          }
        });
      });
    });
  };
}

export default BoneKeyframeRepository;
