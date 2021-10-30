import { TrackListState } from 'reducers/trackList';
import { SelectedLayer, SelectedBones, SelectedProperties } from 'reducers/trackList/types';
import { LayerTrackList, BoneTrackList, PropertyTrackList } from 'reducers/trackList/types';

type SelectedTrackList = SelectedLayer | SelectedBones | SelectedProperties;
type TrackList = LayerTrackList | BoneTrackList | PropertyTrackList;

export interface Service {
  selectClickType(): SelectedTrackList;

  updateTrackList(selectedTrackList: SelectedTrackList): TrackList;

  updateReducerState(newValues: Partial<TrackListState>): TrackListState;
}
