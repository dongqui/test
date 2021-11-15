import { TimeEditorTrack, SelectedKeyframe, Keyframe } from 'types/TP/keyframe';
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

class BoneKeyframeMultipleClick implements MultipleClick {
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

  private getSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { trackNumber, time } = payload;
    const selectedPropertyKeyframes: SelectedKeyframe[] = [];
    for (let propertyNumber = trackNumber + 1; propertyNumber <= trackNumber + 3; propertyNumber++) {
      const { trackId, trackType, keyframes } = this.findEditorTrack(state.propertyTrackList, propertyNumber);
      const keyframe = this.findKeyframe(keyframes, time);
      if (keyframe) {
        const { value, isDeleted } = keyframe;
        if (!isDeleted) selectedPropertyKeyframes.push({ trackNumber: propertyNumber, time, value, trackId, trackType });
      }
    }
    return selectedPropertyKeyframes;
  };

  private filterSelectedLayerKeyframes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const { time } = payload;
    const { trackId, trackType } = layerTrack;
    const selectedLayer = { trackNumber: -1, trackId, time, trackType };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    const selectedKeyframe = { ...payload, trackId };
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private filterSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperties = this.getSelectedPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, selectedProperties);
  };

  private addSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    const selectedKeyframe = { ...payload, trackId };
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private addSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperties = this.getSelectedPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, selectedProperties);
  };

  selectExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayerKeyframes(params),
      selectedBoneKeyframes: this.filterSelectedBoneKeyframes(params),
      selectedPropertyKeyframes: this.filterSelectedPropertyKeyframes(params),
    };
  };

  selectNotExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes } = params.state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes: this.addSelectedBoneKeyframes(params),
      selectedPropertyKeyframes: this.addSelectedPropertyKeyframes(params),
    };
  };
}

export default BoneKeyframeMultipleClick;
