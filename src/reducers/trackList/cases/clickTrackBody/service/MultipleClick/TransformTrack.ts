import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';
import { MultipleClick, SelectedTracks } from './index';

interface Parmas {
  state: TrackListState;
  payload: ClickTransformTrackBody;
}

class MultipleClickTransformTrack implements MultipleClick {
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
    const { selectedBones, selectedTransforms } = state;
    const { trackNumber } = payload;
    const boneNumber = getBoneTrackIndex(trackNumber);
    const nextSelectedBones = this.filterSelectedTracks(selectedBones, [boneNumber]);
    const nextSelectedTransforms = this.filterSelectedTracks(selectedTransforms, [trackNumber]);
    return { selectedBones: nextSelectedBones, selectedTransforms: nextSelectedTransforms };
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedTransforms } = state;
    const nextSelectedTransforms = [...selectedTransforms, payload.trackNumber];
    const sortdTransforms = this.sortAscendingNumbers(nextSelectedTransforms);
    return { selectedBones, selectedTransforms: sortdTransforms };
  };
}

export default MultipleClickTransformTrack;
