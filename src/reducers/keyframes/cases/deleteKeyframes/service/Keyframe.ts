import { LayerIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
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

type DeleteLayerKeyframes = LayerKeyframes & SelectedLayerKeyframes;
type DeleteBoneKeyframes = BoneKeyframes & SelectedBoneKeyframes;
type DeletePropertyKeyframes = PropertyKeyframes & SelectedPropertyKeyframes;
type NewValues = AllKeyframes & AllSelectedKeyframes;
type PropertyTrackList = TimeEditorTrack<PropertyIdentifier>[];

class DeleteKeyframesService implements Service {
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(
    layerRepository: Repository,
    boneRepository: Repository,
    transformRepository: Repository,
  ) {
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  // layer 키프레임 삭제
  private deleteLayerKeyframes = (propertyKeyframes: PropertyTrackList): DeleteLayerKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.layerRepository;
    return {
      layerTrack: deleteSeletedKeyframes(propertyKeyframes) as TimeEditorTrack<LayerIdentifier>,
      selectedLayerKeyframes: clearSeletedKeyframes() as ClusteredKeyframe<LayerIdentifier>[],
    };
  };

  // bone 키프레임 삭제
  private deleteBoneKeyframes = (propertyKeyframes: PropertyTrackList): DeleteBoneKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.boneRepository;
    return {
      boneTrackList: deleteSeletedKeyframes(propertyKeyframes) as TimeEditorTrack<BoneIdentifier>[],
      selectedBoneKeyframes: clearSeletedKeyframes() as ClusteredKeyframe<BoneIdentifier>[],
    };
  };

  // transform 키프레임 삭제
  private deleteTransformKeyframes = (): DeletePropertyKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.transformRepository;
    return {
      propertyTrackList: deleteSeletedKeyframes() as TimeEditorTrack<PropertyIdentifier>[],
      selectedPropertyKeyframes: clearSeletedKeyframes() as ClusteredKeyframe<PropertyIdentifier>[],
    };
  };

  deleteKeyframes = () => {
    const { propertyTrackList, selectedPropertyKeyframes } = this.deleteTransformKeyframes();
    const layerTrack = this.deleteLayerKeyframes(propertyTrackList);
    const boneTrack = this.deleteBoneKeyframes(propertyTrackList);
    return { ...layerTrack, ...boneTrack, propertyTrackList, selectedPropertyKeyframes };
  };

  updateKeyframesState = (newValues: NewValues): KeyframesState => {
    return this.layerRepository.updateStateObject(newValues);
  };
}

export default DeleteKeyframesService;
