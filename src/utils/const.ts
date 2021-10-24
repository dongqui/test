import { CPItemType } from 'types/CP';
import { LPItemListOldType } from 'types/LP';

//////////////////// old ////////////////////
export const isClient = typeof window !== 'undefined';
export const CUT_IMAGES_CNT = 20;

export const STANDARD_TIME_UNIT = 1 / 30;

export const DEFAULT_MODELS: LPItemListOldType = [
  {
    key: 'defaultmodel1',
    name: 'zombie.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493576/zombie_bkqv8g.glb',
    type: 'File',
    baseLayer: [],
    layers: [],
  },
  {
    key: 'defaultmodel2',
    name: 'knight.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493584/knight_zizg5n.glb',
    type: 'File',
    baseLayer: [],
    layers: [],
  },
  {
    key: 'defaultmodel3',
    name: 'vanguard.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619494583/vanguard_t_cslcnl.glb',
    type: 'File',
    baseLayer: [],
    layers: [],
  },
];

export const INITIAL_LP_DATA: LPItemListOldType = [];

export const CP_ITEMS: CPItemType[] = [
  {
    key: '0',
    name: 'Transform',
    type: 'parent',
    isExpanded: true,
  },
  {
    key: '0-1',
    name: 'Position',
    type: 'input',
    parentKey: '0',
  },
  {
    key: '0-2',
    name: 'Rotation',
    type: 'input',
    parentKey: '0',
  },
  {
    key: '0-3',
    name: 'Scale',
    type: 'input',
    parentKey: '0',
  },
  {
    key: '2',
    name: 'Visibility',
    type: 'parent',
    isExpanded: true,
  },
  {
    key: '2-1',
    name: 'Axis',
    type: 'select',
    button: 'axis',
    parentKey: '2',
  },
  {
    key: '2-2',
    name: 'Bone',
    type: 'select',
    button: 'isBoneOn',
    parentKey: '2',
  },
  {
    key: '2-4',
    name: 'Mesh',
    type: 'select',
    button: 'isMeshOn',
    parentKey: '2',
  },
  {
    key: '2-5',
    name: 'Shadow',
    type: 'select',
    button: 'isShadowOn',
    parentKey: '2',
  },
];

export const INITIAL_RECORDING_DATA = {
  duration: 10,
  rangeBoxInfo: {
    // width: window.innerWidth * 0.9,
    // width: 1700,
    width: 0,
    height: 128,
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
  BONE: 3, // Bone 트랙 Index는 끝자리를 3으로 지정
  POSITION: 4, // Position 트랙 index는 끝자리를 4로 지정
  ROTATION: 5, // Rotation 트랙 index는 끝자리를 5로 지정
  SCALE: 6, // Scale 트랙 index는 끝자리를 6으로 지정
};

//////////////////// new ////////////////////
// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
export const DEFAULT_BETA = 0.0;
export const DEFAULT_MIN_CUTOFF = 1.0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
export const MOCAP_POSITION_BETA = 0.002;
export const MOCAP_POSITION_MIN_CUTOFF = 0.05;
export const MOCAP_QUATERNION_BETA = 0.3;
export const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;
