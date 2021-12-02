import { PlaskRetargetMap } from 'types/common';
import { getRandomStringKey } from 'utils/common';

const DEFAULT_HIP_SPACE = 106;

/**
 * targetBone을 포함하지 않는 기본 리타겟맵을 생성합니다.
 * 기본 hipSpace 값으로 106(%)를 가집니다.
 *
 * @param assetId - 대상 asset의 id
 */
const createEmptyRetargetMap = (assetId: string): PlaskRetargetMap => {
  return {
    id: getRandomStringKey(),
    assetId,
    hipSpace: DEFAULT_HIP_SPACE,
    values: [
      { sourceBoneName: 'hips', targetTransformNodeId: null },
      { sourceBoneName: 'leftUpLeg', targetTransformNodeId: null },
      { sourceBoneName: 'rightUpLeg', targetTransformNodeId: null },
      { sourceBoneName: 'spine', targetTransformNodeId: null },
      { sourceBoneName: 'leftLeg', targetTransformNodeId: null },
      { sourceBoneName: 'rightLeg', targetTransformNodeId: null },
      { sourceBoneName: 'spine1', targetTransformNodeId: null },
      { sourceBoneName: 'leftFoot', targetTransformNodeId: null },
      { sourceBoneName: 'rightFoot', targetTransformNodeId: null },
      { sourceBoneName: 'spine2', targetTransformNodeId: null },
      { sourceBoneName: 'leftToeBase', targetTransformNodeId: null },
      { sourceBoneName: 'rightToeBase', targetTransformNodeId: null },
      { sourceBoneName: 'neck', targetTransformNodeId: null },
      { sourceBoneName: 'leftShoulder', targetTransformNodeId: null },
      { sourceBoneName: 'rightShoulder', targetTransformNodeId: null },
      { sourceBoneName: 'head', targetTransformNodeId: null },
      { sourceBoneName: 'leftArm', targetTransformNodeId: null },
      { sourceBoneName: 'rightArm', targetTransformNodeId: null },
      { sourceBoneName: 'leftForeArm', targetTransformNodeId: null },
      { sourceBoneName: 'rightForeArm', targetTransformNodeId: null },
      { sourceBoneName: 'leftHand', targetTransformNodeId: null },
      { sourceBoneName: 'rightHand', targetTransformNodeId: null },
      { sourceBoneName: 'leftHandIndex1', targetTransformNodeId: null },
      { sourceBoneName: 'rightHandIndex1', targetTransformNodeId: null },
    ],
  };
};

export default createEmptyRetargetMap;
