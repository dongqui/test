import produce from 'immer';

import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): TimeEditorTrack[] => {
    const { propertyTrackList, selectedPropertyKeyframes } = this.state;
    return produce(propertyTrackList, (draft) => {
      selectedPropertyKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(propertyTrackList, trackNumber, 'trackNumber');
        const keyframes = propertyTrackList[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(propertyTrackList, trackNumber, 'trackNumber');
        const keyframes = propertyTrackList[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default PropertyKeyframesRepository;
