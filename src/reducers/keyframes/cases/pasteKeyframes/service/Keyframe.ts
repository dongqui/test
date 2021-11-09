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

import { Service } from './index';
import { Repository } from '../repository';

class DragDropKeyframesService implements Service {
  private readonly payload: Paste;
  // private readonly layerRepository: Repository;
  // private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(
    payload: Paste,
    // layerRepository: Repository,
    // boneRepository: Repository,
    transformRepository: Repository,
  ) {
    this.payload = payload;
    // this.layerRepository = layerRepository;
    // this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

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
  updateTimeEditorTrackList = (): PropertyKeyframes => {
    return {
      ...this.updatePropertyTrackList(),
    };
  };

  // 선택 된 layer, bone, property 트랙 리스트 업데이트
  updateSelectedTrackKeyframes = (): SelectedPropertyKeyframes => {
    return {
      ...this.updateSelectedPropertyKeyframes(),
    };
  };
}

export default DragDropKeyframesService;
