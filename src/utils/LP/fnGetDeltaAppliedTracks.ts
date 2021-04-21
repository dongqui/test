import { ShootTrackType } from 'types';
import fnEulerToQuaternionShootTracks from 'utils/common/fnEulerToQuaternionShootTracks';
import _ from 'lodash';
import fnQuaternionToEulerShootTracks from 'utils/common/fnQuaternionToEulerShootTracks';

type StandardBoneName =
  | 'hips'
  | 'spine'
  | 'spine1'
  | 'spine2'
  | 'neck'
  | 'head'
  | 'leftShoulder'
  | 'leftArm'
  | 'leftForeArm'
  | 'leftHand'
  | 'leftHandIndex1'
  | 'rightShoulder'
  | 'rightArm'
  | 'rightForeArm'
  | 'rightHand'
  | 'rightHandIndex1'
  | 'leftUpLeg'
  | 'leftLeg'
  | 'leftFoot'
  | 'leftToeBase'
  | 'rightUpLeg'
  | 'rightLeg'
  | 'rightFoot'
  | 'rightToeBase';

const STANDARD_BONE_NAMES = [
  'hips',
  'spine',
  'spine1',
  'spine2',
  'neck',
  'head',
  'leftShoulder',
  'leftArm',
  'leftForeArm',
  'leftHand',
  'leftHandIndex1',
  'rightShoulder',
  'rightArm',
  'rightForeArm',
  'rightHand',
  'rightHandIndex1',
  'leftUpLeg',
  'leftLeg',
  'leftFoot',
  'leftToeBase',
  'rightUpLeg',
  'rightLeg',
  'rightFoot',
  'rightToeBase',
];

const STANDARD_QUATERNIONS = {
  hips: [-0.7071068286895752, 0, 0, 0.7071068286895752],
  spine: [0, 0, 0, 1],
  spine1: [0, 0, 0, 1],
  spine2: [0, 0, 0, 1],
  neck: [0, 0, 0, 1],
  head: [0, 0, 0, 1],
  leftShoulder: [0, 0, 0, 1],
  leftArm: [0, 0, 0, 1],
  leftForeArm: [0, 0, 0, 1],
  leftHand: [0, 0, 0, 1],
  leftHandIndex1: [0, 0, 0, 1],
  rightShoulder: [0, 0, 0, 1],
  rightArm: [0, 0, 0, 1],
  rightForeArm: [0, 0, 0, 1],
  rightHand: [0, 0, 0, 1],
  rightHandIndex1: [0, 0, 0, 1],
  leftUpLeg: [0, 0, 0, 1],
  leftLeg: [0, 0, 0, 1],
  leftFoot: [0, 0, 0, 1],
  leftToeBase: [1, 0, 0, 0],
  rightUpLeg: [0, 0, 0, 1],
  rightLeg: [0, 0, 0, 1],
  rightFoot: [0, 0, 0, 1],
  rightToeBase: [1, 0, 0, 0],
};

interface FnGetDeltaAppliedTracks {
  sourceRotationTracks: ShootTrackType[];
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
  const { sourceRotationTracks, retargetMap, tPoseAnimation } = props;

  const sourceQuaternionTracks = fnEulerToQuaternionShootTracks({
    eulerTracks: sourceRotationTracks,
  });

  const tPoseQuaternionTracks = tPoseAnimation.tracks.filter(
    (track) =>
      track.name.substring(track.name.lastIndexOf('.'), track.name.length).toLowerCase() ===
      '.quaternion',
  );

  const targetQuaternions = {
    hips: [-0.7071068286895752, 0, 0, 0.7071068286895752],
    spine: [0, 0, 0, 1],
    spine1: [0, 0, 0, 1],
    spine2: [0, 0, 0, 1],
    neck: [0, 0, 0, 1],
    head: [0, 0, 0, 1],
    leftShoulder: [0, 0, 0, 1],
    leftArm: [0, 0, 0, 1],
    leftForeArm: [0, 0, 0, 1],
    leftHand: [0, 0, 0, 1],
    leftHandIndex1: [0, 0, 0, 1],
    rightShoulder: [0, 0, 0, 1],
    rightArm: [0, 0, 0, 1],
    rightForeArm: [0, 0, 0, 1],
    rightHand: [0, 0, 0, 1],
    rightHandIndex1: [0, 0, 0, 1],
    leftUpLeg: [0, 0, 0, 1],
    leftLeg: [0, 0, 0, 1],
    leftFoot: [0, 0, 0, 1],
    leftToeBase: [1, 0, 0, 0],
    rightUpLeg: [0, 0, 0, 1],
    rightLeg: [0, 0, 0, 1],
    rightFoot: [0, 0, 0, 1],
    rightToeBase: [1, 0, 0, 0],
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

  const deltaAddedSourceQuaternionTracks: ShootTrackType[] = [];

  sourceQuaternionTracks.forEach((track: any) => {
    const { name, times, values, isIncluded, interpolation } = track;
    const boneName = name.substring(0, name.lastIndexOf('.'));

    const newValues = values.map(
      (value: number, idx: number) =>
        value -
        STANDARD_QUATERNIONS[boneName as StandardBoneName][idx % 4] +
        targetQuaternions[boneName as StandardBoneName][idx % 4],
    );

    const newTrack: ShootTrackType = {
      name,
      times: _.cloneDeep(times),
      values: newValues,
      isIncluded,
      interpolation,
    };
    deltaAddedSourceQuaternionTracks.push(newTrack);
  });

  const deltaAddedSourceRotationTracks: ShootTrackType[] = fnQuaternionToEulerShootTracks({
    quaternionTracks: deltaAddedSourceQuaternionTracks,
  });

  return deltaAddedSourceRotationTracks;
};

export default fnGetDeltaAppliedTracks;
