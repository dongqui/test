import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';
import { BvhBoneType, PlaskBvhMap, PlaskRetargetMap, RetargetSourceBoneType } from 'types/common';

const DEFAULT_TIMEOUT = 3000;

const BVH_TO_SOURCE_MAP: {
  [bone in BvhBoneType]: RetargetSourceBoneType;
} = {
  Hips: 'hips',
  Chest: 'spine',
  Chest2: 'spine1',
  Chest3: 'spine2',
  Neck: 'neck',
  Head: 'head',
  LeftCollar: 'leftShoulder',
  LeftUpArm: 'leftArm',
  LeftLowArm: 'leftForeArm',
  LeftHand: 'leftHand',
  RightCollar: 'rightShoulder',
  RightUpArm: 'rightArm',
  RightLowArm: 'rightForeArm',
  RightHand: 'rightHand',
  LeftUpLeg: 'leftUpLeg',
  LeftLowLeg: 'leftLeg',
  LeftFoot: 'leftFoot',
  LeftToe: 'leftToeBase',
  RightUpLeg: 'rightUpLeg',
  RightLowLeg: 'rightLeg',
  RightFoot: 'rightFoot',
  RightToe: 'rightToeBase',
};

const createEmptyBvhMap = (): PlaskBvhMap => {
  return {
    Hips: null,
    Chest: null,
    Chest2: null,
    Chest3: null,
    Neck: null,
    Head: null,
    LeftCollar: null,
    LeftUpArm: null,
    LeftLowArm: null,
    LeftHand: null,
    RightCollar: null,
    RightUpArm: null,
    RightLowArm: null,
    RightHand: null,
    LeftUpLeg: null,
    LeftLowLeg: null,
    LeftFoot: null,
    LeftToe: null,
    RightUpLeg: null,
    RightLowLeg: null,
    RightFoot: null,
    RightToe: null,
  };
};

/**
 * BVH export 시에 서버에 함께 넘겨줄 BVH map을 담은 Promise를 생성합니다.
 * BVH bone에 대한 value가 null인 경우가 하나 이상이거나, 제한시간을 넘기면 실패로 처리합니다.
 *
 * @param bones - 대상 asset의 bones
 * @param retargetMap - 대상 asset의 완성된 retargetMap (완성되지 않은 경우에 대한 처리는 본 함수 호출 이전에 분기 처리 필요)
 * @param timeout - 제한시간
 */
const createBvhMap = (bones: BABYLON.Bone[], retargetMap: PlaskRetargetMap, timeout?: number): Promise<PlaskBvhMap> => {
  const bvhMap = createEmptyBvhMap();

  Object.keys(bvhMap).forEach((bvhBone) => {
    const sourceBoneName = BVH_TO_SOURCE_MAP[bvhBone as BvhBoneType];
    const { values } = retargetMap;
    const targetRetargetMapValue = values.find((value) => value.sourceBoneName === sourceBoneName);
    if (targetRetargetMapValue) {
      const targetBone = bones.find((bone) => bone.getTransformNode()?.id === targetRetargetMapValue.targetTransformNodeId);
      if (targetBone) {
        bvhMap[bvhBone as BvhBoneType] = targetBone.name;
      }
    }
  });

  return new Promise((resolve, reject) => {
    if (Object.values(bvhMap).find((value) => isNull(value))) {
      reject('BVH map includes null values');
    }

    resolve(bvhMap);

    setTimeout(() => {
      reject("Timeout: Couldn't create BVH map");
    }, timeout ?? DEFAULT_TIMEOUT);
  });
};

export default createBvhMap;
