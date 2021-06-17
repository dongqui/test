import { LPItemListOldType, LPItemListType, LPItemType } from 'types/LP';

export type LPItemListAction =
  | ReturnType<typeof addItemList>
  | ReturnType<typeof deleteItemList>
  | ReturnType<typeof setItemList>
  | ReturnType<typeof selectItemList>;

interface AddItemList {
  itemList: LPItemListType;
}
export const ADD_ITEMLIST = 'lpdata/ADD_ITEMLIST' as const;
export const addItemList = (params: AddItemList) => ({
  type: ADD_ITEMLIST,
  payload: params,
});

interface DeleteItemList {
  keys: string[];
}
export const DELETE_ITEMLIST = 'lpdata/DELETE_ITEMLIST' as const;
export const deleteItemList = (params: DeleteItemList) => ({
  type: DELETE_ITEMLIST,
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

export type LPItemListOldAction = ReturnType<typeof setItemListOld>;

interface SetItemListOld {
  itemList: LPItemListOldType;
}
export const SET_ITEMLIST_OLD = 'lpdata/SET_ITEMLIST_OLD' as const;
export const setItemListOld = (params: SetItemListOld) => ({
  type: SET_ITEMLIST_OLD,
  payload: params,
});
