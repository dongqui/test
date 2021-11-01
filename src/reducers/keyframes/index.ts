import { LayerIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesAction } from 'actions/keyframes';

import deleteKeyframes from './cases/deleteKeyframes';
import selectKeyframes from './cases/selectKeyframes';

export interface KeyframesState {
  layerTrack: TimeEditorTrack<LayerIdentifier>;
  boneTrackList: TimeEditorTrack<BoneIdentifier>[];
  propertyTrackList: TimeEditorTrack<PropertyIdentifier>[];

  selectedLayerKeyframes: ClusteredKeyframe<LayerIdentifier>[];
  selectedBoneKeyframes: ClusteredKeyframe<BoneIdentifier>[];
  selectedPropertyKeyframes: ClusteredKeyframe<PropertyIdentifier>[];
}

const layerKeyframes: TimeEditorTrack<LayerIdentifier> = {
  layerId: 'aaaaa-aaaaa-aaaaa',
  trackNumber: -1,
  trackType: 'layer',
  keyframes: Array(50)
    .fill(1)
    .map((_, index) => ({
      isSelected: false,
      isDeleted: false,
      time: index,
    })),
};

const boneKeyframes: TimeEditorTrack<BoneIdentifier>[] = Array(3)
  .fill(1)
  .map((_, index) => ({
    trackNumber: index * 10,
    targetId: '',
    trackType: 'bone',
    keyframes: Array(50)
      .fill(1)
      .map((_, index) => ({
        isSelected: false,
        isDeleted: false,
        time: index,
      })),
  }));

const propertyKeyframes: TimeEditorTrack<PropertyIdentifier>[] = [
  ...Array(3)
    .fill(1)
    .map((_, index) => ({
      trackNumber: index + 1,
      trackType: 'property',
      property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
      keyframes: Array(50)
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
      trackNumber: index + 11,
      trackType: 'property',
      property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
      keyframes: Array(50)
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
      trackNumber: index + 21,
      trackType: 'property',
      property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
      keyframes: Array(50)
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
