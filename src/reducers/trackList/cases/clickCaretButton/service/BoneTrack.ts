import { BoneTrack } from 'types/TP_New/track';
import { ClickBoneCaretButton } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { BoneTrackList } from 'reducers/trackList/types';
import { getBinarySearch } from 'utils/TP';

import { Service } from './index';
import { Repository } from '../repository';

class BoneTrackService extends StateUpdate implements Service {
  private readonly payload: ClickBoneCaretButton;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickBoneCaretButton, repository: Repository) {
    super(state);
    this.payload = payload;
    this.repository = repository;
  }

  public findTrackIndex = (): number => {
    const { boneTrackList } = this.state;
    const { trackNumber } = this.payload;
    const trackIndex = getBinarySearch<BoneTrack>({
      collection: boneTrackList,
      index: trackNumber,
      key: 'trackNumber',
    });
    return trackIndex;
  };

  public updateTrackList = (index: number): BoneTrackList => {
    const { isPointedDownCaret } = this.payload;
    const boneTrackList = this.repository.toggleIsPointedDownCaret(index, isPointedDownCaret);
    return { boneTrackList: boneTrackList as BoneTrack[] };
  };

  public updateTrackListState = (trackList: BoneTrackList): TrackListState => {
    return this.updateState(trackList);
  };
}

export default BoneTrackService;
