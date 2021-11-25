import { PlaskTrack } from 'types/common';
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

  changeSelectedTargets = (plaskTracks: PlaskTrack[]): Partial<KeyframesState> => {
    return {
      layerTrack: this.layerTrackRepo.initializeTimeEditorTrack(plaskTracks) as TimeEditorTrack,
      boneTrackList: this.boneTrackRepo.initializeTimeEditorTrack(plaskTracks) as TimeEditorTrack[],
      propertyTrackList: this.propertyTrackRepo.initializeTimeEditorTrack(plaskTracks) as TimeEditorTrack[],
      selectedLayerKeyframes: this.layerTrackRepo.clearSelectedKeyframes(),
      selectedBoneKeyframes: this.boneTrackRepo.clearSelectedKeyframes(),
      selectedPropertyKeyframes: this.propertyTrackRepo.clearSelectedKeyframes(),
      copiedPropertyKeyframes: [],
    };
  };

  clearAnimation = (): Partial<KeyframesState> => {
    return {
      layerTrack: { trackId: '', trackType: 'layer', trackNumber: -1, keyframes: [] },
      boneTrackList: [],
      propertyTrackList: [],
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedPropertyKeyframes: [],
      copiedPropertyKeyframes: [],
    };
  };
}

export default KeyframeService;
