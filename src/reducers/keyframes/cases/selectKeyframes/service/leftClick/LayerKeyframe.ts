import { SelectedKeyframe } from 'types/TP/keyframe';
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

  private getSelectedLayers = ({ state, payload }: Parmas) => {
    const { time, trackType, trackNumber } = payload;
    const { trackId } = state.layerTrack;
    const selectedLayers: SelectedKeyframe = {
      time,
      trackType,
      trackNumber,
      trackId,
    };
    return this.clusterKeyframes.initializeClusterKeyframes([selectedLayers]);
  };

  private getSelectedBones = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedBones: SelectedKeyframe[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { trackId, trackNumber, trackType } = boneTrack;
      selectedBones.push({ trackId, trackNumber, time, trackType });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedProperties: SelectedKeyframe[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { trackId, trackNumber, trackType } = propertyTrack;
      selectedProperties.push({ trackId, trackNumber, time, trackType });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedProperties);
  };

  public selectByLeftClick = (payload: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(payload),
      selectedBoneKeyframes: this.getSelectedBones(payload),
      selectedPropertyKeyframes: this.getSelectedProperties(payload),
    };
  };
}

export default LayerKeyframeLeftClick;
