import { all } from 'redux-saga/effects';
import { watchLpSearchword } from './lpSearchword';
import { watchLpData } from './lpData';

export default function* rootSaga() {
  yield all([watchLpSearchword(), watchLpData()]);
}
