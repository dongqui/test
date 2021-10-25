import { SelectedKeyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

import { LeftClick } from './index';
import { ClusterKeyframes } from '../Ancestor';

interface Parmas {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class LayerKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private clusterLayerKeyframe = (payload: SelectKeyframes) => {
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    return this.initializeClusteredTimes([selectedKeyframe]);
  };

  private clusterBoneKeyframe = ({ state, payload }: Parmas) => {
    const { boneKeyframes } = state;
    const { getSelectedKeyframes, initializeClusteredTimes } = this;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const timeIndex = selectedKeyframe.timeIndex;
    return initializeClusteredTimes(getSelectedKeyframes(boneKeyframes, timeIndex));
  };

  private clusterTransformKeyframe = ({ state, payload }: Parmas) => {
    const { transformKeyframes } = state;
    const { getSelectedKeyframes, initializeClusteredTimes } = this;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const timeIndex = selectedKeyframe.timeIndex;
    return initializeClusteredTimes(getSelectedKeyframes(transformKeyframes, timeIndex));
  };

  private getSelectedKeyframes = (trackKeyframes: TrackKeyframes[], timeIndex: number) => {
    const selectedKeyframes: SelectedKeyframe[] = [];
    trackKeyframes.forEach((keyframe) => {
      selectedKeyframes.push({ trackIndex: keyframe.trackIndex, timeIndex });
    });
    return selectedKeyframes;
  };

  public selectByLeftClick = ({ state, payload }: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: this.clusterLayerKeyframe(payload),
      selectedBoneKeyframes: this.clusterBoneKeyframe({ state, payload }),
      selectedTransformKeyframes: this.clusterTransformKeyframe({ state, payload }),
    };
  };
}

export default LayerKeyframeLeftClick;
