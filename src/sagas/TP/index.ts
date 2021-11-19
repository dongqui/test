import { all } from 'redux-saga/effects';
import changeSelectedTargets from './changeSelectedTargets';
import dragDropKeyframes from './dragDropKeyframes';
import pasteKeyframes from './pasteKeyframes';

export default function* TPSaga() {
  yield all([changeSelectedTargets(), dragDropKeyframes(), pasteKeyframes()]);
}
