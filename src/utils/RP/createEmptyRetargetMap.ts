import { v4 as uuidv4 } from 'uuid';
import { ShootRetargetMap } from 'types/common';

const DEFAULT_HIP_SPACE = 100;

/**
 * targetBone을 포함하지 않는 기본 리타겟맵을 생성합니다.
 * 각 sourceBone은 기본 hipSpace 값으로 100(%)를 가집니다.
 *
 * @param assetId - 대상 asset의 id
 */
const createEmptyRetargetMap = (assetId: string): ShootRetargetMap => {
  return {
    id: uuidv4(),
    assetId,
    hips: { hipSpace: DEFAULT_HIP_SPACE },
    leftUpLeg: { hipSpace: DEFAULT_HIP_SPACE },
    rightUpLeg: { hipSpace: DEFAULT_HIP_SPACE },
    spine: { hipSpace: DEFAULT_HIP_SPACE },
    leftLeg: { hipSpace: DEFAULT_HIP_SPACE },
    rightLeg: { hipSpace: DEFAULT_HIP_SPACE },
    spine1: { hipSpace: DEFAULT_HIP_SPACE },
    leftFoot: { hipSpace: DEFAULT_HIP_SPACE },
    rightFoot: { hipSpace: DEFAULT_HIP_SPACE },
    spine2: { hipSpace: DEFAULT_HIP_SPACE },
    leftToeBase: { hipSpace: DEFAULT_HIP_SPACE },
    rightToeBase: { hipSpace: DEFAULT_HIP_SPACE },
    neck: { hipSpace: DEFAULT_HIP_SPACE },
    leftShoulder: { hipSpace: DEFAULT_HIP_SPACE },
    rightShoulder: { hipSpace: DEFAULT_HIP_SPACE },
    head: { hipSpace: DEFAULT_HIP_SPACE },
    leftArm: { hipSpace: DEFAULT_HIP_SPACE },
    rightArm: { hipSpace: DEFAULT_HIP_SPACE },
    leftForeArm: { hipSpace: DEFAULT_HIP_SPACE },
    rightForeArm: { hipSpace: DEFAULT_HIP_SPACE },
    leftHand: { hipSpace: DEFAULT_HIP_SPACE },
    rightHand: { hipSpace: DEFAULT_HIP_SPACE },
    leftHandIndex1: { hipSpace: DEFAULT_HIP_SPACE },
    rightHandIndex1: { hipSpace: DEFAULT_HIP_SPACE },
  };
};

export default createEmptyRetargetMap;
