import { TrackListState } from 'reducers/trackList';
import { LayerTrackList, BoneTrackList } from 'reducers/trackList/types';

export interface Service {
  findTrackIndex(): number;

  updateTrackList(trackIndex: number): LayerTrackList | BoneTrackList;

  updateTrackListState(trackList: LayerTrackList | BoneTrackList): TrackListState;
}
