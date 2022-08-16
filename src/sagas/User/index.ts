import { call, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { UserResponse, UserUsageInfoResponse, UserCreditInfoResponse } from 'types/common';
import * as globalUIActions from 'actions/Common/globalUI';
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
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, 'userUsage'));
    const usageInfo: UserUsageInfoResponse = yield call(api.getUserUsageInfo);
    yield put(
      userActions.getUserUsagaInfoAsync.success({
        planType: usageInfo.planType,
        planName: usageInfo.planName,
        credits: usageInfo.credits,
        storage: usageInfo.storage,
      }),
    );
  } catch (e) {
  } finally {
    yield put(globalUIActions.closeModal('userUsage'));
  }
}

function* handleGetUserCreditInfo() {
  try {
    const credits: UserCreditInfoResponse = yield call(api.getUserCreditInfo);
    yield put(userActions.getUserCreditInfoAsync.success(credits));
  } catch (e) {
  } finally {
    yield put(globalUIActions.closeModal('userUsage'));
  }
}

function* handleGetUserStorageInfo() {
  try {
    const storage: UserUsageInfoResponse['storage'] = yield call(api.getUserStorageInfo);
    yield put(userActions.getUserStorageInfoAsync.success(storage));
  } catch (e) {
  } finally {
  }
}

export default function* userSaga() {
  yield all([
    takeLatest(getType(userActions.getUserAsync.request), handleGetUser),
    takeLatest(getType(userActions.getUserUsagaInfoAsync.request), handleGetUserUsageInfo),
    takeLatest(getType(userActions.getUserStorageInfoAsync.request), handleGetUserStorageInfo),
    takeLatest(getType(userActions.getUserCreditInfoAsync.request), handleGetUserCreditInfo),
  ]);
}
