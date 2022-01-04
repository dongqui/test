import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

interface Params {
  state?: KeyframesState;
  payload?: SelectKeyframes;
}

export interface VerticalSelection {
  selectByVertical(params: Params): AllSelectedKeyframes;
}
