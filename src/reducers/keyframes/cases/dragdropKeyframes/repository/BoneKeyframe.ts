import produce, { Draft } from 'immer';

import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 삭제 된 property keyframe인지 확인
  private isExistedPropertyKeyframe = (propertyTrackList: TimeEditorTrack[], propertyNumber: number, time: number) => {
    const trackIndex = findElementIndex(propertyTrackList, propertyNumber, 'trackNumber');
    const keyframeIndex = findElementIndex(propertyTrackList[trackIndex].keyframes, time, 'time');
    if (keyframeIndex === -1) return;
    const isExisted = !propertyTrackList[trackIndex].keyframes[keyframeIndex].isDeleted;
    return isExisted;
  };

  // 하위 property keyframe이 모두 삭제 될 경우, bone keyframe 삭제
  private deleteBoneKeyframes = (draft: Draft<TimeEditorTrack>[], propertyTrackList: TimeEditorTrack[], selectedTimes: Map<number, number[]>) => {
    for (const [boneNumber, times] of selectedTimes.entries()) {
      times.forEach((time) => {
        const position = this.isExistedPropertyKeyframe(propertyTrackList, boneNumber + 1, time);
        const rotation = this.isExistedPropertyKeyframe(propertyTrackList, boneNumber + 2, time);
        const scale = this.isExistedPropertyKeyframe(propertyTrackList, boneNumber + 3, time);
        const isAllDeleted = !position && !rotation && !scale;
        if (isAllDeleted) {
          const boneIndex = findElementIndex(draft, boneNumber, 'trackNumber');
          const keyframes = draft[boneIndex].keyframes;
          const keyframeIndex = findElementIndex(keyframes, time, 'time');
          draft[boneIndex].keyframes[keyframeIndex].isDeleted = true;
          draft[boneIndex].keyframes[keyframeIndex].isSelected = false;
        }
      });
    }
  };

  // property keyframe 드랍 시, 상위 bone keyframe 추가
  private addBoneKeyframes = (draft: Draft<TimeEditorTrack>[], selectedTimes: Map<number, number[]>, timeDiff: number) => {
    for (const [boneNumber, times] of selectedTimes.entries()) {
      times.forEach((time) => {
        const nextTime = time + timeDiff;
        const boneIndex = findElementIndex(draft, boneNumber, 'trackNumber');
        const keyframes = draft[boneIndex].keyframes;
        const keyframeIndex = findElementIndex(keyframes, nextTime, 'time');
        if (keyframeIndex !== -1) {
          draft[boneIndex].keyframes[keyframeIndex].isDeleted = false;
        } else {
          draft[boneIndex].keyframes.push({ isDeleted: false, isSelected: false, time: nextTime });
          draft[boneIndex].keyframes.sort((a, b) => a.time - b.time);
        }
      });
    }
  };

  // 이전에 선택 된 bone keyframe일 경우, 드랍 이후에 옮겨진 후에도 선택 효과 적용
  private selectBoneKeyframes = (draft: Draft<TimeEditorTrack>[], timeDiff: number) => {
    const { selectedBoneKeyframes } = this.state;
    selectedBoneKeyframes.forEach((selectedGroup) => {
      const { trackNumber } = selectedGroup;
      const boneIndex = findElementIndex(draft, trackNumber, 'trackNumber');
      const boneKeyframes = draft[boneIndex].keyframes;
      selectedGroup.keyframes.forEach((keyframe) => {
        const nextTime = keyframe.time + timeDiff;
        const keyframeIndex = findElementIndex(boneKeyframes, nextTime, 'time');
        draft[boneIndex].keyframes[keyframeIndex].isSelected = true;
      });
    });
  };

  // bone 트랙 리스트 업데이트
  updateTimeEditorTrack = (timeDiff: number, updatedPropertyTrackList: TimeEditorTrack[], selectedTimes: Map<number, number[]>): TimeEditorTrack[] => {
    return produce(this.state.boneTrackList, (draft) => {
      this.deleteBoneKeyframes(draft, updatedPropertyTrackList, selectedTimes);
      this.addBoneKeyframes(draft, selectedTimes, timeDiff);
      this.selectBoneKeyframes(draft, timeDiff);
    });
  };

  // 선택 된 bone keyframes 업데이트
  updateSelectedKeyframes = (timeDiff: number): ClusteredKeyframe[] => {
    const { selectedBoneKeyframes } = this.state;
    return produce(selectedBoneKeyframes, (draft) => {
      draft.forEach((selectedGroup) => {
        selectedGroup.keyframes.forEach((keyframe) => {
          keyframe.time += timeDiff;
        });
      });
    });
  };
}

export default BoneKeyframeRepository;
