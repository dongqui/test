import { all } from 'redux-saga/effects';
import TP from './TP';
import RPSaga from './RP';
import LPSaga from './LP';
import CPSaga from './CP';
import UserSaga from './User';
import socketSaga from './socket.saga';

export default function* rootSaga() {
  yield all([TP(), RPSaga(), LPSaga(), socketSaga(), CPSaga(), UserSaga()]);
}
