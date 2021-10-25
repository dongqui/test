import { SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getTransformXIndex } from 'utils/TP';

import { LeftClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

class TransformKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private getSelectedTransforms = (payload: SelectKeyframes) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const transformXIndex = getTransformXIndex(selectedKeyframe.trackIndex as number);
    for (let index = transformXIndex; index < transformXIndex + 3; index++) {
      selectedTransforms.push({ timeIndex: selectedKeyframe.timeIndex, trackIndex: index });
    }
    return selectedTransforms;
  };

  private clusterTransformKeyframes = (payload: SelectKeyframes) => {
    const selectedTransforms = this.getSelectedTransforms(payload);
    return this.initializeClusteredTimes(selectedTransforms);
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
