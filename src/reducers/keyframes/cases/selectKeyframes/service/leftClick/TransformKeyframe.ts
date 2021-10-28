import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';

import { LeftClick } from './index';

class TransformKeyframeLeftClick implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private getSelectedTransforms = (payload: SelectKeyframes) => {
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.clusterKeyframes.initializeClusterKeyframes([selectedKeyframe]);
  };

  public selectByLeftClick = ({ payload }: { payload: SelectKeyframes }): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedTransformKeyframes: this.getSelectedTransforms(payload),
    };
  };
}

export default TransformKeyframeLeftClick;
