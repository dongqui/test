import { RetargetMapItem, TargetBoneType } from 'types/CP';

export type RetargetDataAction =
  | ReturnType<typeof setRetargetInfo>
  | ReturnType<typeof setRetargetMap>;

interface SetRetargetInfo {
  modelKey: string;
  targetboneList: TargetBoneType[];
  retargetMap: RetargetMapItem[];
}
export const SET_RETARGET_INFO = 'retargetData/SET_RETARGET_INFO' as const;
export const setRetargetInfo = (params: SetRetargetInfo) => ({
  type: SET_RETARGET_INFO,
  payload: {
    ...params,
  },
});

interface SetRetargetMap {
  retargetMap: RetargetMapItem[];
}
export const SET_RETARGET_MAP = 'retargetData/SET_RETARGET_MAP' as const;
export const setRetargetMap = (params: SetRetargetMap) => ({
  type: SET_RETARGET_MAP,
  payload: {
    ...params,
  },
});
