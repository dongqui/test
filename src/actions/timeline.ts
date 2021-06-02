import { TPTrackList, TPLastBone, TPcurrentClickedTrack, KeyframeData } from 'types/TP';

export type TimelineAction =
  | ReturnType<typeof setTrackList>
  | ReturnType<typeof clearAll>
  | ReturnType<typeof addNewLayer>
  | ReturnType<typeof deleteLayer>
  | ReturnType<typeof setLayerName>
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
  trackList: TPTrackList[];
  lastBoneOfLayers: TPLastBone[];
}

export const SET_TRACK_LIST = 'timeline/SET_TRACK_LIST' as const;
export const setTrackList = (params: SetTrackList) => ({
  type: SET_TRACK_LIST,
  payload: {
    ...params,
  },
});

// model 삭제 dope sheet 리셋
export const CLEAR_ALL = 'timeline/CLEAR_ALL' as const;
export const clearAll = () => ({
  type: CLEAR_ALL,
});

// 레이어 추가
interface AddNewLayer {
  trackList: TPTrackList[];
  lastBoneOfLayers: TPLastBone[];
}

export const ADD_NEW_LAYER = 'timeline/ADD_NEW_LAYER' as const;
export const addNewLayer = (params: AddNewLayer) => ({
  type: ADD_NEW_LAYER,
  payload: {
    ...params,
  },
});

// 레이어 삭제
interface DeleteLayer {
  trackList: TPTrackList[];
  lastBoneOfLayers: TPLastBone[];
}

export const DELETE_LAYER = 'timeline/DELETE_LAYER' as const;
export const deleteLayer = (params: DeleteLayer) => ({
  type: DELETE_LAYER,
  payload: {
    ...params,
  },
});

// 레이어 이름 변경
interface SetLayerName {
  trackList: TPTrackList[];
}

export const SET_LAYER_NAME = 'timeline/SET_LAYER_NAME' as const;
export const setLayerName = (params: SetLayerName) => ({
  type: SET_LAYER_NAME,
  payload: {
    ...params,
  },
});

// 키프레임 추가
interface AddKeyframes {
  trackList: TPTrackList[];
}

export const ADD_KEYFRAMES = 'timeline/ADD_KEYFRAMES' as const;
export const addKeyframes = (params: AddKeyframes) => ({
  type: ADD_KEYFRAMES,
  payload: {
    ...params,
  },
});

// 키프레임 삭제
interface DeleteKeyframes {
  trackList: TPTrackList[];
}

export const DELETE_KEYFRAMES = 'timeline/DELETE_KEYFRAMES' as const;
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

export const SELECT_KEYFRAMES = 'timeline/SELECT_KEYFRAMES' as const;
export const selectKeyframes = (params: SelectKeyframes) => ({
  type: SELECT_KEYFRAMES,
  payload: {
    ...params,
  },
});

// 트랙 검색
interface SearchTrackList {
  trackList: TPTrackList[];
}

export const SEARCH_TRACK_LIST = 'timeline/SEARCH_TRACK_LIST' as const;
export const searchTrackList = (params: SearchTrackList) => ({
  type: SEARCH_TRACK_LIST,
  payload: {
    ...params,
  },
});

// 화살표 버튼 클릭
interface ClickTrackArrowButton {
  trackList: TPTrackList[];
  currentClickedTrack: TPcurrentClickedTrack;
}

export const CLICK_TRACK_ARROW_BUTTON = 'timeline/CLICK_TRACK_ARROW_BUTTON' as const;
export const clickTrackArrowButton = (params: ClickTrackArrowButton) => ({
  type: CLICK_TRACK_ARROW_BUTTON,
  payload: {
    ...params,
  },
});

// 트랙 클릭
interface ClickTrackBody {
  trackList: TPTrackList[];
  selectedTrackIndices: number[];
}

export const CLICK_TRACK_BODY = 'timeline/CLICK_TRACK_BODY' as const;
export const clickTrackBody = (params: ClickTrackBody) => ({
  type: CLICK_TRACK_BODY,
  payload: {
    ...params,
  },
});

// 잠금 버튼 클릭
interface ClickTrackLockButton {
  trackList: TPTrackList[];
}

export const CLICK_TRACK_LOCK_BUTTON = 'timeline/CLICK_TRACK_LOCK_BUTTON' as const;
export const clickTrackLockButton = (params: ClickTrackLockButton) => ({
  type: CLICK_TRACK_LOCK_BUTTON,
  payload: {
    ...params,
  },
});

// 랜더링 체크 버튼 클릭
interface ClickTrackCheckButton {
  trackList: TPTrackList[];
}

export const CLICK_TRACK_CHECK_BUTTON = 'timeline/CLICK_TRACK_CHECK_BUTTON' as const;
export const clickTrackCheckButton = (params: ClickTrackCheckButton) => ({
  type: CLICK_TRACK_CHECK_BUTTON,
  payload: {
    ...params,
  },
});
