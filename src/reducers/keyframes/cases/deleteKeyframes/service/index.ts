import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes } from 'reducers/keyframes/types';

type NewValues = AllKeyframes & AllSelectedKeyframes;

export interface Service {
  deleteKeyframes(): NewValues;

  updateKeyframesState(newValues: NewValues): KeyframesState;
}
