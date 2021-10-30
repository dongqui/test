import { TrackListAction } from 'actions/trackList';
import { LayerTrack, BoneTrack, TransformTrack } from 'types/TP_New/track';

import addLayerTrack from './cases/addLayerTrack';
import initializeTrackList from './cases/createTrackList';
import clickCaretButton from './cases/clickCaretButton';
import clickInterpolationMode from './cases/clickInterpolationMode';
import clickTrackBody from './cases/clickTrackBody';
import deleteLayerTrack from './cases/deleteLayerTrack';
import muteLayerTrack from './cases/muteLayerTrack';

const transformTrackList1: TransformTrack[] = Array(3)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: index === 0 ? 'Position' : index === 1 ? 'Rotation' : 'Scale',
    interpolationType: 'linear',
    trackNumber: index + 1,
    trackId: 'alwkejr-zxchzxklc-13hkjsa',
    trackType: 'transform',
  }));

const transformTrackList2: TransformTrack[] = Array(3)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: index === 0 ? 'Position' : index === 1 ? 'Rotation' : 'Scale',
    interpolationType: 'linear',
    trackNumber: index + 11,
    trackId: 'opsdfoi-sdlflkd-zxchoisda',
    trackType: 'transform',
  }));

const transformTrackList3: TransformTrack[] = Array(3)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: index === 0 ? 'Position' : index === 1 ? 'Rotation' : 'Scale',
    interpolationType: 'linear',
    trackNumber: index + 21,
    trackId: 'lskdfjhlks-ewjkhsdklf-asdasd',
    trackType: 'transform',
  }));

const boneTrackList: BoneTrack[] = [
  {
    isSelected: false,
    trackName: 'Left Shoulder',
    isPointedDownCaret: false,
    trackNumber: 0,
    trackId: '',
    trackType: 'bone',
  },
  {
    isSelected: false,
    trackName: 'Left Arm',
    isPointedDownCaret: false,
    trackNumber: 10,
    trackId: '',
    trackType: 'bone',
  },
  {
    isSelected: false,
    trackName: 'Left Hand',
    isPointedDownCaret: false,
    trackNumber: 20,
    trackId: '',
    trackType: 'bone',
  },
];

const layerTrackList: LayerTrack[] = [
  {
    trackNumber: -1,
    trackId: 'sdjfhsdkjfdsfj-q1234b2jkwqebjk-sdfjksdfkj',
    trackName: 'Layer1',
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: true,
    trackType: 'layer',
  },
  {
    trackNumber: -1,
    trackId: 'sqweasdklasd-xcvcxcasd-eqwdsasd',
    trackName: 'Layer2',
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackType: 'layer',
  },
  {
    trackNumber: -1,
    trackId: 'hguidfhjsao-12easdsa-sdgsdgf',
    trackName: 'Layer3',
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackType: 'layer',
  },
];

export interface TrackListState {
  layerTrackList: LayerTrack[];
  boneTrackList: BoneTrack[];
  transformTrackList: TransformTrack[];

  selectedLayer: string;
  selectedBones: number[];
  selectedTransforms: number[];

  // interpolationType: InterpolationType;

  trackScrollTop: number; // editor mode에서도 scroll height를 알기 위해 추가
}

const initialState: TrackListState = {
  layerTrackList: layerTrackList,
  boneTrackList: boneTrackList,
  transformTrackList: [...transformTrackList1, ...transformTrackList2, ...transformTrackList3],

  selectedLayer: 'sdjfhsdkjfdsfj-q1234b2jkwqebjk-sdfjksdfkj',
  selectedBones: [],
  selectedTransforms: [],

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
    case 'trackList/CLICK_INTERPOLATION_MODE': {
      return clickInterpolationMode(state, action.payload);
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

export default trackList;
