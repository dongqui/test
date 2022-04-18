import { AnimationGroup } from '@babylonjs/core';
import { PlayDirection, PlayState } from 'types/RP';

export type AnimatingControlsAction =
  | ReturnType<typeof setCurrentAnimationGroup>
  | ReturnType<typeof blurStartInput>
  | ReturnType<typeof blurEndInput>
  | ReturnType<typeof moveScrubber>
  | ReturnType<typeof clickPlayStateButton>
  | ReturnType<typeof selectFasterDropdown>
  | ReturnType<typeof clickAutoKeyButton>;

interface SetCurrentAnimationGroup {
  animationGroup: AnimationGroup;
}

export const SET_CURRENT_ANIMATION_GROUP = 'animatingControls/SET_CURRENT_ANIMATION_GROUP' as const;
export const setCurrentAnimationGroup = (params: SetCurrentAnimationGroup) => ({
  type: SET_CURRENT_ANIMATION_GROUP,
  payload: {
    ...params,
  },
});

// start input blur 이벤트
interface BlurStartInput {
  startTimeIndex: number;
  currentTimeIndex: number;
}

export const BLUR_START_INPUT = 'animatingControls/BLUR_START_INPUT' as const;
export const blurStartInput = (params: BlurStartInput) => ({
  type: BLUR_START_INPUT,
  payload: {
    ...params,
  },
});

// end input blur 이벤트
interface BlurEndInput {
  endTimeIndex: number;
  currentTimeIndex: number;
}

export const BLUR_END_INPUT = 'animatingControls/BLUR_END_INPUT' as const;
export const blurEndInput = (params: BlurEndInput) => ({
  type: BLUR_END_INPUT,
  payload: {
    ...params,
  },
});

// scrubber 이동(drag, now input 입력)
interface MoveScrubber {
  currentTimeIndex: number;
}
export const MOVE_SCRUBBER = 'animatingControls/MOVE_SCRUBBER' as const;
export const moveScrubber = (params: MoveScrubber) => ({
  type: MOVE_SCRUBBER,
  payload: {
    ...params,
  },
});

// play, rewind, stop, pause 버튼 클릭
interface ClickPlayStateButton {
  playState: PlayState;
  playDirection?: PlayDirection; // play, rewind
  currentTimeIndex?: number; // stop
}
export const CLICK_PLAY_STATE_BUTTON = 'animatingControls/CLICK_PLAY_STATE_BUTTON' as const;
export const clickPlayStateButton = (params: ClickPlayStateButton) => ({
  type: CLICK_PLAY_STATE_BUTTON,
  payload: {
    ...params,
  },
});

// 배속 드랍다운 아이템 선택
interface SelectFasterDropdown {
  playSpeed: number;
}
export const SELECT_FASTER_DROPDOWN = 'animatingControls/SELECT_FASTER_DROPDOWN' as const;
export const selectFasterDropdown = (params: SelectFasterDropdown) => ({
  type: SELECT_FASTER_DROPDOWN,
  payload: {
    ...params,
  },
});

// auto key 모든 클릭
export const clickAutoKeyButton = () => ({
  type: 'animatingControls/CLICK_AUTO_KEY_BUTTON' as const,
});
