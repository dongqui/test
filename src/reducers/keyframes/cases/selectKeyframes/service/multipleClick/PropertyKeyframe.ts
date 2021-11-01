import { TrackIdentifier } from 'types/TP';
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

  private findEditorTrack = <T extends TrackIdentifier>(
    editorTrackList: TimeEditorTrack<T>[],
    trackNumber: number,
  ) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const { layerId, trackNumber, trackType } = layerTrack;
    const selectedLayer = { layerId, trackNumber, trackType, time: payload.time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { time, trackNumber } = payload;
    const boneNumber = getBoneTrackIndex(trackNumber);
    const { targetId, trackType } = this.findEditorTrack(boneTrackList, boneNumber);
    const selectedBone = { trackType, targetId, trackNumber: boneNumber, time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedBone]);
  };

  private filterSelectedProperty = ({ state, payload }: Params) => {
    const { propertyTrackList, selectedPropertyKeyframes } = state;
    const { trackNumber, trackType, time } = payload;
    const { property } = this.findEditorTrack(propertyTrackList, payload.trackNumber);
    const selectedKeyframe = { time, trackNumber, trackType, property };
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, [selectedKeyframe]);
  };

  private addPropertyTimes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes, propertyTrackList } = state;
    const { trackNumber, trackType, time } = payload;
    const { property } = this.findEditorTrack(propertyTrackList, payload.trackNumber);
    const selectedKeyframe = { time, trackNumber, trackType, property };
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
