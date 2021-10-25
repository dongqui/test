import { KeyframesState } from 'reducers/keyframes';
import { Service } from './index';
import { Repository } from '../repository';
import { KeyframesUnion, SelectedKeyframesUnion } from 'reducers/keyframes/types';

type NewValues = KeyframesUnion & SelectedKeyframesUnion;

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
  private deleteLayerKeyframes = (): NewValues => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.layerRepository;
    return { ...deleteSeletedKeyframes(), ...clearSeletedKeyframes() };
  };

  // bone 키프레임 삭제
  private deleteBoneKeyframes = (): NewValues => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.boneRepository;
    return { ...deleteSeletedKeyframes(), ...clearSeletedKeyframes() };
  };

  // transform 키프레임 삭제
  private deleteTransformKeyframes = (): NewValues => {
    const { deleteSeletedKeyframes, clearSeletedKeyframes } = this.transformRepository;
    return { ...deleteSeletedKeyframes(), ...clearSeletedKeyframes() };
  };

  public deleteKeyframes = (): NewValues => {
    const layerTrack = this.deleteLayerKeyframes();
    const boneTrack = this.deleteBoneKeyframes();
    const transformTrack = this.deleteTransformKeyframes();
    return { ...layerTrack, ...boneTrack, ...transformTrack };
  };

  public updateKeyframesState = (newValues: NewValues): KeyframesState => {
    return this.layerRepository.updateStateObject(newValues);
  };
}

export default DeleteKeyframesService;
