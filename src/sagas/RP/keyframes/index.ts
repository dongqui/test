import { all } from 'redux-saga/effects';

import editKeyframes from './editKeyframes';

import updateKeyframes from './updateKeyframes';

export default function* keyframesSaga() {
  yield all([editKeyframes(), updateKeyframes()]);
}
