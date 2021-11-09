import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesAction } from 'actions/keyframes';
import { Observer } from 'utils/TP';

import deleteKeyframes from './cases/deleteKeyframes';
import dragdropKeyframes from './cases/dragdropKeyframes';
import selectKeyframes from './cases/selectKeyframes';
import pasteKeyframes from './cases/pasteKeyframes';

export interface KeyframesState {
  layerTrack: TimeEditorTrack;
  boneTrackList: TimeEditorTrack[];
  propertyTrackList: TimeEditorTrack[];

  selectedLayerKeyframes: ClusteredKeyframe[];
  selectedBoneKeyframes: ClusteredKeyframe[];
  selectedPropertyKeyframes: ClusteredKeyframe[];

  copiedPropertyKeyframes: ClusteredKeyframe[];
}

const layerKeyframes: TimeEditorTrack = {
  trackId: 'layer-1',
  trackNumber: -1,
  trackType: 'layer',
  keyframes: Array(5)
    .fill(1)
    .map((_, index) => ({
      isSelected: false,
      isDeleted: false,
      time: index,
    })),
};

const boneKeyframes: TimeEditorTrack[] = Array(3)
  .fill(1)
  .map((_, index) => ({
    trackNumber: index * 10,
    trackId: 'bone' + index,
    trackType: 'bone',
    keyframes: Array(5)
      .fill(1)
      .map((_, index) => ({
        isSelected: false,
        isDeleted: false,
        time: index,
      })),
  }));

const propertyKeyframes: TimeEditorTrack[] = [
  // ...Array(3)
  //   .fill(1)
  //   .map((_, index) => ({
  //     trackId: 'property-aaaaa' + index,
  //     trackNumber: index + 1,
  //     trackType: 'property',
  //     keyframes: Array(5)
  //       .fill(1)
  //       .map((_, index) => ({
  //         isSelected: false,
  //         isDeleted: false,
  //         time: index,
  //         value: { x: 1, y: 1, z: 1 },
  //       })),
  //   })),
  // ...Array(3)
  //   .fill(1)
  //   .map((_, index) => ({
  //     trackId: 'property-bbbbb' + index,
  //     trackNumber: index + 11,
  //     trackType: 'property',
  //     keyframes: Array(5)
  //       .fill(1)
  //       .map((_, index) => ({
  //         isSelected: false,
  //         isDeleted: false,
  //         time: index,
  //         value: { x: 1, y: 1, z: 1 },
  //       })),
  //   })),
  // ...Array(3)
  //   .fill(1)
  //   .map((_, index) => ({
  //     trackId: 'property-ccccc' + index,
  //     trackNumber: index + 21,
  //     trackType: 'property',
  //     keyframes: Array(5)
  //       .fill(1)
  //       .map((_, index) => ({
  //         isSelected: false,
  //         isDeleted: false,
  //         time: index,
  //         value: { x: 1, y: 1, z: 1 },
  //       })),
  //   })),
];

const initialState: KeyframesState = {
  layerTrack: layerKeyframes,
  boneTrackList: boneKeyframes,
  propertyTrackList: propertyKeyframes,

  selectedLayerKeyframes: [],
  selectedBoneKeyframes: [],
  selectedPropertyKeyframes: [],

  copiedPropertyKeyframes: [],
};

export const keyframes = (state = initialState, action: KeyframesAction) => {
  switch (action.type) {
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
