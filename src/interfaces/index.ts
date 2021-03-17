import { ShootLayerType, ShootTrackType } from 'types/common';
import { ContextmenuDataTypes } from '../components/Contextmenu';

export enum PAGE_NAMES {
  extract = 'extract',
  shoot = 'shoot',
  record = 'record',
}
export enum FORMAT_TYPES {
  glb = 'glb',
  fbx = 'fbx',
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
}
export const ENABLE_VIDEO_FORMATS = [
  VIDEO_FORMAT_TYPES.mp4,
  VIDEO_FORMAT_TYPES.avi,
  VIDEO_FORMAT_TYPES.mkv,
  VIDEO_FORMAT_TYPES.wmv,
  VIDEO_FORMAT_TYPES.webm,
  VIDEO_FORMAT_TYPES.mov,
];
export const ENABLE_FILE_FORMATS = [FORMAT_TYPES.glb, FORMAT_TYPES.fbx, ...ENABLE_VIDEO_FORMATS];
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
export enum FILE_TYPES {
  folder = 'folder',
  file = 'file',
  motion = 'motion',
}
export enum MAINDATA_PROPERTY_TYPES {
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
  isModifying = 'isModifying',
  isCopied = 'isCopied',
  isDragging = 'isDragging',
  baseLayer = 'baseLayer',
  layers = 'layers',
}
export enum LPMODE_TYPES {
  listview = 'listview',
  iconview = 'iconview',
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
export interface ContextmenuTypes {
  data?: ContextmenuDataTypes[];
  isShow: boolean;
  top: number;
  left: number;
  onClick: ({ key }: { key: string }) => void;
}

export interface MainDataTypes {
  [MAINDATA_PROPERTY_TYPES.key]: string;
  [MAINDATA_PROPERTY_TYPES.name]: string;
  [MAINDATA_PROPERTY_TYPES.type]: FILE_TYPES;
  [MAINDATA_PROPERTY_TYPES.parentKey]?: string;
  [MAINDATA_PROPERTY_TYPES.isExpanded]?: boolean;
  [MAINDATA_PROPERTY_TYPES.url]?: string;
  [MAINDATA_PROPERTY_TYPES.isClicked]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isSelected]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isVisualized]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isVisualizeSelected]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isModifying]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isCopied]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isDragging]?: boolean;
  [MAINDATA_PROPERTY_TYPES.baseLayer]?: ShootTrackType[];
  [MAINDATA_PROPERTY_TYPES.layers]?: ShootLayerType[];
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
export interface ModalTypes {
  msg: string;
  isShow: boolean;
  type?: MODAL_TYPES;
}
