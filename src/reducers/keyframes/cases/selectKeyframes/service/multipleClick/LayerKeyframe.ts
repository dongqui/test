import { ClusteredTimes, SelectedKeyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { MultipleClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeMultipleClick extends ClusterKeyframes implements MultipleClick {
  private getSelectedBones = (keyframes: TrackKeyframes[], selected: SelectedKeyframe) => {
    const selectedBones: SelectedKeyframe[] = [];
    keyframes.forEach((keyframe) => {
      selectedBones.push({
        trackIndex: keyframe.trackIndex,
        timeIndex: selected.timeIndex,
      });
    });
    return selectedBones;
  };

  private getSelectedTransforms = (keyframes: TrackKeyframes[], selected: SelectedKeyframe) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    keyframes.forEach((keyframe) => {
      selectedTransforms.push({
        trackIndex: keyframe.trackIndex,
        timeIndex: selected.timeIndex,
      });
    });
    return selectedTransforms;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.filterTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneKeyframes, selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones = this.getSelectedBones(boneKeyframes, selectedKeyframe);
    return this.filterTimes(selectedBoneKeyframes, selectedBones);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { transformKeyframes, selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(transformKeyframes, selectedKeyframe);
    return this.filterTimes(selectedTransformKeyframes, selectedTransform);
  };

  private addLayerTimes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.addTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { boneKeyframes, selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones = this.getSelectedBones(boneKeyframes, selectedKeyframe);
    return this.addTimes(selectedBoneKeyframes, selectedBones);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { transformKeyframes, selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(transformKeyframes, selectedKeyframe);
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
    const { addLayerTimes, addBoneTimes, addTransformTimes } = this;
    return {
      selectedLayerKeyframes: addLayerTimes({ state, payload }),
      selectedBoneKeyframes: addBoneTimes({ state, payload }),
      selectedTransformKeyframes: addTransformTimes({ state, payload }),
    };
  };
}

export default LayerKeyframeMultipleClick;
