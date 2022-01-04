import produce from 'immer';

import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 선택 된 keyframes 삭제
  deleteSeletedKeyframes = () => {
    const { propertyTrackList, selectedPropertyKeyframes } = this.state;
    return produce(propertyTrackList, (draft) => {
      selectedPropertyKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, keyframes } = selectedKeyframe;
        const trackIndex = findElementIndex(propertyTrackList, trackNumber, 'trackNumber');
        keyframes.forEach((keyframe) => {
          const timeIndex = findElementIndex(propertyTrackList[trackIndex].keyframes, keyframe.time, 'time');
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
          draft[trackIndex].keyframes[timeIndex].isSelected = false;
        });
      });
    });
  };

  // 선택 된 property keyframes 리스트 초기화
  clearSeletedKeyframes = () => {
    return [];
  };

  updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default PropertyKeyframeRepository;
