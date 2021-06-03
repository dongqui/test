import { ShootLayerType, ShootTrackType } from '..';

export const ROOT_FOLDER_NAME = 'root';

export const ROOT_KEY = 'root';

export type FileType = 'Folder' | 'File' | 'Motion';

export interface LPItemType {
  key: string;
  name: string;
  type: FileType;
  parentKey: string;
  url: string;
  isSelected?: boolean;
  isVisualized?: boolean;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  boneNames: string[];
}

export type LPItemListType = Array<LPItemType>;

export type LPMode = 'listView' | 'iconView';

export interface LPModeType {
  mode: LPMode;
}

export interface LPPageType {
  key: string;
}

export interface LPSearchwordType {
  word: string;
}
