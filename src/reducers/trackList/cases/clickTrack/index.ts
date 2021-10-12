import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { TrackChecker, layerTrackConfig, boneTrackConfig, transformTrackConfig } from './config';

function clickTrackBody(state: TrackListState, payload: ClickTrackBody) {
  const trackChecker = new TrackChecker();
  if (trackChecker.isLayerTrack(payload)) {
    return layerTrackConfig(state, payload);
  }
  if (trackChecker.isBoneTrack(payload)) {
    return boneTrackConfig(state, payload);
  }
  if (trackChecker.isTransformTrack(payload)) {
    return transformTrackConfig(state, payload);
  }
  return state;
}

export default clickTrackBody;
