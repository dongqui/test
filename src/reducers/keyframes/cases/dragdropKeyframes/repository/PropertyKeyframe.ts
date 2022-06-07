import produce, { Draft } from 'immer';

import { TimeEditorTrack, TransformKey, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 키프레임 데이터 생성
  private createPropertyKeyframe = (nextTime: number, transformKey: TransformKey): Keyframe => {
    return { isDeleted: false, isSelected: true, time: nextTime, value: transformKey.value };
  };

  // 키프레임 업데이트
  private updatePropertyKeyframes = (draft: Draft<TimeEditorTrack>[], trackNumber: number, transformKey: TransformKey, timeDiff: number) => {
    const trackIndex = findElementIndex(draft, trackNumber, 'trackNumber');
    const propertyKeyframes = draft[trackIndex].keyframes;
    const nextTime = transformKey.time + timeDiff;
    const keyframeIndex = findElementIndex(propertyKeyframes, transformKey.time, 'time');
    const nextKeyframeIndex = findElementIndex(propertyKeyframes, nextTime, 'time');
    const nextPropertyKeyframe = this.createPropertyKeyframe(nextTime, transformKey);
    draft[trackIndex].keyframes[keyframeIndex].isDeleted = true;
    draft[trackIndex].keyframes[keyframeIndex].isSelected = false;
    if (nextKeyframeIndex === -1) {
      draft[trackIndex].keyframes.push(nextPropertyKeyframe);
      draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
    } else {
      draft[trackIndex].keyframes[nextKeyframeIndex] = nextPropertyKeyframe;
    }
  };

  // 트랙 리스트 업데이트
  updateTimeEditorTrack = (timeDiff: number): TimeEditorTrack[] => {
    const { propertyTrackList, selectedPropertyKeyframes } = this.state;
    return produce(propertyTrackList, (draft) => {
      if (timeDiff < 0) {
        selectedPropertyKeyframes.forEach((group) => {
          const { trackNumber, keyframes } = group;
          keyframes.forEach((keyframe) => {
            this.updatePropertyKeyframes(draft, trackNumber, keyframe, timeDiff);
          });
        });
      } else {
        selectedPropertyKeyframes.forEach((group) => {
          const { trackNumber, keyframes } = group;
          for (let count = keyframes.length - 1; 0 <= count; --count) {
            const keyframe = keyframes[count];
            this.updatePropertyKeyframes(draft, trackNumber, keyframe, timeDiff);
          }
        });
      }
    });
  };

  // 선택 된 키프레임 리스트 업데이트
  updateSelectedKeyframes = (timeDiff: number): ClusteredKeyframe[] => {
    const { selectedPropertyKeyframes } = this.state;
    return produce(selectedPropertyKeyframes, (draft) => {
      draft.forEach((selectedGroup) => {
        selectedGroup.keyframes.forEach((keyframe) => {
          keyframe.time += timeDiff;
        });
      });
    });
  };
}

export default PropertyKeyframeRepository;
