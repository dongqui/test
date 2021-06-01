import { PlayDirection, PlayState } from 'types/RP';

export type AnimatingDataAction =
  | ReturnType<typeof setPlayState>
  | ReturnType<typeof setPlayDirection>
  | ReturnType<typeof setPlaySpeed>
  | ReturnType<typeof setStartTimeIndex>
  | ReturnType<typeof setEndTimeIndex>
  | ReturnType<typeof setMixer>
  | ReturnType<typeof setCurrentAction>;

// 애니메이션 재생 상태
interface SetPlayState {
  playState: PlayState;
}
export const SET_PLAY_STATE = 'animatingData/SET_PLAY_STATE' as const;
export const setPlayState = (params: SetPlayState) => ({
  type: SET_PLAY_STATE,
  payload: {
    ...params,
  },
});

// 애니메이션 재생 방향
interface SetPlayDirection {
  playDirection: PlayDirection;
}
export const SET_PLAY_DIRECTION = 'animatingData/SET_PLAY_DIRECTION' as const;
export const setPlayDirection = (params: SetPlayDirection) => ({
  type: SET_PLAY_DIRECTION,
  payload: {
    ...params,
  },
});

// 애니메이션 재생 속도(배속)
interface SetPlaySpeed {
  playSpeed: number;
}
export const SET_PLAY_SPEED = 'animatingData/SET_PLAY_SPEED' as const;
export const setPlaySpeed = (params: SetPlaySpeed) => ({
  type: SET_PLAY_SPEED,
  payload: {
    ...params,
  },
});

// 시작 타임프레임 인덱스
interface SetStartTimeIndex {
  startTimeIndex: number;
}
export const SET_START_TIME_INDEX = 'animatingData/SET_START_TIME_INDEX' as const;
export const setStartTimeIndex = (params: SetStartTimeIndex) => ({
  type: SET_START_TIME_INDEX,
  payload: {
    ...params,
  },
});

// 끝 타임프레임 인덱스
interface SetEndTimeIndex {
  endTimeIndex: number;
}
export const SET_END_TIME_INDEX = 'animatingData/SET_END_TIME_INDEX' as const;
export const setEndTimeIndex = (params: SetEndTimeIndex) => ({
  type: SET_END_TIME_INDEX,
  payload: {
    ...params,
  },
});

// 애니메이션 믹서 설정
interface SetMixer {
  mixer: THREE.AnimationMixer;
}
export const SET_MIXER = 'animatingData/SET_MIXER' as const;
export const setMixer = (params: SetMixer) => ({
  type: SET_MIXER,
  payload: {
    ...params,
  },
});

// 현재 애니메이션 설정
interface SetCurrentAction {
  action: THREE.AnimationAction;
}
export const SET_CURRENT_ACTION = 'animatingData/SET_CURRENT_ACTION' as const;
export const setCurrentAction = (params: SetCurrentAction) => ({
  type: SET_CURRENT_ACTION,
  payload: {
    ...params,
  },
});
