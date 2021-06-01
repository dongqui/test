import _ from 'lodash';
import { LPItemsState, LPModelDataAction } from 'actions/lpData';

export const ROOT_KEY = 'root';
const defaultState: LPItemsState = [];

interface FindDeleteKeys {
  data: LPItemsState;
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

export const lpData = (state: LPItemsState = defaultState, action: LPModelDataAction) => {
  switch (action.type) {
    case 'lpdata/SET_LP_ITEMS': {
      return [...state, ...action.payload];
    }
    case 'lpdata/DELETE_LP_ITEMS': {
      // 하위 키들을 함께 지워준다
      const deleteKeys = findDeleteKeys({ data: state, keys: action.payload });
      return state.filter((item) => !deleteKeys.includes(item.key));
    }
    default: {
      return state;
    }
  }
};
