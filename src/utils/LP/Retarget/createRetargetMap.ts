import * as BABYLON from '@babylonjs/core';

import { createAutoRetargetMap, createEmptyRetargetMap } from 'utils/LP/Retarget';

export default async function createRetargetMap(assetId: string, skeletons: BABYLON.Skeleton[]) {
  try {
    return await createAutoRetargetMap(assetId, skeletons[0]?.bones, 3000);
  } catch (e) {
    return createEmptyRetargetMap(assetId);
  }
}
