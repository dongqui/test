import { ShootLayerType, ShootTrackType } from 'types';
import { UpdatedTrack } from 'types/TP';

export type CurrentVisualizedDataAction =
  | ReturnType<typeof setCurrentVisualizedData>
  | ReturnType<typeof resetCurrentVisualizedData>
  | ReturnType<typeof updateKeyframeToBase>
  | ReturnType<typeof updateKeyframeToLayer>
  | ReturnType<typeof deleteKeyframe>
  | ReturnType<typeof excludeTrack>
  | ReturnType<typeof setLayerName>
  | ReturnType<typeof addNewLayer>
  | ReturnType<typeof deleteLayer>;

// 현재 애니메이션을 만들기 위한 RP 내 Visualize 된 데이터
type FileTypes = 'folder' | 'file' | 'motion';
export interface CurrentVisualizedData {
  key: string;
  name: string;
  type: FileTypes;
  boneNames: string[];
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

export const RESET_CURRENT_VISUALIZED_DATA = 'currentVisualizedData/RESET_CURRENT_VISUALIZED_DATA' as const;
export const resetCurrentVisualizedData = () => ({
  type: RESET_CURRENT_VISUALIZED_DATA,
});

interface SetCurrentVisualizedData {
  data: CurrentVisualizedData;
}
export const SET_CURRENT_VISUALIZED_DATA = 'currentVisualizedData/SET_CURRENT_VISUALIZED_DATA' as const;
export const setCurrentVisualizedData = (params: SetCurrentVisualizedData) => ({
  type: SET_CURRENT_VISUALIZED_DATA,
  payload: {
    ...params,
  },
});

interface UpdateKeyframeToBase {
  data: CurrentVisualizedData;
}
export const UPDATE_KEYFRAME_TO_BASE = 'currentVisualizedData/UPDATE_KEYFRAME_TO_BASE' as const;
export const updateKeyframeToBase = (params: UpdateKeyframeToBase) => ({
  type: UPDATE_KEYFRAME_TO_BASE,
  payload: {
    ...params,
  },
});

interface UpdateKeyframeToLayer {
  data: CurrentVisualizedData;
}
export const UPDATE_KEYFRAME_TO_LAYER = 'currentVisualizedData/UPDATE_KEYFRAME_TO_LAYER' as const;
export const updateKeyframeToLayer = (params: UpdateKeyframeToLayer) => ({
  type: UPDATE_KEYFRAME_TO_LAYER,
  payload: {
    ...params,
  },
});

interface DeleteKeyframe {
  data: CurrentVisualizedData;
}
export const DELETE_KEYFRAME = 'currentVisualizedData/DELETE_KEYFRAME' as const;
export const deleteKeyframe = (params: DeleteKeyframe) => ({
  type: DELETE_KEYFRAME,
  payload: {
    ...params,
  },
});

interface ExcludeTrack {
  layerKey: string;
  updatedState: UpdatedTrack<'isIncluded' | 'trackIndex' | 'trackName'>[];
}
export const EXCLUDE_TRACK = 'currentVisualizedData/EXCLUDE_TRACK' as const;
export const excludeTrack = (params: ExcludeTrack) => ({
  type: EXCLUDE_TRACK,
  payload: {
    ...params,
  },
});

interface SetLayerName {
  layerKey: string;
  newLayerName: string;
}
export const SET_LAYER_NAME = 'currentVisualizedData/SET_LAYER_NAME' as const;
export const setLayerName = (params: SetLayerName) => ({
  type: SET_LAYER_NAME,
  payload: {
    ...params,
  },
});

interface AddNewLayer {
  newLayer: ShootLayerType;
}
export const ADD_NEW_LAYER = 'currentVisualizedData/ADD_NEW_LAYER' as const;
export const addNewLayer = (params: AddNewLayer) => ({
  type: ADD_NEW_LAYER,
  payload: {
    ...params,
  },
});

interface DeleteLayer {
  layerKey: string;
}
export const DELETE_LAYER = 'currentVisualizedData/DELETE_LAYER' as const;
export const deleteLayer = (params: DeleteLayer) => ({
  type: DELETE_LAYER,
  payload: {
    ...params,
  },
});
