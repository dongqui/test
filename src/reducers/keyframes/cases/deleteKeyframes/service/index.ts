import { KeyframesState } from 'reducers/keyframes';
import { KeyframesUnion, SelectedKeyframesUnion } from 'reducers/keyframes/types';

export interface Service {
  deleteKeyframes(): KeyframesUnion & SelectedKeyframesUnion;

  updateKeyframesState(newValues: KeyframesUnion & SelectedKeyframesUnion): KeyframesState;
}
