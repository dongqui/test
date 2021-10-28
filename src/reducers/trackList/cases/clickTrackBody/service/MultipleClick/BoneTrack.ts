import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch } from 'utils/TP';

import { MultipleClick, SelectedTracks } from './index';

interface Parmas {
  state: TrackListState;
  payload: ClickBoneTrackBody;
}

class BoneTrackMultipleClick implements MultipleClick {
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

  private setSelectedTracks = (payload: ClickBoneTrackBody): SelectedTracks => {
    const selectedTransforms: number[] = [];
    const boneNumber = payload.trackNumber;
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedTransforms.push(transform);
    }
    return { selectedBones: [boneNumber], selectedTransforms };
  };

  public clickMultipleSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedTransforms } = this.setSelectedTracks(payload);
    const nextSelectedBones = this.filterSelectedTracks(state.selectedBones, selectedBones);
    const nextSelectedTransforms = this.filterSelectedTracks(
      state.selectedTransforms,
      selectedTransforms,
    );
    return { selectedBones: nextSelectedBones, selectedTransforms: nextSelectedTransforms };
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedTransforms } = this.setSelectedTracks(payload);
    const nextSelectedBones = this.sortAscendingNumbers(state.selectedBones, selectedBones);
    const nextSelectedTransforms = this.sortAscendingNumbers(
      state.selectedTransforms,
      selectedTransforms,
    );
    return { selectedBones: nextSelectedBones, selectedTransforms: nextSelectedTransforms };
  };
}

export default BoneTrackMultipleClick;
