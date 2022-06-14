import { ClickPropertyTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';
import { MultipleClick, SelectedTracks } from './index';

interface Parmas {
  state: TrackListState;
  payload: ClickPropertyTrackBody;
}

class MultipleClickPropertyTrack implements MultipleClick {
  private filterSelectedTracks = (selectedTracks: number[], filterTarget: number[]) => {
    const nextSelectedTracks: number[] = [];
    selectedTracks.forEach((trackNumber) => {
      const trackIndex = getBinarySearch({ collection: filterTarget, index: trackNumber });
      if (trackIndex === -1) nextSelectedTracks.push(trackNumber);
    });
    return nextSelectedTracks;
  };

  private sortAscendingNumbers = (...arr: number[] | number[][]) => {
    const flatten = [...arr].flat();
    return flatten.sort((a, b) => a - b);
  };

  public clickMultipleSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    const { trackNumber } = payload;
    const boneNumber = getBoneTrackIndex(state.propertyTrackList[trackNumber]);
    const nextSelectedBones = this.filterSelectedTracks(selectedBones, [boneNumber]);
    const nextselectedProperties = this.filterSelectedTracks(selectedProperties, [trackNumber]);
    return { selectedBones: nextSelectedBones, selectedProperties: nextselectedProperties };
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    const nextselectedProperties = [...selectedProperties, payload.trackNumber];
    const sortdTransforms = this.sortAscendingNumbers(nextselectedProperties);
    return { selectedBones, selectedProperties: sortdTransforms };
  };
}

export default MultipleClickPropertyTrack;
