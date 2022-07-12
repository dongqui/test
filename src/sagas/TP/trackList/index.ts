import { all } from 'redux-saga/effects';

import muteLayerTrack from './muteLayerTrack';
import watchAddLayerSocketActions from './addLayer';
import watchDeleteLayer from './deleteLayer';

export default function* trackListSaga() {
  yield all([muteLayerTrack(), watchAddLayerSocketActions(), watchDeleteLayer()]);
}
