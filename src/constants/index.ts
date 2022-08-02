import { RetargetSourceBoneType, PlaskProperty } from 'types/common';

export const TRACK_DATA_PROPERTY: PlaskProperty[] = ['position', 'rotation', 'rotationQuaternion', 'scaling', 'isContact'];
export const BONE_NAMES: RetargetSourceBoneType[] = [
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

export const IK_CONTROLLER_EL_ID = 'ik-controller-container' as const;
