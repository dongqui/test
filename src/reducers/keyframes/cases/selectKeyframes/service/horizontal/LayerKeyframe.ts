import { SelectedKeyframe } from 'types/TP_New/keyframe';
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
    const { trackId, trackNumber, keyframes } = state.layerKeyframes;
    const selectedLayers: SelectedKeyframe[] = [];
    keyframes.forEach((keyframe) => {
      selectedLayers.push({ trackId, trackNumber, time: keyframe.time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayers);
  };

  private getSelectedBones = ({ state }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    state.boneKeyframes.forEach((boneKeyframe) => {
      const { keyframes, trackId, trackNumber } = boneKeyframe;
      keyframes.forEach((keyframe) => {
        selectedBones.push({ trackNumber, trackId, time: keyframe.time });
      });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedTransforms = ({ state }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    state.transformKeyframes.forEach((transformKeyframe) => {
      const { keyframes, trackId, trackNumber } = transformKeyframe;
      keyframes.forEach((keyframe) => {
        selectedTransforms.push({ trackNumber, trackId, time: keyframe.time });
      });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(params),
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedTransformKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default LayerKeyframeHorizontal;
