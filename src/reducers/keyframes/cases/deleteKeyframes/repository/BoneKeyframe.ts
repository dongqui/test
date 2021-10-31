import produce from 'immer';

import { ClusteredTimes, Keyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';

import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private findTrackIndex = (target: ClusteredTimes[] | TrackKeyframes[], trackIndex: number) => {
    return getBinarySearch<ClusteredTimes | TrackKeyframes>({
      collection: target,
      index: trackIndex,
      key: 'trackIndex',
    });
  };

  private findKeyframeIndex = (
    trackKeyframes: TrackKeyframes[],
    tarckIndex: number,
    time: number,
  ) => {
    const boneTrack = trackKeyframes[tarckIndex];
    const keyframeIndex = getBinarySearch<Keyframe>({
      collection: boneTrack.keyframes,
      index: time,
      key: 'timeIndex',
    });
    return keyframeIndex;
  };

  // 선택 된 transform keyframes의 times 계산
  private findSelectedTransformTimes = () => {
    const { selectedTransformKeyframes } = this.state;
    const selectedTimes = new Map<number, Set<number>>();
    selectedTransformKeyframes.forEach(({ times, trackIndex }) => {
      const boneIndex = getBoneTrackIndex(trackIndex as number);
      const prev = selectedTimes.get(boneIndex);
      selectedTimes.set(boneIndex, prev ? new Set([...prev, ...times]) : new Set([...times]));
    });
    return selectedTimes;
  };

  private findDeletedBoneTimes = (transformKeyframes: TrackKeyframes[]) => {
    const deletedBoneTimes: ClusteredTimes[] = [];
    const selectedTransformTimes = this.findSelectedTransformTimes();
    for (const [trackIndex, times] of selectedTransformTimes.entries()) {
      times.forEach((time) => {
        let deletedCount = 0;
        for (let index = trackIndex + 1; index <= trackIndex + 3; index++) {
          const trackIndex = this.findTrackIndex(transformKeyframes, index);
          const timeIndex = this.findKeyframeIndex(transformKeyframes, trackIndex, time);
          const isDeleted = transformKeyframes[trackIndex].keyframes[timeIndex].isDeleted;
          if (isDeleted) deletedCount += 1;
        }
        if (deletedCount === 3) {
          const index = this.findTrackIndex(deletedBoneTimes, trackIndex);
          if (index === -1) {
            deletedBoneTimes.push({ trackIndex: trackIndex, times: [time] });
          } else {
            deletedBoneTimes[index].times.push(time);
          }
        }
      });
    }
    return deletedBoneTimes;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteBoneKeyframes = (transformKeyframes: TrackKeyframes[]) => {
    const { boneKeyframes, selectedBoneKeyframes } = this.state;
    const deletedBoneTimes = this.findDeletedBoneTimes(transformKeyframes);
    return produce(boneKeyframes, (draft) => {
      selectedBoneKeyframes.forEach((selectedKeyframe) => {
        const selectedIndex = selectedKeyframe.trackIndex as number;
        const trackIndex = this.findTrackIndex(boneKeyframes, selectedIndex);
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findKeyframeIndex(boneKeyframes, trackIndex, time);
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
      deletedBoneTimes.forEach((selectedKeyframe) => {
        const selectedIndex = selectedKeyframe.trackIndex as number;
        const trackIndex = this.findTrackIndex(boneKeyframes, selectedIndex);
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findKeyframeIndex(boneKeyframes, trackIndex, time);
          draft[trackIndex].keyframes[timeIndex].isDeleted = true;
        });
      });
    });
  };

  // 선택 된 bone keyframes 리스트 초기화
  public clearSeletedKeyframes = (): ClusteredTimes[] => {
    return [];
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (transformKeyframes: TrackKeyframes[]): TrackKeyframes[] => {
    return this.deleteBoneKeyframes(transformKeyframes);
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default BoneKeyframeRepository;
