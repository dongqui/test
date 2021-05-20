import _ from 'lodash';
import { TPDopeSheet, TPLastBone } from 'types/TP';
import { DopeSheetAction } from 'actions/dopeSheet';

interface DopeSheetState {
  trackList: TPDopeSheet[];
  lastBoneOfLayers: TPLastBone[];
  prevSelectedIndexes: number[];
}

const defaultState: DopeSheetState = {
  trackList: [],
  lastBoneOfLayers: [],
  prevSelectedIndexes: [],
};

export const dopeSheet = (state = defaultState, action: DopeSheetAction) => {
  switch (action.type) {
    case 'dopeSheet/SET_TRACK_LIST': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'dopeSheet/CLEAR_ALL': {
      return Object.assign({}, state, {
        trackList: [],
        lastBoneOfLayers: [],
      });
    }
    case 'dopeSheet/CLICK_TRACK_ARROW_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/CLICK_TRACK_BODY': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        prevSelectedIndexes: action.payload.prevSelectedIndexes,
      });
    }
    case 'dopeSheet/CLICK_TRACK_LOCK_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/SEARCH_TRACK_LIST': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    default: {
      return state;
    }
  }
};
