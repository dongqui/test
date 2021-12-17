import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { TimeEditorTrack, UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // property keyframe 추가
  addKeyframes = (updatedKeyframesList: UpdatedPropertyKeyframes): TimeEditorTrack[] => {
    const { propertyTrackList } = this.state;
    return produce(propertyTrackList, (draft) => {
      updatedKeyframesList.transformKeys.forEach((transformKey) => {
        const trackIndex = draft.findIndex((propertyTrack) => propertyTrack.trackId === transformKey.trackId);
        const keyframeIndex = findElementIndex(draft[trackIndex].keyframes, transformKey.to, 'time');
        if (keyframeIndex === -1) {
          draft[trackIndex].keyframes.push({ isDeleted: false, isSelected: false, time: transformKey.to, value: transformKey.value });
          draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
        } else {
          draft[trackIndex].keyframes[keyframeIndex].isDeleted = false;
          draft[trackIndex].keyframes[keyframeIndex].value = transformKey.value;
        }
      });
    });
  };
}

export default PropertyKeyframeRepository;
