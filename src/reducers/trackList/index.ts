import { TrackListAction } from 'actions/trackList';
import { LayerTrack, BoneTrack, TransformTrack, InterpolationType } from 'types/TP_New/track';

import addLayerTrack from './cases/addLayerTrack';
import createTrackList from './cases/createTrackList';
import clickCaretButton from './cases/clickCaretButton';
import clickInterpolationMode from './cases/clickInterpolationMode';
import clickTrack from './cases/clickTrack';
import deleteLayerTrack from './cases/deleteLayerTrack';
import muteLayerTrack from './cases/muteLayerTrack';

const transformTrackList1: TransformTrack[] = Array(9)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: 'PositionX' + index,
    interpolationType: index % 2 === 0 ? 'linear' : 'bezier',
    transformIndex: index + 1,
  }));

const transformTrackList2: TransformTrack[] = Array(9)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: 'PositionX' + index,
    interpolationType: 'linear',
    transformIndex: index + 1 + 10,
  }));

const transformTrackList3: TransformTrack[] = Array(9)
  .fill(0)
  .map((_, index) => ({
    isSelected: false,
    trackName: 'PositionX' + index,
    interpolationType: 'linear',
    transformIndex: index + 1 + 20,
  }));

const boneTrackList: BoneTrack[] = [
  {
    isSelected: false,
    trackName: 'Left Shoulder',
    isPointedDownCaret: false,
    boneIndex: 0,
  },
  {
    isSelected: false,
    trackName: 'Left Arm',
    isPointedDownCaret: false,
    boneIndex: 10,
  },
  {
    isSelected: false,
    trackName: 'Left Hand',
    isPointedDownCaret: false,
    boneIndex: 20,
  },
];

export interface TrackListState {
  layerTrackList: LayerTrack[];
  boneTrackList: BoneTrack[];
  transformTrackList: TransformTrack[];

  selectedLayer: string;
  selectedBones: number[];
  selectedTransforms: number[];

  interpolationType: InterpolationType;

  trackScrollTop: number; // editor mode에서도 scroll height를 알기 위해 추가
}

const initialState: TrackListState = {
  layerTrackList: [],
  boneTrackList: boneTrackList,
  transformTrackList: [...transformTrackList1, ...transformTrackList2, ...transformTrackList3],

  selectedLayer: 'Layer1',
  selectedBones: [],
  selectedTransforms: [],

  interpolationType: 'none',

  trackScrollTop: 0,
};

export const trackList = (state = initialState, action: TrackListAction) => {
  switch (action.type) {
    case 'trackList/CREATE_TRACK_LIST': {
      return createTrackList(state, action.payload);
    }
    case 'trackList/ADD_LAYER_TRACK': {
      return addLayerTrack(state, action.payload);
    }
    case 'trackList/CLICK_CARET_BUTTON': {
      return clickCaretButton(state, action.payload);
    }
    case 'trackList/CLICK_TRACK_BODY': {
      return clickTrack(state, action.payload);
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
