import { LPDatasState, LPDataAction } from 'actions/lpdata';

export const ROOT_KEY = 'root';
const defaultState: LPDatasState = [
  {
    key: '0',
    name: 'file',
    type: 'File',
    parentKey: ROOT_KEY,
    baseLayer: [],
    layers: [],
    boneNames: [],
  },
];

export const lpdata = (state: LPDatasState = defaultState, action: LPDataAction): LPDatasState => {
  switch (action.type) {
    case 'lpdata/SET_LPDATA': {
      return [...state, action.payload];
    }
    default: {
      return state;
    }
  }
};
