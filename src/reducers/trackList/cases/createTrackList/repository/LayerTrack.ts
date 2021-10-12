import { TrackListState } from 'reducers/trackList';
import { LayerTrack } from 'types/TP_New/track';
import { Repository } from './index';

class LayerTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private createLayerTrack = (track: any) => {
    return {
      isPointedDownCaret: false,
      isSelected: track.trackName === 'Base',
      isMuted: false,
      layerId: track.layerId,
      trackName: track.trackName,
    };
  };

  public createTrackList = (trackList: any[]) => {
    const layerTrackList: LayerTrack[] = [];
    trackList.forEach((track) => {
      const layerTrack = this.createLayerTrack(track);
      layerTrackList.push(layerTrack);
    });
    return { layerTrackList };
  };

  public createSelectedTracks = (trackList: any[]) => {
    return { selectedLayer: trackList[0].trackName };
  };

  public updateTrackListState = (params: Partial<TrackListState>) => {
    return Object.assign({}, this.state, params);
  };
}

export default LayerTrackRepository;
