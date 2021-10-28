import { EditorTrack, SelectedKeyframe } from 'types/TP_New/keyframe';
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

  private findEditorTrack = (editorTrackList: EditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const { transformKeyframes } = state;
    const { trackNumber, time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransforms: SelectedKeyframe[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { trackId } = this.findEditorTrack(transformKeyframes, transform);
      selectedTransforms.push({ trackNumber: transform, trackId, time });
    }
    return selectedTransforms;
  };

  private filterSelectedLayer = ({ state, payload }: Params) => {
    const { selectedLayerKeyframes, layerKeyframes } = state;
    const { time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedLayer = { trackNumber: -1, trackId: layerKeyframes.trackId, time };
    return this.clusterKeyframes.filterKeyframeTimes(selectedLayerKeyframes, [selectedLayer]);
  };

  private filterSelectedBone = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.filterKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private filterSelectedTransform = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedTransforms = this.getSelectedTransforms({ state, payload });
    return this.clusterKeyframes.filterKeyframeTimes(
      selectedTransformKeyframes,
      selectedTransforms,
    );
  };

  private addBoneTimes = ({ state, payload }: Params) => {
    const { selectedBoneKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.addKeyframeTimes(selectedBoneKeyframes, [selectedKeyframe]);
  };

  private addTransformTimes = ({ state, payload }: Params) => {
    const { selectedTransformKeyframes } = state;
    const selectedTransform = this.getSelectedTransforms({ state, payload });
    return this.clusterKeyframes.addKeyframeTimes(selectedTransformKeyframes, selectedTransform);
  };

  selectExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.filterSelectedLayer(params),
      selectedBoneKeyframes: this.filterSelectedBone(params),
      selectedTransformKeyframes: this.filterSelectedTransform(params),
    };
  };

  selectNotExistedByMultipleClick = (params: Params): AllSelectedKeyframes => {
    const { selectedLayerKeyframes } = params.state;
    return {
      selectedLayerKeyframes,
      selectedBoneKeyframes: this.addBoneTimes(params),
      selectedTransformKeyframes: this.addTransformTimes(params),
    };
  };
}

export default BoneKeyframeMultipleClick;
