import {
  ClickTrackBody,
  ClickLayerTrackBody,
  ClickBoneTrackBody,
  ClickTransformTrackBody,
} from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { layerTrackConfig, boneTrackConfig, transformTrackConfig } from './config';

const clickTrackBody = (state: TrackListState, payload: ClickTrackBody) => {
  if (payload.trackType === 'layer') {
    return layerTrackConfig(state, payload as ClickLayerTrackBody);
  }
  if (payload.trackType === 'bone') {
    return boneTrackConfig(state, payload as ClickBoneTrackBody);
  }
  if (payload.trackType === 'transform') {
    return transformTrackConfig(state, payload as ClickTransformTrackBody);
  }
  return state;
};

export default clickTrackBody;
