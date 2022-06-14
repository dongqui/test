import { TimeEditorTrack, SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = (editorTrackList: TimeEditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private findKeyframe = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    return keyframes[keyframeIndex];
  };

  private selectBoneKeyframes = ({ state, payload }: Params) => {
    const { trackId } = this.findEditorTrack(state.boneTrackList, payload.trackNumber);
    const selectedBoneKeyframes: SelectedKeyframe[] = [{ ...payload, trackId }];
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBoneKeyframes);
  };

  private selectPropertyKeyframes = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const { trackNumber, time } = payload;
    const selectedPropertyKeyframes: SelectedKeyframe[] = [];
    const childTracks = findChildrenTracks(trackNumber, propertyTrackList);
    for (const childTrack of childTracks) {
      const propertyNumber = childTrack.trackNumber;
      const { trackId, keyframes, trackType, parentTrackNumber } = childTrack;
      const keyframe = this.findKeyframe(keyframes, payload.time);
      if (keyframe && !keyframe.isDeleted) {
        selectedPropertyKeyframes.push({ trackNumber: propertyNumber, trackId, time, value: keyframe.value, trackType, parentTrackNumber });
      }
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedPropertyKeyframes);
  };

  selectByLeftClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.selectBoneKeyframes(params),
      selectedPropertyKeyframes: this.selectPropertyKeyframes(params),
    };
  };
}

export default BoneKeyframeLeftClick;
