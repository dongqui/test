import { all } from 'redux-saga/effects';
import { watchMode } from './mode';
import { watchLpSearchword } from './lpSearchword';

export default function* rootSaga() {
  yield all([watchMode(), watchLpSearchword()]);
}
