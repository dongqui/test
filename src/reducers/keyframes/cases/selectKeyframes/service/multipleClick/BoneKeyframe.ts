import { TimeEditorTrack, SelectedKeyframe } from 'types/TP/keyframe';
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

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const { trackNumber, time } = payload;
    const selectedProperties: SelectedKeyframe[] = [];
    for (let propertyNum = trackNumber + 1; propertyNum <= trackNumber + 3; propertyNum++) {
      const { trackId, trackType } = this.findEditorTrack(propertyTrackList, propertyNum);
      selectedProperties.push({ trackNumber: propertyNum, time, trackId, trackType });
    }
    return selectedProperties;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerTrack } = state;
    const { time } = payload;
    const { trackId, trackType } = layerTrack;
    const selectedLayer = { trackNumber: -1, trackId, time, trackType };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    const selectedKeyframe = { ...payload, trackId };
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private filterSelectedProperties = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperties = this.getSelectedProperties({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(selectedPropertyKeyframes, selectedProperties);
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { boneTrackList, selectedBoneKeyframes } = state;
    const { trackId } = this.findEditorTrack(boneTrackList, payload.trackNumber);
    const selectedKeyframe = { ...payload, trackId };
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private addPropertyTimes = ({ state, payload }: Params) => {
    const { selectedPropertyKeyframes } = state;
    const selectedProperties = this.getSelectedProperties({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedPropertyKeyframes, selectedProperties);
  };

  selectExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayer(params),
      selectedBoneKeyframes: this.filterSelectedBone(params),
      selectedPropertyKeyframes: this.filterSelectedProperties(params),
    };
  };

  selectNotExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes } = params.state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes: this.addBoneTimes(params),
      selectedPropertyKeyframes: this.addPropertyTimes(params),
    };
  };
}

export default BoneKeyframeMultipleClick;
