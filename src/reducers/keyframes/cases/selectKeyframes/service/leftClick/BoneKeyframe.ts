import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { LeftClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

class BoneKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private getTransformKeyframes = (boneKeyframe: SelectedKeyframe) => {
    const boneIndex = boneKeyframe.trackIndex as number;
    const transformKeyframes: SelectedKeyframe[] = [];
    for (let index = boneIndex + 1; index <= boneIndex + 9; index++) {
      transformKeyframes.push({
        timeIndex: boneKeyframe.timeIndex,
        trackIndex: index,
      });
    }
    return transformKeyframes;
  };

  private clusterBoneKeyframes = (payload: SelectKeyframes) => {
    const selectedKeyframes = payload.selectedKeyframes as SelectedKeyframe;
    return this.initializeClusteredTimes([selectedKeyframes]);
  };

  private clusterTransformKeyframes = (payload: SelectKeyframes) => {
    const { initializeClusteredTimes, getTransformKeyframes } = this;
    const selectedKeyframes = payload.selectedKeyframes as SelectedKeyframe;
    return initializeClusteredTimes(getTransformKeyframes(selectedKeyframes));
  };

  public selectByLeftClick = ({ payload }: { payload: SelectKeyframes }): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.clusterBoneKeyframes(payload),
      selectedTransformKeyframes: this.clusterTransformKeyframes(payload),
    };
  };
}

export default BoneKeyframeLeftClick;
