import produce from 'immer';

import { Keyframe, TrackKeyframes, ClusteredTimes } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  // 키프레임 idnex 계산
  private findTimeIndex = (keyframes: Keyframe[], time: number) => {
    const keyframeIndex = getBinarySearch<Keyframe>({
      collection: keyframes,
      index: time,
      key: 'timeIndex',
    });
    return keyframeIndex;
  };

  // 선택 된 transform keyframes의 times 계산
  private findSelectedTransformTimes = () => {
    const { selectedTransformKeyframes } = this.state;
    const selectedTimes = new Set<number>();
    selectedTransformKeyframes.forEach(({ times }) => {
      times.forEach((time) => selectedTimes.add(time));
    });
    return [...selectedTimes];
  };

  // 삭제시킬 layer keyframes의 times 계산
  private findDeletedLayerTimes = (transformKeyframes: TrackKeyframes[]) => {
    const times: number[] = [];
    const selectedTransformTimes = this.findSelectedTransformTimes();
    selectedTransformTimes.forEach((time) => {
      let deletedCount = 0;
      transformKeyframes.forEach(({ keyframes }) => {
        const timeIndex = this.findTimeIndex(keyframes, time);
        const isDeleted = keyframes[timeIndex].isDeleted;
        if (isDeleted) deletedCount += 1;
      });
      if (deletedCount === transformKeyframes.length) times.push(time);
    });
    return times;
  };

  // 선택 된 keyframes에 isDeleted 상태값 변경
  private deleteLayerKeyframes = (transformKeyframes: TrackKeyframes[]) => {
    const { layerKeyframes, selectedLayerKeyframes } = this.state;
    const deletedLayerTimes = this.findDeletedLayerTimes(transformKeyframes);
    return produce(layerKeyframes, (draft) => {
      selectedLayerKeyframes.forEach((selectedKeyframe) => {
        selectedKeyframe.times.forEach((time) => {
          const timeIndex = this.findTimeIndex(layerKeyframes.keyframes, time);
          draft.keyframes[timeIndex].isDeleted = true;
        });
      });
      deletedLayerTimes.forEach((time) => {
        const timeIndex = this.findTimeIndex(layerKeyframes.keyframes, time);
        draft.keyframes[timeIndex].isDeleted = true;
      });
    });
  };

  // 선택 된 layer keyframes 리스트 초기화
  public clearSeletedKeyframes = (): ClusteredTimes[] => {
    return [];
  };

  // 선택 된 keyframes 삭제
  public deleteSeletedKeyframes = (transformKeyframes: TrackKeyframes[]): TrackKeyframes => {
    return this.deleteLayerKeyframes(transformKeyframes);
  };

  public updateStateObject = (newValues: Partial<KeyframesState>): KeyframesState => {
    return Object.assign({}, this.state, newValues);
  };
}

export default LayerKeyframeRepository;
