import { SelectedKeyframe, EditorTrack } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { SelectKeyframes } from 'actions/keyframes';
import { findElementIndex } from 'utils/TP';

import { HorizontalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeHorizontal implements HorizontalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = (editorTrackList: EditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    const { trackId, trackNumber } = payload.selectedKeyframes as SelectedKeyframe;
    const { keyframes } = this.findEditorTrack(state.boneKeyframes, trackNumber);
    keyframes.forEach((keyframe) => {
      const { time } = keyframe;
      selectedBones.push({ trackNumber, time, trackId });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const { trackNumber } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransforms: SelectedKeyframe[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { keyframes, trackId } = this.findEditorTrack(state.transformKeyframes, transform);
      keyframes.forEach((keyframe) => {
        const { time } = keyframe;
        selectedTransforms.push({ trackNumber: transform, time, trackId });
      });
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedTransformKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default BoneKeyframeHorizontal;
