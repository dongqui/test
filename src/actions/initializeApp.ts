import { createAsyncAction } from 'typesafe-actions';
import { InitAppRequest } from 'types/common';

export const initializeAppAsync = createAsyncAction('app/INIT_REQUEST', 'app/INIT_SUCCESS', 'app/INIT_FAILURE')<InitAppRequest>();
