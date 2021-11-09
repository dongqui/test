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
    const selectedProperties: number[] = [];
    const boneNumber = payload.trackNumber;
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedProperties.push(transform);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };

  public clickMultipleSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedProperties } = this.setSelectedTracks(payload);
    const nextSelectedBones = this.filterSelectedTracks(state.selectedBones, selectedBones);
    const nextSelectedProselectedProperties = this.filterSelectedTracks(
      state.selectedProperties,
      selectedProperties,
    );
    return {
      selectedBones: nextSelectedBones,
      selectedProperties: nextSelectedProselectedProperties,
    };
  };

  public clickMultipleNotSelectedTrack = ({ state, payload }: Parmas): SelectedTracks => {
    const { selectedBones, selectedProperties } = this.setSelectedTracks(payload);
    const nextSelectedBones = this.sortAscendingNumbers(state.selectedBones, selectedBones);
    const nextSelectedProselectedProperties = this.sortAscendingNumbers(
      state.selectedProperties,
      selectedProperties,
    );
    return {
      selectedBones: nextSelectedBones,
      selectedProperties: nextSelectedProselectedProperties,
    };
  };
}

export default BoneTrackMultipleClick;
