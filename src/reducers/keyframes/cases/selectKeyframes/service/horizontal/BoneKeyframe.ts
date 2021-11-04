import { SelectedKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { SelectKeyframes } from 'actions/keyframes';
import { findElementIndex } from 'utils/TP';

import { HorizontalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeHorizontal implements HorizontalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findTrack = (editorTrackList: TimeEditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    const { trackNumber } = payload;
    const { keyframes, trackId } = this.findTrack(state.boneTrackList, trackNumber);
    keyframes.forEach((keyframe) => {
      const { time } = keyframe;
      selectedBones.push({ trackNumber, time, trackId, trackType: 'bone' });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { trackNumber } = payload;
    const selectedProperties: SelectedKeyframe[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { keyframes, trackId, trackType } = this.findTrack(state.propertyTrackList, transform);
      keyframes.forEach((keyframe) => {
        const { time, value } = keyframe;
        selectedProperties.push({ trackNumber: transform, trackId, time, value, trackType });
      });
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedProperties);
  };

  selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedPropertyKeyframes: this.getSelectedProperties(params),
    };
  };
}

export default BoneKeyframeHorizontal;
