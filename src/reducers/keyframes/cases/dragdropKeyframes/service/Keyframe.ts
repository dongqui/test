import { TimeEditorTrack, ClusteredKeyframe, TrasnformKey } from 'types/TP/keyframe';
import { DragDropKeyframes } from 'actions/keyframes';
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
import { getBoneTrackIndex, getBinarySearch } from 'utils/TP';

import { Service } from './index';
import { Repository } from '../repository';

class DragDropKeyframesService implements Service {
  private readonly state: KeyframesState;
  private readonly payload: DragDropKeyframes;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(state: KeyframesState, payload: DragDropKeyframes, layerRepository: Repository, boneRepository: Repository, transformRepository: Repository) {
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

  // layer keyframe 하위에 선택 된 property keyframe 탐색
  private findSelectedChildrenToLayer = () => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedChildren: number[] = [];
    selectedPropertyKeyframes.forEach((selectedGroup) => {
      const { keyframes } = selectedGroup;
      const times = this.setUniqueTimes(selectedChildren, keyframes);
      selectedChildren.push(...times);
      selectedChildren.sort((a, b) => a - b);
    });
    return selectedChildren;
  };

  // bone keyframe 하위에 선택 된 property keyframe 탐색
  private findSelectedChildrenToBone = () => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedChildren = new Map<number, number[]>();
    selectedPropertyKeyframes.forEach((selectedGroup) => {
      const { trackNumber, keyframes } = selectedGroup;
      const boneNumber = getBoneTrackIndex(trackNumber);
      const currentTimes = selectedChildren.get(boneNumber);
      if (currentTimes) {
        const uniqueTimes = this.setUniqueTimes(currentTimes, keyframes);
        const newTimes = [...currentTimes, ...uniqueTimes].sort((a, b) => a - b);
        selectedChildren.set(boneNumber, newTimes);
      } else {
        const newTimes = keyframes.map((keyframe) => keyframe.time);
        selectedChildren.set(boneNumber, newTimes);
      }
    });
    return selectedChildren;
  };

  // layer 트랙 업데이트
  private updateLayerTrack = (propertyTrackList: TimeEditorTrack[]): LayerKeyframes => {
    const { timeDiff } = this.payload;
    const { updateTimeEditorTrack } = this.layerRepository;
    const selectedChildren = this.findSelectedChildrenToLayer();
    const layerTrack = updateTimeEditorTrack(timeDiff, propertyTrackList, selectedChildren);
    return {
      layerTrack: layerTrack as TimeEditorTrack,
    };
  };

  // 선택 된 layer keyframes 업데이트
  private updateSelectedLayerKeyframes = (): SelectedLayerKeyframes => {
    const { updateSelectedKeyframes } = this.layerRepository;
    const selectedLayerKeyframes = updateSelectedKeyframes(this.payload.timeDiff);
    return {
      selectedLayerKeyframes: selectedLayerKeyframes as ClusteredKeyframe[],
    };
  };

  // bone 트랙 리스트 업데이트
  private updateBoneTrackList = (propertyTrackList: TimeEditorTrack[]): BoneKeyframes => {
    const { timeDiff } = this.payload;
    const { updateTimeEditorTrack } = this.boneRepository;
    const selectedChildren = this.findSelectedChildrenToBone();
    const boneTrackList = updateTimeEditorTrack(timeDiff, propertyTrackList, selectedChildren);
    return {
      boneTrackList: boneTrackList as TimeEditorTrack[],
    };
  };

  // 선택 된 bone keyframes 업데이트
  private updateSelectedBoneKeyframes = (): SelectedBoneKeyframes => {
    const { updateSelectedKeyframes } = this.boneRepository;
    const selectedBoneKeyframes = updateSelectedKeyframes(this.payload.timeDiff);
    return {
      selectedBoneKeyframes: selectedBoneKeyframes as ClusteredKeyframe[],
    };
  };

  // property 트랙 리스트 업데이트
  private updatePropertyTrackList = (): PropertyKeyframes => {
    const { updateTimeEditorTrack } = this.transformRepository;
    const propertyTrackList = updateTimeEditorTrack(this.payload.timeDiff);
    return {
      propertyTrackList: propertyTrackList as TimeEditorTrack[],
    };
  };

  // 선택 된 property keyframes 업데이트
  private updateSelectedPropertyKeyframes = (): SelectedPropertyKeyframes => {
    const { updateSelectedKeyframes } = this.transformRepository;
    const selectedPropertyKeyframes = updateSelectedKeyframes(this.payload.timeDiff);
    return {
      selectedPropertyKeyframes: selectedPropertyKeyframes as ClusteredKeyframe[],
    };
  };

  // layer, bone, property 트랙 리스트 업데이트
  updateTimeEditorTrackList = (): PropertyKeyframes => {
    const { propertyTrackList } = this.updatePropertyTrackList();
    return {
      ...this.updateLayerTrack(propertyTrackList),
      ...this.updateBoneTrackList(propertyTrackList),
      propertyTrackList,
    };
  };

  // 선택 된 layer, bone, property 트랙 리스트 업데이트
  updateSelectedTrackKeyframes = (): SelectedPropertyKeyframes => {
    return {
      ...this.updateSelectedLayerKeyframes(),
      ...this.updateSelectedBoneKeyframes(),
      ...this.updateSelectedPropertyKeyframes(),
    };
  };
}

export default DragDropKeyframesService;
