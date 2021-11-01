import { TrackListAction } from 'actions/trackList';
import { LayerTrack, BoneTrack, PropertyTrack } from 'types/TP/track';

import addLayerTrack from './cases/addLayerTrack';
// import initializeTrackList from './cases/createTrackList';
import clickCaretButton from './cases/clickCaretButton';
import clickInterpolationMode from './cases/clickInterpolationMode';
import clickTrackBody from './cases/clickTrackBody';
import deleteLayerTrack from './cases/deleteLayerTrack';
import muteLayerTrack from './cases/muteLayerTrack';

const propertyTrackList1: PropertyTrack[] = Array(3)
  .fill(0)
  .map(
    (_, index) =>
      ({
        isSelected: false,
        trackName: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        interpolationType: 'linear',
        trackNumber: index + 1,
        trackType: 'property',
      } as PropertyTrack),
  );

const propertyTrackList2: PropertyTrack[] = Array(3)
  .fill(0)
  .map(
    (_, index) =>
      ({
        isSelected: false,
        trackName: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        interpolationType: 'linear',
        trackNumber: index + 11,
        trackType: 'property',
      } as PropertyTrack),
  );

const propertyTrackList3: PropertyTrack[] = Array(3)
  .fill(0)
  .map(
    (_, index) =>
      ({
        isSelected: false,
        trackName: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        property: index === 0 ? 'position' : index === 1 ? 'rotation' : 'scale',
        interpolationType: 'linear',
        trackNumber: index + 21,
        trackType: 'property',
      } as PropertyTrack),
  );

const boneTrackList: BoneTrack[] = [
  {
    isSelected: false,
    trackName: 'Left Shoulder',
    isPointedDownCaret: false,
    trackNumber: 0,
    targetId: '11111-11111-11111',
    trackType: 'bone',
  },
  {
    isSelected: false,
    trackName: 'Left Arm',
    isPointedDownCaret: false,
    trackNumber: 10,
    targetId: '22222-22222-22222',
    trackType: 'bone',
  },
  {
    isSelected: false,
    trackName: 'Left Hand',
    isPointedDownCaret: false,
    trackNumber: 20,
    targetId: '33333-33333-33333',
    trackType: 'bone',
  },
];

const layerTrackList: LayerTrack[] = [
  {
    trackNumber: -1,
    layerId: 'aaaaa-aaaaa-aaaaa',
    trackName: 'Layer1',
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: true,
    trackType: 'layer',
  },
  {
    trackNumber: -1,
    layerId: 'bbbbb-bbbbb-bbbbb',
    trackName: 'Layer2',
    isMuted: false,
    isPointedDownCaret: false,
    isSelected: false,
    trackType: 'layer',
  },
  {
    trackNumber: -1,
    layerId: 'ccccc-ccccc-ccccc',
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
  propertyTrackList: PropertyTrack[];

  selectedLayer: string;
  selectedBones: number[];
  selectedProperties: number[];

  // interpolationType: InterpolationType;

  trackScrollTop: number; // editor mode에서도 scroll height를 알기 위해 추가
}

const initialState: TrackListState = {
  layerTrackList: layerTrackList,
  boneTrackList: boneTrackList,
  propertyTrackList: [...propertyTrackList1, ...propertyTrackList2, ...propertyTrackList3],

  selectedLayer: 'aaaaa-aaaaa-aaaaa',
  selectedBones: [],
  selectedProperties: [],

  // interpolationType: 'none',

  trackScrollTop: 0,
};

export const trackList = (state = initialState, action: TrackListAction) => {
  switch (action.type) {
    // case 'trackList/INITIALIZE_TRACK_LIST': {
    //   return initializeTrackList(state, action.payload);
    // }
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
