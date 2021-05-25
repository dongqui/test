import _ from 'lodash';
import { LPDatasState, LPDataAction } from 'actions/lpdata';

export const ROOT_KEY = 'root';
const defaultState: LPDatasState = [];

interface FindDeleteKeys {
  data: LPDatasState;
  keys: string[];
}

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
      const deleteKeys = findDeleteKeys({ data: state, keys: action.payload });
      return state.filter((item) => !deleteKeys.includes(item.key));
    }
    default: {
      return state;
    }
  }
};
