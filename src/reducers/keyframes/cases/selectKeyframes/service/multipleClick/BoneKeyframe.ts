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

  private selectPropertyKeyframes = ({ state, payload }: Params) => {
    const { trackNumber, time } = payload;
    const selectedPropertyKeyframes: SelectedKeyframe[] = [];
    for (let propertyNumber = trackNumber + 1; propertyNumber <= trackNumber + 3; propertyNumber++) {
      const { trackId, trackType, keyframes } = this.findEditorTrack(state.propertyTrackList, propertyNumber);
      const keyframe = this.findKeyframe(keyframes, time);
      if (keyframe && !keyframe.isDeleted) {
        selectedPropertyKeyframes.push({ trackNumber: propertyNumber, trackType, trackId, time, value: keyframe.value });
      }
    }
    return selectedPropertyKeyframes;
  };

  private filterSelectedLayerKeyframes = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const { time } = payload;
    const { trackId, trackType } = layerTrack;
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [{ trackNumber: -1, trackId, time, trackType }]);
  };

  private filterSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [{ ...payload, trackId }]);
  };

  private filterSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const filteredPropertyKeyframes = this.selectPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, filteredPropertyKeyframes);
  };

  private addSelectedBoneKeyframes = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, [{ ...payload, trackId }]);
  };

  private addSelectedPropertyKeyframes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const addedPropertyKeyframes = this.selectPropertyKeyframes({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, addedPropertyKeyframes);
  };

  selectExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayerKeyframes(params),
      selectedBoneKeyframes: this.filterSelectedBoneKeyframes(params),
      selectedPropertyKeyframes: this.filterSelectedPropertyKeyframes(params),
    };
  };

  selectNotExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: params.state.selectedLayerKeyframes,
      selectedBoneKeyframes: this.addSelectedBoneKeyframes(params),
      selectedPropertyKeyframes: this.addSelectedPropertyKeyframes(params),
    };
  };
}

export default BoneKeyframeMultipleClick;
