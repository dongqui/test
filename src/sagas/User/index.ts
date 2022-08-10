import { call, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { UserResponse, UserUsageInfoReponse } from 'types/common';
import * as userActions from 'actions/User';
import * as api from 'api';

function* handleGetUser() {
  try {
    const user: UserResponse = yield call(api.getUser);
    yield put(
      userActions.getUserAsync.success({
        name: user.name,
        hadFreeTrial: user.hadFreeTrial,
      }),
    );
  } catch (e) {}
}

function* handleGetUserUsageInfo() {
  try {
    const usageInfo: UserUsageInfoReponse = yield call(api.getUserUsageInfo);
    console.log(usageInfo);
    yield put(
      userActions.getUserUsagaInfoAsync.success({
        planName: usageInfo.planName,
        credits: usageInfo.credits,
        storage: usageInfo.storage,
      }),
    );
  } catch (e) {}
}

export default function* userSaga() {
  yield all([takeLatest(getType(userActions.getUserAsync.request), handleGetUser), takeLatest(getType(userActions.getUserUsagaInfoAsync.request), handleGetUserUsageInfo)]);
}
