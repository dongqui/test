import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { ClusteredKeyframe, Keyframe, TrasnformKey, TimeEditorTrack } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private createNextKeyframeValue = (time: number, trasnformKey: TrasnformKey): Keyframe => {
    return { isSelected: true, isDeleted: false, time, value: trasnformKey.value };
  };

  private updateValues = <T extends ClusteredKeyframe | TimeEditorTrack>(base: T[], scrubberTime: number) => {
    const { copiedPropertyKeyframes } = this.state;
    const timeDiff = scrubberTime - copiedPropertyKeyframes[0].keyframes[0].time;
    return produce(base, (draft) => {
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

  // property track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number): TimeEditorTrack[] => {
    const { propertyTrackList } = this.state;
    return this.updateValues(propertyTrackList, scrubberTime);
  };

  // 선택 된 property keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number): ClusteredKeyframe[] => {
    const { selectedPropertyKeyframes } = this.state;
    return this.updateValues(selectedPropertyKeyframes, scrubberTime);
  };
}

export default PropertyKeyframeRepository;
