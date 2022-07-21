import { SelectedKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { SelectKeyframes } from 'actions/keyframes';
import { findElementIndex } from 'utils/TP';

import { HorizontalSelection } from './index';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';

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
      const { time, isDeleted } = keyframe;
      if (!isDeleted) selectedBones.push({ trackNumber, time, parentTrackNumber: -1, trackId, trackType: 'bone' });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { trackNumber } = payload;
    const selectedProperties: SelectedKeyframe[] = [];
    const childTracks = findChildrenTracks(trackNumber, state.propertyTrackList);
    for (const childTrack of childTracks) {
      const { keyframes, trackId, trackType, parentTrackNumber } = childTrack;
      keyframes.forEach((keyframe) => {
        const { time, value, isDeleted } = keyframe;
        if (!isDeleted) selectedProperties.push({ trackNumber: childTrack.trackNumber, trackId, time, value, trackType, parentTrackNumber });
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
