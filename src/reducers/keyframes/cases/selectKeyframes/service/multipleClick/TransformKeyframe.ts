import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getBoneTrackIndex, getTransformXIndex } from 'utils/TP';

import { MultipleClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeMultipleClick extends ClusterKeyframes implements MultipleClick {
  private getSelectedTransforms = (payload: SelectKeyframes) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const transformXIndex = getTransformXIndex(selectedKeyframe.trackIndex as number);
    for (let index = transformXIndex; index < transformXIndex + 3; index++) {
      selectedTransforms.push({ timeIndex: selectedKeyframe.timeIndex, trackIndex: index });
    }
    return selectedTransforms;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const layerId = layerKeyframes.trackIndex;
    const layerSelected: SelectedKeyframe = {
      trackIndex: layerId,
      timeIndex: selectedKeyframe.timeIndex,
    };
    return this.filterTimes(selectedLayerKeyframes, [layerSelected]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const boneIndex = getBoneTrackIndex(selectedKeyframe.trackIndex as number);
    const boneSelected: SelectedKeyframe = {
      timeIndex: selectedKeyframe.timeIndex,
      trackIndex: boneIndex,
    };
    return this.filterTimes(selectedBoneKeyframes, [boneSelected]);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = this.getSelectedTransforms(payload);
    return this.filterTimes(selectedTransformKeyframes, selectedKeyframe);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = this.getSelectedTransforms(payload);
    return this.addTimes(selectedTransformKeyframes, selectedKeyframe);
  };

  public selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: this.filterSelectedBone({ state, payload }),
      selectedTransformKeyframes: this.filterSelectedTransform({ state, payload }),
    };
  };

  public selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes, selectedBoneKeyframes } = state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes,
      selectedTransformKeyframes: this.addTransformTimes({ state, payload }),
    };
  };
}

export default TransformKeyframeMultipleClick;
