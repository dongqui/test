import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { HorizontalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeHorizontal implements HorizontalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findTransformTrack = ({ state, payload }: Params) => {
    const { transformKeyframes } = state;
    const { trackNumber } = payload.selectedKeyframes as SelectedKeyframe;
    const trackIndex = findElementIndex(transformKeyframes, trackNumber, 'trackNumber');
    return transformKeyframes[trackIndex];
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const { trackNumber, keyframes, trackId } = this.findTransformTrack({ state, payload });
    keyframes.forEach((keyframe) => {
      selectedTransforms.push({ trackNumber, time: keyframe.time, trackId });
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  public selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedTransformKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default TransformKeyframeHorizontal;
