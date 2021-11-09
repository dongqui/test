import { FileType } from './LP';

export interface ContextmenuDataTypes {
  key: string;
  value: string;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export enum PAGE_NAMES {
  extract = 'extract',
  shoot = 'shoot',
  record = 'record',
}
export enum FORMAT_TYPES {
  glb = 'glb',
  fbx = 'fbx',
  json = 'json',
}
export enum VIDEO_FORMAT_TYPES {
  mp4 = 'mp4',
  avi = 'avi',
  mkv = 'mkv',
  wmv = 'wmv',
  webm = 'webm',
  mov = 'mov',
}
export enum MODAL_TYPES {
  alert = 'alert',
  input = 'input',
  loading = 'loading',
  confirm = 'confirm',
}
export const ENABLE_VIDEO_FORMATS = [
  VIDEO_FORMAT_TYPES.mp4,
  VIDEO_FORMAT_TYPES.avi,
  VIDEO_FORMAT_TYPES.mkv,
  VIDEO_FORMAT_TYPES.wmv,
  VIDEO_FORMAT_TYPES.webm,
  VIDEO_FORMAT_TYPES.mov,
];
export const ENABLE_FILE_FORMATS = [FORMAT_TYPES.glb, FORMAT_TYPES.fbx, FORMAT_TYPES.json, ...ENABLE_VIDEO_FORMATS];
export enum PROPERTY_TYPES {
  position = 'position',
  positionCnt = 3,
  quaternion = 'quaternion',
  quaternionCnt = 4,
  rotation = 'rotation',
  rotationCnt = 3,
  scale = 'scale',
  scaleCnt = 3,
}
export enum LPDATA_PROPERTY_TYPES {
  key = 'key',
  name = 'name',
  type = 'type',
  parentKey = 'parentKey',
  isExpanded = 'isExpanded',
  url = 'url',
  isClicked = 'isClicked',
  isSelected = 'isSelected',
  isVisualized = 'isVisualized',
  isVisualizeSelected = 'isVisualizeSelected',
  isFirst = 'isFirst',
  isLast = 'isLast',
  isModifying = 'isModifying',
  isCopied = 'isCopied',
  isDragging = 'isDragging',
  baseLayer = 'baseLayer',
  layers = 'layers',
  boneNames = 'boneNames',
  depth = 'depth',
  retargetMap = 'retargetMap',
  isExportedMotion = 'isExportedMotion',
}
export enum LPModeType {
  listview = 'listView',
  iconview = 'iconView',
}
export interface ScreenSizeTypes {
  width: number;
  height: number;
}
export interface ShortcutTypes {
  key: string;
  ctrlKey?: boolean;
  event: Function;
}
export interface ContextmenuType {
  data: ContextmenuDataTypes[];
  isShow: boolean;
  top: number;
  left: number;
  onClick: (key: string, value: string) => void;
}

export interface BonesTypes {
  name: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  quaternionW: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}
export interface skeletonHelpersTypes {
  time?: string;
  bones?: BonesTypes[];
}
export interface ModalType {
  msg: string;
  isShow: boolean;
  type?: MODAL_TYPES;
  cancel?: boolean;
  onClose?: () => void;
}
export interface ShootTrackType {
  name: string;
  times: number[];
  values: number[];
  interpolation: string;
  isIncluded: boolean;
}

export interface ShootLayerType {
  name: string;
  key: string;
  tracks: ShootTrackType[];
}
export interface PageInfoType {
  page: 'shoot' | 'extract' | 'record';
  videoUrl?: string;
  extension?: string;
  duration?: number;
}

export type PropertyType = 'Position' | 'Rotation' | 'Scale';
