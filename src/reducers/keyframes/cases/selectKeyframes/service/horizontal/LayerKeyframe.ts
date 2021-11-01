import { LayerIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP';
import { SelectedKeyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { HorizontalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeHorizontal implements HorizontalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedLayers = ({ state }: Params) => {
    const { layerId, trackNumber, keyframes } = state.layerTrack;
    const selectedLayers: SelectedKeyframe<LayerIdentifier>[] = [];
    keyframes.forEach((keyframe) => {
      selectedLayers.push({ layerId, trackNumber, time: keyframe.time, trackType: 'layer' });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayers);
  };

  private getSelectedBones = ({ state }: Params) => {
    const selectedBones: SelectedKeyframe<BoneIdentifier>[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { keyframes, targetId, trackNumber } = boneTrack;
      keyframes.forEach((keyframe) => {
        selectedBones.push({ trackNumber, targetId, time: keyframe.time, trackType: 'bone' });
      });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state }: Params) => {
    const selectedTransforms: SelectedKeyframe<PropertyIdentifier>[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { keyframes, property, trackNumber } = propertyTrack;
      keyframes.forEach((keyframe) => {
        const { time } = keyframe;
        selectedTransforms.push({ trackNumber, property, time, trackType: 'property' });
      });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(params),
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedPropertyKeyframes: this.getSelectedProperties(params),
    };
  };
}

export default LayerKeyframeHorizontal;
