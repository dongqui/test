import {
  ClickTrackBody,
  ClickLayerTrackBody,
  ClickBoneTrackBody,
  ClickPropertyTrackBody,
} from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { layerTrackConfig, boneTrackConfig, propertyTrackConfig } from './config';

const clickTrackBody = (state: TrackListState, payload: ClickTrackBody) => {
  if (payload.trackType === 'layer') {
    return layerTrackConfig(state, payload as ClickLayerTrackBody);
  }
  if (payload.trackType === 'bone') {
    return boneTrackConfig(state, payload as ClickBoneTrackBody);
  }
  if (payload.trackType === 'property') {
    return propertyTrackConfig(state, payload as ClickPropertyTrackBody);
  }
  return state;
};

export default clickTrackBody;
