import _ from 'lodash';
import * as THREE from 'three';
import fnGetNormalizedEulerTracks from 'utils/common/fnGetNormalizedRotationTracks';

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

const STANDARD_QUATERNIONS = {
  hips: [-0.7071068286895752, 0, 0, 0.7071068286895752],
  leftUpLeg: [0, 0, 0, 1],
  rightUpLeg: [0, 0, 0, 1],
  spine: [0, 0, 0, 1],
  leftLeg: [0, 0, 0, 1],
  rightLeg: [0, 0, 0, 1],
  spine1: [0, 0, 0, 1],
  leftFoot: [0, 0, 0, 1],
  rightFoot: [0, 0, 0, 1],
  spine2: [0, 0, 0, 1],
  leftToeBase: [1, 0, 0, 0],
  rightToeBase: [1, 0, 0, 0],
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

interface FnGetDeltaAppliedTracks {
  sourceRotationTracks: THREE.VectorKeyframeTrack[];
  retargetMap: any[]; // 선행 코드의 any 타입 선언으로 인해 불가피하게 사용
  tPoseAnimation: THREE.AnimationClip;
}

/**
 * 리타게팅 대상 rotation 트랙들을 받아, Bone 의 dalta 값을 적용한 rotation 트랙들을 반환합니다.
 *
 * @param sourceRotationTracks - 리타게팅 대상 rotaion 트랙들
 * @param retargetMap - mapper api 및 수동 리타게팅을 거친 retarget map
 * @param tPoseAnimation - delta 값을 구하기 위한 t-pose 애니메이션
 *
 * @returns delta 값을 적용한 트랙들
 *
 */
const fnGetDeltaAppliedTracks = (props: FnGetDeltaAppliedTracks) => {
  // euler 상태로 delta 계산하는 방식으로 구현
  const { sourceRotationTracks, retargetMap, tPoseAnimation } = props;

  const STANDARD_EULERS = _.cloneDeep(STANDARD_QUATERNIONS);
  Object.keys(STANDARD_EULERS).forEach((key) => {
    const q = new THREE.Quaternion(...STANDARD_EULERS[key as StandardBoneName]);
    const e = new THREE.Euler().setFromQuaternion(q.normalize(), 'XYZ');
    const { x, y, z } = e;
    STANDARD_EULERS[key as StandardBoneName] = [x, y, z];
  });

  const tPoseQuaternionTracks = tPoseAnimation.tracks.filter(
    (track) =>
      track.name.substring(track.name.lastIndexOf('.'), track.name.length).toLowerCase() ===
      '.quaternion',
  );

  const targetQuaternions = {
    hips: [-0.7071068286895752, 0, 0, 0.7071068286895752],
    leftUpLeg: [0, 0, 0, 1],
    rightUpLeg: [0, 0, 0, 1],
    spine: [0, 0, 0, 1],
    leftLeg: [0, 0, 0, 1],
    rightLeg: [0, 0, 0, 1],
    spine1: [0, 0, 0, 1],
    leftFoot: [0, 0, 0, 1],
    rightFoot: [0, 0, 0, 1],
    spine2: [0, 0, 0, 1],
    leftToeBase: [1, 0, 0, 0],
    rightToeBase: [1, 0, 0, 0],
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
    // bone name 돌면서 targetQuaternions 만들기
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
  const targetEulers = _.cloneDeep(targetQuaternions);
  Object.keys(targetEulers).forEach((key) => {
    const q = new THREE.Quaternion(...targetEulers[key as StandardBoneName]);
    const e = new THREE.Euler().setFromQuaternion(q.normalize(), 'XYZ');
    const { x, y, z } = e;
    targetEulers[key as StandardBoneName] = [x, y, z];
  });

  const standardSubtractRotationTracks: THREE.VectorKeyframeTrack[] = [];

  sourceRotationTracks.forEach((track: THREE.VectorKeyframeTrack) => {
    const { name, times, values } = track;
    const boneName = name.substring(0, name.lastIndexOf('.'));
    const newTimes = _.toArray(_.cloneDeep(times));
    const newValues = _.toArray(
      values.map(
        (value: number, idx: number) =>
          value - STANDARD_EULERS[boneName as StandardBoneName][idx % 3],
      ),
    );

    const newTrack = new THREE.VectorKeyframeTrack(name, newTimes, newValues);

    standardSubtractRotationTracks.push(newTrack);
  });

  const deltaAddedSourceRotationTracks: THREE.VectorKeyframeTrack[] = [];

  fnGetNormalizedEulerTracks({ eulerTracks: standardSubtractRotationTracks }).forEach(
    (track: THREE.VectorKeyframeTrack) => {
      const { name, times, values } = track;
      const boneName = name.substring(0, name.lastIndexOf('.'));
      const newTimes = _.toArray(_.cloneDeep(times));
      const newValues = _.toArray(
        values.map(
          (value: number, idx: number) =>
            value + targetEulers[boneName as StandardBoneName][idx % 3],
        ),
      );

      const newTrack = new THREE.VectorKeyframeTrack(name, newTimes, newValues);

      deltaAddedSourceRotationTracks.push(newTrack);
    },
  );

  return fnGetNormalizedEulerTracks({ eulerTracks: deltaAddedSourceRotationTracks });
};

export default fnGetDeltaAppliedTracks;
