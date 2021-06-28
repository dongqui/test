import {
  LPItemListOldType,
  LPItemListType,
  LPItemType,
  LPModeType,
  LPPageType,
  ModalInfoType,
} from 'types/LP';

export type LPItemListAction =
  | ReturnType<typeof addItemList>
  | ReturnType<typeof setItemList>
  | ReturnType<typeof deleteItemList>
  | ReturnType<typeof selectItemList>
  | ReturnType<typeof setSelectedRows>
  | ReturnType<typeof addSelectedRows>
  | ReturnType<typeof deleteSelectedRows>
  | ReturnType<typeof setLPMode>
  | ReturnType<typeof setLPPage>
  | ReturnType<typeof addDirectory>
  | ReturnType<typeof changeFileName>
  | ReturnType<typeof setModalInfo>;

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

type DeleteItemList = Pick<LPItemType, 'key'>;
export const DELETE_ITEMLIST = 'lpdata/DELETE_ITEMLIST' as const;
export const deleteItemList = (params: DeleteItemList) => ({
  type: DELETE_ITEMLIST,
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

type SetLPPage = Pick<LPPageType, 'key'>;
export const SET_LPPAGE = 'lpdata/SET_LPPAGE' as const;
export const setLPPage = (params: SetLPPage) => ({
  type: SET_LPPAGE,
  payload: params,
});

export const ADD_DIRECTORY = 'lpdata/ADD_DIRECTORY' as const;
export const addDirectory = () => ({
  type: ADD_DIRECTORY,
});

type ChangeFileName = Pick<LPItemType, 'key' | 'name' | 'parentKey' | 'type'>;
export const CHANGE_FILENAME = 'lpdata/CHANGE_FILENAME' as const;
export const changeFileName = (params: ChangeFileName) => ({
  type: CHANGE_FILENAME,
  payload: params,
});

type SetModalInfo = Partial<ModalInfoType>;
export const SET_MODAL_INFO = 'lpdata/SET_MODAL_INFO' as const;
export const setModalInfo = (params: SetModalInfo) => ({
  type: SET_MODAL_INFO,
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
