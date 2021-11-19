import { TrackListAction } from 'actions/trackList';
import { LayerTrack, BoneTrack, PropertyTrack } from 'types/TP/track';

import addLayerTrack from './cases/addLayerTrack';
import initializeTrackList from './cases/initializeTrackList';
import clickCaretButton from './cases/clickCaretButton';
import clickTrackBody from './cases/clickTrackBody';
import deleteLayerTrack from './cases/deleteLayerTrack';
import muteLayerTrack from './cases/muteLayerTrack';

export interface TrackListState {
  layerTrackList: LayerTrack[];
  boneTrackList: BoneTrack[];
  propertyTrackList: PropertyTrack[];

  selectedLayer: string;
  selectedBones: number[];
  selectedProperties: number[];

  // interpolationType: InterpolationType;

  trackScrollTop: number; // editor mode에서도 scroll height를 알기 위해 추가
}

const initialState: TrackListState = {
  layerTrackList: [],
  boneTrackList: [],
  propertyTrackList: [],

  selectedLayer: '',
  selectedBones: [],
  selectedProperties: [],

  // interpolationType: 'none',

  trackScrollTop: 0,
};

export const trackList = (state = initialState, action: TrackListAction) => {
  switch (action.type) {
    case 'trackList/INITIALIZE_TRACK_LIST': {
      return initializeTrackList(state, action.payload);
    }
    case 'trackList/ADD_LAYER_TRACK': {
      return addLayerTrack(state, action.payload);
    }
    case 'trackList/CLICK_CARET_BUTTON': {
      return clickCaretButton(state, action.payload);
    }
    case 'trackList/CLICK_TRACK_BODY': {
      return clickTrackBody(state, action.payload);
    }
    case 'trackList/DELETE_LAYER_TRACK': {
      return deleteLayerTrack(state, action.payload);
    }
    case 'trackList/MUTE_LAYER_TRACK': {
      return muteLayerTrack(state, action.payload);
    }
    case 'trackList/CHANGE_TRACK_SCROLL_TOP': {
      return Object.assign<{}, TrackListState, Partial<TrackListState>>({}, state, {
        trackScrollTop: action.payalod.scrollTop,
      });
    }
    default: {
      return state;
    }
  }
};
