import _ from 'lodash';
/**
 * 본 함수는 리얼타임 모션캡쳐의 예시 데이터를 리턴합니다.
 * 리얼타임 모션캡쳐의 데이터는 정적인 한 시점의 Bone 들의 속성값(position, quaternion)을 담고 있습니다.
 * hips 를 제외한 Bone 들은 회전값인 quaternion 만 변합니다.
 * 본 예시 데이터는 vanguard.fbx (Dying.fbx) 의 Bone 들을 기준으로 하며, 유효한 값들 내의 임의의 값을 생성하여 리턴합니다.
 *
 * @returns 리얼타임 모션챕쳐 예시 데이터
 *
 */
export const getDummyData = () => {
  const boneNames = [
    'mixamorigSpine',
    'mixamorigSpine1',
    'mixamorigSpine2',
    'mixamorigNeck',
    'mixamorigHead',
    'mixamorigLeftUpLeg',
    'mixamorigLeftLeg',
    'mixamorigLeftFoot',
    'mixamorigLeftToeBase',
    'mixamorigLeftToe_End',
    'mixamorigRightUpLeg',
    'mixamorigRightLeg',
    'mixamorigRightFoot',
    'mixamorigRightToeBase',
    'mixamorigRightToe_End',
    'mixamorigLeftShoulder',
    'mixamorigLeftArm',
    'mixamorigLeftHand',
    'mixamorigLeftHandIndex1',
    'mixamorigLeftForeArm',
    'mixamorigRightShoulder',
    'mixamorigRightArm',
    'mixamorigRightForeArm',
    'mixamorigRightHand',
    'mixamorigRightHandIndex1',
  ];
  let dummyData: Array<{
    boneName: string;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    quaternionX: number;
    quaternionY: number;
    quaternionZ: number;
    quaternionW: number;
  }> = [
    {
      boneName: 'mixamorigHips',
      positionX: _.random(-10, 10, true),
      positionY: _.random(-10, 10, true),
      positionZ: _.random(-10, 10, true),
      quaternionX: _.random(-0.1, 0.1, true),
      quaternionY: _.random(-0.1, 0.1, true),
      quaternionZ: _.random(-0.1, 0.1, true),
      quaternionW: 1,
    },
  ];
  dummyData = [
    ...dummyData,
    ..._.map(boneNames, (boneName) => ({
      boneName,
      quaternionX: _.random(-0.1, 0.1, true),
      quaternionY: _.random(-0.1, 0.1, true),
      quaternionZ: _.random(-0.1, 0.1, true),
      quaternionW: 1,
    })),
  ];
  return dummyData;
};
