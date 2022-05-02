import { createAsyncAction } from 'typesafe-actions';

export const connectSocket = createAsyncAction('socket/CONNECT_SOCKET_REQUEST', 'socket/CONNECT_SOCKET_SUCCESS', 'socket/CONNECT_SOCKET_FAILURE')<
  { sceneId: string; token: string },
  null,
  Error
>();
