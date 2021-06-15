import _ from 'lodash';
import { LPItemListAction, LPItemListOldAction } from 'actions/lpData';
import { LPItemListOldType, LPItemListType } from 'types/LP';

interface FindDeleteKeys {
  data: LPItemListType;
  keys: string[];
}

/**
 * 삭제할 key들의 하위키들을 모두 찾아준다
 *
 * @param data - lpdata
 * @param keys - 삭제할 키들의 배열
 *
 * @return 삭제할 키들의 배열 (하위키들 포함)
 */
const findDeleteKeys = (params: FindDeleteKeys): string[] => {
  const { data, keys } = params;
  const relationalKeys = data
    .filter((item) => keys.includes(item.parentKey))
    .map((item) => item.key);
  const deleteKeys = _.concat(keys, relationalKeys);
  return deleteKeys;
};

type LPDataState = LPItemListType;

const defaultState: LPDataState = [];

export const lpData = (state = defaultState, action: LPItemListAction) => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return [...state, ...action.payload.itemList];
    }
    case 'lpdata/DELETE_ITEMLIST': {
      // 하위 키들을 함께 지워준다
      const deleteKeys = findDeleteKeys({ data: state, keys: action.payload.keys });
      return state.filter((item) => !deleteKeys.includes(item.key));
    }
    default: {
      return state;
    }
  }
};

type LPDataOldState = LPItemListOldType;

const defaultStateOld: LPDataOldState = [];

export const lpDataOld = (state = defaultStateOld, action: LPItemListOldAction) => {
  switch (action.type) {
    case 'lpdata/SET_ITEMLIST_OLD': {
      return [...action.payload.itemList];
    }
    default: {
      return state;
    }
  }
};
