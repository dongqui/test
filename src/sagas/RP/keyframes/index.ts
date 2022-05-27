import { all } from 'redux-saga/effects';

import editKeyframes from './editKeyframes copy';

export default function* keyframesSaga() {
  yield all([editKeyframes()]);
}
