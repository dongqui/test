import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { VerticalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class KeyframeVerticalSelection implements VerticalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedLayers = ({ state, payload }: Params) => {
    const { layerKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedLayer: SelectedKeyframe[] = [];
    selectedLayer.push({ trackId: layerKeyframes.trackId, trackNumber: -1, time });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayer);
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { boneKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones: SelectedKeyframe[] = [];
    boneKeyframes.forEach((boneKeyframe) => {
      const { trackNumber, trackId } = boneKeyframe;
      selectedBones.push({ trackNumber, trackId, time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const { transformKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransforms: SelectedKeyframe[] = [];
    transformKeyframes.forEach((transformKeyframe) => {
      const { trackNumber, trackId } = transformKeyframe;
      selectedTransforms.push({ trackNumber, trackId, time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  public selectByVertical = (payload: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(payload),
      selectedBoneKeyframes: this.getSelectedBones(payload),
      selectedTransformKeyframes: this.getSelectedTransforms(payload),
    };
  };
}

export default KeyframeVerticalSelection;
