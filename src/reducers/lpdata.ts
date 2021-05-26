import _ from 'lodash';
import { LPDatasState, LPDataAction } from 'actions/lpdata';

export const ROOT_KEY = 'root';
const defaultState: LPDatasState = [];

interface FindDeleteKeys {
  data: LPDatasState;
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

export const lpdata = (state: LPDatasState = defaultState, action: LPDataAction): LPDatasState => {
  switch (action.type) {
    case 'lpdata/SET_LPDATA': {
      return [...state, ...action.payload];
    }
    case 'lpdata/DELETE_LPDATA': {
      // 하위 키들을 함께 지워준다
      const deleteKeys = findDeleteKeys({ data: state, keys: action.payload });
      return state.filter((item) => !deleteKeys.includes(item.key));
    }
    default: {
      return state;
    }
  }
};
