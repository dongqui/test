import { ShootRetargetMap } from 'types/common';

export type RetargetMapAction =
  | ReturnType<typeof addRetargetMap>
  | ReturnType<typeof removeRetargetMap>;

const ADD_RETARGET_MAP = 'retargetMapsAction/ADD_RETARGET_MAP' as const;
const REMOVE_RETARGET_MAP = 'retargetMapsAction/REMOVE_RETARGET_MAP' as const;

interface AddRetargetMap {
  retargetMap: ShootRetargetMap;
}

interface RemoveRetargetMap {
  assetId: string;
}

/**
 * retargetMap을 추가합니다. 새로 asset을 로드할 때 호출합니다.
 *
 * @param retargetMap - 추가할 retargetMap
 */
export const addRetargetMap = (params: AddRetargetMap) => ({
  type: ADD_RETARGET_MAP,
  payload: {
    ...params,
  },
});

/**
 * retargetMap을 제거합니다. asset을 LP에서 제거할 때 호출합니다.
 *
 * @param assetId - retargetMap을 삭제할 asset의 id
 */
export const removeRetargetMap = (params: RemoveRetargetMap) => ({
  type: REMOVE_RETARGET_MAP,
  payload: {
    ...params,
  },
});
