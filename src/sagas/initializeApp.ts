import { call, put, all, takeLatest, SagaReturnType } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as globalUIActions from 'actions/Common/globalUI';
import * as userActions from 'actions/User';
import { initializeAppAsync } from 'actions/initializeApp';
import popupManager from 'utils/PopupManager';
import planManager from 'utils/PlanManager';
import * as socketActions from 'actions/Common/socket';
import * as lpActions from 'actions/LP/lpNodeAction';

import { UserResponse, UserUsageInfoResponse } from 'types/common';
import * as api from 'api';

function* handleInitializeApp(action: ReturnType<typeof initializeAppAsync.request>) {
  yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, 'userUsage'));

  const { sceneId, token, nodes, dispatch } = action.payload;
  planManager.init(dispatch);
  popupManager.init(dispatch);

  yield put(lpActions.setSceneId(sceneId));
  yield put(socketActions.connectSocket.request({ sceneId, token }));
  yield put(lpActions.initNodes(nodes));

  const [user, usageInfo]: [UserResponse, UserUsageInfoResponse] = yield all([call(api.getUser), call(api.getUserUsageInfo)]);
  yield put(
    userActions.getUserAsync.success({
      name: user.name,
      hadFreeTrial: user.hadFreeTrial,
      planType: usageInfo.planType,
      planName: usageInfo.planName,
      credits: usageInfo.credits,
      storage: usageInfo.storage,
    }),
  );

  yield put(globalUIActions.closeModal('LoadingModal'));

  setTimeout(() => {
    popupManager.next();
  }, 1000);
}

export default function* initAppSaga() {
  yield takeLatest(getType(initializeAppAsync.request), handleInitializeApp);
}
