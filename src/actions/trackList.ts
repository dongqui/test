import { LayerTrack, BoneTrack, TransformTrack } from 'types/TP_New/track';

export type TrackListAction =
  | ReturnType<typeof clickCaretButton>
  | ReturnType<typeof clickTrackBody>
  | ReturnType<typeof clickInterpolationMode>
  | ReturnType<typeof addLayerTrack>
  | ReturnType<typeof deleteLayerTrack>
  | ReturnType<typeof muteLayerTrack>
  | ReturnType<typeof createTrackList>;

// 트랙 리스트 생성
export const createTrackList = (params: any) => ({
  type: 'trackList/CREATE_TRACK_LIST' as const,
  payload: {
    ...params,
  },
});

// 트랙 내부 펴닫기 버튼 클릭
export type ClickLayerCaretButton = Pick<LayerTrack, 'isPointedDownCaret' | 'layerId'>;
export type ClickBoneCaretButton = Pick<BoneTrack, 'isPointedDownCaret' | 'boneIndex'>;
export type ClickCaretButton = ClickLayerCaretButton | ClickBoneCaretButton;
export const clickCaretButton = (params: ClickCaretButton) => ({
  type: 'trackList/CLICK_CARET_BUTTON' as const,
  payload: {
    ...params,
  },
});

// 트랙 몸통 클릭
interface TrackMultipleClick {
  isMultipleClicked: boolean;
}
interface ContextMenuClick {
  isRightClicked: boolean;
  isShowedContextMenu: boolean;
  isSelectedAll: boolean;
}
export type ClickLayerTrackBody = Pick<LayerTrack, 'layerId'>;
export type ClickBoneTrackBody = Pick<BoneTrack, 'boneIndex'> &
  TrackMultipleClick &
  ContextMenuClick;
export type ClickTransformTrackBody = Pick<TransformTrack, 'transformIndex'> &
  TrackMultipleClick &
  ContextMenuClick;
export type ClickTrackBody = ClickLayerTrackBody | ClickBoneTrackBody | ClickTransformTrackBody;
export const clickTrackBody = (params: ClickTrackBody) => ({
  type: 'trackList/CLICK_TRACK_BODY' as const,
  payload: {
    ...params,
  },
});

// interpolation mode 버튼 클릭
export type ClickInterpolationMode = Pick<TransformTrack, 'interpolationType'>;
export const clickInterpolationMode = (params: ClickInterpolationMode) => ({
  type: 'trackList/CLICK_INTERPOLATION_MODE' as const,
  payload: {
    ...params,
  },
});

// 레이어 트랙 추가
export type AddLayerTrack = Pick<LayerTrack, 'trackName'>;
export const addLayerTrack = (params: AddLayerTrack) => ({
  type: 'trackList/ADD_LAYER_TRACK' as const,
  payload: {
    ...params,
  },
});

// 레이어 트랙 삭제
export type DeleteLayerTrack = Pick<LayerTrack, 'trackName'>;
export const deleteLayerTrack = (params: DeleteLayerTrack) => ({
  type: 'trackList/DELETE_LAYER_TRACK' as const,
  payload: {
    ...params,
  },
});

// 레이어 트랙 mute/unmute
export type MuteLayerTrack = Pick<LayerTrack, 'isMuted' | 'trackName'>;
export const muteLayerTrack = (params: MuteLayerTrack) => ({
  type: 'trackList/MUTE_LAYER_TRACK' as const,
  payload: {
    ...params,
  },
});
