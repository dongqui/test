import { call, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { UserUsageInfoResponse, UserCreditInfoResponse } from 'types/common';
import * as globalUIActions from 'actions/Common/globalUI';
import * as userActions from 'actions/User';
import * as api from 'api';

function* handleGetUserUsageInfo() {
  try {
    yield put(userActions.setUsageInfoLoading(true));
    const usageInfo: UserUsageInfoResponse = yield call(api.getUserUsageInfo);
    yield put(
      userActions.getUserUsagaInfoAsync.success({
        planType: usageInfo.planType,
        planName: usageInfo.planName,
        credits: usageInfo.credits,
        storage: usageInfo.storage,
      }),
    );

    yield put(globalUIActions.closeModal('UpgradePlanModal'));
  } catch (e) {
  } finally {
    yield put(userActions.setUsageInfoLoading(true));
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
    takeLatest(getType(userActions.getUserUsagaInfoAsync.request), handleGetUserUsageInfo),
    takeLatest(getType(userActions.getUserStorageInfoAsync.request), handleGetUserStorageInfo),
    takeLatest(getType(userActions.getUserCreditInfoAsync.request), handleGetUserCreditInfo),
  ]);
}
