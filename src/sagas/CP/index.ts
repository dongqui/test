import { takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as cpActions from 'actions/CP';
import handleAssignRetargetmap from './assignRetargetmap';

export default function* CPSaga() {
  yield all([takeLatest(getType(cpActions.assignRetargetmapAsync.request), handleAssignRetargetmap)]);
}
