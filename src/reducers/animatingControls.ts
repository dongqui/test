import { AnimatingControlsAction } from 'actions/animatingControlsAction';
import { TimeIndex } from 'utils/TP';
import { PlayDirection, PlayState } from 'types/RP';
import { Nullable } from 'types/common';
import { AnimationGroup } from '@babylonjs/core';

interface AnimatingContolsState {
  currentAnimationGroup: Nullable<AnimationGroup>;
  playState: PlayState;
  playDirection: PlayDirection;
  playSpeed: number;
  currentTimeIndex: number;
  startTimeIndex: number;
  endTimeIndex: number;
  isAutokeyOn: boolean;
}

const defaultState: AnimatingContolsState = {
  currentAnimationGroup: null,
  playState: 'stop',
  playDirection: PlayDirection.forward,
  playSpeed: 1,
  currentTimeIndex: 0,
  startTimeIndex: 0,
  endTimeIndex: 100,
  isAutokeyOn: false,
};

export const animatingControls = (state = defaultState, action: AnimatingControlsAction) => {
  switch (action.type) {
    case 'animatingControls/SET_CURRENT_ANIMATION_GROUP': {
      return Object.assign({}, state, {
        currentAnimationGroup: action.payload.animationGroup,
      });
    }
    case 'animatingControls/BLUR_START_INPUT': {
      TimeIndex.setStartTimeIndex(action.payload.startTimeIndex);
      TimeIndex.setCurrentTimeIndex(action.payload.currentTimeIndex);
      return Object.assign({}, state, {
        startTimeIndex: action.payload.startTimeIndex,
        currentTimeIndex: action.payload.currentTimeIndex,
      });
    }
    case 'animatingControls/BLUR_END_INPUT': {
      TimeIndex.setEndTimeIndex(action.payload.endTimeIndex);
      TimeIndex.setCurrentTimeIndex(action.payload.currentTimeIndex);
      return Object.assign({}, state, {
        endTimeIndex: action.payload.endTimeIndex,
        currentTimeIndex: action.payload.currentTimeIndex,
      });
    }
    case 'animatingControls/MOVE_SCRUBBER': {
      TimeIndex.setCurrentTimeIndex(action.payload.currentTimeIndex);
      return Object.assign({}, state, {
        currentTimeIndex: action.payload.currentTimeIndex,
      });
    }
    case 'animatingControls/CLICK_PLAY_STATE_BUTTON': {
      if (typeof action.payload.currentTimeIndex === 'number') {
        TimeIndex.setCurrentTimeIndex(action.payload.currentTimeIndex);
      }
      TimeIndex.setPlayState(action.payload.playState);
      return Object.assign({}, state, action.payload);
    }
    case 'animatingControls/SELECT_FASTER_DROPDOWN': {
      return Object.assign({}, state, {
        playSpeed: action.payload.playSpeed,
      });
    }
    case 'animatingControls/CLICK_AUTO_KEY_BUTTON': {
      return Object.assign({}, state, {
        isAutokeyOn: !state.isAutokeyOn,
      });
    }
    default: {
      return state;
    }
  }
};
