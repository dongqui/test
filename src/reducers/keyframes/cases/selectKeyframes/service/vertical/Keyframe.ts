import { SelectedKeyframe } from 'types/TP/keyframe';
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
    const { trackId, trackNumber, trackType } = layerTrack;
    const selectedLayer: SelectedKeyframe[] = [];
    selectedLayer.push({ trackId, trackNumber, trackType, time: payload.time });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedLayer);
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { boneTrackList } = state;
    const selectedBones: SelectedKeyframe[] = [];
    boneTrackList.forEach((boneKeyframe) => {
      const { trackNumber, trackId, trackType } = boneKeyframe;
      selectedBones.push({ trackNumber, trackId, trackType, time: payload.time });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const selectedTransforms: SelectedKeyframe[] = [];
    propertyTrackList.forEach((transformKeyframe) => {
      const { trackNumber, trackType, trackId } = transformKeyframe;
      selectedTransforms.push({ trackNumber, trackType, trackId, time: payload.time });
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
