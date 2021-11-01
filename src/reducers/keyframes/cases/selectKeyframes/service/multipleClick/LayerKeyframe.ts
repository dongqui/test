import { BoneIdentifier, PropertyIdentifier } from 'types/TP_New';
import { SelectedKeyframe } from 'types/TP_New/keyframe';
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

  private getSelectedBones = ({ state, payload }: Params) => {
    const selectedBones: SelectedKeyframe<BoneIdentifier>[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { targetId, trackNumber, trackType } = boneTrack;
      selectedBones.push({ targetId, trackNumber, trackType, time: payload.time });
    });
    return selectedBones;
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const selectedPropertiess: SelectedKeyframe<PropertyIdentifier>[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { trackType, property, trackNumber } = propertyTrack;
      selectedPropertiess.push({ trackNumber, trackType, property, time: payload.time });
    });
    return selectedPropertiess;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const layerId = layerTrack.layerId;
    const selectedKeyframe = { ...payload, layerId };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedBones = this.getSelectedBones({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private filterSelectedProperty = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperty = this.getSelectedProperties({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, selectedProperty);
  };

  private addLayerTimes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const layerId = layerTrack.layerId;
    const selectedKeyframe = { ...payload, layerId };
    return this.clusterKeyframes.addKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedBones = this.getSelectedBones({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private addPropertyTimes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperty = this.getSelectedProperties({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, selectedProperty);
  };

  selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { filterSelectedLayer, filterSelectedBone, filterSelectedProperty } = this;
    return {
      selectedLayerKeyframes: filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: filterSelectedBone({ state, payload }),
      selectedPropertyKeyframes: filterSelectedProperty({ state, payload }),
    };
  };

  selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { addLayerTimes, addBoneTimes, addPropertyTimes } = this;
    return {
      selectedLayerKeyframes: addLayerTimes({ state, payload }),
      selectedBoneKeyframes: addBoneTimes({ state, payload }),
      selectedPropertyKeyframes: addPropertyTimes({ state, payload }),
    };
  };
}

export default LayerKeyframeMultipleClick;
