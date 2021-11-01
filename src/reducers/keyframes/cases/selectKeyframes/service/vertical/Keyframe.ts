import { LayerIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP_New';
import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { VerticalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class KeyframeVerticalSelection implements VerticalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedLayers = ({ state, payload }: Params) => {
    const { layerTrack } = state;
    const { layerId, trackNumber, trackType } = layerTrack;
    const selectedLayer: SelectedKeyframe<LayerIdentifier>[] = [];
    selectedLayer.push({ layerId, trackNumber, trackType, time: payload.time });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayer);
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { boneTrackList } = state;
    const selectedBones: SelectedKeyframe<BoneIdentifier>[] = [];
    boneTrackList.forEach((boneKeyframe) => {
      const { trackNumber, targetId, trackType } = boneKeyframe;
      selectedBones.push({ trackNumber, targetId, trackType, time: payload.time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const selectedTransforms: SelectedKeyframe<PropertyIdentifier>[] = [];
    propertyTrackList.forEach((transformKeyframe) => {
      const { trackNumber, trackType, property } = transformKeyframe;
      selectedTransforms.push({ trackNumber, trackType, property, time: payload.time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  public selectByVertical = (payload: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.getSelectedLayers(payload),
      selectedBoneKeyframes: this.getSelectedBones(payload),
      selectedPropertyKeyframes: this.getSelectedProperties(payload),
    };
  };
}

export default KeyframeVerticalSelection;
