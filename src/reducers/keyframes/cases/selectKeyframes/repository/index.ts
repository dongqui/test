import { Keyframe, TrackKeyframes, ClusteredTimes } from 'types/TP_New/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { KeyframesUnion, SelectedKeyframesUnion } from 'reducers/keyframes/types';
import { getBinarySearch } from 'utils/TP';

export interface Repository {
  updateKeyframes(selectedKeyframes: SelectedKeyframesUnion): KeyframesUnion;

  updateState(newValues: Partial<KeyframesState>): KeyframesState;
}

export class Common {
  protected findTrackIndex = (trackList: TrackKeyframes[], selectedKeyframe: ClusteredTimes) => {
    const trackIndex = getBinarySearch<TrackKeyframes>({
      collection: trackList,
      index: selectedKeyframe.trackIndex as number,
      key: 'trackIndex',
    });
    return trackIndex;
  };

  protected findTimeIndex = (keyframes: Keyframe[], time: number) => {
    const timeIndex = getBinarySearch<Keyframe>({
      collection: keyframes,
      index: time,
      key: 'timeIndex',
    });
    return timeIndex;
  };

  protected updateStateObject = (state: KeyframesState, newValues: Partial<KeyframesState>) => {
    return Object.assign({}, state, newValues);
  };
}
