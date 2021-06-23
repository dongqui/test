import { LPItemListOldType, LPItemListType, LPItemType, LPModeType } from 'types/LP';

export type LPItemListAction =
  | ReturnType<typeof addItemList>
  | ReturnType<typeof setItemList>
  | ReturnType<typeof selectItemList>
  | ReturnType<typeof setSelectedRows>
  | ReturnType<typeof addSelectedRows>
  | ReturnType<typeof deleteSelectedRows>
  | ReturnType<typeof setLPMode>;

interface AddItemList {
  itemList: LPItemListType;
}
export const ADD_ITEMLIST = 'lpdata/ADD_ITEMLIST' as const;
export const addItemList = (params: AddItemList) => ({
  type: ADD_ITEMLIST,
  payload: params,
});

interface SetItemList extends Partial<LPItemType> {
  key: string;
}
export const SET_ITEMLIST = 'lpdata/SET_ITEMLIST' as const;
export const setItemList = (params: SetItemList) => ({
  type: SET_ITEMLIST,
  payload: params,
});

type SelectType = 'none' | 'shift' | 'ctrl';

export interface SelectItemList {
  keys: string[];
  isSelected: boolean;
  selectType: SelectType;
}
export const SELECT_ITEMLIST = 'lpdata/SELECT_ITEMLIST' as const;
export const selectItemList = (params: SelectItemList) => ({
  type: SELECT_ITEMLIST,
  payload: params,
});

export type SelectedRowsAction = ReturnType<typeof setSelectedRows>;

export interface SetSelectedRows {
  keys: string[];
}
export const SET_SELECTED_ROWS = 'lpdata/SET_SELECTED_ROWS' as const;
export const setSelectedRows = (params: SetSelectedRows) => ({
  type: SET_SELECTED_ROWS,
  payload: params,
});

interface AddSelectedRows {
  keys: string[];
}
export const ADD_SELECTED_ROWS = 'lpdata/ADD_SELECTED_ROWS' as const;
export const addSelectedRows = (params: AddSelectedRows) => ({
  type: ADD_SELECTED_ROWS,
  payload: params,
});

interface DeleteSelectedRows {
  keys: string[];
}
export const DELETE_SELECTED_ROWS = 'lpdata/DELETE_SELECTED_ROWS' as const;
export const deleteSelectedRows = (params: DeleteSelectedRows) => ({
  type: DELETE_SELECTED_ROWS,
  payload: params,
});

type SetLPMode = LPModeType;
export const SET_LPMODE = 'lpdata/SET_LPMODE' as const;
export const setLPMode = (params: SetLPMode) => ({
  type: SET_LPMODE,
  payload: params,
});

export type LPItemListOldAction = ReturnType<typeof setItemListOld>;

interface SetItemListOld {
  itemList: LPItemListOldType;
}
export const SET_ITEMLIST_OLD = 'lpdata/SET_ITEMLIST_OLD' as const;
export const setItemListOld = (params: SetItemListOld) => ({
  type: SET_ITEMLIST_OLD,
  payload: params,
});
