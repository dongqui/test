import produce from 'immer';

import { TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 선택 된 property keyframes의 times 계산
  private findSelectedPropertyTimes = () => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedTimes = new Set<number>();
    selectedPropertyKeyframes.forEach(({ keyframes }) => {
      keyframes.forEach((keyframe) => selectedTimes.add(keyframe.time));
    });
    return [...selectedTimes];
  };

  // 삭제시킬 layer keyframes의 times 계산
  private findDeletedLayerTimes = (propertyKeyframes: TimeEditorTrack[]) => {
    const times: number[] = [];
    const selectedPropertyTimes = this.findSelectedPropertyTimes();
    selectedPropertyTimes.forEach((time) => {
      let deletedCount = 0;
      propertyKeyframes.forEach(({ keyframes }) => {
        const timeIndex = findElementIndex(keyframes, time, 'time');
        const isDeleted = keyframes[timeIndex].isDeleted;
        if (isDeleted) deletedCount += 1;
      });
      if (deletedCount === propertyKeyframes.length) times.push(time);
    });
    return times;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteLayerKeyframes = (propertyKeyframes: TimeEditorTrack[]) => {
    const { layerTrack, selectedLayerKeyframes } = this.state;
    const deletedLayerTimes = this.findDeletedLayerTimes(propertyKeyframes);
    return produce(layerTrack, (draft) => {
      selectedLayerKeyframes.forEach(({ keyframes }) => {
        keyframes.forEach((keyframe) => {
          const timeIndex = findElementIndex(layerTrack.keyframes, keyframe.time, 'time');
          draft.keyframes[timeIndex].isSelected = false;
        });
      });
      deletedLayerTimes.forEach((time) => {
        const timeIndex = findElementIndex(layerTrack.keyframes, time, 'time');
        draft.keyframes[timeIndex].isDeleted = true;
        draft.keyframes[timeIndex].isSelected = false;
      });
    });
  };

  // 선택 된 layer keyframes 리스트 초기화
  public clearSeletedKeyframes = () => {
    return [];
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (propertyKeyframes: TimeEditorTrack[]) => {
    return this.deleteLayerKeyframes(propertyKeyframes);
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default LayerKeyframeRepository;
