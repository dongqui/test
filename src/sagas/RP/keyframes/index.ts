import { all } from 'redux-saga/effects';

import editKeyframes from './editKeyframes';

export default function* keyframesSaga() {
  yield all([editKeyframes()]);
}
