import { TrackListState } from 'reducers/trackList';
import { BoneTrack } from 'types/TP_New/track';
import { Repository } from './index';

class BoneTrackRepository implements Repository {
  private boneIndex = 0;
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private createBoneTrack = (track: any): BoneTrack => {
    return {
      isPointedDownCaret: false,
      isSelected: false,
      trackName: track.trackName,
      boneIndex: this.boneIndex,
    };
  };

  public createTrackList = (trackList: any[]) => {
    const boneTrackList: BoneTrack[] = [];
    trackList.forEach((track) => {
      const boneTrack = this.createBoneTrack(track);
      boneTrackList.push(boneTrack);
      this.boneIndex += 10;
    });
    return { boneTrackList };
  };

  public createSelectedTracks = () => {
    return { selectedBones: [] as number[] };
  };

  public updateTrackListState = (params: Partial<TrackListState>) => {
    return Object.assign({}, this.state, params);
  };
}

export default BoneTrackRepository;
