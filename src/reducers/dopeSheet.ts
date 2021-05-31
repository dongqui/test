import _ from 'lodash';
import { TPTrackList, TPLastBone, TPcurrentClickedTrack, KeyframeData } from 'types/TP';
import { DopeSheetAction } from 'actions/dopeSheet';

interface DopeSheetState {
  trackList: TPTrackList[];
  lastBoneOfLayers: TPLastBone[];
  selectedTrackIndices: number[];
  selectedKeyframes: KeyframeData[];
  currentClickedTrack: TPcurrentClickedTrack;
}

const defaultState: DopeSheetState = {
  trackList: [],
  lastBoneOfLayers: [],
  selectedTrackIndices: [],
  selectedKeyframes: [],
  currentClickedTrack: { trackIndex: 0, isPointedDownArrow: true },
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
        selectedTrackIndices: [],
        currentClickedTrack: 0,
      });
    }
    case 'dopeSheet/CLICK_TRACK_ARROW_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        currentClickedTrack: action.payload.currentClickedTrack,
      });
    }
    case 'dopeSheet/CLICK_TRACK_BODY': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        selectedTrackIndices: action.payload.selectedTrackIndices,
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
    case 'dopeSheet/ADD_KEYFRAMES': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'dopeSheet/DELETE_KEYFRAMES': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        selectedKeyframes: action.payload.selectedKeyframes,
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
