import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { MultipleClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeMultipleClick extends ClusterKeyframes implements MultipleClick {
  private getSelectedTransforms = (selected: SelectedKeyframe) => {
    const transformKeyframes: SelectedKeyframe[] = [];
    const boneIndex = selected.trackIndex as number;
    for (let index = boneIndex + 1; index <= boneIndex + 3; index++) {
      transformKeyframes.push({
        trackIndex: index,
        timeIndex: selected.timeIndex,
      });
    }
    return transformKeyframes;
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
    return this.filterTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(selectedKeyframe);
    return this.filterTimes(selectedTransformKeyframes, selectedTransform);
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.addTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(selectedKeyframe);
    return this.addTimes(selectedTransformKeyframes, selectedTransform);
  };

  public selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { filterSelectedLayer, filterSelectedBone, filterSelectedTransform } = this;
    return {
      selectedLayerKeyframes: filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: filterSelectedBone({ state, payload }),
      selectedTransformKeyframes: filterSelectedTransform({ state, payload }),
    };
  };

  public selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: state.selectedLayerKeyframes,
      selectedBoneKeyframes: this.addBoneTimes({ state, payload }),
      selectedTransformKeyframes: this.addTransformTimes({ state, payload }),
    };
  };
}

export default BoneKeyframeMultipleClick;
