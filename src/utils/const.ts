import { CUTIMAGE_HEIGHT } from 'containers/extract/CutEdit/CutEdit.styles';
import { LPDataType } from 'types';
import { CPComponentType, CPDataType, CPNameType } from 'types/CP';
import {
  AnimatingDataType,
  axisName,
  RenderingDataPropertyName,
  RenderingDataType,
} from 'types/RP';

export const isDebug = false;
export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';
export const DEFAULT_FILE_URL = '/video/exo.mp4';
export const CUT_IMAGES_CNT = 20;
export const STANDARD_TIME_UNIT = 1 / 30;
export const INITIAL_LP_DATA: LPDataType[] = [];
export const INITIAL_ANIMATING_DATA: AnimatingDataType = {
  playState: 'stop',
  playDirection: 1, // 1 은 정재생, -1 은 역재생
  playSpeed: 1,
  startTimeIndex: 1, // 미들바의 start 에 해당
  endTimeIndex: 300, // 미들바의 end 에 해당
};
export const INITIAL_RENDERING_DATA: RenderingDataType = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scaleX: 0,
  scaleY: 0,
  scaleZ: 0,
  axis: axisName.y,
  isBoneOn: true,
  // isJointOn: true,
  isMeshOn: true,
  isShadowOn: true,
  // isFogOn: false,
  // fogNear: 10,
  // fogFar: 80,
};
export const INITIAL_CP_DATA: CPDataType[] = [
  {
    key: '0',
    name: CPNameType.Transform,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '0-1',
    name: CPNameType.Position,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.positionX,
    y: RenderingDataPropertyName.positionY,
    z: RenderingDataPropertyName.positionZ,
    parentKey: '0',
  },
  {
    key: '0-2',
    name: CPNameType.Rotation,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.rotationX,
    y: RenderingDataPropertyName.rotationY,
    z: RenderingDataPropertyName.rotationZ,
    parentKey: '0',
  },
  {
    key: '0-3',
    name: CPNameType.Scale,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.scaleX,
    y: RenderingDataPropertyName.scaleY,
    z: RenderingDataPropertyName.scaleZ,
    parentKey: '0',
  },
  // {
  //   key: '1',
  //   name: CPNameType.Camera,
  //   type: CPComponentType.parent,
  //   isExpanded: true,
  // },
  // {
  //   key: '1-1',
  //   name: CPNameType.Location,
  //   type: CPComponentType.input,
  //   x: RenderingDataPropertyName.locationX,
  //   y: RenderingDataPropertyName.locationY,
  //   z: RenderingDataPropertyName.locationZ,
  //   parentKey: '1',
  // },
  // {
  //   key: '1-2',
  //   name: CPNameType.Angle,
  //   type: CPComponentType.input,
  //   x: RenderingDataPropertyName.angleX,
  //   y: RenderingDataPropertyName.angleY,
  //   z: RenderingDataPropertyName.angleZ,
  //   parentKey: '1',
  // },
  {
    key: '2',
    name: CPNameType.Visibility,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '2-1',
    name: CPNameType.Axis,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.axis,
    parentKey: '2',
  },
  {
    key: '2-2',
    name: CPNameType.Bone,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.isBoneOn,
    parentKey: '2',
  },
  // {
  //   key: '2-3',
  //   name: CPNameType.Joint,
  //   type: CPComponentType.select,
  //   button: RenderingDataPropertyName.isJointOn,
  //   parentKey: '2',
  // },
  {
    key: '2-4',
    name: CPNameType.Mesh,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.isMeshOn,
    parentKey: '2',
  },
  {
    key: '2-5',
    name: CPNameType.Shadow,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.isShadowOn,
    parentKey: '2',
  },
  // {
  //   key: '3',
  //   name: CPNameType.Fog,
  //   type: CPComponentType.parent,
  //   isExpanded: true,
  // },
  // {
  //   key: '3-1',
  //   name: CPNameType.Fog,
  //   type: CPComponentType.select,
  //   button: RenderingDataPropertyName.isFogOn,
  //   parentKey: '3',
  // },
  // {
  //   key: '3-2',
  //   name: CPNameType.Near,
  //   type: CPComponentType.slider,
  //   slider: RenderingDataPropertyName.fogNear,
  //   parentKey: '3',
  // },
  // {
  //   key: '3-3',
  //   name: CPNameType.Far,
  //   type: CPComponentType.slider,
  //   slider: RenderingDataPropertyName.fogFar,
  //   parentKey: '3',
  // },
];
export const INITIAL_RECORDING_DATA = {
  duration: 10,
  rangeBoxInfo: {
    // width: window.innerWidth * 0.9,
    // width: 1700,
    width: 0,
    height: CUTIMAGE_HEIGHT,
    x: 0,
    barX: 0,
    y: 0,
  },
  isPlaying: false,
  motionName: '',
  isRecording: undefined,
  count: undefined,
};

export const DEFAULT_TARGETBONES = [
  'Source Bone1',
  'Source Bone2',
  'Source Bone3',
  'Source Bone4',
  'Source Bone5',
];

// TP Track 별 Index 규칙
export const TP_TRACK_INDEX = {
  SUMMARY: 1, // Summary 트랙
  LAYER: 2, // Layer 트랙(Base Layer, 사용자가 추가시킨 Layer)
  BONE_A: 3, // Bone 트랙 Index는 끝자리를 3과 7로 지정
  POSITION_A: 4, // Position 트랙 index는 끝자리를 4와 8로 지정
  ROTATION_A: 5, // Rotation 트랙 index는 끝자리를 5과 9로 지정
  SCALE_A: 6, // Scale 트랙 index는 끝자리를 6과 0으로 지정
  BONE_B: 7,
  POSITION_B: 8,
  ROTATION_B: 9,
  SCALE_B: 0,
};
