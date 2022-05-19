import { all } from 'redux-saga/effects';

import addNewLayerTrack from './addNewLayerTrack';
import deleteLayerTrack from './deleteLayerTrack';
import muteLayerTrack from './muteLayerTrack';
import watchAddLayerSocketActions from './addLayer';
import watchDeleteLayer from './deleteLayer';

export default function* trackListSaga() {
  yield all([addNewLayerTrack(), deleteLayerTrack(), muteLayerTrack(), watchAddLayerSocketActions(), watchDeleteLayer()]);
}
