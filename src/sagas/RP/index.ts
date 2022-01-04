import { all } from 'redux-saga/effects';

import keyframesSaga from './keyframes';

export default function* RPSaga() {
  yield all([keyframesSaga()]);
}
