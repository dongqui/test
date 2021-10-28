import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { LeftClick } from './index';

interface Parmas {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeLeftClick implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedLayers = (payload: SelectKeyframes) => {
    const selectedLayer = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.initializeClusterKeyframes([selectedLayer]);
  };

  private getSelectedBones = ({ state, payload }: Parmas) => {
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones: SelectedKeyframe[] = [];
    state.boneKeyframes.forEach((boneKeyframe) => {
      const { trackId, trackNumber } = boneKeyframe;
      selectedBones.push({ trackId, trackNumber, time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedTransforms = ({ state, payload }: Parmas) => {
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransforms: SelectedKeyframe[] = [];
    state.transformKeyframes.forEach((transformKeyframe) => {
      const { trackId, trackNumber } = transformKeyframe;
      selectedTransforms.push({ trackId, trackNumber, time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  public selectByLeftClick = ({ state, payload }: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(payload),
      selectedBoneKeyframes: this.getSelectedBones({ state, payload }),
      selectedTransformKeyframes: this.getSelectedTransforms({ state, payload }),
    };
  };
}

export default LayerKeyframeLeftClick;
