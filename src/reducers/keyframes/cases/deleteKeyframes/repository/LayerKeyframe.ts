import produce from 'immer';

import { Keyframe } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

type LayerKeyframes = Pick<AllKeyframes, 'layerKeyframes'>;
type SelectedLayerKeyframes = Pick<AllSelectedKeyframes, 'selectedLayerKeyframes'>;

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private findKeyframeIndex = (time: number) => {
    const { layerKeyframes } = this.state;
    const keyframeIndex = getBinarySearch<Keyframe>({
      collection: layerKeyframes.keyframes,
      index: time,
      key: 'timeIndex',
    });
    return keyframeIndex;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteLayerKeyframes = () => {
    const { layerKeyframes, selectedLayerKeyframes } = this.state;
    return produce(layerKeyframes, (draft) => {
      selectedLayerKeyframes.forEach((selectedKeyframe) => {
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findKeyframeIndex(time);
          draft.keyframes[timeIndex].isDeleted = true;
        });
      });
    });
  };

  // 선택 된 layer keyframes 리스트 초기화
  public clearSeletedKeyframes = (): SelectedLayerKeyframes => {
    return {
      selectedLayerKeyframes: [],
    };
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (): LayerKeyframes => {
    return {
      layerKeyframes: this.deleteLayerKeyframes(),
    };
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default LayerKeyframeRepository;
