import { changeHipSpace } from './../../actions/animationDataAction';
import { takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as cpActions from 'actions/CP';
import handleAssignRetargetmap from './assignRetargetmap';
import handleEditHipsace from './editHipspace';

export default function* CPSaga() {
  yield all([takeLatest(getType(cpActions.assignRetargetmapAsync.request), handleAssignRetargetmap), takeLatest(getType(cpActions.editHipspaceAsync.request), handleEditHipsace)]);
}
