import * as BABYLON from '@babylonjs/core';
import { cloneDeep } from 'lodash';
import { PlaskRetargetMap, RetargetSourceBoneType } from 'types/common';
import createEmptyRetargetMap from './createEmptyRetargetMap';

const DEFAULT_TIME_OUT = 3000;
const MAX_ITERATE_COUNT = 20; // 잘못된 bone 구조의 model에 의해 while문을 빠져나오지 못하는 경우를 막기 위한 최대 반복 횟수

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
 * 기존 mapping api의 결과물과 같은 구조(sourceBone과 targetBone의 연결)의 데이터를 만들어냅니다
 *
 * @param bones - targetBone으로 사용될 bone들
 */
const getInnerRetargetMap = (bones: BABYLON.Bone[]) => {
  const retargetMap: { [boneName in RetargetSourceBoneType]?: BABYLON.Bone } = {};

  // hips, spine2 찾기
  // children 3개 이상 가진 bone들을 candidate bone으로 보고 검사
  const candidateBones = bones.filter((bone) => bone.children.length > 2);

  candidateBones.forEach((candidateBone) => {
    // candidate Bone의 childrenBones 중 leg 혹은 arm의 searchKeyword를 포함하는 이름을 가진 child 개수를 확인하고
    // 2개 이상이라면 각각 spine2, hips로 결정
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
      // spine2 결정
      retargetMap.spine2 = candidateBone;
    }
  });

  // hips, spine2에서 뻗어나가는 방향들로 각각 맞는 bone을 mapping
  [
    ['hips', 'spine', 'UpLeg'], // 하체
    ['spine2', 'neck', 'Shoulder'], // 상체
  ].forEach(([keyBoneName, middleBoneName, pairBoneName]) => {
    const keyBone = retargetMap[keyBoneName as RetargetSourceBoneType];

    if (keyBone) {
      // keyBone을 parent로 가지는 bone들을 childrenBones로 지정하고, 각각을 리타게팅 맵에 추가
      // 실제 bone의 index는 1씩 작음
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

    // leg, arm chain에 속하는 bone들 mapping
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
 * model(asset)에 대한 자동 리타겟맵 생성합니다.
 *
 * @param assetId - 대상 model asset의 id
 * @param bones - 대상 model의 bone들
 * @param timeout - 실패 기준이 되는 제한시간
 */
const createAutoRetargetMap = (assetId: string, bones: BABYLON.Bone[], timeout?: number): Promise<PlaskRetargetMap> => {
  const retargetMap = createEmptyRetargetMap(assetId);

  // innerRetargetMap을 사용해서 retargetMap.values를 업데이트
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

  return new Promise((resolve, reject) => {
    // auto retarget에 성공하면 생성한 retargetMap을 반환
    resolve(retargetMap);

    // timeout을 넘어서면 실패를 반환
    setTimeout(() => {
      reject('Timeout: Auto retargeting has failed');
    }, timeout ?? DEFAULT_TIME_OUT);
  });
};

export default createAutoRetargetMap;
