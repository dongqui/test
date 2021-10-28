import { EditorTrack, SelectedKeyframe } from 'types/TP_New/keyframe';
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

  private findEditorTrack = (editorTrackList: EditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const trackId = layerKeyframes.trackId;
    const selectedLayer: SelectedKeyframe = { trackNumber: -1, trackId, time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { boneKeyframes, selectedBoneKeyframes } = state;
    const { time, trackNumber } = payload.selectedKeyframes as SelectedKeyframe;
    const boneNumber = getBoneTrackIndex(trackNumber);
    const { trackId } = this.findEditorTrack(boneKeyframes, boneNumber);
    const selectedBone: SelectedKeyframe = { trackId, trackNumber: boneNumber, time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedBone]);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.filterKeyframeTimes(selectedTransformKeyframes, [
      selectedKeyframe,
    ]);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.addKeyframeTimes(selectedTransformKeyframes, [selectedKeyframe]);
  };

  public selectExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayer({ state, payload }),
      selectedBoneKeyframes: this.filterSelectedBone({ state, payload }),
      selectedTransformKeyframes: this.filterSelectedTransform({ state, payload }),
    };
  };

  public selectNotExistedByMultipleClick = ({ state, payload }: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes, selectedBoneKeyframes } = state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes,
      selectedTransformKeyframes: this.addTransformTimes({ state, payload }),
    };
  };
}

export default TransformKeyframeMultipleClick;
