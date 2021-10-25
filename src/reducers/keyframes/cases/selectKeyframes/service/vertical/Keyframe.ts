import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { ClusterKeyframes } from '../Ancestor';
import { VerticalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class KeyframeVerticalSelection extends ClusterKeyframes implements VerticalSelection {
  private getLayerKeyframes = ({ state, payload }: Params) => {
    const { layerKeyframes } = state;
    const selectedLayer: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    selectedLayer.push({
      trackIndex: layerKeyframes.trackIndex,
      timeIndex: selectedKeyframe.timeIndex,
    });
    return this.initializeClusteredTimes(selectedLayer);
  };

  private getBoneKeyframes = ({ state, payload }: Params) => {
    const { boneKeyframes } = state;
    const selectedBones: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    boneKeyframes.forEach((keyframe) => {
      selectedBones.push({
        trackIndex: keyframe.trackIndex,
        timeIndex: selectedKeyframe.timeIndex,
      });
    });
    return this.initializeClusteredTimes(selectedBones);
  };

  private getTransformKeyframes = ({ state, payload }: Params) => {
    const { transformKeyframes } = state;
    const selectedTransforms: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    transformKeyframes.forEach((keyframe) => {
      selectedTransforms.push({
        trackIndex: keyframe.trackIndex,
        timeIndex: selectedKeyframe.timeIndex,
      });
    });
    return this.initializeClusteredTimes(selectedTransforms);
  };

  public selectByVertical = (payload: Params): AllSelectedKeyframes => {
    const { getLayerKeyframes, getBoneKeyframes, getTransformKeyframes } = this;
    return {
      selectedLayerKeyframes: getLayerKeyframes(payload),
      selectedBoneKeyframes: getBoneKeyframes(payload),
      selectedTransformKeyframes: getTransformKeyframes(payload),
    };
  };
}

export default KeyframeVerticalSelection;
