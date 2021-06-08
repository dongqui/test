import { BarPositionXAction } from 'actions/barPositionX';
import { BarPositionXType } from 'types/VM';

type BarPositionXState = BarPositionXType;

const defaultState: BarPositionXState = {
  x: 0,
};

export const barPositionX = (state = defaultState, action: BarPositionXAction) => {
  switch (action.type) {
    case 'barPositionX/SET_BARPOSITION_X': {
      return Object.assign({}, state, {
        x: action.payload.x,
      });
    }
    default: {
      return state;
    }
  }
};
