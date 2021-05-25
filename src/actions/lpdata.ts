import { ShootLayerType, ShootTrackType } from 'types';

export type FileType = 'Folder' | 'File' | 'Motion';

export interface LPDataState {
  key: string;
  name: string;
  type: FileType;
  parentKey: string;
  url?: string;
  isSelected?: boolean;
  isVisualized?: boolean;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  boneNames: string[];
}
export interface LPDatasState extends Array<LPDataState> {}

export type LPDataAction = ReturnType<typeof setLPData> | ReturnType<typeof deleteLPData>;

export const SET_LPDATA = 'lpdata/SET_LPDATA' as const;
export const DELETE_LPDATA = 'lpdata/DELETE_LPDATA' as const;

interface SetLPData extends LPDatasState {}

export const setLPData = (params: SetLPData) => ({
  type: SET_LPDATA,
  payload: [...params],
});

export const deleteLPData = (params: string[]) => ({
  type: DELETE_LPDATA,
  payload: params,
});
