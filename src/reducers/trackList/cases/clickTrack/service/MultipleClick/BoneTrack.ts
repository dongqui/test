import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch } from 'utils/TP';

import { MultipleClick } from './index';

export interface Parmas {
  state: TrackListState;
  payload: ClickBoneTrackBody;
}

class BoneTrackMultipleClick implements MultipleClick {
  private setSelectedTracks = (selectedBones: number[], selectedTransforms: number[]) => {
    return { selectedBones, selectedTransforms };
  };

  private filterIncludedIndex = (iter: number[], removeTarget: number[]) => {
    const nextSelectedTracks: number[] = [];
    iter.forEach((index) => {
      const trackIndex = getBinarySearch({
        collection: removeTarget,
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

  private selectBoneTransforms = (payload: ClickBoneTrackBody) => {
    const selectedTransforms: number[] = [];
    const boneIndex = payload.boneIndex;
    for (let index = boneIndex + 1; index <= boneIndex + 3; index++) {
      selectedTransforms.push(index);
    }
    return this.setSelectedTracks([boneIndex], selectedTransforms);
  };

  public clickMultipleSelectedTrack = ({ state, payload }: Parmas) => {
    const { selectedBones, selectedTransforms } = this.selectBoneTransforms(payload);
    const nextSelectedBones = this.filterIncludedIndex(state.selectedBones, selectedBones);
    const nextSelectedTransforms = this.filterIncludedIndex(
      state.selectedTransforms,
      selectedTransforms,
    );
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas) => {
    const { selectedBones, selectedTransforms } = this.selectBoneTransforms(payload);
    const nextSelectedBones = this.sortAscendingNumbers(state.selectedBones, selectedBones);
    const nextSelectedTransforms = this.sortAscendingNumbers(
      state.selectedTransforms,
      selectedTransforms,
    );
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };
}

export default BoneTrackMultipleClick;
