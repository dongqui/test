import { EditorTrack, ClusteredKeyframe } from 'types/TP_New/keyframe';
import { KeyframesAction } from 'actions/keyframes';

import deleteKeyframes from './cases/deleteKeyframes';
import selectKeyframes from './cases/selectKeyframes';

export interface KeyframesState {
  layerKeyframes: EditorTrack;
  boneKeyframes: EditorTrack[];
  transformKeyframes: EditorTrack[];

  selectedLayerKeyframes: ClusteredKeyframe[];
  selectedBoneKeyframes: ClusteredKeyframe[];
  selectedTransformKeyframes: ClusteredKeyframe[];
}

const layerKeyframes: EditorTrack = {
  trackId: 'Base',
  trackNumber: -1,
  keyframes: Array(50)
    .fill(1)
    .map((_, index) => ({
      isSelected: false,
      isDeleted: false,
      time: index,
      value: 1,
    })),
};

const boneKeyframes: EditorTrack[] = Array(3)
  .fill(1)
  .map((_, index) => ({
    trackNumber: index * 10,
    trackId: '',
    keyframes: Array(50)
      .fill(1)
      .map((_, index) => ({
        isSelected: false,
        isDeleted: false,
        time: index,
        value: 1,
      })),
  }));

const transformKeyframes: EditorTrack[] = [
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackNumber: index + 1,
      trackId: '',
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: 1,
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackNumber: index + 11,
      trackId: '',
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: 1,
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackNumber: index + 21,
      trackId: '',
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          time: index,
          value: 1,
        })),
    })),
];

const initialState: KeyframesState = {
  layerKeyframes: layerKeyframes,
  boneKeyframes: boneKeyframes,
  transformKeyframes: transformKeyframes,

  selectedLayerKeyframes: [],
  selectedBoneKeyframes: [],
  selectedTransformKeyframes: [],
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
