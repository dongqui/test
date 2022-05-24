import { all } from 'redux-saga/effects';

import deleteKeyframes from './deleteKeyframes copy';
import dragDropKeyframes from './dragDropKeyframes';
import pasteKeyframes from './pasteKeyframes copy';
import moveKeyFrames from './moveKeyframes';

export default function* keyframesSaga() {
  yield all([deleteKeyframes(), dragDropKeyframes(), pasteKeyframes(), moveKeyFrames()]);
}
