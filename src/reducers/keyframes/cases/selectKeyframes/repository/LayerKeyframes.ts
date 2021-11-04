import produce from 'immer';

import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframesRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  updateIsSelected = (nextSelectedKeyframes: ClusteredKeyframe[]): TimeEditorTrack => {
    const { layerTrack, selectedLayerKeyframes } = this.state;
    const layerKeyframes = layerTrack.keyframes;
    return produce(layerTrack, (draft) => {
      selectedLayerKeyframes.forEach((selectedKeyframe) => {
        const { keyframes } = selectedKeyframe;
        keyframes.forEach(({ time }) => {
          const keyframeIndex = findElementIndex(layerKeyframes, time, 'time');
          const keyframe = draft.keyframes[keyframeIndex];
          keyframe.isSelected = false;
        });
      });
      nextSelectedKeyframes.forEach((selectedKeyframe) => {
        const { keyframes } = selectedKeyframe;
        keyframes.forEach(({ time }) => {
          const keyframeIndex = findElementIndex(layerKeyframes, time, 'time');
          const keyframe = draft.keyframes[keyframeIndex];
          keyframe.isSelected = true;
        });
      });
    });
  };
}

export default LayerKeyframesRepository;
