import { KeyframesState } from 'reducers/keyframes';
import { AllKeyframes, AllSelectedKeyframes, PropertyKeyframes, SelectedPropertyKeyframes } from 'reducers/keyframes/types';

type NewValues = AllKeyframes & AllSelectedKeyframes;

export interface Service {
  updateTimeEditorTrackList(): PropertyKeyframes;

  updateSelectedTrackKeyframes(): SelectedPropertyKeyframes;
}
