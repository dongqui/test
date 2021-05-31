import { ShootLayerType, ShootTrackType } from 'types';

export type FileType = 'Folder' | 'File' | 'Motion';

export interface LPModelDataState {
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
export interface LPModelDataListState extends Array<LPModelDataState> {}

export type LPModelDataAction =
  | ReturnType<typeof setLPModelData>
  | ReturnType<typeof deleteLPModelData>;

export const SET_LP_MODELDATA = 'lpdata/SET_LP_MODELDATA' as const;
export const DELETE_LP_MODELDATA = 'lpdata/DELETE_LP_MODELDATA' as const;

interface SetLPModelData extends LPModelDataListState {}

export const setLPModelData = (params: SetLPModelData) => ({
  type: SET_LP_MODELDATA,
  payload: [...params],
});

export const deleteLPModelData = (params: string[]) => ({
  type: DELETE_LP_MODELDATA,
  payload: params,
});
