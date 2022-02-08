import { PlaskLayer, PlaskTrack } from 'types/common';
import { TrackType } from 'types/TP';
import { LayerTrack, BoneTrack, PropertyTrack } from 'types/TP/track';

export type TrackListAction =
  | ReturnType<typeof initializeTrackList>
  | ReturnType<typeof clickCaretButton>
  | ReturnType<typeof clickTrackBody>
  | ReturnType<typeof clickInterpolationMode>
  | ReturnType<typeof addLayerTrack>
  | ReturnType<typeof deleteLayerTrack>
  | ReturnType<typeof muteLayerTrack>
  | ReturnType<typeof changeTrackScrollTop>;

export const INITIALIZE_TRACK_LIST = 'trackList/INITIALIZE_TRACK_LIST' as const;
export const CHANGE_SELECTED_TARGETS = 'trackList/CHANGE_SELECTED_TARGETS' as const;
export const CLICK_CARET_BUTTON = 'trackList/CLICK_CARET_BUTTON' as const;
export const CLICK_TRACK_BODY = 'trackList/CLICK_TRACK_BODY' as const;
export const CLICK_INTERPOLATION_MODE = 'trackList/CLICK_INTERPOLATION_MODE' as const;
export const CLICK_ADD_LAYER_TRACK_BUTTON = 'trackList/CLICK_ADD_LAYER_TRACK_BUTTON' as const;
export const ADD_LAYER_TRACK = 'trackList/ADD_LAYER_TRACK' as const;
export const CLICK_DELETE_LAYER_TRACK_BUTTON = 'trackList/CLICK_DELETE_LAYER_TRACK_BUTTON' as const;
export const DELETE_LAYER_TRACK = 'trackList/DELETE_LAYER_TRACK' as const;
export const CLICK_LAYER_TRACK_MUTE_BUTTON = 'trackList/CLICK_LAYER_TRACK_MUTE_BUTTON' as const;
export const MUTE_LAYER_TRACK = 'trackList/MUTE_LAYER_TRACK' as const;
export const CHANGE_TRACK_SCROLL_TOP = 'trackList/CHANGE_TRACK_SCROLL_TOP' as const;

// 트랙 리스트 생성
export interface InitializeTrackList {
  list: PlaskLayer[] | PlaskTrack[];
  animationIngredientId?: string;
  clearAnimation?: boolean;
}
export const initializeTrackList = (params: InitializeTrackList) => ({
  type: INITIALIZE_TRACK_LIST,
  payload: { ...params },
});

//
export const changeSelectedTargets = () => ({
  type: CHANGE_SELECTED_TARGETS,
});

// 트랙 내부 펴닫기 버튼 클릭
export type ClickLayerCaretButton = Pick<LayerTrack, 'isPointedDownCaret' | 'trackId' | 'trackType'>;
export type ClickBoneCaretButton = Pick<BoneTrack, 'isPointedDownCaret' | 'trackNumber' | 'trackType'>;
export type ClickCaretButton = ClickLayerCaretButton | ClickBoneCaretButton;
export const clickCaretButton = (params: ClickCaretButton) => ({
  type: CLICK_CARET_BUTTON,
  payload: { ...params },
});

// 트랙 몸통 클릭
export interface ClickTrackBody {
  trackType: TrackType;
  eventType: 'leftClick' | 'multipleClick' | 'rightClick' | 'selectAll' | 'unselectAll';
}
export type ClickLayerTrackBody = Pick<LayerTrack, 'trackId'> & ClickTrackBody;
export type ClickBoneTrackBody = Pick<BoneTrack, 'trackNumber'> & ClickTrackBody;
export type ClickPropertyTrackBody = Pick<PropertyTrack, 'trackNumber'> & ClickTrackBody;
export const clickTrackBody = (params: ClickTrackBody) => ({
  type: CLICK_TRACK_BODY,
  payload: { ...params },
});

// interpolation mode 버튼 클릭
export type ClickInterpolationMode = Pick<PropertyTrack, 'interpolationType'>;
export const clickInterpolationMode = (params: ClickInterpolationMode) => ({
  type: CLICK_INTERPOLATION_MODE,
  payload: { ...params },
});

// 레이어 트랙 추가 버튼 클릭
export const clickAddLayerTrackButton = () => ({
  type: CLICK_ADD_LAYER_TRACK_BUTTON,
});

// 레이어 트랙 추가
export interface AddLayerTrack {
  id: string;
  name: string;
}
export const addLayerTrack = (params: AddLayerTrack) => ({
  type: ADD_LAYER_TRACK,
  payload: { ...params },
});

// 레이어 트랙 삭제 버튼 클릭
export interface ClickDeleteLayerTrackButton {
  id: string;
}
export const clickDeleteLayerTrackButton = (params: ClickDeleteLayerTrackButton) => ({
  type: CLICK_DELETE_LAYER_TRACK_BUTTON,
  payload: { ...params },
});

// 레이어 트랙 삭제
export interface DeleteLayerTrack {
  id: string;
}
export const deleteLayerTrack = (params: DeleteLayerTrack) => ({
  type: DELETE_LAYER_TRACK,
  payload: { ...params },
});

// mute/unmute 버튼 클릭
export interface ClickLayerTrackMuteButton {
  id: string;
}
export const clickLayerTrackMuteButton = (params: ClickLayerTrackMuteButton) => ({
  type: CLICK_LAYER_TRACK_MUTE_BUTTON,
  payload: { ...params },
});

// 레이어 트랙 mute/unmute
export interface MuteLayerTrack {
  id: string;
}
export const muteLayerTrack = (params: MuteLayerTrack) => ({
  type: MUTE_LAYER_TRACK,
  payload: { ...params },
});

// 트랙 스크롤 높이 전달
interface ChangeTrackScrollTop {
  scrollTop: number;
}
export const changeTrackScrollTop = (params: ChangeTrackScrollTop) => ({
  type: CHANGE_TRACK_SCROLL_TOP,
  payalod: { ...params },
});
