import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { HorizontalSelection } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeHorizontal extends ClusterKeyframes implements HorizontalSelection {
  private findTransformTrack = ({ state, payload }: Params) => {
    const { transformKeyframes } = state;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const transformIndex = selectedKeyframe.trackIndex as number;
    const trackIndex = this.findTrackIndex(transformKeyframes, transformIndex);
    return transformKeyframes[trackIndex];
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const { trackIndex, keyframes, trackId } = this.findTransformTrack({ state, payload });
    keyframes.forEach((keyframe) => {
      selectedTransforms.push({ trackIndex, timeIndex: keyframe.timeIndex, trackId });
    });
    return selectedTransforms;
  };

  private clusterSelectedTransforms = ({ state, payload }: Params) => {
    const selectedTransforms = this.getSelectedTransforms({ state, payload });
    return this.initializeClusteredTimes(selectedTransforms);
  };

  public selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedTransformKeyframes: this.clusterSelectedTransforms(params),
    };
  };
}

export default TransformKeyframeHorizontal;
