import { TPDopeSheet, TPLastBone, TPCurrentClickedChannel, KeyframeData } from 'types/TP';

export type DopeSheetAction =
  | ReturnType<typeof setTrackList>
  | ReturnType<typeof clearAll>
  | ReturnType<typeof addLayer>
  | ReturnType<typeof deleteLayer>
  | ReturnType<typeof modifyLayerName>
  | ReturnType<typeof addKeyframes>
  | ReturnType<typeof deleteKeyframes>
  | ReturnType<typeof selectKeyframes>
  | ReturnType<typeof searchTrackList>
  | ReturnType<typeof clickTrackBody>
  | ReturnType<typeof clickTrackArrowButton>
  | ReturnType<typeof clickTrackLockButton>
  | ReturnType<typeof clickTrackCheckButton>;

// 모델 변경 시 dope sheet 데이터 set
interface SetTrackList {
  trackList: TPDopeSheet[];
  lastBoneOfLayers: TPLastBone[];
}

export const SET_TRACK_LIST = 'dopeSheet/SET_TRACK_LIST' as const;
export const setTrackList = (params: SetTrackList) => ({
  type: SET_TRACK_LIST,
  payload: {
    ...params,
  },
});

// model 삭제 dope sheet 리셋
export const CLEAR_ALL = 'dopeSheet/CLEAR_ALL' as const;
export const clearAll = () => ({
  type: CLEAR_ALL,
});

// 레이어 추가
interface AddLayer {}

export const ADD_LAYER = 'dopeSheet/ADD_LAYER' as const;
export const addLayer = (params: AddLayer) => ({
  type: ADD_LAYER,
  payload: {
    ...params,
  },
});

// 레이어 삭제
interface DeleteLayer {}

export const DELETE_LAYER = 'dopeSheet/DELETE_LAYER' as const;
export const deleteLayer = (params: DeleteLayer) => ({
  type: DELETE_LAYER,
  payload: {
    ...params,
  },
});

// 레이어 이름 변경
interface ModifyLayerName {}

export const MODIFY_LAYER_NAME = 'dopeSheet/MODIFY_LAYER_NAME' as const;
export const modifyLayerName = (params: ModifyLayerName) => ({
  type: MODIFY_LAYER_NAME,
  payload: {
    ...params,
  },
});

// 키프레임 추가
interface AddKeyframes {}

export const ADD_KEYFRAMES = 'dopeSheet/ADD_KEYFRAMES' as const;
export const addKeyframes = (params: AddKeyframes) => ({
  type: ADD_KEYFRAMES,
  payload: {
    ...params,
  },
});

// 키프레임 삭제
interface DeleteKeyframes {}

export const DELETE_KEYFRAMES = 'dopeSheet/DELETE_KEYFRAMES' as const;
export const deleteKeyframes = (params: DeleteKeyframes) => ({
  type: DELETE_KEYFRAMES,
  payload: {
    ...params,
  },
});

// 키프레임 선택
interface SelectKeyframes {
  selectedKeyframes: KeyframeData[];
}

export const SELECT_KEYFRAMES = 'dopeSheet/SELECT_KEYFRAMES' as const;
export const selectKeyframes = (params: SelectKeyframes) => ({
  type: SELECT_KEYFRAMES,
  payload: {
    ...params,
  },
});

// 트랙 검색
interface SearchTrackList {
  trackList: TPDopeSheet[];
}

export const SEARCH_TRACK_LIST = 'dopeSheet/SEARCH_TRACK_LIST' as const;
export const searchTrackList = (params: SearchTrackList) => ({
  type: SEARCH_TRACK_LIST,
  payload: {
    ...params,
  },
});

// 화살표 버튼 클릭
interface ClickTrackArrowButton {
  trackList: TPDopeSheet[];
  currentClickedChannel: TPCurrentClickedChannel;
}

export const CLICK_TRACK_ARROW_BUTTON = 'dopeSheet/CLICK_TRACK_ARROW_BUTTON' as const;
export const clickTrackArrowButton = (params: ClickTrackArrowButton) => ({
  type: CLICK_TRACK_ARROW_BUTTON,
  payload: {
    ...params,
  },
});

// 트랙 클릭
interface ClickTrackBody {
  trackList: TPDopeSheet[];
  selectedChannels: number[];
}

export const CLICK_TRACK_BODY = 'dopeSheet/CLICK_TRACK_BODY' as const;
export const clickTrackBody = (params: ClickTrackBody) => ({
  type: CLICK_TRACK_BODY,
  payload: {
    ...params,
  },
});

// 잠금 버튼 클릭
interface ClickTrackLockButton {
  trackList: TPDopeSheet[];
}

export const CLICK_TRACK_LOCK_BUTTON = 'dopeSheet/CLICK_TRACK_LOCK_BUTTON' as const;
export const clickTrackLockButton = (params: ClickTrackLockButton) => ({
  type: CLICK_TRACK_LOCK_BUTTON,
  payload: {
    ...params,
  },
});

// 랜더링 체크 버튼 클릭
interface ClickTrackCheckButton {}

export const CLICK_TRACK_CHECK_BUTTON = 'dopeSheet/CLICK_TRACK_CHECK_BUTTON' as const;
export const clickTrackCheckButton = (params: ClickTrackCheckButton) => ({
  type: CLICK_TRACK_CHECK_BUTTON,
  payload: {
    ...params,
  },
});
