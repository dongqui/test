import { TimeEditorTrack } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex, getBoneTrackIndex } from 'utils/TP';

import { MultipleClick } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeMultipleClick implements MultipleClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = (editorTrackList: TimeEditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const { trackId, trackNumber, trackType } = layerTrack;
    const selectedLayer = { trackId, trackNumber, trackType, time: payload.time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { time, trackNumber } = payload;
    const boneNumber = getBoneTrackIndex(trackNumber);
    const { trackId, trackType } = this.findEditorTrack(boneTrackList, boneNumber);
    const selectedBone = { trackType, trackId, trackNumber: boneNumber, time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedBone]);
  };

  private filterSelectedProperty = ({ state, payload }: Params) => {
    const { propertyTrackList, selectedPropertyKeyframes } = state;
    const { trackNumber, trackType, time } = payload;
    const { trackId } = this.findEditorTrack(propertyTrackList, payload.trackNumber);
    const selectedKeyframe = { time, trackNumber, trackType, trackId };
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, [selectedKeyframe]);
  };

  private addPropertyTimes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes, propertyTrackList } = state;
    const { trackNumber, trackType, time } = payload;
    const { trackId } = this.findEditorTrack(propertyTrackList, payload.trackNumber);
    const selectedKeyframe = { time, trackNumber, trackType, trackId };
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, [selectedKeyframe]);
  };

  public selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: this.filterSelectedBone({ state, payload }),
      selectedPropertyKeyframes: this.filterSelectedProperty({ state, payload }),
    };
  };

  public selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes, selectedBoneKeyframes } = state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes,
      selectedPropertyKeyframes: this.addPropertyTimes({ state, payload }),
    };
  };
}

export default TransformKeyframeMultipleClick;
