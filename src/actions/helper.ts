import { TypeConstant, createAction } from 'typesafe-actions';

export function createSocketActions<
  TRequestType extends TypeConstant,
  TSendType extends TypeConstant,
  TReceiveType extends TypeConstant,
  TUpdateType extends TypeConstant,
  TFailureType extends TypeConstant
>(TRequestActionType: TRequestType, TSendActionType: TSendType, TReceiveActionType: TReceiveType, TUpdateActionType: TUpdateType, TFailureActionType: TFailureType) {
  return function <RequestActionParam, SendActionParam, ReceiveActionParam, UpdateActionParam, FailureActionParam>() {
    return {
      request: createAction(TRequestActionType)<TRequestType, RequestActionParam>(),
      send: createAction(TSendActionType)<TSendType, SendActionParam>(),
      receive: createAction(TReceiveActionType)<TReceiveType, ReceiveActionParam>(),
      update: createAction(TUpdateActionType)<TUpdateType, UpdateActionParam>(),
      failure: createAction(TFailureActionType)<TFailureType, FailureActionParam>(),
    };
  };
}

// ---------------------------------------------------------- Usage example ----------------------------------------------------------

// src/actions/LP ---------------------------------------------------------------------------------------------------------
interface UpdateFolderRequestParam {}
interface UpdateFolderSendParam {}
interface UpdateFolderReceiveParam {}
interface UpdateFolderFailureParam {}
interface UpdateFolderUpdateParam {}

const updateFolderSocketActions = createSocketActions(
  'node/UPDATE_FOLDER_SOCKET_REQUEST',
  'node/UPDATE_FOLDER_SOCKET_SEND',
  'node/UPDATE_FOLDER_SOCKET_RECEIVE',
  'node/UPDATE_FOLDER_SOCKET_UPDATE',
  'node/UPDATE_FOLDER_SOCKET_FAILURE',
)<UpdateFolderRequestParam, UpdateFolderSendParam, UpdateFolderReceiveParam, UpdateFolderFailureParam, UpdateFolderUpdateParam>();

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
