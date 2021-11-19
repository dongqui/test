import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesAction } from 'actions/keyframes';
import { Observer } from 'utils/TP';

import initializeKeyframes from './cases/initializeKeyframes';
import deleteKeyframes from './cases/deleteKeyframes';
import dragdropKeyframes from './cases/dragdropKeyframes';
import selectKeyframes from './cases/selectKeyframes';
import pasteKeyframes from './cases/pasteKeyframes';

export interface KeyframesState {
  layerTrack: TimeEditorTrack | null;
  boneTrackList: TimeEditorTrack[];
  propertyTrackList: TimeEditorTrack[];

  selectedLayerKeyframes: ClusteredKeyframe[];
  selectedBoneKeyframes: ClusteredKeyframe[];
  selectedPropertyKeyframes: ClusteredKeyframe[];

  copiedPropertyKeyframes: ClusteredKeyframe[];
}

const initialState: KeyframesState = {
  layerTrack: null,
  boneTrackList: [],
  propertyTrackList: [],

  selectedLayerKeyframes: [],
  selectedBoneKeyframes: [],
  selectedPropertyKeyframes: [],

  copiedPropertyKeyframes: [],
};

export const keyframes = (state = initialState, action: KeyframesAction) => {
  switch (action.type) {
    case 'keyframes/INITIALIZE_KEYFRAMES': {
      return initializeKeyframes(state, action.payload);
    }
    case 'keyframes/SELECT_KEYFRAMES': {
      Observer.clearAllKeyframes();
      return selectKeyframes(state, action.payload);
    }
    case 'keyframes/DELETE_KEYFRAMES': {
      Observer.clearAllKeyframes();
      return deleteKeyframes(state);
    }
    case 'keyframes/DRAG_DROP_KEYFRAMES': {
      Observer.clearAllKeyframes();
      return dragdropKeyframes(state, action.payload);
    }
    case 'keyframes/COPY_KEYFRAMES': {
      return Object.assign<{}, KeyframesState, Partial<KeyframesState>>({}, state, {
        copiedPropertyKeyframes: state.selectedPropertyKeyframes,
      });
    }
    case 'keyframes/PASTE': {
      Observer.clearAllKeyframes();
      return pasteKeyframes(state, action.payload);
    }
    default: {
      return state;
    }
  }
};
