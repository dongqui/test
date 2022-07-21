import { SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';

interface Parmas {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeLeftClick implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findKeyframe = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    return keyframes[keyframeIndex];
  };

  private selectLayerKeyframes = ({ state, payload }: Parmas) => {
    const { time, trackType, trackNumber } = payload;
    const { trackId } = state.layerTrack;
    const selectedLayerKeyframe: SelectedKeyframe = { time, trackType, parentTrackNumber: -1, trackNumber, trackId };
    return this.clusterKeyframes.initializeClusterKeyframes([selectedLayerKeyframe]);
  };

  private selectBoneKeyframes = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedBoneKeyframes: SelectedKeyframe[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { trackId, trackNumber, trackType } = boneTrack;
      const keyframe = this.findKeyframe(boneTrack.keyframes, time);
      if (keyframe && !keyframe.isDeleted) selectedBoneKeyframes.push({ trackId, parentTrackNumber: -1, trackNumber, time, trackType });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBoneKeyframes);
  };

  private selectPropertyKeyframes = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedPropertyKeyframes: SelectedKeyframe[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { trackId, trackNumber, trackType, keyframes, parentTrackNumber } = propertyTrack;
      const keyframe = this.findKeyframe(keyframes, time);
      if (keyframe && !keyframe.isDeleted) {
        selectedPropertyKeyframes.push({ trackId, trackNumber, trackType, time, value: keyframe.value, parentTrackNumber });
      }
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedPropertyKeyframes);
  };

  selectByLeftClick = (payload: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.selectLayerKeyframes(payload),
      selectedBoneKeyframes: this.selectBoneKeyframes(payload),
      selectedPropertyKeyframes: this.selectPropertyKeyframes(payload),
    };
  };
}

export default LayerKeyframeLeftClick;
