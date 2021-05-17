import _ from 'lodash';
import * as THREE from 'three';
import {
  fnDotProductQuaternion,
  fnEulerToQuaternionTracks,
  fnQuaternionToEulerTracks,
} from 'utils/common';

type StandardBoneName =
  | 'hips'
  | 'leftUpLeg'
  | 'rightUpLeg'
  | 'spine'
  | 'leftLeg'
  | 'rightLeg'
  | 'spine1'
  | 'leftFoot'
  | 'rightFoot'
  | 'spine2'
  | 'leftToeBase'
  | 'rightToeBase'
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'head'
  | 'leftArm'
  | 'rightArm'
  | 'leftForeArm'
  | 'rightForeArm'
  | 'leftHand'
  | 'rightHand'
  | 'leftHandIndex1'
  | 'rightHandIndex1';

const STANDARD_BONE_NAMES = [
  'hips',
  'leftUpLeg',
  'rightUpLeg',
  'spine',
  'leftLeg',
  'rightLeg',
  'spine1',
  'leftFoot',
  'rightFoot',
  'spine2',
  'leftToeBase',
  'rightToeBase',
  'neck',
  'leftShoulder',
  'rightShoulder',
  'head',
  'leftArm',
  'rightArm',
  'leftForeArm',
  'rightForeArm',
  'leftHand',
  'rightHand',
  'leftHandIndex1',
  'rightHandIndex1',
];

interface FnGetDeltaProductedTracks {
  sourceRotationTracks: THREE.VectorKeyframeTrack[];
  retargetMap: any[]; // 선행 코드의 any 타입 선언으로 인해 불가피하게 사용
  tPoseAnimation: THREE.AnimationClip;
}

/**
 * 리타게팅 대상 rotation 트랙들을 받아, Bone 의 quaternion delta 값을 적용한 rotation 트랙들을 반환합니다.
 *
 * @param sourceRotationTracks - 리타게팅 대상 rotaion 트랙들
 * @param retargetMap - mapper api 및 수동 리타게팅을 거친 retarget map
 * @param tPoseAnimation - delta 값을 구하기 위한 t-pose 애니메이션
 *
 * @returns quaternion delta 값을 적용한 트랙들
 *
 */
const fnGetDeltaProductedTracks = (props: FnGetDeltaProductedTracks) => {
  const { sourceRotationTracks, retargetMap, tPoseAnimation } = props;

  const sourceQuaternionTracks = fnEulerToQuaternionTracks({
    eulerTracks: sourceRotationTracks,
  });

  const tPoseQuaternionTracks = tPoseAnimation.tracks.filter(
    (track) =>
      track.name.substring(track.name.lastIndexOf('.'), track.name.length).toLowerCase() ===
      '.quaternion',
  );

  const targetQuaternions = {
    hips: [0, 0, 0, 1],
    leftUpLeg: [0, 0, 0, 1],
    rightUpLeg: [0, 0, 0, 1],
    spine: [0, 0, 0, 1],
    leftLeg: [0, 0, 0, 1],
    rightLeg: [0, 0, 0, 1],
    spine1: [0, 0, 0, 1],
    leftFoot: [0, 0, 0, 1],
    rightFoot: [0, 0, 0, 1],
    spine2: [0, 0, 0, 1],
    leftToeBase: [0, 0, 0, 1],
    rightToeBase: [0, 0, 0, 1],
    neck: [0, 0, 0, 1],
    leftShoulder: [0, 0, 0, 1],
    rightShoulder: [0, 0, 0, 1],
    head: [0, 0, 0, 1],
    leftArm: [0, 0, 0, 1],
    rightArm: [0, 0, 0, 1],
    leftForeArm: [0, 0, 0, 1],
    rightForeArm: [0, 0, 0, 1],
    leftHand: [0, 0, 0, 1],
    rightHand: [0, 0, 0, 1],
    leftHandIndex1: [0, 0, 0, 1],
    rightHandIndex1: [0, 0, 0, 1],
  };

  _.forEach(STANDARD_BONE_NAMES, (standardBoneName) => {
    // bone name 돌면서 targetQuaternions(Rpre) 만들기
    const targetBoneMapInfo = _.find(retargetMap, (item) => item.key === standardBoneName);
    if (targetBoneMapInfo) {
      const targetBoneName = targetBoneMapInfo.value.targetBone;
      const targetBoneTPoseTrack = _.find(
        tPoseQuaternionTracks,
        (track) => track.name.substring(0, track.name.lastIndexOf('.')) === targetBoneName,
      );
      if (targetBoneTPoseTrack) {
        targetQuaternions[standardBoneName as StandardBoneName] = _.toArray(
          targetBoneTPoseTrack.values.slice(0, 4),
        );
      }
    }
  });

  const deltaProductedSourceQuaternionTracks: THREE.QuaternionKeyframeTrack[] = [];

  sourceQuaternionTracks.forEach((track: THREE.QuaternionKeyframeTrack) => {
    const { name, times, values } = track;
    const boneName = name.substring(0, name.lastIndexOf('.'));
    const newTimes = _.toArray(_.cloneDeep(times));
    const newValues: number[] = [];
    const targetQuaternion = targetQuaternions[boneName as StandardBoneName];

    // 4개씩 자르고, dotProduct 계산해서 다시 넣어줘야 함
    let inner: number[] = [];
    values.forEach((value: number, idx: number) => {
      inner.push(value);
      if (idx % 4 === 3) {
        newValues.push(...fnDotProductQuaternion(targetQuaternion, inner));
        // inner 초기화
        inner = [];
      }
    });

    const newTrack = new THREE.QuaternionKeyframeTrack(name, newTimes, newValues);

    deltaProductedSourceQuaternionTracks.push(newTrack);
  });

  const deltaProductedSourceRotationTracks: THREE.VectorKeyframeTrack[] = fnQuaternionToEulerTracks(
    {
      quaternionTracks: deltaProductedSourceQuaternionTracks,
    },
  );

  return deltaProductedSourceRotationTracks;
};

export default fnGetDeltaProductedTracks;
