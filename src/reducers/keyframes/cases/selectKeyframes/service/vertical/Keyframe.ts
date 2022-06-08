import { SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { VerticalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class KeyframeVerticalSelection implements VerticalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findKeyframe = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    return keyframes[keyframeIndex];
  };

  private getSelectedLayers = ({ state, payload }: Params) => {
    const { layerTrack } = state;
    const { trackId, trackNumber, trackType, keyframes, parentTrackNumber } = layerTrack;
    const selectedLayer: SelectedKeyframe[] = [];
    const keyframe = this.findKeyframe(keyframes, payload.time);
    if (keyframe && !keyframe.isDeleted) selectedLayer.push({ trackId, trackNumber, trackType, time: payload.time, parentTrackNumber });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayer);
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { boneTrackList } = state;
    const selectedBones: SelectedKeyframe[] = [];
    boneTrackList.forEach((boneKeyframe) => {
      const { trackNumber, trackId, trackType, keyframes, parentTrackNumber } = boneKeyframe;
      const keyframe = this.findKeyframe(keyframes, payload.time);
      if (keyframe && !keyframe.isDeleted) selectedBones.push({ trackNumber, trackId, trackType, time: payload.time, parentTrackNumber });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const selectedTransforms: SelectedKeyframe[] = [];
    propertyTrackList.forEach((transformKeyframe) => {
      const { trackNumber, trackType, trackId, keyframes, parentTrackNumber } = transformKeyframe;
      const keyframe = this.findKeyframe(keyframes, payload.time);
      if (keyframe) {
        const { value, isDeleted } = keyframe;
        if (!isDeleted) selectedTransforms.push({ trackNumber, trackType, trackId, time: payload.time, value, parentTrackNumber });
      }
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  selectByVertical = (payload: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(payload),
      selectedBoneKeyframes: this.getSelectedBones(payload),
      selectedPropertyKeyframes: this.getSelectedProperties(payload),
    };
  };
}

export default KeyframeVerticalSelection;
