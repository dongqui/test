import { all } from 'redux-saga/effects';
import TP from './TP';
import RPSaga from './RP';

export default function* rootSaga() {
  yield all([TP(), RPSaga()]);
}
