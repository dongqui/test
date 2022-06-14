import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { DragDropKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { LayerKeyframes, BoneKeyframes, PropertyKeyframes, SelectedLayerKeyframes, SelectedBoneKeyframes, SelectedPropertyKeyframes } from 'reducers/keyframes/types';
import { getBoneTrackIndex } from 'utils/TP';

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

  // layer keyframe 하위에 선택 된 property keyframe 탐색
  private findSelectedChildrenToLayer = () => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedChildren = new Set<number>();
    selectedPropertyKeyframes.forEach((selectedGroup) => {
      const { keyframes } = selectedGroup;
      keyframes.forEach((keyframe) => {
        selectedChildren.add(keyframe.time);
      });
    });
    return [...selectedChildren].sort((a, b) => a - b);
  };

  // bone keyframe 하위에 선택 된 property keyframe 탐색
  private findSelectedChildrenToBone = (propertyTrackList: TimeEditorTrack[]) => {
    const { selectedPropertyKeyframes } = this.state;
    const selectedChildren = new Map<number, number[]>();
    selectedPropertyKeyframes.forEach((selectedGroup) => {
      const { keyframes } = selectedGroup;
      const boneNumber = getBoneTrackIndex(selectedGroup);
      const currentKeyframeTimes = selectedChildren.get(boneNumber);
      const set = new Set<number>(currentKeyframeTimes);
      keyframes.forEach((keyframe) => set.add(keyframe.time));
      selectedChildren.set(
        boneNumber,
        [...set].sort((a, b) => a - b),
      );
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
    const selectedChildren = this.findSelectedChildrenToBone(propertyTrackList);
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
