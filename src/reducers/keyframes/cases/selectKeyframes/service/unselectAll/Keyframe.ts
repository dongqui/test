import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { UnselectAll } from './index';

class KeyframesUnselectAll implements UnselectAll {
  public unselectAll = (): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedTransformKeyframes: [],
    };
  };
}

export default KeyframesUnselectAll;
