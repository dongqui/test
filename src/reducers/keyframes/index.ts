import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesAction } from 'actions/keyframes';

import deleteKeyframes from './cases/deleteKeyframes';
// import dropKeyframes from './cases/dropKeyframes';
import selectKeyframes from './cases/selectKeyframes';

export interface KeyframesState {
  layerTrack: TimeEditorTrack;
  boneTrackList: TimeEditorTrack[];
  propertyTrackList: TimeEditorTrack[];

  selectedLayerKeyframes: ClusteredKeyframe[];
  selectedBoneKeyframes: ClusteredKeyframe[];
  selectedPropertyKeyframes: ClusteredKeyframe[];
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
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackId: 'property-aaaaa' + index,
      trackNumber: index + 1,
      trackType: 'property',
      keyframes: Array(5)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: { _isdirty: true, _x: 1, _y: 1, _z: 1 },
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackId: 'property-bbbbb' + index,
      trackNumber: index + 11,
      trackType: 'property',
      keyframes: Array(5)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: { _isdirty: true, _x: 1, _y: 1, _z: 1 },
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackId: 'property-ccccc' + index,
      trackNumber: index + 21,
      trackType: 'property',
      keyframes: Array(5)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: { _isdirty: true, _x: 1, _y: 1, _z: 1 },
        })),
    })),
];

const initialState: KeyframesState = {
  layerTrack: layerKeyframes,
  boneTrackList: boneKeyframes,
  propertyTrackList: propertyKeyframes,

  selectedLayerKeyframes: [],
  selectedBoneKeyframes: [],
  selectedPropertyKeyframes: [],
};

export const keyframes = (state = initialState, action: KeyframesAction) => {
  switch (action.type) {
    case 'keyframes/SELECT_KEYFRAMES': {
      return selectKeyframes(state, action.payload);
    }
    case 'keyframes/DELETE_KEYFRAMES': {
      return deleteKeyframes(state);
    }
    default: {
      return state;
    }
  }
};

export default keyframes;
