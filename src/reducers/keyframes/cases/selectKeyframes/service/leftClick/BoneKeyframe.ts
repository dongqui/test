import { TimeEditorTrack, SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';

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

  private findKeyframeValue = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    return keyframes[keyframeIndex].value;
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { trackId } = this.findEditorTrack(state.boneTrackList, payload.trackNumber);
    const selectedBones: SelectedKeyframe[] = [{ ...payload, trackId }];
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const { trackNumber, time } = payload;
    const selectedProperties: SelectedKeyframe[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { trackId, keyframes, trackType } = this.findEditorTrack(propertyTrackList, transform);
      const value = this.findKeyframeValue(keyframes, payload.time);
      selectedProperties.push({ trackNumber: transform, trackId, time, value, trackType });
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedProperties);
  };

  selectByLeftClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedPropertyKeyframes: this.getSelectedProperties(params),
    };
  };
}

export default BoneKeyframeLeftClick;
