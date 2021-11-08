import { all } from 'redux-saga/effects';
import { watchChangeFileToLoad } from './RP/shootProject';

export default function* rootSaga() {
  yield all([watchChangeFileToLoad()]);
}
