import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { SelectedKeyframesUnion } from 'reducers/keyframes/types';

import { Repository } from '../repository';

export interface Service {
  selectEventType(): SelectedKeyframesUnion;

  updateKeyframesState(selectedKeyframes: SelectedKeyframesUnion): KeyframesState;
}

export interface ServiceConstructor {
  new (
    state: KeyframesState,
    payload: SelectKeyframes,
    layerRepo: Repository,
    boneRepo: Repository,
    transformRepo: Repository,
  ): Service;
}
