import { ShootLayerType, ShootTrackType } from 'types';

export type FileType = 'Folder' | 'File' | 'Motion';

export interface LPItemState {
  key: string;
  name: string;
  type: FileType;
  parentKey: string;
  groupKey: string;
  url: string;
  isSelected?: boolean;
  isVisualized?: boolean;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  boneNames: string[];
}
export interface LPItemsState extends Array<LPItemState> {}

export type LPItemsAction = ReturnType<typeof setItems> | ReturnType<typeof deleteItems>;

export const SET_LP_ITEMS = 'lpdata/SET_LP_ITEMS' as const;
export const DELETE_LP_ITEMS = 'lpdata/DELETE_LP_ITEMS' as const;

interface SetLPItems extends LPItemsState {}

export const setItems = (params: SetLPItems) => ({
  type: SET_LP_ITEMS,
  payload: [...params],
});

export const deleteItems = (params: string[]) => ({
  type: DELETE_LP_ITEMS,
  payload: params,
});
