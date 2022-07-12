import produce, { Draft } from 'immer';

import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 삭제 된 property keyframe인지 확인
  private isExistedPropertyKeyframe = (track: TimeEditorTrack, time: number) => {
    const keyframeIndex = findElementIndex(track.keyframes, time, 'time');
    if (keyframeIndex === -1) return false;
    const isExisted = !track.keyframes[keyframeIndex].isDeleted;
    return isExisted;
  };

  // 이전에 선택 된 bone keyframe에 선택 효과 제거
  private deselectBoneKeyframes = (draft: Draft<TimeEditorTrack>[]) => {
    const { selectedBoneKeyframes } = this.state;
    selectedBoneKeyframes.forEach(({ keyframes, trackNumber }) => {
      const trackIdnex = findElementIndex(draft, trackNumber, 'trackNumber');
      keyframes.forEach((keyframe) => {
        const keyframeIndex = findElementIndex(draft[trackIdnex].keyframes, keyframe.time, 'time');
        draft[trackIdnex].keyframes[keyframeIndex].isSelected = false;
      });
    });
  };

  // 하위 property keyframe이 모두 삭제 될 경우, bone keyframe 삭제
  private deleteBoneKeyframes = (draft: Draft<TimeEditorTrack>[], updatedPropertyTrackList: TimeEditorTrack[], selectedTimes: Map<number, number[]>) => {
    for (const [boneNumber, times] of selectedTimes.entries()) {
      const selectedTracks = findChildrenTracks(boneNumber, updatedPropertyTrackList) as TimeEditorTrack[];
      times.forEach((time) => {
        let boneKeyframeExists = false;
        for (const track of selectedTracks) {
          if (this.isExistedPropertyKeyframe(track, time)) {
            boneKeyframeExists = true;
            break;
          }
        }

        if (!boneKeyframeExists) {
          const boneIndex = findElementIndex(draft, boneNumber, 'trackNumber');
          const keyframeIndex = findElementIndex(draft[boneIndex].keyframes, time, 'time');
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
        const keyframeIndex = findElementIndex(draft[boneIndex].keyframes, nextTime, 'time');
        if (keyframeIndex !== -1) {
          draft[boneIndex].keyframes[keyframeIndex].isDeleted = false;
          draft[boneIndex].keyframes[keyframeIndex].isSelected = false;
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
      selectedGroup.keyframes.forEach((keyframe) => {
        const nextTime = keyframe.time + timeDiff;
        const keyframeIndex = findElementIndex(draft[boneIndex].keyframes, nextTime, 'time');
        draft[boneIndex].keyframes[keyframeIndex].isSelected = true;
      });
    });
  };

  // bone 트랙 리스트 업데이트
  updateTimeEditorTrack = (timeDiff: number, updatedPropertyTrackList: TimeEditorTrack[], selectedTimes: Map<number, number[]>): TimeEditorTrack[] => {
    return produce(this.state.boneTrackList, (draft) => {
      this.deselectBoneKeyframes(draft);
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
