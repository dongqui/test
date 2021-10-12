import { ShootRetargetMap } from '../types/common';
import { RetargetMapAction } from 'actions/retargetMapsAction';

type State = ShootRetargetMap[];

const defaultState: State = [];

export const retargetMaps = (state = defaultState, action: RetargetMapAction) => {
  switch (action.type) {
    case 'retargetMapsAction/ADD_RETARGET_MAP': {
      return [...state, action.payload.retargetMap];
    }
    case 'retargetMapsAction/REMOVE_RETARGET_MAP': {
      return state.filter((retargetMap) => retargetMap.assetId !== action.payload.assetId);
    }
    default: {
      return state;
    }
  }
};
