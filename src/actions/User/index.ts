import { createAsyncAction, createAction } from 'typesafe-actions';

import { UserUsageInfoResponse, UserCreditInfoResponse, UserState } from 'types/common';

export const getUserAsync = createAsyncAction('user/GET_USER_REQUEST', 'user/GET_USER_SUCCESS', 'user/GET_USER_FAILURE')<undefined, Partial<UserState>, Error>();

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

export const upgradePlanAsync = createAsyncAction('user/UPGRADE_PLAN_REQUEST', 'user/UPGRADE_PLAN_SUCCESS', 'user/UPGRADE_PLAN_FAILURE')<boolean, string, Error>();

export const setUsageInfoLoading = createAction('user/SET_USAGE_INFO_LOADING')<boolean>();
