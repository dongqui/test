import { Service } from './index';
import { Repository } from '../repository';
import { TrackListState } from 'reducers/trackList';

class BoneTrackService implements Service {
  private readonly state: TrackListState;
  private readonly payload: any;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: any, repository: Repository) {
    this.state = state;
    this.payload = payload;
    this.repository = repository;
  }

  public updateState = () => {
    const { createSelectedTracks, createTrackList, updateTrackListState } = this.repository;
    const selectedTracks = createSelectedTracks(this.payload);
    const trackList = createTrackList(this.payload);
    return updateTrackListState({ ...selectedTracks, ...trackList });
  };
}

export default BoneTrackService;
