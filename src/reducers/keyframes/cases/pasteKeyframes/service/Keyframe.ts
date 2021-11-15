import { TimeEditorTrack, ClusteredKeyframe, TrasnformKey } from 'types/TP/keyframe';
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
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';

import { Service } from './index';
import { Repository } from '../repository';

class DragDropKeyframesService implements Service {
  private readonly state: KeyframesState;
  private readonly payload: Paste;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(state: KeyframesState, payload: Paste, layerRepository: Repository, boneRepository: Repository, transformRepository: Repository) {
    this.state = state;
    this.payload = payload;
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  private setUniqueTimes = (currentTimes: number[], transformKeys: TrasnformKey[]) => {
    const uniqueTimes: number[] = [];
    transformKeys.forEach(({ time }) => {
      const index = getBinarySearch({ collection: currentTimes, index: time });
      if (index === -1) uniqueTimes.push(time);
    });
    return uniqueTimes;
  };

  // 새로운 frame에 추가 된 property keyframe 탐색
  private findSelectedChildrenToLayer = (scrubberTime: number) => {
    const { copiedPropertyKeyframes } = this.state;
    const pastedKeyframes = new Set<number>();
    const timeDiff = scrubberTime - copiedPropertyKeyframes[0].keyframes[0].time;
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
    const timeDiff = scrubberTime - copiedPropertyKeyframes[0].keyframes[0].time;
    copiedPropertyKeyframes.forEach((group) => {
      const { trackNumber, keyframes } = group;
      const boneNumber = getBoneTrackIndex(trackNumber);
      const currentTimes = selectedChildren.get(boneNumber);
      if (currentTimes) {
        const uniqueTimes = this.setUniqueTimes(currentTimes, keyframes);
        const newTimes = [...currentTimes, ...uniqueTimes].sort((a, b) => a - b);
        selectedChildren.set(boneNumber, newTimes);
      } else {
        const newTimes = keyframes.map((keyframe) => keyframe.time + timeDiff);
        selectedChildren.set(boneNumber, newTimes);
      }
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
    const { updateTimeEditorTrack } = this.transformRepository;
    const propertyTrackList = updateTimeEditorTrack(this.payload.currentTimeIndex);
    return {
      propertyTrackList: propertyTrackList as TimeEditorTrack[],
    };
  };

  // 선택 된 property keyframes 리스트 업데이트
  private updateSelectedPropertyKeyframes = (): SelectedPropertyKeyframes => {
    const { updateSelectedKeyframes } = this.transformRepository;
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
