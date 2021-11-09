import { DragDropKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { StateUpdate } from 'reducers/keyframes/classes';

import KeyframeService from './service/Keyframe';

import LayerKeyframeRepo from './repository/LayerKeyframe';
import BoneKeyframeRepo from './repository/BoneKeyframe';
import PropertyKeyframeRepo from './repository/PropertyKeyframe';

const dragDropKeyframes = (state: KeyframesState, payload: DragDropKeyframes) => {
  const layerRepo = new LayerKeyframeRepo(state);
  const boneKeyframeRepo = new BoneKeyframeRepo(state);
  const propertyKeyframeRepo = new PropertyKeyframeRepo(state);
  const service = new KeyframeService(
    state,
    payload,
    layerRepo,
    boneKeyframeRepo,
    propertyKeyframeRepo,
  );
  const timeEditorTrackList = service.updateTimeEditorTrackList();
  const selectedKeyframes = service.updateSelectedTrackKeyframes();
  return new StateUpdate(state).updateState({ ...timeEditorTrackList, ...selectedKeyframes });
};

export default dragDropKeyframes;
