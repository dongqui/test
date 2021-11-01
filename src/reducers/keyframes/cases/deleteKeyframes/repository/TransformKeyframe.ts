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
        const { trackNumber, times } = selectedKeyframe;
        const trackIndex = findElementIndex(propertyTrackList, trackNumber, 'trackNumber');
        times.forEach((time) => {
          const timeIndex = findElementIndex(propertyTrackList[trackIndex].keyframes, time, 'time');
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
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
