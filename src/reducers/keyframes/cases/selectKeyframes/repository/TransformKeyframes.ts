import produce from 'immer';

import { ClusteredKeyframe, EditorTrack } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class TransformKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): EditorTrack[] => {
    const { transformKeyframes, selectedTransformKeyframes } = this.state;
    return produce(transformKeyframes, (draft) => {
      selectedTransformKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(transformKeyframes, trackNumber, 'trackNumber');
        const keyframes = transformKeyframes[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(transformKeyframes, trackNumber, 'trackNumber');
        const keyframes = transformKeyframes[trackIndex].keyframes;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft[trackIndex].keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default TransformKeyframesRepository;
