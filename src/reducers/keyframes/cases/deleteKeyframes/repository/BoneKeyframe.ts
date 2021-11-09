import produce from 'immer';

import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { getBoneTrackIndex, findElementIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private findTrack = (editorTrackList: TimeEditorTrack[], trackNumber: number) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  // 각 bone 하위의 선택 된 property keyframes time 계산
  private getSelectedPropertyTimes = () => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedTimes = new Map<number, Set<number>>();
    selectedPropertyKeyframes.forEach(({ keyframes, trackNumber }) => {
      const boneNumber = getBoneTrackIndex(trackNumber);
      const prevTimes = selectedTimes.get(boneNumber);
      const times: number[] = [];
      keyframes.forEach((keyframe) => {
        times.push(keyframe.time);
      });
      if (prevTimes) {
        selectedTimes.set(boneNumber, new Set([...prevTimes, ...times]));
      } else {
        selectedTimes.set(boneNumber, new Set([...times]));
      }
    });
    return selectedTimes;
  };

  // 하위 property keyframe들이 모두 삭제되었는지 확인
  private isAllDeleted = (trackList: TimeEditorTrack[], trackNumber: number, time: number) => {
    let deletedCount = 0;
    for (let property = trackNumber + 1; property <= trackNumber + 3; property++) {
      const trackIndex = findElementIndex(trackList, property, 'trackNumber');
      const { keyframes } = trackList[trackIndex];
      const timeIndex = findElementIndex(keyframes, time, 'time');
      const isDeleted = trackList[trackIndex].keyframes[timeIndex].isDeleted;
      if (isDeleted) deletedCount += 1;
    }
    return deletedCount === 3;
  };

  // 하위 property keyframes들이 모두 삭제 된 경우 탐색
  private getDeletedBoneTimes = (propertyTrackList: TimeEditorTrack[]) => {
    const { boneTrackList } = this.state;
    const deletedBoneTimes: ClusteredKeyframe[] = [];
    const selectedPropertyTimes = this.getSelectedPropertyTimes();
    for (const [boneNumber, propertyTimes] of selectedPropertyTimes.entries()) {
      propertyTimes.forEach((time) => {
        const isAllDeleted = this.isAllDeleted(propertyTrackList, boneNumber, time);
        if (isAllDeleted) {
          const index = findElementIndex(deletedBoneTimes, boneNumber);
          if (index === -1) {
            const { trackId, trackType } = this.findTrack(boneTrackList, boneNumber);
            const keyframes = [{ time }];
            deletedBoneTimes.push({ trackId, trackType, trackNumber: boneNumber, keyframes });
          } else {
            deletedBoneTimes[index].keyframes.push({ time });
          }
        }
      });
    }
    return deletedBoneTimes;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteBoneKeyframes = (propertyTrackList: TimeEditorTrack[]) => {
    const { boneTrackList, selectedBoneKeyframes } = this.state;
    const deletedBoneTimes = this.getDeletedBoneTimes(propertyTrackList);
    return produce(boneTrackList, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const { trackNumber, keyframes } = selectedKeyframe;
        const trackIndex = findElementIndex(boneTrackList, trackNumber, 'trackNumber');
        keyframes.forEach(({ time }) => {
          const timeIndex = findElementIndex(boneTrackList[trackIndex].keyframes, time, 'time');
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
      deletedBoneTimes.forEach((selectedKeyframe) => {
        const { trackNumber, keyframes } = selectedKeyframe;
        const trackIndex = findElementIndex(boneTrackList, trackNumber, 'trackNumber');
        keyframes.forEach(({ time }) => {
          const timeIndex = findElementIndex(boneTrackList[trackIndex].keyframes, time, 'time');
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
    });
  };

  // 선택 된 bone keyframes 리스트 초기화
  clearSeletedKeyframes = () => {
    return [];
  };

  // 선택 된 keyframes 삭제
  deleteSeletedKeyframes = (propertyTrackList: TimeEditorTrack[]) => {
    return this.deleteBoneKeyframes(propertyTrackList);
  };

  updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default BoneKeyframeRepository;
