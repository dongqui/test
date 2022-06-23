import { all } from 'redux-saga/effects';

import addIK from './addIK';

export default function* ikSaga() {
  yield all([addIK()]);
}
