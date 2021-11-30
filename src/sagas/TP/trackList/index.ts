import { all } from 'redux-saga/effects';

import addNewLayerTrack from './addNewLayerTrack';
import deleteLayerTrack from './deleteLayerTrack';
import muteLayerTrack from './muteLayerTrack';

export default function* trackListSaga() {
  yield all([addNewLayerTrack(), deleteLayerTrack(), muteLayerTrack()]);
}
