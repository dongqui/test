import produce from 'immer';

import { ClusteredKeyframe, EditorTrack } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): EditorTrack => {
    const { layerKeyframes, selectedLayerKeyframes } = this.state;
    const { keyframes } = layerKeyframes;
    return produce(layerKeyframes, (draft) => {
      selectedLayerKeyframes.forEach((selectedKeyframe) => {
        const { times } = selectedKeyframe;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft.keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { times } = selectedKeyframe;
        times.forEach((time) => {
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          const keyframe = draft.keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default LayerKeyframesRepository;
