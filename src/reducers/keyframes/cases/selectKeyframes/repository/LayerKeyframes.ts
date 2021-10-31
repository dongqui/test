import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';

import { Repository, Common } from './index';

type LayerKeyframes = Pick<AllKeyframes, 'layerKeyframes'>;
type SelectedLayerKeyframes = Pick<AllSelectedKeyframes, 'selectedLayerKeyframes'>;

class LayerKeyframesRepository extends Common implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    super();
    this.state = state;
  }

  private updateLayerKeyframes = (next: SelectedLayerKeyframes) => {
    const { layerKeyframes, selectedLayerKeyframes } = this.state;
    return produce(layerKeyframes, (draft) => {
      selectedLayerKeyframes.forEach((selectedKeyframe) => {
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(layerKeyframes.keyframes, time);
          const layerKeyframe = draft.keyframes[timeIndex];
          layerKeyframe.isSelected = false;
        });
      });
      next.selectedLayerKeyframes.forEach((selectedKeyframe) => {
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(layerKeyframes.keyframes, time);
          const layerKeyframe = draft.keyframes[timeIndex];
          layerKeyframe.isSelected = true;
        });
      });
    });
  };

  public updateKeyframes = (next: AllSelectedKeyframes): LayerKeyframes => {
    const layerKeyframes = this.updateLayerKeyframes(next);
    return { layerKeyframes };
  };

  public updateState = (newValues: Partial<KeyframesState>) => {
    return this.updateStateObject(this.state, newValues);
  };
}

export default LayerKeyframesRepository;
