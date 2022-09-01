import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { ClusteredKeyframe, Keyframe, TransformKey, TimeEditorTrack } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private createNextKeyframeValue = (time: number, trasnformKey: TransformKey): Keyframe => {
    return { isSelected: true, isDeleted: false, time, value: trasnformKey.value };
  };

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

  // property track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number): TimeEditorTrack[] => {
    const { copiedPropertyKeyframes, propertyTrackList } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(propertyTrackList, (draft) => {
      copiedPropertyKeyframes.forEach((copiedGroup) => {
        const { trackNumber, keyframes } = copiedGroup;
        const trackIndex = findElementIndex(draft, trackNumber, 'trackNumber');
        keyframes.forEach((keyframe) => {
          const nextTime = timeDiff + keyframe.time;
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, nextTime, 'time');
          const nextKeyframeValue = this.createNextKeyframeValue(nextTime, keyframe);
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

  // 선택 된 property keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number): ClusteredKeyframe[] => {
    const { selectedPropertyKeyframes, copiedPropertyKeyframes } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(selectedPropertyKeyframes, (draft) => {
      copiedPropertyKeyframes.forEach((copied) => {
        const { trackNumber, trackId, keyframes, parentTrackNumber } = copied;
        let trackIndex = findElementIndex(draft, trackNumber, 'trackNumber');
        if (trackIndex === -1) {
          draft.push({ keyframes: [], trackType: 'property', trackNumber: trackNumber, trackId: trackId, parentTrackNumber });
          draft.sort((a, b) => a.trackNumber - b.trackNumber);
          trackIndex = findElementIndex(draft, trackNumber, 'trackNumber');
        }
        keyframes.forEach((keyframe) => {
          const nextTime = timeDiff + keyframe.time;
          const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, nextTime, 'time');
          const nextKeyframeValue = this.createNextKeyframeValue(nextTime, keyframe);
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

export default PropertyKeyframeRepository;
