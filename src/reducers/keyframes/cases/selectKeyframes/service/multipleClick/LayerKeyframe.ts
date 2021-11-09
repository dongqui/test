import { SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { MultipleClick } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeMultipleClick implements MultipleClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findKeyframeValue = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    return keyframes[keyframeIndex].value;
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { trackId, trackNumber, trackType, keyframes } = boneTrack;
      const value = this.findKeyframeValue(keyframes, payload.time);
      if (value) {
        selectedBones.push({ trackId, trackNumber, trackType, time: payload.time, value });
      }
    });
    return selectedBones;
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const selectedPropertiess: SelectedKeyframe[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { trackType, trackId, trackNumber } = propertyTrack;
      selectedPropertiess.push({ trackNumber, trackType, trackId, time: payload.time });
    });
    return selectedPropertiess;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const selectedKeyframe = { ...payload, trackId: layerTrack.trackId };
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
    const selectedKeyframe = { ...payload, trackId: layerTrack.trackId };
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
