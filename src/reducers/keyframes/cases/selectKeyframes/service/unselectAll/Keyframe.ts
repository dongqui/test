import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { UnselectAll } from './index';

class KeyframesUnselectAll implements UnselectAll {
  public unselectAll = (): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedPropertyKeyframes: [],
    };
  };
}

export default KeyframesUnselectAll;
