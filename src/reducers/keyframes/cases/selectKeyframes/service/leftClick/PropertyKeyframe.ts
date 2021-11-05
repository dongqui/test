import { SelectedKeyframe, TimeEditorTrack, Keyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';

interface Parmas {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class PropertyKeyframeLeftClick implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = (editorTrackList: TimeEditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private findKeyframeValue = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = findElementIndex(keyframes, time, 'time');
    return keyframes[keyframeIndex].value;
  };

  private getSelectedTransforms = ({ state, payload }: Parmas) => {
    const { time, trackNumber, trackType } = payload;
    const { trackId, keyframes } = this.findEditorTrack(state.propertyTrackList, trackNumber);
    console.log('keyframes', keyframes);
    const value = this.findKeyframeValue(keyframes, time);
    const selectedKeyframes: SelectedKeyframe = { time, trackNumber, trackType, trackId, value };
    return this.clusterKeyframes.initializeClusterKeyframes([selectedKeyframes]);
  };

  selectByLeftClick = (params: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedPropertyKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default PropertyKeyframeLeftClick;
