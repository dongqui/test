import { LayerIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP';
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
    const { layerId } = state.layerTrack;
    const selectedLayers: SelectedKeyframe<LayerIdentifier> = {
      time,
      trackType,
      trackNumber,
      layerId,
    };
    return this.clusterKeyframes.initializeClusterKeyframes([selectedLayers]);
  };

  private getSelectedBones = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedBones: SelectedKeyframe<BoneIdentifier>[] = [];
    state.boneTrackList.forEach((boneTrack) => {
      const { targetId, trackNumber, trackType } = boneTrack;
      selectedBones.push({ targetId, trackNumber, time, trackType });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Parmas) => {
    const { time } = payload;
    const selectedProperties: SelectedKeyframe<PropertyIdentifier>[] = [];
    state.propertyTrackList.forEach((propertyTrack) => {
      const { property, trackNumber, trackType } = propertyTrack;
      selectedProperties.push({ property, trackNumber, time, trackType });
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
