import { AnimationIngredientsAction } from 'actions/animationIngredientsAction';
import { AnimationIngredient } from 'types/common';

type State = AnimationIngredient[];

const defaultState: State = [];

export const animationIngredients = (state = defaultState, action: AnimationIngredientsAction) => {
  switch (action.type) {
    case 'animationIngredientsAction/ADD_ANIMATION_INGREDIENTS': {
      return [...state, ...action.payload.animationIngredients];
    }
    default: {
      return state;
    }
  }
};
