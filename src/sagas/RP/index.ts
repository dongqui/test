import { all } from 'redux-saga/effects';

import keyframesSaga from './keyframes';
import ikSaga from './ik';

export default function* RPSaga() {
  yield all([keyframesSaga(), ikSaga()]);
}
