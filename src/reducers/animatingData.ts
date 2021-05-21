import { AnimatingDataAction, CurrentVisualizedData } from 'actions/animatingData';
import { PlayDirection, PlayState } from 'types/RP';

interface AnimatingDataState {
  playState: PlayState;
  playDirection: PlayDirection;
  playSpeed: number;
  startTimeIndex: number;
  endTimeIndex: number;
  mixer: THREE.AnimationMixer | undefined;
  currentAction: THREE.AnimationAction | undefined;
  currentVisualizedData: CurrentVisualizedData | undefined;
}

const defaultState: AnimatingDataState = {
  playState: 'stop',
  playDirection: 1,
  playSpeed: 1,
  startTimeIndex: 1,
  endTimeIndex: 300,
  mixer: undefined,
  currentAction: undefined,
  currentVisualizedData: undefined,
};

export const animatingData = (state = defaultState, action: AnimatingDataAction) => {
  switch (action.type) {
    case 'animatingData/SET_PLAY_STATE': {
      return Object.assign({}, state, {
        playState: action.payload.playState,
      });
    }
    case 'animatingData/SET_PLAY_DIRECTION': {
      return Object.assign({}, state, {
        playDirection: action.payload.playDirection,
      });
    }
    case 'animatingData/SET_PLAY_SPEED': {
      return Object.assign({}, state, {
        playSpeed: action.payload.playSpeed,
      });
    }
    case 'animatingData/SET_START_TIME_INDEX': {
      return Object.assign({}, state, {
        startTimeIndex: action.payload.startTimeIndex,
      });
    }
    case 'animatingData/SET_END_TIME_INDEX': {
      return Object.assign({}, state, {
        endTimeIndex: action.payload.endTimeIndex,
      });
    }
    case 'animatingData/SET_MIXER': {
      return Object.assign({}, state, {
        mixer: action.payload.mixer,
      });
    }
    case 'animatingData/SET_CURRENT_ACTION': {
      return Object.assign({}, state, {
        currentAction: action.payload.action,
      });
    }
    case 'animationData/SET_CURRENT_VISUALIZED_DATA': {
      return Object.assign({}, state, {
        currentVisualizedData: action.payload.data,
      });
    }
    default: {
      return state;
    }
  }
};
