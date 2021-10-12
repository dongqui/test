import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { fnGetBinarySearch, fnGetBoneTrackIndex } from 'utils/TP/trackUtils';
import { MultipleClick } from './index';

export interface Parmas {
  state: TrackListState;
  payload: ClickTransformTrackBody;
}

class MultipleClickTransformTrack implements MultipleClick {
  private setSelectedTracks = (selectedBones: number[], selectedTransforms: number[]) => {
    return { selectedBones, selectedTransforms };
  };

  private filterIncludedIndex = (iter: number[], filterTarget: number[]) => {
    const nextSelectedTracks: number[] = [];
    iter.forEach((index) => {
      const trackIndex = fnGetBinarySearch({
        collection: filterTarget,
        index,
      });
      if (trackIndex === -1) nextSelectedTracks.push(index);
    });
    return nextSelectedTracks;
  };

  private sortAscendingNumbers = (...arr: number[] | number[][]) => {
    const flatten = [...arr].flat();
    return flatten.sort((a, b) => a - b);
  };

  public clickMultipleSelectedTrack = ({ state, payload }: Parmas) => {
    const { selectedBones, selectedTransforms } = state;
    const { transformIndex } = payload;
    const boneIndex = fnGetBoneTrackIndex(transformIndex);
    const nextSelectedBones = this.filterIncludedIndex(selectedBones, [boneIndex]);
    const nextSelectedTransforms = this.filterIncludedIndex(selectedTransforms, [transformIndex]);
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas) => {
    const { selectedBones, selectedTransforms } = state;
    const nextSelectedTransforms = [...selectedTransforms, payload.transformIndex];
    const sortdTransforms = this.sortAscendingNumbers(nextSelectedTransforms);
    return this.setSelectedTracks(selectedBones, sortdTransforms);
  };
}

export default MultipleClickTransformTrack;
