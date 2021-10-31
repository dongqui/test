import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { HorizontalSelection } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeHorizontal extends ClusterKeyframes implements HorizontalSelection {
  private getSelectedLayers = ({ state }: Params) => {
    const selectedLayers: SelectedKeyframe[] = [];
    const layerId = state.layerKeyframes.trackIndex;
    state.layerKeyframes.keyframes.forEach((keyframe) => {
      selectedLayers.push({ trackIndex: layerId, timeIndex: keyframe.timeIndex });
    });
    return this.initializeClusteredTimes(selectedLayers);
  };

  private getSelectedBones = ({ state }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    state.boneKeyframes.forEach((boneKeyframe) => {
      boneKeyframe.keyframes.forEach((keyframe) => {
        selectedBones.push({ trackIndex: boneKeyframe.trackIndex, timeIndex: keyframe.timeIndex });
      });
    });
    return this.initializeClusteredTimes(selectedBones);
  };

  private getSelectedTransforms = ({ state }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    state.transformKeyframes.forEach(({ trackIndex, keyframes }) => {
      keyframes.forEach((keyframe) => {
        selectedTransforms.push({ trackIndex, timeIndex: keyframe.timeIndex });
      });
    });
    return this.initializeClusteredTimes(selectedTransforms);
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
