import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { TimeEditorTrack, UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // layer keyframe 추가
  addKeyframes(updatedKeyframes: UpdatedPropertyKeyframes): TimeEditorTrack {
    const { layerTrack } = this.state;
    const to = updatedKeyframes.transformKeys[0].to;
    return produce(layerTrack, (draft) => {
      const keyframeIndex = findElementIndex(draft.keyframes, to, 'time');
      if (keyframeIndex === -1) {
        draft.keyframes.push({ isDeleted: false, isSelected: false, time: to });
        draft.keyframes.sort((a, b) => a.time - b.time);
      } else {
        draft.keyframes[keyframeIndex].isDeleted = false;
      }
    });
  }
}

export default LayerKeyframeRepository;
