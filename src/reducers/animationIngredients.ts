import { AnimationIngredientsAction } from 'actions/animationIngredientsAction';
import { AnimationIngredient } from 'types/common';

type State = AnimationIngredient[];

const defaultState: State = [];

export const animationIngredients = (state = defaultState, action: AnimationIngredientsAction) => {
  switch (action.type) {
    case 'animationIngredientsAction/ADD_ANIMATION_INGREDIENTS': {
      return [...state, ...action.payload.animationIngredients];
    }
    case 'animationIngredientsAction/EDIT_ANIMATION_INGREDIENT': {
      return state.map((anim) =>
        anim.id === action.payload.animationIngredient.id
          ? action.payload.animationIngredient
          : anim,
      );
    }
    default: {
      return state;
    }
  }
};
