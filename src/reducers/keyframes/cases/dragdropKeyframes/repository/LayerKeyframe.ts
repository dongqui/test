import produce, { Draft } from 'immer';
import { KeyframesState } from 'reducers/keyframes';

import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 삭제 된 property keyframe인지 확인
  private isExistedPropertyKeyframe = (propertyTrackList: TimeEditorTrack[], propertyNumber: number, time: number) => {
    const propertyIndex = findElementIndex(propertyTrackList, propertyNumber, 'trackNumber');
    const timeIndex = findElementIndex(propertyTrackList[propertyIndex].keyframes, time, 'time');
    if (timeIndex === -1) return;
    const isExisted = !propertyTrackList[propertyIndex].keyframes[timeIndex].isDeleted;
    return isExisted;
  };

  // 이전에 선택 된 layer keyframe에 선택 효과 제거
  private deselectLayerKeyframes = (draft: Draft<TimeEditorTrack>) => {
    const { selectedLayerKeyframes } = this.state;
    selectedLayerKeyframes.forEach(({ keyframes }) => {
      keyframes.forEach((keyframe) => {
        const keyframeIndex = findElementIndex(draft.keyframes, keyframe.time, 'time');
        draft.keyframes[keyframeIndex].isSelected = false;
      });
    });
  };

  // 하위 property keyframe이 모두 삭제 될 경우, layer keyframe 삭제
  private deleteLayerKeyframes = (draft: Draft<TimeEditorTrack>, updatedPropertyTrackList: TimeEditorTrack[], selectedTimes: number[]) => {
    const { propertyTrackList } = this.state;
    selectedTimes.forEach((time) => {
      let deletedCount = 0;
      propertyTrackList.forEach((prpertyTrack) => {
        const { trackNumber } = prpertyTrack;
        const isExisted = this.isExistedPropertyKeyframe(updatedPropertyTrackList, trackNumber, time);
        if (isExisted) deletedCount += 1;
      });
      if (deletedCount === 0) {
        const keyframeIndex = findElementIndex(draft.keyframes, time, 'time');
        draft.keyframes[keyframeIndex].isDeleted = true;
        draft.keyframes[keyframeIndex].isSelected = false;
      }
    });
  };

  // property keyframe 드랍 시, 상위 layer keyframe 추가
  private addLayerKeyframes = (draft: Draft<TimeEditorTrack>, selectedTimes: number[], timeDiff: number) => {
    selectedTimes.forEach((time) => {
      const nextTime = time + timeDiff;
      const keyframeIndex = findElementIndex(draft.keyframes, nextTime, 'time');
      if (keyframeIndex !== -1) {
        draft.keyframes[keyframeIndex].isDeleted = false;
        draft.keyframes[keyframeIndex].isSelected = false;
      } else {
        draft.keyframes.push({ isDeleted: false, isSelected: false, time: nextTime });
        draft.keyframes.sort((a, b) => a.time - b.time);
      }
    });
  };

  // 이전에 선택 된 layer keyframe일 경우, 드랍 이후에 옮겨진 후에도 선택 효과 적용
  private selectLayerKeyframes = (draft: Draft<TimeEditorTrack>, timeDiff: number) => {
    const { selectedLayerKeyframes } = this.state;
    selectedLayerKeyframes.forEach((selectedGroup) => {
      selectedGroup.keyframes.forEach((keyframe) => {
        const nextTime = keyframe.time + timeDiff;
        const keyframeIndex = findElementIndex(draft.keyframes, nextTime, 'time');
        draft.keyframes[keyframeIndex].isSelected = true;
      });
    });
  };

  // layer 트랙 업데이트
  updateTimeEditorTrack = (timeDiff: number, updatedPropertyTrackList: TimeEditorTrack[], selectedTimes: number[]): TimeEditorTrack => {
    return produce(this.state.layerTrack, (draft) => {
      this.deselectLayerKeyframes(draft);
      this.deleteLayerKeyframes(draft, updatedPropertyTrackList, selectedTimes);
      this.addLayerKeyframes(draft, selectedTimes, timeDiff);
      this.selectLayerKeyframes(draft, timeDiff);
    });
  };

  // 선택 된 layer keyframes 업데이트
  updateSelectedKeyframes = (timeDiff: number): ClusteredKeyframe[] => {
    const { selectedLayerKeyframes } = this.state;
    return produce(selectedLayerKeyframes, (draft) => {
      draft.forEach((selectedGroup) => {
        selectedGroup.keyframes.forEach((keyframe) => {
          keyframe.time += timeDiff;
        });
      });
    });
  };
}

export default LayerKeyframeRepository;
