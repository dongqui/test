import _ from 'lodash';
import { TPDopeSheet, TPLastBone, TPCurrentClickedChannel, KeyframeData } from 'types/TP';
import { DopeSheetAction } from 'actions/dopeSheet';

interface DopeSheetState {
  trackList: TPDopeSheet[];
  lastBoneOfLayers: TPLastBone[];
  selectedChannels: number[];
  selectedKeyframes: KeyframeData[];
  currentClickedChannel: TPCurrentClickedChannel;
}

const defaultState: DopeSheetState = {
  trackList: [],
  lastBoneOfLayers: [],
  selectedChannels: [],
  selectedKeyframes: [],
  currentClickedChannel: { trackIndex: 0, isPointedDownArrow: true },
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
        selectedChannels: [],
        currentClickedChannel: 0,
      });
    }
    case 'dopeSheet/CLICK_TRACK_ARROW_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        currentClickedChannel: action.payload.currentClickedChannel,
      });
    }
    case 'dopeSheet/CLICK_TRACK_BODY': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        selectedChannels: action.payload.selectedChannels,
      });
    }
    case 'dopeSheet/CLICK_TRACK_LOCK_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/CLICK_TRACK_CHECK_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/SEARCH_TRACK_LIST': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/SELECT_KEYFRAMES': {
      return Object.assign({}, state, {
        selectedKeyframes: action.payload.selectedKeyframes,
      });
    }
    case 'dopeSheet/ADD_LAYER': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'dopeSheet/DELETE_LAYER': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'dopeSheet/MODIFY_LAYER_NAME': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    default: {
      return state;
    }
  }
};
