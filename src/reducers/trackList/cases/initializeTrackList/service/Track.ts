import { PlaskLayer, PlaskTrack } from 'types/common';
import { LayerTrack, BoneTrack, PropertyTrack } from 'types/TP/track';
import { TrackListState } from 'reducers/trackList';

import { Serivice } from './index';
import { Repository } from '../repository';

class TrackService implements Serivice {
  private readonly layerTrackRepo: Repository;
  private readonly boneTrackRepo: Repository;
  private readonly propertyTrackRepo: Repository;

  constructor(layerTrackRepo: Repository, boneTrackRepo: Repository, propertyTrackRepo: Repository) {
    this.layerTrackRepo = layerTrackRepo;
    this.boneTrackRepo = boneTrackRepo;
    this.propertyTrackRepo = propertyTrackRepo;
  }

  visualizeAnimation = (list: PlaskLayer[]): Partial<TrackListState> => {
    return {
      layerTrackList: this.layerTrackRepo.initializeTrackList(list) as LayerTrack[],
      boneTrackList: [],
      propertyTrackList: [],
      selectedLayer: this.layerTrackRepo.initializeSelectedTracks(list) as string,
      selectedBones: this.boneTrackRepo.initializeSelectedTracks() as number[],
      selectedProperties: this.propertyTrackRepo.initializeSelectedTracks() as number[],
      trackScrollTop: 0,
    };
  };

  changeSelectedTargets = (list: PlaskTrack[]): Partial<TrackListState> => {
    return {
      boneTrackList: this.boneTrackRepo.initializeTrackList(list) as BoneTrack[],
      propertyTrackList: this.propertyTrackRepo.initializeTrackList(list) as PropertyTrack[],
      selectedBones: this.boneTrackRepo.initializeSelectedTracks() as number[],
      selectedProperties: this.propertyTrackRepo.initializeSelectedTracks() as number[],
      trackScrollTop: 0,
    };
  };

  clearAnimation = (): Partial<TrackListState> => {
    return {
      layerTrackList: [],
      boneTrackList: [],
      propertyTrackList: [],
      selectedLayer: '',
      selectedBones: [],
      selectedProperties: [],
      trackScrollTop: 0,
    };
  };
}

export default TrackService;
