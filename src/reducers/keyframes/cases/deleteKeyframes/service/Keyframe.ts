import { KeyframesState } from 'reducers/keyframes';
import {
  AllKeyframes,
  AllSelectedKeyframes,
  LayerKeyframes,
  BoneKeyframes,
  TransformKeyframes,
  SelectedLayerKeyframes,
  SelectedBoneKeyframes,
  SelectedTransformKeyframes,
} from 'reducers/keyframes/types';
import { TrackKeyframes } from 'types/TP_New/keyframe';

import { Service } from './index';
import { Repository } from '../repository';

type DeleteLayerKeyframes = LayerKeyframes & SelectedLayerKeyframes;
type DeleteBoneKeyframes = BoneKeyframes & SelectedBoneKeyframes;
type DeleteTransformKeyframes = TransformKeyframes & SelectedTransformKeyframes;
type NewValues = AllKeyframes & AllSelectedKeyframes;

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
  private deleteLayerKeyframes = (transformKeyframes: TrackKeyframes[]): DeleteLayerKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.layerRepository;
    return {
      layerKeyframes: deleteSeletedKeyframes(transformKeyframes) as TrackKeyframes,
      selectedLayerKeyframes: clearSeletedKeyframes(),
    };
  };

  // bone 키프레임 삭제
  private deleteBoneKeyframes = (transformKeyframes: TrackKeyframes[]): DeleteBoneKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.boneRepository;
    return {
      boneKeyframes: deleteSeletedKeyframes(transformKeyframes) as TrackKeyframes[],
      selectedBoneKeyframes: clearSeletedKeyframes(),
    };
  };

  // transform 키프레임 삭제
  private deleteTransformKeyframes = (): DeleteTransformKeyframes => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.transformRepository;
    return {
      transformKeyframes: deleteSeletedKeyframes() as TrackKeyframes[],
      selectedTransformKeyframes: clearSeletedKeyframes(),
    };
  };

  public deleteKeyframes = () => {
    const transformTrack = this.deleteTransformKeyframes();
    const layerTrack = this.deleteLayerKeyframes(transformTrack.transformKeyframes);
    const boneTrack = this.deleteBoneKeyframes(transformTrack.transformKeyframes);
    return { ...layerTrack, ...boneTrack, ...transformTrack };
  };

  public updateKeyframesState = (newValues: NewValues): KeyframesState => {
    return this.layerRepository.updateStateObject(newValues);
  };
}

export default DeleteKeyframesService;
