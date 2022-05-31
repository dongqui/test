import { all } from 'redux-saga/effects';

import deleteKeyframes from './deleteKeyframes';
import pasteKeyframes from './pasteKeyframes';
import moveKeyFrames from './moveKeyframes';

export default function* keyframesSaga() {
  yield all([deleteKeyframes(), pasteKeyframes(), moveKeyFrames()]);
}
