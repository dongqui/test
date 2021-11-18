import produce from 'immer';

import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private createNextKeyframeValue = (time: number): Keyframe => {
    return { isSelected: true, isDeleted: false, time };
  };

  // bone track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number, selectedChildren: number[]): TimeEditorTrack => {
    const { layerTrack } = this.state;
    return produce(layerTrack, (draft) => {
      selectedChildren.forEach((time) => {
        const keyframeIndex = findElementIndex(draft.keyframes, time, 'time');
        const nextKeyframeValue = this.createNextKeyframeValue(time);
        if (keyframeIndex === -1) {
          draft.keyframes.push(nextKeyframeValue);
          draft.keyframes.sort((a, b) => a.time - b.time);
        } else {
          draft.keyframes[keyframeIndex] = nextKeyframeValue;
        }
      });
    });
  };

  // 선택 된 bone keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number, selectedChildren: number[]): ClusteredKeyframe[] => {
    const { layerTrack, selectedLayerKeyframes } = this.state;
    return produce(selectedLayerKeyframes, (draft) => {
      if (!draft[0]) {
        draft[0] = { keyframes: [], trackType: 'layer', trackNumber: -1, trackId: layerTrack.trackId };
      }
      selectedChildren.forEach((time) => {
        const keyframeIndex = findElementIndex(draft[0].keyframes, time, 'time');
        const nextKeyframeValue = this.createNextKeyframeValue(time);
        if (keyframeIndex === -1) {
          draft[0].keyframes.push(nextKeyframeValue);
          draft[0].keyframes.sort((a, b) => a.time - b.time);
        } else {
          draft[0].keyframes[keyframeIndex] = nextKeyframeValue;
        }
      });
    });
  };
}

export default LayerKeyframeRepository;
