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

  private getSmallestKeyframeTime = () => {
    const { copiedPropertyKeyframes } = this.state;
    let smallestTime = Infinity;
    copiedPropertyKeyframes.forEach((copied) => {
      const time = copied.keyframes[0].time;
      if (time < smallestTime) smallestTime = time;
    });
    return smallestTime;
  };

  // bone track list 업데이트
  updateTimeEditorTrack = (scrubberTime: number, selectedChildren: number[]): TimeEditorTrack => {
    const { layerTrack, copiedLayerKeyframes, copiedPropertyKeyframes } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(layerTrack, (draft) => {
      selectedChildren.forEach((time) => {
        const keyframeIndex = findElementIndex(draft.keyframes, time, 'time');
        if (keyframeIndex === -1) {
          draft.keyframes.push({ isSelected: false, isDeleted: false, time });
          draft.keyframes.sort((a, b) => a.time - b.time);
        } else {
          draft.keyframes[keyframeIndex].isDeleted = false;
        }
      });
      copiedLayerKeyframes[0]?.keyframes.forEach((keyframe) => {
        const nextTime = timeDiff + keyframe.time;
        const keyframeIndex = findElementIndex(draft.keyframes, nextTime, 'time');
        draft.keyframes[keyframeIndex].isSelected = true;
      });
    });
  };

  // 선택 된 bone keyframes 업데이트
  updateSelectedKeyframes = (scrubberTime: number, selectedChildren: number[]): ClusteredKeyframe[] => {
    const { layerTrack, selectedLayerKeyframes, copiedLayerKeyframes, copiedPropertyKeyframes } = this.state;
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    return produce(selectedLayerKeyframes, (draft) => {
      if (!draft[0]) {
        draft[0] = { keyframes: [], trackType: 'layer', trackNumber: -1, trackId: layerTrack.trackId, parentTrackNumber: -1 };
      }
      copiedLayerKeyframes[0]?.keyframes.forEach((keyframe) => {
        const nextTime = timeDiff + keyframe.time;
        const keyframeIndex = findElementIndex(draft[0].keyframes, nextTime, 'time');
        if (keyframeIndex === -1) {
          draft[0].keyframes.push({ time: nextTime });
          draft[0].keyframes.sort((a, b) => a.time - b.time);
        }
      });
    });
  };
}

export default LayerKeyframeRepository;
