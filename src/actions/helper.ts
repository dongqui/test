import { TypeConstant, createAction } from 'typesafe-actions';

// temporal type for example;
interface SocketIOEvent {}

export function createSocketActions<RequestActionParam, SendActionParam, ReceiveActionParam, FailureActionParam, UpdateActionParam>(
  TRequestActionType: TypeConstant,
  TSendActionType: TypeConstant,
  TReceiveActionType: TypeConstant,
  TFailureActionType: TypeConstant,
  TUpdateActionType: TypeConstant,
) {
  return {
    request: createAction(TRequestActionType)<RequestActionParam>(),
    send: createAction(TSendActionType)<SendActionParam>(),
    receive: createAction(TReceiveActionType)<ReceiveActionParam, SocketIOEvent>(),
    failure: createAction(TFailureActionType)<FailureActionParam>(),
    update: createAction(TUpdateActionType)<UpdateActionParam>(),
  };
}

// ---------------------------------------------------------- Usage example ----------------------------------------------------------

// src/actions/LP ---------------------------------------------------------------------------------------------------------
interface UpdateFolderRequestParam {}
interface UpdateFolderSendParam {}
interface UpdateFolderReceiveParam {}
interface UpdateFolderFailureParam {}
interface UpdateFolderUpdateParam {}

const updateFolderSocketActions = createSocketActions<UpdateFolderRequestParam, UpdateFolderSendParam, UpdateFolderReceiveParam, UpdateFolderFailureParam, UpdateFolderUpdateParam>(
  'node/UPDATE_FOLDER_SOCKET_REQUEST',
  'node/UPDATE_FOLDER_SOCKET_SEND',
  'node/UPDATE_FOLDER_SOCKET_RECEIVE',
  'node/UPDATE_FOLDER_SOCKET_UPDATE',
  'node/UPDATE_FOLDER_SOCKET_FAILURE',
);

// src/sagas/LP/updateFolder ---------------------------------------------------------------------------------------------------------
function* updateFolderRequest(action: ReturnType<typeof updateFolderSocketActions.request>) {
  // const payloads = action.payload;
  // do something
  // yield put(updateFolderSocketActions.send(...something))
}

function* updateFolderSend(action: ReturnType<typeof updateFolderSocketActions.send>) {
  // const payloads = action.payload;
  //socket.emit('event name', ...something);
}

// Maybe emit 'updateFolderSocketActions.receive' in somewhere we handle saga-socket channel
function* uppdateFolderReceive(action: ReturnType<typeof updateFolderSocketActions.receive>) {
  // const payloads = action.payload;
  // do something
  // yield put(updateFolderSocketActions.Update(...something));
}

// src/reducers/LP ---------------------------------------------------------------------------------------------------------
// (reducer)
// case: getType(updateFolderSocketActions.Update):
//    update state!

// somewhere in containers ---------------------------------------------------------------------------------------------------------
// dispatch(updateFolderSocketActions.request(...something))
