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

// 트랙 리스트 생성
export interface InitializeTrackList {
  list: PlaskLayer[] | PlaskTrack[];
  animationIngredientId?: string;
  clearAnimation?: boolean;
}
export const initializeTrackList = (params: InitializeTrackList) => ({
  type: 'trackList/INITIALIZE_TRACK_LIST' as const,
  payload: { ...params },
});

export const CHANGE_SELECTED_TARGETS = 'trackList/CHANGE_SELECTED_TARGETS' as const;
export const changeSelectedTargets = () => ({
  type: CHANGE_SELECTED_TARGETS,
});

// 트랙 내부 펴닫기 버튼 클릭
export type ClickLayerCaretButton = Pick<LayerTrack, 'isPointedDownCaret' | 'trackId' | 'trackType'>;
export type ClickBoneCaretButton = Pick<BoneTrack, 'isPointedDownCaret' | 'trackNumber' | 'trackType'>;
export type ClickCaretButton = ClickLayerCaretButton | ClickBoneCaretButton;
export const clickCaretButton = (params: ClickCaretButton) => ({
  type: 'trackList/CLICK_CARET_BUTTON' as const,
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
  type: 'trackList/CLICK_TRACK_BODY' as const,
  payload: { ...params },
});

// interpolation mode 버튼 클릭
export type ClickInterpolationMode = Pick<PropertyTrack, 'interpolationType'>;
export const clickInterpolationMode = (params: ClickInterpolationMode) => ({
  type: 'trackList/CLICK_INTERPOLATION_MODE' as const,
  payload: { ...params },
});

// 레이어 트랙 추가 버튼 클릭
export const CLICK_ADD_LAYER_TRACK_BUTTON = 'trackList/CLICK_ADD_LAYER_TRACK_BUTTON' as const;
export const clickAddLayerTrackButton = () => ({
  type: CLICK_ADD_LAYER_TRACK_BUTTON,
});

// 레이어 트랙 추가
export const addLayerTrack = (params: PlaskLayer) => ({
  type: 'trackList/ADD_LAYER_TRACK' as const,
  payload: { ...params },
});

// 레이어 트랙 삭제 버튼 클릭
export const CLICK_DELETE_LAYER_TRACK_BUTTON = 'trackList/CLICK_DELETE_LAYER_TRACK_BUTTON' as const;
export const clickDeleteLayerTrackButton = (params: PlaskLayer) => ({
  type: CLICK_DELETE_LAYER_TRACK_BUTTON,
  payload: { ...params },
});

// 레이어 트랙 삭제
export const deleteLayerTrack = (params: PlaskLayer) => ({
  type: 'trackList/DELETE_LAYER_TRACK' as const,
  payload: { ...params },
});

// 레이어 트랙 mute/unmute
export type MuteLayerTrack = Pick<LayerTrack, 'isMuted' | 'trackName'>;
export const muteLayerTrack = (params: MuteLayerTrack) => ({
  type: 'trackList/MUTE_LAYER_TRACK' as const,
  payload: { ...params },
});

// 트랙 스크롤 높이 전달
interface ChangeTrackScrollTop {
  scrollTop: number;
}
export const changeTrackScrollTop = (params: ChangeTrackScrollTop) => ({
  type: 'trackList/CHANGE_TRACK_SCROLL_TOP' as const,
  payalod: { ...params },
});
