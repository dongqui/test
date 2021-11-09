import { all } from 'redux-saga/effects';
import dragDropKeyframes from './dragDropKeyframes';
import pasteKeyframes from './pasteKeyframes';

export default function* TPSaga() {
  yield all([dragDropKeyframes(), pasteKeyframes()]);
}
