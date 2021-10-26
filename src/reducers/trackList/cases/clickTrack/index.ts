import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { layerTrackConfig, boneTrackConfig, transformTrackConfig } from './config';

const clickTrackBody = (state: TrackListState, payload: ClickTrackBody) => {
  if (payload.trackType === 'layer') {
    return layerTrackConfig(state, payload);
  }
  if (payload.trackType === 'bone') {
    return boneTrackConfig(state, payload);
  }
  if (payload.trackType === 'transform') {
    return transformTrackConfig(state, payload);
  }
  return state;
};

export default clickTrackBody;
