import { TypeConstant, createAction } from 'typesafe-actions';

// temporal type for example;
interface SocketIOEvent {}

export function createSocketActions<RequestActionArg, SendActionArg, ReceiveActionArg, FailureActionArg, HandleActionArg>(
  TRequestActionType: TypeConstant,
  TSendActionType: TypeConstant,
  TReceiveActionType: TypeConstant,
  TFailureActionType: TypeConstant,
  THandleActionType: TypeConstant,
) {
  return {
    request: createAction(TRequestActionType)<RequestActionArg>(),
    send: createAction(TSendActionType)<SendActionArg>(),
    receive: createAction(TReceiveActionType)<ReceiveActionArg, SocketIOEvent>(),
    failure: createAction(TFailureActionType)<FailureActionArg>(),
    handle: createAction(THandleActionType)<HandleActionArg>(),
  };
}

// ---------------------------------------------------------- Usage example ----------------------------------------------------------

// src/actions/LP ---------------------------------------------------------------------------------------------------------
interface UpdateFolderRequestParam {}
interface UpdateFolderSendParam {}
interface UpdateFolderReceiveParam {}
interface UpdateFolderFailureParam {}
interface UpdateFolderHandleParam {}

const updateFolderSocketActions = createSocketActions<UpdateFolderRequestParam, UpdateFolderSendParam, UpdateFolderReceiveParam, UpdateFolderFailureParam, UpdateFolderHandleParam>(
  'node/UPDATE_FOLDER_SOCKET_REQUEST',
  'node/UPDATE_FOLDER_SOCKET_SEND',
  'node/UPDATE_FOLDER_SOCKET_RECEIVE',
  'node/UPDATE_FOLDER_SOCKET_HANDLE',
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
  // yield put(updateFolderSocketActions.handle(...something));
}

// src/reducers/LP ---------------------------------------------------------------------------------------------------------
// (reducer)
// case: getType(updateFolderSocketActions.handle):
//    update state!

// somewhere in containers ---------------------------------------------------------------------------------------------------------
// dispatch(updateFolderSocketActions.request(...something))
