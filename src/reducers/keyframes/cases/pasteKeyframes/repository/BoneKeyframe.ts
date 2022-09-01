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

  private getSmallestKeyframeTime = () => {
    const { copiedPropertyKeyframes } = this.state;
    let smallestTime = Infinity;
    copiedPropertyKeyframes.forEach((copied) => {
      if (copied.keyframes.length === 0) return;
      const time = copied.keyframes[0].time;
      if (time < smallestTime) smallestTime = time;
    });
    return smallestTime;
  };

  // bone track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number, selectedChildren: Map<number, number[]>): TimeEditorTrack[] => {
    const { boneTrackList, copiedBoneKeyframes } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(boneTrackList, (draft) => {
      selectedChildren.forEach((times, boneNumber) => {
        const trackIndex = findElementIndex(draft, boneNumber, 'trackNumber');
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, time, 'time');
          if (keyframeIndex === -1) {
            draft[trackIndex].keyframes.push({ isSelected: false, isDeleted: false, time });
            draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
          } else {
            draft[trackIndex].keyframes[keyframeIndex].isDeleted = false;
          }
        });
      });
      copiedBoneKeyframes.forEach((copied) => {
        const trackIndex = findElementIndex(draft, copied.trackNumber, 'trackNumber');
        copied.keyframes.forEach((keyframe) => {
          const nextTime = timeDiff + keyframe.time;
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, nextTime, 'time');
          draft[trackIndex].keyframes[keyframeIndex].isSelected = true;
        });
      });
    });
  };

  // 선택 된 bone keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number, selectedChildren: Map<number, number[]>): ClusteredKeyframe[] => {
    const { selectedBoneKeyframes, copiedBoneKeyframes } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(selectedBoneKeyframes, (draft) => {
      copiedBoneKeyframes.forEach((copied) => {
        let trackIndex = findElementIndex(draft, copied.trackNumber, 'trackNumber');
        if (trackIndex === -1) {
          draft.push({ keyframes: [], trackType: 'bone', trackNumber: copied.trackNumber, trackId: copied.trackId, parentTrackNumber: copied.parentTrackNumber });
          draft.sort((a, b) => a.trackNumber - b.trackNumber);
          trackIndex = findElementIndex(draft, copied.trackNumber, 'trackNumber');
        }
        copied.keyframes.forEach((keyframe) => {
          const nextTime = timeDiff + keyframe.time;
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, nextTime, 'time');
          if (keyframeIndex === -1) {
            draft[trackIndex].keyframes.push({ time: nextTime });
            draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
          }
        });
      });
    });
  };
}

export default BoneKeyframeRepository;
