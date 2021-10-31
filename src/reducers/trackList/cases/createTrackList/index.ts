import { TrackListState } from 'reducers/trackList';
import { layerTrackConfig, boneTrackConfig, transformTrackConfig } from './config';

const createTrackList = (state: TrackListState, payload: any) => {
  return layerTrackConfig(state, payload);
};

export default createTrackList;
