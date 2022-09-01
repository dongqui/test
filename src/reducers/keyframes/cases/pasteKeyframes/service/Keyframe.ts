import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { Paste } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import {
  AllKeyframes,
  AllSelectedKeyframes,
  LayerKeyframes,
  BoneKeyframes,
  PropertyKeyframes,
  SelectedLayerKeyframes,
  SelectedBoneKeyframes,
  SelectedPropertyKeyframes,
} from 'reducers/keyframes/types';
import { getBoneTrackIndex } from 'utils/TP';

import { Service } from './index';
import { Repository } from '../repository';

class DragDropKeyframesService implements Service {
  private readonly state: KeyframesState;
  private readonly payload: Paste;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly propertyRepository: Repository;

  constructor(state: KeyframesState, payload: Paste, layerRepository: Repository, boneRepository: Repository, propertyRepository: Repository) {
    this.state = state;
    this.payload = payload;
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.propertyRepository = propertyRepository;
  }

  private getSmallestKeyframeTime = () => {
    const { copiedPropertyKeyframes } = this.state;
    let smallestTime = Infinity;
    copiedPropertyKeyframes.forEach((copied) => {
      if (copied.keyframes.length === 0) return;
      const time = copied.keyframes[0].time;
      if (time < smallestTime) smallestTime = time;
    });
    return smallestTime;
  };

  // 새로운 frame에 추가 된 property keyframe 탐색
  private findSelectedChildrenToLayer = (scrubberTime: number) => {
    const { copiedPropertyKeyframes } = this.state;
    const pastedKeyframes = new Set<number>();
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    copiedPropertyKeyframes.forEach((group) => {
      group.keyframes.forEach((keyframe) => {
        pastedKeyframes.add(keyframe.time + timeDiff);
      });
    });
    return [...pastedKeyframes].sort((a, b) => a - b);
  };

  // 새로운 frame에 추가 된 property keyframe을 bone track별로 분류
  private findSelectedChildrenToBone = (scrubberTime: number) => {
    const { copiedPropertyKeyframes } = this.state;
    const selectedChildren = new Map<number, number[]>();
    const timeDiff = scrubberTime - this.getSmallestKeyframeTime();
    copiedPropertyKeyframes.forEach((group) => {
      const { keyframes } = group;
      const boneNumber = getBoneTrackIndex(group);
      const currentKeyframeTimes = selectedChildren.get(boneNumber);
      const set = new Set<number>(currentKeyframeTimes);
      keyframes.forEach((keyframe) => set.add(keyframe.time + timeDiff));
      selectedChildren.set(
        boneNumber,
        [...set].sort((a, b) => a - b),
      );
    });
    return selectedChildren;
  };

  // layer 트랙 업데이트
  private updateLayerTrack = (): LayerKeyframes => {
    const { currentTimeIndex } = this.payload;
    const { updateTimeEditorTrack } = this.layerRepository;
    const selectedChildren = this.findSelectedChildrenToLayer(currentTimeIndex);
    const layerTrack = updateTimeEditorTrack(currentTimeIndex, selectedChildren);
    return {
      layerTrack: layerTrack as TimeEditorTrack,
    };
  };

  // 선택 된 layer keyframes 업데이트
  private updateSelectedLayerKeyframes = (): SelectedLayerKeyframes => {
    const { currentTimeIndex } = this.payload;
    const { updateSelectedKeyframes } = this.layerRepository;
    const selectedChildren = this.findSelectedChildrenToLayer(currentTimeIndex);
    const selectedLayerKeyframes = updateSelectedKeyframes(currentTimeIndex, selectedChildren);
    return {
      selectedLayerKeyframes: selectedLayerKeyframes as ClusteredKeyframe[],
    };
  };

  // bone 트랙 리스트 업데이트
  private updateBoneTrackList = (): BoneKeyframes => {
    const { currentTimeIndex } = this.payload;
    const { updateTimeEditorTrack } = this.boneRepository;
    const selectedChildren = this.findSelectedChildrenToBone(currentTimeIndex);
    const boneTrackList = updateTimeEditorTrack(currentTimeIndex, selectedChildren);
    return {
      boneTrackList: boneTrackList as TimeEditorTrack[],
    };
  };

  // 선택 된 bone keyframes 업데이트
  private updateSelectedBoneKeyframes = (): SelectedBoneKeyframes => {
    const { currentTimeIndex } = this.payload;
    const { updateSelectedKeyframes } = this.boneRepository;
    const selectedChildren = this.findSelectedChildrenToBone(currentTimeIndex);
    const selectedBoneKeyframes = updateSelectedKeyframes(currentTimeIndex, selectedChildren);
    return {
      selectedBoneKeyframes: selectedBoneKeyframes as ClusteredKeyframe[],
    };
  };

  // property 트랙 리스트 업데이트
  private updatePropertyTrackList = (): PropertyKeyframes => {
    const { updateTimeEditorTrack } = this.propertyRepository;
    const propertyTrackList = updateTimeEditorTrack(this.payload.currentTimeIndex);
    return {
      propertyTrackList: propertyTrackList as TimeEditorTrack[],
    };
  };

  // 선택 된 property keyframes 리스트 업데이트
  private updateSelectedPropertyKeyframes = (): SelectedPropertyKeyframes => {
    const { updateSelectedKeyframes } = this.propertyRepository;
    const selectedPropertyKeyframes = updateSelectedKeyframes(this.payload.currentTimeIndex);
    return {
      selectedPropertyKeyframes: selectedPropertyKeyframes as ClusteredKeyframe[],
    };
  };

  // layer, bone, property 트랙 리스트 업데이트
  updateTimeEditorTrackList = (): AllKeyframes => {
    return {
      ...this.updateLayerTrack(),
      ...this.updateBoneTrackList(),
      ...this.updatePropertyTrackList(),
    };
  };

  // 선택 된 layer, bone, property 트랙 리스트 업데이트
  updateSelectedTrackKeyframes = (): AllSelectedKeyframes => {
    return {
      ...this.updateSelectedLayerKeyframes(),
      ...this.updateSelectedBoneKeyframes(),
      ...this.updateSelectedPropertyKeyframes(),
    };
  };
}

export default DragDropKeyframesService;
