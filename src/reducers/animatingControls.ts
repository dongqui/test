import { AnimatingControlsAction } from 'actions/animatingControls';
import { TimeIndex } from 'utils/TP';
import { PlayDirection_New, PlayState } from 'types/RP';

interface AnimatingContolsState {
  playState: PlayState;
  playDirection: PlayDirection_New;
  playSpeed: number;
  currentTimeIndex: number;
  startTimeIndex: number;
  endTimeIndex: number;
}

const defaultState: AnimatingContolsState = {
  playState: 'stop',
  playDirection: PlayDirection_New.forward,
  playSpeed: 1,
  currentTimeIndex: 0,
  startTimeIndex: 0,
  endTimeIndex: 100,
};

export const animatingControls = (state = defaultState, action: AnimatingControlsAction) => {
  switch (action.type) {
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
      return Object.assign({}, state, action.payload);
    }
    case 'animatingControls/SELECT_FASTER_DROPDOWN': {
      return Object.assign({}, state, {
        playSpeed: action.payload.playSpeed,
      });
    }
    default: {
      return state;
    }
  }
};
