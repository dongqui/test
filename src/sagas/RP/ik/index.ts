import { all } from 'redux-saga/effects';

import addIK from './addIK';
import removeIK from './removeIK';

export default function* ikSaga() {
  yield all([addIK(), removeIK()]);
}
