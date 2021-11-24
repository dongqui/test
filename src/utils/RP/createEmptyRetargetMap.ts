import { v4 as uuidv4 } from 'uuid';
import { PlaskRetargetMap } from 'types/common';

const DEFAULT_HIP_SPACE = 106;

/**
 * targetBone을 포함하지 않는 기본 리타겟맵을 생성합니다.
 * 기본 hipSpace 값으로 106(%)를 가집니다.
 *
 * @param assetId - 대상 asset의 id
 */
const createEmptyRetargetMap = (assetId: string): PlaskRetargetMap => {
  return {
    id: uuidv4(),
    assetId,
    hipSpace: DEFAULT_HIP_SPACE,
    values: [
      { sourceBoneName: 'hips', targetBoneId: null },
      { sourceBoneName: 'leftUpLeg', targetBoneId: null },
      { sourceBoneName: 'rightUpLeg', targetBoneId: null },
      { sourceBoneName: 'spine', targetBoneId: null },
      { sourceBoneName: 'leftLeg', targetBoneId: null },
      { sourceBoneName: 'rightLeg', targetBoneId: null },
      { sourceBoneName: 'spine1', targetBoneId: null },
      { sourceBoneName: 'leftFoot', targetBoneId: null },
      { sourceBoneName: 'rightFoot', targetBoneId: null },
      { sourceBoneName: 'spine2', targetBoneId: null },
      { sourceBoneName: 'leftToeBase', targetBoneId: null },
      { sourceBoneName: 'rightToeBase', targetBoneId: null },
      { sourceBoneName: 'neck', targetBoneId: null },
      { sourceBoneName: 'leftShoulder', targetBoneId: null },
      { sourceBoneName: 'rightShoulder', targetBoneId: null },
      { sourceBoneName: 'head', targetBoneId: null },
      { sourceBoneName: 'leftArm', targetBoneId: null },
      { sourceBoneName: 'rightArm', targetBoneId: null },
      { sourceBoneName: 'leftForeArm', targetBoneId: null },
      { sourceBoneName: 'rightForeArm', targetBoneId: null },
      { sourceBoneName: 'leftHand', targetBoneId: null },
      { sourceBoneName: 'rightHand', targetBoneId: null },
      { sourceBoneName: 'leftHandIndex1', targetBoneId: null },
      { sourceBoneName: 'rightHandIndex1', targetBoneId: null },
    ],
  };
};

export default createEmptyRetargetMap;
