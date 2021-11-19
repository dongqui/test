import { ShootTrack } from 'types/common';
import { TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';

import { Service } from './index';
import { Repository } from '../repository';

class KeyframeService implements Service {
  private readonly layerTrackRepo: Repository;
  private readonly boneTrackRepo: Repository;
  private readonly propertyTrackRepo: Repository;

  constructor(layerTrackRepo: Repository, boneTrackRepo: Repository, propertyTrackRepo: Repository) {
    this.layerTrackRepo = layerTrackRepo;
    this.boneTrackRepo = boneTrackRepo;
    this.propertyTrackRepo = propertyTrackRepo;
  }

  changeSelectedTargets = (shootTracks: ShootTrack[]): Partial<KeyframesState> => {
    return {
      layerTrack: this.layerTrackRepo.initializeTimeEditorTrack(shootTracks) as TimeEditorTrack,
      boneTrackList: this.boneTrackRepo.initializeTimeEditorTrack(shootTracks) as TimeEditorTrack[],
      propertyTrackList: this.propertyTrackRepo.initializeTimeEditorTrack(shootTracks) as TimeEditorTrack[],
      selectedLayerKeyframes: this.layerTrackRepo.clearSelectedKeyframes(),
      selectedBoneKeyframes: this.boneTrackRepo.clearSelectedKeyframes(),
      selectedPropertyKeyframes: this.propertyTrackRepo.clearSelectedKeyframes(),
      copiedPropertyKeyframes: [],
    };
  };
}

export default KeyframeService;
