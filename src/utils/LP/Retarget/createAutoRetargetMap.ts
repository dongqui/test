import * as BABYLON from '@babylonjs/core';
import { cloneDeep } from 'lodash';
import { PlaskRetargetMap, RetargetSourceBoneType } from 'types/common';
import createEmptyRetargetMap from './createEmptyRetargetMap';

const DEFAULT_TIMEOUT = 3000;
const MAX_ITERATE_COUNT = 20; // max count of iteration for prevent from infinite loop inside of the while statement due to wrong bone structure

const SOURCE_BONES = {
  hips: { key: 0, searchKeywords: ['hips', 'pelvis'] },
  leftUpLeg: { key: 1, searchKeywords: ['upleg', 'upperleg', 'thigh'] },
  rightUpLeg: { key: 2, searchKeywords: ['upleg', 'upperleg', 'thigh'] },
  spine: { key: 3, searchKeywords: [] },
  leftLeg: { key: 4, searchKeywords: ['leg', 'knee', 'lowerleg', 'shin', 'calf'] },
  rightLeg: { key: 5, searchKeywords: ['leg', 'knee', 'lowerleg', 'shin', 'calf'] },
  spine1: { key: 6, searchKeywords: [] },
  leftFoot: { key: 7, searchKeywords: ['foot', 'ankle'] },
  rightFoot: { key: 8, searchKeywords: ['foot', 'ankle'] },
  spine2: { key: 9, searchKeywords: [] },
  leftToeBase: { key: 10, searchKeywords: ['toe', 'toebase'] },
  rightToeBase: { key: 11, searchKeywords: ['toe', 'toebase'] },
  neck: { key: 12, searchKeywords: [] },
  leftShoulder: { key: 13, searchKeywords: ['shoulder', 'clavicle', 'Scapula'] },
  rightShoulder: { key: 14, searchKeywords: ['shoulder', 'clavicle', 'Scapula'] },
  head: { key: 15, searchKeywords: ['head', 'cranium'] },
  leftArm: { key: 16, searchKeywords: ['arm', 'upperarm'] },
  rightArm: { key: 17, searchKeywords: ['arm', 'upperarm'] },
  leftForeArm: { key: 18, searchKeywords: ['forearm', 'elbow', 'lowerarm'] },
  rightForeArm: { key: 19, searchKeywords: ['forearm', 'elbow', 'lowerarm'] },
  leftHand: { key: 20, searchKeywords: ['hand', 'wrist'] },
  rightHand: { key: 21, searchKeywords: ['hand', 'wrist'] },
  leftHandIndex1: { key: 22, searchKeywords: ['handindex'] },
  rightHandIndex1: { key: 23, searchKeywords: ['handindex'] },
};

/**
 * create object mapping source bones to target bones
 *
 * @param bones - target bones
 */
