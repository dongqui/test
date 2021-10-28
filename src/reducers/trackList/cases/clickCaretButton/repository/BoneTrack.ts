import produce from 'immer';

import { BoneTrack } from 'types/TP_New/track';
import { TrackListState } from 'reducers/trackList';

import { Repository } from './index';

class BoneTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  public toggleIsPointedDownCaret = (trackIndex: number, isPointedDown: boolean): BoneTrack[] => {
    return produce(this.state.boneTrackList, (draft) => {
      draft[trackIndex].isPointedDownCaret = isPointedDown;
    });
  };
}

export default BoneTrackRepository;
