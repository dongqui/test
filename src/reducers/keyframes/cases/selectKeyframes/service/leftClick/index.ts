import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { SelectedKeyframesUnion } from 'reducers/keyframes/types';

interface Parmas {
  state?: KeyframesState;
  payload?: SelectKeyframes;
}

export interface LeftClick {
  selectByLeftClick(params: Parmas): SelectedKeyframesUnion;
}
