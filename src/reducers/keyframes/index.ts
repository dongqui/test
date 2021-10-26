import { TrackKeyframes, ClusteredTimes } from 'types/TP_New/keyframe';
import { KeyframesAction } from 'actions/keyframes';

import deleteKeyframes from './cases/deleteKeyframes';
import selectKeyframes from './cases/selectKeyframes';

export interface KeyframesState {
  layerKeyframes: TrackKeyframes;
  boneKeyframes: TrackKeyframes[];
  transformKeyframes: TrackKeyframes[];

  selectedLayerKeyframes: ClusteredTimes[];
  selectedBoneKeyframes: ClusteredTimes[];
  selectedTransformKeyframes: ClusteredTimes[];
}

const layerKeyframes: TrackKeyframes = {
  trackIndex: 'Base',
  keyframes: Array(50)
    .fill(1)
    .map((_, index) => ({
      isSelected: false,
      isDeleted: false,
      timeIndex: index,
      value: 1,
    })),
};

const boneKeyframes: TrackKeyframes[] = Array(3)
  .fill(1)
  .map((_, index) => ({
    trackIndex: index * 10,
    keyframes: Array(50)
      .fill(1)
      .map((_, index) => ({
        isSelected: false,
        isDeleted: false,
        timeIndex: index,
        value: 1,
      })),
  }));

const transformKeyframes: TrackKeyframes[] = [
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackIndex: index + 1,
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          timeIndex: index,
          value: 1,
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackIndex: index + 11,
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          timeIndex: index,
          value: 1,
        })),
    })),
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackIndex: index + 21,
      keyframes: Array(50)
        .fill(1)
        .map((_, index) => ({
          isSelected: false,
          isDeleted: false,
          timeIndex: index,
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
