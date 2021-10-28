import { EditorTrack, SelectedKeyframe } from 'types/TP_New/keyframe';
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

  private findEditorTrack = (editorTrackList: EditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedBones = ({ payload }: Params) => {
    const selectedBones = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.initializeClusterKeyframes([selectedBones]);
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const { trackNumber, time } = payload.selectedKeyframes as SelectedKeyframe;
    const selectedTransforms: SelectedKeyframe[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { trackId } = this.findEditorTrack(state.transformKeyframes, transform);
      selectedTransforms.push({ trackNumber: transform, trackId, time });
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  selectByLeftClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedTransformKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default BoneKeyframeLeftClick;
