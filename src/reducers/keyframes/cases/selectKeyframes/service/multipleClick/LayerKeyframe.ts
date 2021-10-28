import { SelectedKeyframe, EditorTrack } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { MultipleClick } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeMultipleClick implements MultipleClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedBones = (boneTrackList: EditorTrack[], time: number) => {
    const selectedBones: SelectedKeyframe[] = [];
    boneTrackList.forEach((boneTrack) => {
      const { trackId, trackNumber } = boneTrack;
      selectedBones.push({ trackId, trackNumber, time });
    });
    return selectedBones;
  };

  private getSelectedTransforms = (transformTrackList: EditorTrack[], time: number) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    transformTrackList.forEach((transformTrack) => {
      const { trackId, trackNumber } = transformTrack;
      selectedTransforms.push({ trackId, trackNumber, time });
    });
    return selectedTransforms;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneKeyframes, selectedBoneKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones = this.getSelectedBones(boneKeyframes, time);
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { transformKeyframes, selectedTransformKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(transformKeyframes, time);
    return this.clusterKeyframes.filterKeyframeTimes(selectedTransformKeyframes, selectedTransform);
  };

  private addLayerTimes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.addKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { boneKeyframes, selectedBoneKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedBones = this.getSelectedBones(boneKeyframes, time);
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { transformKeyframes, selectedTransformKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransform = this.getSelectedTransforms(transformKeyframes, time);
    return this.clusterKeyframes.addKeyframeTimes(selectedTransformKeyframes, selectedTransform);
  };

  selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { filterSelectedLayer, filterSelectedBone, filterSelectedTransform } = this;
    return {
      selectedLayerKeyframes: filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: filterSelectedBone({ state, payload }),
      selectedTransformKeyframes: filterSelectedTransform({ state, payload }),
    };
  };

  selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { addLayerTimes, addBoneTimes, addTransformTimes } = this;
    return {
      selectedLayerKeyframes: addLayerTimes({ state, payload }),
      selectedBoneKeyframes: addBoneTimes({ state, payload }),
      selectedTransformKeyframes: addTransformTimes({ state, payload }),
    };
  };
}

export default LayerKeyframeMultipleClick;
