import { FILE_TYPES, LPDataType } from 'types';
import { CPItemType } from 'types/CP';

export const isClient = typeof window !== 'undefined';

export const CUT_IMAGES_CNT = 20;

export const STANDARD_TIME_UNIT = 1 / 30;

export const DEFAULT_MODELS: LPDataType[] = [
  {
    key: 'defaultmodel1',
    name: 'zombie.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493576/zombie_bkqv8g.glb',
    type: FILE_TYPES.file,
    baseLayer: [],
    layers: [],
  },
  {
    key: 'defaultmodel2',
    name: 'knight.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493584/knight_zizg5n.glb',
    type: FILE_TYPES.file,
    baseLayer: [],
    layers: [],
  },
  {
    key: 'defaultmodel3',
    name: 'vanguard.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619494583/vanguard_t_cslcnl.glb',
    type: FILE_TYPES.file,
    baseLayer: [],
    layers: [],
  },
];

export const INITIAL_LP_DATA: LPDataType[] = [];

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
  BONE_A: 3, // Bone 트랙 Index는 끝자리를 3과 7로 지정
  POSITION_A: 4, // Position 트랙 index는 끝자리를 4와 8로 지정
  ROTATION_A: 5, // Rotation 트랙 index는 끝자리를 5과 9로 지정
  SCALE_A: 6, // Scale 트랙 index는 끝자리를 6과 0으로 지정
  BONE_B: 7,
  POSITION_B: 8,
  ROTATION_B: 9,
  SCALE_B: 0,
};
