import { TrackListState } from 'reducers/trackList';
import { SelectedLayer, SelectedBones, SelectedTransforms } from 'reducers/trackList/types';
import { LayerTrackList, BoneTrackList, TrnasformTrackList } from 'reducers/trackList/types';

type SelectedTrackList = SelectedLayer | SelectedBones | SelectedTransforms;
type TrackList = LayerTrackList | BoneTrackList | TrnasformTrackList;

export interface Service {
  selectClickType(): SelectedTrackList;

  updateTrackList(selectedTrackList: SelectedTrackList): TrackList;

  updateReducerState(newValues: Partial<TrackListState>): TrackListState;
}
