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

  private findKeyframe = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    return keyframes[keyframeIndex];
  };

  private getSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const selectedBoneKeyframes: SelectedKeyframe[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { trackId, trackNumber, trackType, keyframes } = boneTrack;
      const keyframe = this.findKeyframe(keyframes, payload.time);
      if (keyframe && !keyframe.isDeleted) selectedBoneKeyframes.push({ trackId, trackNumber, trackType, time: payload.time });
    });
    return selectedBoneKeyframes;
  };

  private getSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const selectedPropertyKeyframes: SelectedKeyframe[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { trackType, trackId, trackNumber, keyframes } = propertyTrack;
      const keyframe = this.findKeyframe(keyframes, payload.time);
      if (keyframe) {
        const { isDeleted, value } = keyframe;
        if (!isDeleted) selectedPropertyKeyframes.push({ trackNumber, trackType, trackId, time: payload.time, value });
      }
    });
    return selectedPropertyKeyframes;
  };

  private filterSelectedLayerKeyframes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const selectedKeyframe = { ...payload, trackId: layerTrack.trackId };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private filterSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedBones = this.getSelectedBoneKeyframes({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private filterSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperty = this.getSelectedPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, selectedProperty);
  };

  private addSelectedLayerKeyframes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const selectedKeyframe = { ...payload, trackId: layerTrack.trackId };
    return this.clusterKeyframes.addKeyframeTimes(selectedLayerKeyframes, [selectedKeyframe]);
  };

  private addSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedBones = this.getSelectedBoneKeyframes({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, selectedBones);
  };

  private addSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperty = this.getSelectedPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, selectedProperty);
  };

  selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayerKeyframes({ state, payload }),
      selectedBoneKeyframes: this.filterSelectedBoneKeyframes({ state, payload }),
      selectedPropertyKeyframes: this.filterSelectedPropertyKeyframes({ state, payload }),
    };
  };

  selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.addSelectedLayerKeyframes({ state, payload }),
      selectedBoneKeyframes: this.addSelectedBoneKeyframes({ state, payload }),
      selectedPropertyKeyframes: this.addSelectedPropertyKeyframes({ state, payload }),
    };
  };
}

export default LayerKeyframeMultipleClick;
