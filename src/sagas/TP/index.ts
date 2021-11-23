import { all } from 'redux-saga/effects';

import changeSelectedTargets from './changeSelectedTargets';
import keyframesSaga from './keyframes';
import trackListSaga from './trackList';

export default function* TPSaga() {
  yield all([changeSelectedTargets(), keyframesSaga(), trackListSaga()]);
}
