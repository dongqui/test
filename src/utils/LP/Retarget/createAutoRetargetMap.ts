import { PlaskRetargetMap, RetargetMapValue, RetargetSourceBoneType, SerializedBone } from 'types/common';
import createEmptyRetargetMap from './createEmptyRetargetMap';

const DEFAULT_HIP_SPACE = 106;
const DEFAULT_TIME_OUT = 3000;
const MAX_ITERATE_COUNT = 20; // 잘못된 bone 구조의 model에 의해 while문을 빠져나오지 못하는 경우를 막기 위한 최대 반복 횟수

const KEY_PAIR_BONES = {
  hips: { pairBone: 'UpLeg', middleBone: 'spine' },
  spine2: { pairBone: 'Shoulder', middleBone: 'neck' },
};

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

const doMap = (bones: SerializedBone[]) => {
  const innerRetargetMap: { [boneName in RetargetSourceBoneType]?: SerializedBone } = {};

  const parentBoneIndices: number[] = [];
  const keyTargetIndices: number[] = [];

  // 각 Bone들의 parentBoneIndex를 parentBoneIndex 배열에 담기
  bones.forEach((bone) => {
    // bone serialize시 실제 index와 index 속성의 값이 일치하지 않음
    parentBoneIndices.push(bone.parentBoneIndex);
  });

  // parentBoneIndex 안에 속한 element의 count를 나타내는 객체를 생성
  const counts: { [n in number]: number } = {};
  parentBoneIndices.forEach((parentIndex) => {
    if (counts[parentIndex]) {
      counts[parentIndex] = counts[parentIndex] + 1;
    } else {
      counts[parentIndex] = 1;
    }
  });

  // counts 객체의 key 중 value, 즉 count가 2를 초과하는 key들을 keyTargetIndices에 담기
  Object.entries(counts).forEach(([parentIndex, count]) => {
    if (count > 2) {
      keyTargetIndices.push(parseInt(parentIndex));
    }
  });

  // hips, spine2 찾기
  // keyTargetIndex에 해당하는 bone들을 candidate bone들로 보고 검사
  keyTargetIndices.forEach((keyTargetIndex) => {
    // 실제 bone의 index는 1씩 작음
    const candidateBone = bones.find((bone) => bone.index === keyTargetIndex - 1);

    if (candidateBone) {
      // candidate Bone의 childrenBones 중 leg 혹은 arm의 searchKeyword를 포함하는 이름을 가진 child 개수를 확인하고
      // 2개 이상이라면 각각 spine2, hips로 결정
      const childrenBones = bones.filter((bone) => bone.parentBoneIndex === candidateBone.index + 1);

      let legCounts = 0;
      childrenBones.forEach((childBone) => {
        SOURCE_BONES.leftUpLeg.searchKeywords.forEach((keyword) => {
          if (childBone.name.toLowerCase().includes(keyword)) {
            legCounts += 1;
          }
        });
      });

      if (legCounts >= 2) {
        // hips 결정
        innerRetargetMap.hips = candidateBone;
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
        innerRetargetMap.spine2 = candidateBone;
      }
    }
  });

  // hips, spine2에서 뻗어나가는 방향들로 각각 맞는 bone을 mapping
  [
    ['hips', 'spine', 'UpLeg'], // 하체
    ['spine2', 'neck', 'Shoulder'], // 상체
  ].forEach(([keyBoneName, middleBoneName, pairBoneName]) => {
    const keyBone = innerRetargetMap[keyBoneName as RetargetSourceBoneType];

    if (keyBone) {
      // keyBone을 parent로 가지는 bone들을 childrenBones로 지정하고, 각각을 리타게팅 맵에 추가
      // 실제 bone의 index는 1씩 작음
      const childrenBones = bones.filter((bone) => bone.parentBoneIndex === keyBone.index + 1);

      childrenBones.forEach((childBone) => {
        if (childBone.name.toLowerCase().includes('left')) {
          innerRetargetMap[`left${pairBoneName}` as RetargetSourceBoneType] = childBone;
        } else if (childBone.name.toLowerCase().includes('right')) {
          innerRetargetMap[`right${pairBoneName}` as RetargetSourceBoneType] = childBone;
        } else {
          innerRetargetMap[middleBoneName as RetargetSourceBoneType] = childBone;
        }
      });
    }

    // leg, arm chain에 속하는 bone들 mapping
    ['left', 'right'].forEach((direction) => {
      // leg mapping
      const legChain = [];
      let prevLegBone = innerRetargetMap[`${direction}UpLeg` as RetargetSourceBoneType];
      let legIterateCount = 0;
      while (legIterateCount < MAX_ITERATE_COUNT && prevLegBone) {
        prevLegBone = bones.find((bone) => bone.parentBoneIndex === prevLegBone!.index + 1);
        if (prevLegBone) {
          legChain.push(prevLegBone);
        }
        legIterateCount += 1;
      }
      innerRetargetMap[`${direction}Leg` as RetargetSourceBoneType] = legChain[0];
      innerRetargetMap[`${direction}Foot` as RetargetSourceBoneType] = legChain[1];
      innerRetargetMap[`${direction}ToeBase` as RetargetSourceBoneType] = legChain[2];

      // arm mapping
      const armChain = [];
      let prevArmBone = innerRetargetMap[`${direction}Shoulder` as RetargetSourceBoneType];
      let armIterateCount = 0;
      while (armIterateCount < MAX_ITERATE_COUNT && prevArmBone) {
        prevArmBone = bones.find((bone) => bone.parentBoneIndex === prevArmBone!.index + 1);
        if (prevArmBone) {
          armChain.push(prevArmBone);
        }
        armIterateCount += 1;
      }
      innerRetargetMap[`${direction}Arm` as RetargetSourceBoneType] = armChain[0];
      innerRetargetMap[`${direction}ForeArm` as RetargetSourceBoneType] = armChain[1];
      innerRetargetMap[`${direction}Hand` as RetargetSourceBoneType] = armChain[2];
      if (armChain[2]) {
        const handBone = armChain[2];
        const fingerBones = bones.filter((bone) => bone.parentBoneIndex === handBone.index + 1);
        const indexFingerBone = fingerBones.find((bone) => bone.name.toLowerCase().includes('index'));
        innerRetargetMap[`${direction}HandIndex1` as RetargetSourceBoneType] = indexFingerBone;
      }
    });

    // spine1 mapping
    const spineChain = [];
    const spineStartBone = innerRetargetMap['spine'];
    const spineEndBone = innerRetargetMap['spine2'];

    if (spineStartBone && spineEndBone) {
      let prevSpineBone: SerializedBone | undefined = spineStartBone;
      let spineIterateCount = 0;
      while (spineIterateCount < MAX_ITERATE_COUNT && prevSpineBone && prevSpineBone !== spineEndBone) {
        prevSpineBone = bones.find((bone) => bone.parentBoneIndex === prevSpineBone!.index + 1 && bone.name.toLowerCase().includes('spine'));
        if (prevSpineBone && prevSpineBone !== spineEndBone) {
          spineChain.push(prevSpineBone);
        }
        spineIterateCount += 1;
      }
      innerRetargetMap['spine1'] = spineChain[Math.round((spineChain.length - 1) / 2)];
    }

    // head mapping
    const neckBone = innerRetargetMap['neck'];
    if (neckBone) {
      innerRetargetMap['head'] = bones.find((bone) => bone.parentBoneIndex === neckBone.index + 1);
    }
  });

  console.log('innerRetargetMap: ', innerRetargetMap);
};

const createAutoRetargetMap = (assetId: string, serializeBones: SerializedBone[], timeout?: number): Promise<PlaskRetargetMap> => {
  const retargetMap = createEmptyRetargetMap(assetId);

  doMap(serializeBones);

  return new Promise((resolve, reject) => {
    // auto retarget에 성공하면 생성한 retargetMap을 반환
    resolve(retargetMap);

    // timeout을 넘어서면 실패를 반환
    setTimeout(() => {
      reject('Auto retargeting has failed');
    }, timeout ?? DEFAULT_TIME_OUT);
  });
};

export default createAutoRetargetMap;
