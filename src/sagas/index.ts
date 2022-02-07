import { all } from 'redux-saga/effects';
import TP from './TP';
import RPSaga from './RP';
import LPSaga from './LP';

export default function* rootSaga() {
  yield all([TP(), RPSaga(), LPSaga()]);
}
