import { createAsyncAction } from 'typesafe-actions';

import { UserUsageInfoResponse, UserCreditInfoResponse } from 'types/common';

export const getUserAsync = createAsyncAction('user/GET_USER_REQUEST', 'user/GET_USER_SUCCESS', 'user/GET_USER_FAILURE')<
  undefined,
  { name: string; hadFreeTrial: boolean },
  Error
>();

export const getUserUsagaInfoAsync = createAsyncAction('user/GET_USER_USAGE_INFO_REQUEST', 'user/GET_USER_USAGE_INFO_SUCCESS', 'user/GET_USER_USAGE_INFO_FAILURE')<
  undefined,
  Partial<UserUsageInfoResponse>,
  Error
>();

export const getUserCreditInfoAsync = createAsyncAction('user/GET_USER_CREDIT_INFO_REQUEST', 'user/GET_USER_CREDIT_INFO_SUCCESS', 'user/GET_USER_CREDIT_INFO_FAILURE')<
  undefined,
  UserCreditInfoResponse,
  Error
>();

export const getUserStorageInfoAsync = createAsyncAction('user/GET_USER_STORAGE_INFO_REQUEST', 'user/GET_USER_STORAGE_INFO_SUCCESS', 'user/GET_USER_STORAGE_INFO_FAILURE')<
  undefined,
  UserUsageInfoResponse['storage'],
  Error
>();
