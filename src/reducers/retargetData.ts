import { RetargetDataAction } from 'actions/retargetData';
import { RetargetInfoType, RetargetMapItem, TargetBoneType } from 'types/CP';

interface RetargetDataState {
  retargetInfo: RetargetInfoType;
  retargetMap: RetargetMapItem[];
}

const defaultState: RetargetDataState = {
  retargetInfo: {
    modelKey: null,
    targetboneList: [],
    retargetMap: [],
  },
  retargetMap: [],
};

export const retargetData = (state = defaultState, action: RetargetDataAction) => {
  switch (action.type) {
    case 'retargetData/SET_RETARGET_INFO': {
      return Object.assign({}, state, {
        retargetInfo: {
          modelKey: action.payload.modelKey,
          targetboneList: action.payload.targetboneList,
          retargetMap: action.payload.retargetMap,
        },
      });
    }
    case 'retargetData/SET_RETARGET_MAP': {
      return Object.assign({}, state, {
        retargetMap: action.payload.retargetMap,
      });
    }
    default:
      return state;
  }
};
