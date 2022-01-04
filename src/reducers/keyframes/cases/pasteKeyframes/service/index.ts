import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes, PropertyKeyframes, SelectedPropertyKeyframes } from 'reducers/keyframes/types';

export interface Service {
  updateTimeEditorTrackList(): AllKeyframes;

  updateSelectedTrackKeyframes(): AllSelectedKeyframes;
}
