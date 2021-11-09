import { all } from 'redux-saga/effects';
import TP from './TP';

export default function* rootSaga() {
  yield all([TP()]);
}
