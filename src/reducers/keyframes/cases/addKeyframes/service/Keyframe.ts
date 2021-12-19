import { KeyframesState } from 'reducers/keyframes';
import { TimeEditorTrack, UpdatedPropertyKeyframes } from 'types/TP/keyframe';

import Service from './index';
import { Repository } from '../repository';

class KeyframeService implements Service {
  private readonly payload: UpdatedPropertyKeyframes;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly propertyRepository: Repository;

  constructor(payload: UpdatedPropertyKeyframes, layerRepository: Repository, boneRepository: Repository, propertyRepository: Repository) {
    this.payload = payload;
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.propertyRepository = propertyRepository;
  }

  updateTrackKeyframesList(): Partial<KeyframesState> {
    const layerTrackKeyframes = this.layerRepository.addKeyframes(this.payload) as TimeEditorTrack;
    const boneTrackKeyframes = this.boneRepository.addKeyframes(this.payload) as TimeEditorTrack[];
    const propertyTrackKeyframes = this.propertyRepository.addKeyframes(this.payload) as TimeEditorTrack[];
    return {
      layerTrack: layerTrackKeyframes,
      boneTrackList: boneTrackKeyframes,
      propertyTrackList: propertyTrackKeyframes,
    };
  }
}

export default KeyframeService;
