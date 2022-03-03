export type PlaskEngineSyncAction = ReturnType<typeof plaskEngineSyncAction>;
export const PLASK_ENGINE_SYNC = '__plaskEngineGenericSync__';
export const plaskEngineSyncAction = (params: any) => ({
  type: PLASK_ENGINE_SYNC,
  payload: params,
});
