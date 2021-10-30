import { TrackListState } from 'reducers/trackList';
import { AllClick, SelectedTracks } from './index';

class BoneTrackAllClick implements AllClick {
  private setSelectedTracks = (boneNumber: number): SelectedTracks => {
    const selectedProperties: number[] = [];
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedProperties.push(transform);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };

  // context menu에서 select all 클릭
  public clickSelectAll = ({ state }: { state: TrackListState }): SelectedTracks => {
    const nextSelectedBones: number[] = [];
    const nextSelectedProperties: number[] = [];
    state.boneTrackList.forEach(({ trackNumber }) => {
      const { selectedBones, selectedProperties } = this.setSelectedTracks(trackNumber);
      nextSelectedBones.push(...selectedBones);
      nextSelectedProperties.push(...selectedProperties);
    });
    return { selectedBones: nextSelectedBones, selectedProperties: nextSelectedProperties };
  };

  // context menu에서 unselect all 클릭
  public clickUnselectAll = (): SelectedTracks => {
    return { selectedBones: [], selectedProperties: [] };
  };
}

export default BoneTrackAllClick;
