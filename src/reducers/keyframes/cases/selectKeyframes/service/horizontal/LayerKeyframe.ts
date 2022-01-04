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
    const { trackId, trackNumber, keyframes } = state.layerTrack;
    const selectedLayers: SelectedKeyframe[] = [];
    keyframes.forEach((keyframe) => {
      const { time, isDeleted } = keyframe;
      if (!isDeleted) selectedLayers.push({ trackId, trackNumber, time, trackType: 'layer' });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayers);
  };

  private getSelectedBones = ({ state }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { keyframes, trackId, trackNumber } = boneTrack;
      keyframes.forEach((keyframe) => {
        const { time, isDeleted } = keyframe;
        if (!isDeleted) selectedBones.push({ trackNumber, trackId, time, trackType: 'bone' });
      });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { keyframes, trackId, trackNumber, trackType } = propertyTrack;
      keyframes.forEach((keyframe) => {
        const { time, value, isDeleted } = keyframe;
        if (!isDeleted) selectedTransforms.push({ trackNumber, trackId, time, value, trackType });
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