const getInnerRetargetMap = (bones: BABYLON.Bone[]) => {
  const retargetMap: { [boneName in RetargetSourceBoneType]?: BABYLON.Bone } = {};

  // find hips, spine2
  // filter bones with more than 2 children
  const candidateBones = bones.filter((bone) => bone.children.length > 2);

  candidateBones.forEach((candidateBone) => {
    // check each candidate if it has child with name containing 'leg' or 'arm'
    // candidata with more than 1 child with name containing 'leg' -> spine2
    // candidata with more than 1 child with name containing 'arm' -> hips
    const childrenBones = candidateBone.children;

    let legCounts = 0;
    childrenBones.forEach((childBone) => {
      SOURCE_BONES.leftUpLeg.searchKeywords.forEach((keyword) => {
        if (childBone.name.toLowerCase().includes(keyword)) {
          legCounts += 1;
        }
      });
    });

    if (legCounts >= 2) {
      retargetMap.hips = candidateBone;
    }

    let armCounts = 0;
    childrenBones.forEach((childBone) => {
      SOURCE_BONES.leftShoulder.searchKeywords.forEach((keyword) => {
        if (childBone.name.toLowerCase().includes(keyword)) {
          armCounts += 1;
        }
      });
    });

    if (armCounts >= 2) {
      retargetMap.spine2 = candidateBone;
    }
  });

  // map bones from hips and spine2
  [
    ['hips', 'spine', 'UpLeg'], // lower body
    ['spine2', 'neck', 'Shoulder'], // upper body
  ].forEach(([keyBoneName, middleBoneName, pairBoneName]) => {
    const keyBone = retargetMap[keyBoneName as RetargetSourceBoneType];

    if (keyBone) {
      // add children bones of keyBone to retargetMap
      const childrenBones = keyBone.children;

      childrenBones.forEach((childBone) => {
        if (childBone.name.toLowerCase().includes('left')) {
          retargetMap[`left${pairBoneName}` as RetargetSourceBoneType] = childBone;
        } else if (childBone.name.toLowerCase().includes('right')) {
          retargetMap[`right${pairBoneName}` as RetargetSourceBoneType] = childBone;
        } else {
          retargetMap[middleBoneName as RetargetSourceBoneType] = childBone;
        }
      });
    }

    // maaping from leg and arm chain
    ['left', 'right'].forEach((direction) => {
      // leg mapping
      const legChain = [];
      let prevLegBone = retargetMap[`${direction}UpLeg` as RetargetSourceBoneType];
      let legIterateCount = 0;
      while (legIterateCount < MAX_ITERATE_COUNT && prevLegBone) {
        prevLegBone = prevLegBone.children[0];
        if (prevLegBone) {
          legChain.push(prevLegBone);
        }
        legIterateCount += 1;
      }
      retargetMap[`${direction}Leg` as RetargetSourceBoneType] = legChain[0];
      retargetMap[`${direction}Foot` as RetargetSourceBoneType] = legChain[1];
      retargetMap[`${direction}ToeBase` as RetargetSourceBoneType] = legChain[2];

      // arm mapping
      const armChain = [];
      let prevArmBone = retargetMap[`${direction}Shoulder` as RetargetSourceBoneType];
      let armIterateCount = 0;
      while (armIterateCount < MAX_ITERATE_COUNT && prevArmBone) {
        prevArmBone = prevArmBone.children[0];
        if (prevArmBone) {
          armChain.push(prevArmBone);
        }
        armIterateCount += 1;
      }
      retargetMap[`${direction}Arm` as RetargetSourceBoneType] = armChain[0];
      retargetMap[`${direction}ForeArm` as RetargetSourceBoneType] = armChain[1];
      retargetMap[`${direction}Hand` as RetargetSourceBoneType] = armChain[2];
      if (armChain[2]) {
        const handBone = armChain[2];
        const fingerBones = handBone.children;
        const indexFingerBone = fingerBones.find((bone) => bone.name.toLowerCase().includes('index'));
        retargetMap[`${direction}HandIndex1` as RetargetSourceBoneType] = indexFingerBone;
      }
    });

    // spine1 mapping
    const spineChain = [];
    const spineStartBone = retargetMap['spine'];
    const spineEndBone = retargetMap['spine2'];

    if (spineStartBone && spineEndBone) {
      let prevSpineBone: BABYLON.Bone | undefined = spineStartBone;
      let spineIterateCount = 0;
      while (spineIterateCount < MAX_ITERATE_COUNT && prevSpineBone && prevSpineBone !== spineEndBone) {
        prevSpineBone = prevSpineBone.children.find((child) => child.name.toLowerCase().includes('spine'));
        if (prevSpineBone && prevSpineBone !== spineEndBone) {
          spineChain.push(prevSpineBone);
        }
        spineIterateCount += 1;
      }
      retargetMap['spine1'] = spineChain[Math.round((spineChain.length - 1) / 2)];
    }

    // head mapping
    const neckBone = retargetMap['neck'];
    if (neckBone) {
      retargetMap['head'] = neckBone.children[0];
    }
  });

  return retargetMap;
};

/**
 * create asset's retargetMap automatically
 *
 * @param assetId - asset's id
 * @param bones - asset's bones to use as target bones
 * @param timeout - timeout in ms
 */
const createAutoRetargetMap = (assetId: string, bones: BABYLON.Bone[], timeout?: number): Promise<PlaskRetargetMap> => {
  const retargetMap = createEmptyRetargetMap(assetId);

  // updates retargetMap.values
  if (bones && bones.length > 0) {
    const innerRetargetMap = getInnerRetargetMap(bones);
    const newValues = cloneDeep(retargetMap.values);
    newValues.forEach((value) => {
      const { sourceBoneName } = value;
      const targetBone = innerRetargetMap[sourceBoneName];
      if (targetBone) {
        const targetTransformNode = targetBone.getTransformNode();
        if (targetTransformNode) {
          value.targetTransformNodeId = targetTransformNode.id;
        }
      }
    });
    retargetMap.values = newValues;
  }

  return new Promise((resolve, reject) => {
    // return retargetMap when auto retarget completed
    resolve(retargetMap);

    // return failure after timeout
    setTimeout(() => {
      reject('Timeout: Auto retargeting has failed');
    }, timeout ?? DEFAULT_TIMEOUT);
  });
};

export default createAutoRetargetMap;
