import { all } from 'redux-saga/effects';

import deleteKeyframes from './deleteKeyframes';
import dragDropKeyframes from './dragDropKeyframes';
import pasteKeyframes from './pasteKeyframes';

export default function* KeyframesSaga() {
  yield all([deleteKeyframes(), dragDropKeyframes(), pasteKeyframes()]);
}
