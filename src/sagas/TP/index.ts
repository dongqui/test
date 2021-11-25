import { all } from 'redux-saga/effects';

import addNewLayerTrack from './addNewLayerTrack';
import changeSelectedTargets from './changeSelectedTargets';
import deleteLayerTrack from './deleteLayerTrack';
import dragDropKeyframes from './dragDropKeyframes';
import muteLayerTrack from './muteLayerTrack';
import pasteKeyframes from './pasteKeyframes';

export default function* TPSaga() {
  yield all([addNewLayerTrack(), changeSelectedTargets(), deleteLayerTrack(), dragDropKeyframes(), muteLayerTrack(), pasteKeyframes()]);
}
