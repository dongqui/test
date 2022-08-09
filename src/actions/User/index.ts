import { createAsyncAction } from 'typesafe-actions';

import { UserUsageInfoReponse } from 'types/common';

export const getUserAsync = createAsyncAction('user/GET_USER_REQUEST', 'user/GET_USER_SUCCESS', 'user/GET_USER_FAILURE')<undefined, string, Error>();
export const getUserUsagaInfoAsync = createAsyncAction('user/GET_USER_USAGE_INFO_REQUEST', 'user/GET_USER_USAGE_INFO_SUCCESS', 'user/GET_USER_USAGE_INFO_FAILURE')<
  undefined,
  Partial<UserUsageInfoReponse>,
  Error
>();
