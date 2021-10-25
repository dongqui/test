import { SelectedKeyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getTransformXIndex } from 'utils/TP';

import { HorizontalSelection } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeHorizontal extends ClusterKeyframes implements HorizontalSelection {
  private findTransformTrack = (keyframes: TrackKeyframes[], trackId: number) => {
    const trackIndex = this.findTrackIndex(keyframes, trackId);
    return keyframes[trackIndex];
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const transformXIndex = getTransformXIndex(selectedKeyframe.trackIndex as number);
    for (let index = transformXIndex; index < transformXIndex + 3; index++) {
      const { trackIndex, keyframes } = this.findTransformTrack(state.transformKeyframes, index);
      keyframes.forEach((keyframe) => {
        selectedTransforms.push({ trackIndex, timeIndex: keyframe.timeIndex });
      });
    }
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
