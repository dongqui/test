import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { LeftClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

class TransformKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private clusterTransformKeyframes = (payload: SelectKeyframes) => {
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.initializeClusteredTimes([selectedKeyframe]);
  };

  public selectByLeftClick = ({ payload }: { payload: SelectKeyframes }): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedTransformKeyframes: this.clusterTransformKeyframes(payload),
    };
  };
}

export default TransformKeyframeLeftClick;
