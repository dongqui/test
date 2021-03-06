// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IpcRenderer } from 'electron';
import { BooleanValueNode } from 'graphql';
import { ContextmenuDataTypes } from '../components/Contextmenu';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
}
export enum FORMAT_TYPES {
  glb = 'glb',
  fbx = 'fbx',
  gltf = 'gltf',
}
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
  tracks = 'tracks',
  motionIndex = 'motionIndex',
}
export enum LPMODE_TYPES {
  listview = 'listview',
  iconview = 'iconview',
}
export interface screenSizeTypes {
  width: number;
  height: number;
}
export interface shortcutTypes {
  key: string;
  ctrlKey?: boolean;
  event: Function;
}
export interface contextmenuTypes {
  data?: ContextmenuDataTypes[];
  isShow: boolean;
  top: number;
  left: number;
  onClick: ({ key }: { key: string }) => void;
}
export interface mainDataTypes {
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
  [MAINDATA_PROPERTY_TYPES.tracks]?: any;
  [MAINDATA_PROPERTY_TYPES.motionIndex]?: number;
}
export interface bonesTypes {
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
  bones?: bonesTypes[];
}
