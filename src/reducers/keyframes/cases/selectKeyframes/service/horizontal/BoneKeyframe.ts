import { SelectedKeyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { KeyframesState } from 'reducers/keyframes';
import { SelectKeyframes } from 'actions/keyframes';

import { HorizontalSelection } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeHorizontal extends ClusterKeyframes implements HorizontalSelection {
  private getKeyframeTrack = (keyframes: TrackKeyframes[], trackIdnex: number) => {
    const trackIndex = this.findTrackIndex(keyframes, trackIdnex);
    return keyframes[trackIndex];
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const selectedBones: SelectedKeyframe[] = [];
    const boneIndex = (payload.selectedKeyframes as SelectedKeyframe).trackIndex as number;
    const { keyframes } = this.getKeyframeTrack(state.boneKeyframes, boneIndex);
    keyframes.forEach((keyframe) => {
      selectedBones.push({ trackIndex: boneIndex, timeIndex: keyframe.timeIndex });
    });
    return this.initializeClusteredTimes(selectedBones);
  };

  private getSelectedTransforms = ({ state, payload }: Params) => {
    const boneIndex = (payload.selectedKeyframes as SelectedKeyframe).trackIndex as number;
    const selectedTransforms: SelectedKeyframe[] = [];
    for (let index = boneIndex + 1; index <= boneIndex + 9; index++) {
      const { keyframes } = this.getKeyframeTrack(state.transformKeyframes, index);
      keyframes.forEach((keyframe) => {
        selectedTransforms.push({ trackIndex: index, timeIndex: keyframe.timeIndex });
      });
    }
    return this.initializeClusteredTimes(selectedTransforms);
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
