import { AllKeyframes, AllSelectedKeyframes, PropertyKeyframes, SelectedPropertyKeyframes } from 'reducers/keyframes/types';

export interface Service {
  updateTimeEditorTrackList(): PropertyKeyframes;

  updateSelectedTrackKeyframes(): SelectedPropertyKeyframes;
}
