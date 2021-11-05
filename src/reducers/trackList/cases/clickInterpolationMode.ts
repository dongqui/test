import produce from 'immer';

import { getBinarySearch } from 'utils/TP';
import { ClickInterpolationMode } from 'actions/trackList';
import { TransformTrack } from 'types/TP/track';
import { TrackListState } from '../index';

function findTransformIndex(trackList: TransformTrack[], index: number) {
  const trackIndex = getBinarySearch<TransformTrack>({
    collection: trackList,
    index,
    key: 'transformIndex',
  });
  return trackIndex;
}

function updateState(state: TrackListState, newValues: Partial<TrackListState>) {
  return Object.assign({}, state, newValues);
}

function updateTransformTrackList(state: TrackListState, payload: ClickInterpolationMode) {
  return produce(state.transformTrackList, (draft) => {
    state.selectedTransforms.forEach((index) => {
      const trackIndex = findTransformIndex(state.transformTrackList, index);
      draft[trackIndex].interpolationType = payload.interpolationType;
    });
  });
}

function clickInterpolationMode(state: TrackListState, payload: ClickInterpolationMode) {
  const transformTrackList = updateTransformTrackList(state, payload);
  return updateState(state, {
    transformTrackList,
    interpolationType: payload.interpolationType,
  });
}

export default clickInterpolationMode;
