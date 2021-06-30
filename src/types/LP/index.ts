import { LPDATA_PROPERTY_TYPES, ShootLayerType, ShootTrackType } from '..';

export const ROOT_FOLDER_NAME = 'root';

export const ROOT_KEY = 'root';

export type FileType = 'Folder' | 'File' | 'Motion';

export interface LPItemType {
  key: string;
  name: string;
  type: FileType;
  parentKey: string;
  parentKeyList: string[];
  url: string;
  isVisualized?: boolean;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  boneNames: string[];
  groupKey: string;
  depth: number;
}

export interface LPItemOldType {
  [LPDATA_PROPERTY_TYPES.key]: string;
  [LPDATA_PROPERTY_TYPES.name]: string;
  [LPDATA_PROPERTY_TYPES.type]: FileType;
  [LPDATA_PROPERTY_TYPES.parentKey]?: string;
  [LPDATA_PROPERTY_TYPES.isExpanded]?: boolean;
  [LPDATA_PROPERTY_TYPES.url]?: string;
  [LPDATA_PROPERTY_TYPES.isClicked]?: boolean;
  [LPDATA_PROPERTY_TYPES.isSelected]?: boolean;
  [LPDATA_PROPERTY_TYPES.isVisualized]?: boolean;
  [LPDATA_PROPERTY_TYPES.isVisualizeSelected]?: boolean;
  [LPDATA_PROPERTY_TYPES.isFirst]?: boolean;
  [LPDATA_PROPERTY_TYPES.isLast]?: boolean;
  [LPDATA_PROPERTY_TYPES.isModifying]?: boolean;
  [LPDATA_PROPERTY_TYPES.isCopied]?: boolean;
  [LPDATA_PROPERTY_TYPES.isDragging]?: boolean;
  [LPDATA_PROPERTY_TYPES.baseLayer]: ShootTrackType[];
  [LPDATA_PROPERTY_TYPES.layers]: ShootLayerType[];
  [LPDATA_PROPERTY_TYPES.boneNames]?: string[];
  [LPDATA_PROPERTY_TYPES.depth]?: number;
  [LPDATA_PROPERTY_TYPES.retargetMap]?: Array<any>;
  [LPDATA_PROPERTY_TYPES.isExportedMotion]?: boolean;
}

export type LPItemListType = Array<LPItemType>;

export type LPItemListOldType = Array<LPItemOldType>;

export type LPMode = 'listView' | 'iconView';

export interface LPModeType {
  mode: LPMode;
}

export interface LPPageType {
  key: string;
}

export interface LPPageOldType {
  key: string;
  name: string;
  type: FileType;
}

export type LPPageListOldType = Array<LPPageOldType>;

export interface LPSearchwordType {
  word: string;
}

export interface ModalInfoType {
  modalType: 'none' | 'alert' | 'confirm';
  detailType?: 'overwrite';
  isShow: boolean;
  message?: string;
  loading?: boolean;
  text?: { confirm: string; cancel: string };
}

export enum ContextMenuEnum {
  NEW_DIRECTORY = 'New Directory',
  EDIT_NAME = 'Edit name',
  COPY = 'Copy',
  PASTE = 'Paste',
}
