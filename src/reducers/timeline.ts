import _ from 'lodash';
import { TPTrackList, TPLastBone, TPcurrentClickedTrack, KeyframeData } from 'types/TP';
import { TimelineAction } from 'actions/timeline';

interface TimelineState {
  trackList: TPTrackList[];
  lastBoneOfLayers: TPLastBone[];
  selectedTrackIndices: number[];
  selectedKeyframes: KeyframeData[];
  currentClickedTrack: TPcurrentClickedTrack;
}

const defaultState: TimelineState = {
  trackList: [],
  lastBoneOfLayers: [],
  selectedTrackIndices: [],
  selectedKeyframes: [],
  currentClickedTrack: { trackIndex: 0, isPointedDownArrow: true },
};

export const timeline = (state = defaultState, action: TimelineAction) => {
  switch (action.type) {
    case 'timeline/SET_TRACK_LIST': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'timeline/CLEAR_ALL': {
      return Object.assign({}, state, {
        trackList: [],
        lastBoneOfLayers: [],
        selectedTrackIndices: [],
        currentClickedTrack: 0,
      });
    }
    case 'timeline/CLICK_TRACK_ARROW_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        currentClickedTrack: action.payload.currentClickedTrack,
      });
    }
    case 'timeline/CLICK_TRACK_BODY': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        selectedTrackIndices: action.payload.selectedTrackIndices,
      });
    }
    case 'timeline/CLICK_TRACK_LOCK_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'timeline/CLICK_TRACK_CHECK_BUTTON': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'timeline/SEARCH_TRACK_LIST': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'timeline/ADD_KEYFRAMES': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    case 'timeline/DELETE_KEYFRAMES': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        selectedKeyframes: action.payload.selectedKeyframes,
      });
    }
    case 'timeline/SELECT_KEYFRAMES': {
      return Object.assign({}, state, {
        selectedKeyframes: action.payload.selectedKeyframes,
      });
    }
    case 'timeline/ADD_NEW_LAYER': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'timeline/DELETE_LAYER': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
        lastBoneOfLayers: action.payload.lastBoneOfLayers,
      });
    }
    case 'timeline/SET_LAYER_NAME': {
      return Object.assign({}, state, {
        trackList: action.payload.trackList,
      });
    }
    default: {
      return state;
    }
  }
};
