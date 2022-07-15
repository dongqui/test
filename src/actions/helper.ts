import { TypeConstant, createAction } from 'typesafe-actions';

export function createSocketActions<
  TRequestType extends TypeConstant,
  TSendType extends TypeConstant,
  TReceiveType extends TypeConstant,
  TUpdateType extends TypeConstant,
  TFailureType extends TypeConstant,
>(TRequestActionType: TRequestType, TSendActionType: TSendType, TReceiveActionType: TReceiveType, TUpdateActionType: TUpdateType, TFailureActionType: TFailureType) {
  return function <RequestActionParam, SendActionParam, ReceiveActionParam, UpdateActionParam, FailureActionParam>() {
    return {
      request: createAction(TRequestActionType)<RequestActionParam>(),
      send: createAction(TSendActionType)<SendActionParam>(),
      receive: createAction(TReceiveActionType)<ReceiveActionParam>(),
      update: createAction(TUpdateActionType)<UpdateActionParam>(),
      failure: createAction(TFailureActionType)<FailureActionParam>(),
    };
  };
}
