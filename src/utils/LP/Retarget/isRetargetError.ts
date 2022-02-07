import { PlaskRetargetMap } from 'types/common';

function isRetargetError(retargetMap: PlaskRetargetMap) {
  return retargetMap.values.some((value) => !value.targetTransformNodeId);
}

export default isRetargetError;
