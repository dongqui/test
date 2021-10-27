import { TrackListState } from 'reducers/trackList';
import { TrackIndex, TransformTrack } from 'types/TP_New/track';
import { Repository } from './index';

class TransformTrackRepository implements Repository {
  private transformIndex = TrackIndex.POSITION;
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private setTransformIndex = () => {
    if (this.transformIndex % 10 === TrackIndex.BONE) this.transformIndex++;
    this.transformIndex++;
  };

  private createTransformTrack = (track: any): TransformTrack => {
    return {
      isSelected: false,
      trackName: track.trackName,
      interpolationType: track.interpolationType,
      transformIndex: this.transformIndex,
    };
  };

  public createTrackList = (trackList: any[]) => {
    const transformTrackList: TransformTrack[] = [];
    trackList.forEach((track) => {
      const trnasformTrack = this.createTransformTrack(track);
      transformTrackList.push(trnasformTrack);
      this.setTransformIndex();
    });
    return { transformTrackList };
  };

  public createSelectedTracks = () => {
    return { selectedTransforms: [] as number[] };
  };

  public updateTrackListState = (params: Partial<TrackListState>) => {
    return Object.assign({}, this.state, params);
  };
}

export default TransformTrackRepository;
