import { TrackListState } from 'reducers/trackList';
import { AllClick, SelectedTracks } from './index';

class BoneTrackAllClick implements AllClick {
  private setSelectedTracks = (boneNumber: number): SelectedTracks => {
    const selectedTransforms: number[] = [];
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedTransforms.push(transform);
    }
    return { selectedBones: [boneNumber], selectedTransforms };
  };

  // context menu에서 select all 클릭
  public clickSelectAll = ({ state }: { state: TrackListState }): SelectedTracks => {
    const nextSelectedBones: number[] = [];
    const nextSelectedTransforms: number[] = [];
    state.boneTrackList.forEach(({ trackNumber }) => {
      const { selectedBones, selectedTransforms } = this.setSelectedTracks(trackNumber);
      nextSelectedBones.push(...selectedBones);
      nextSelectedTransforms.push(...selectedTransforms);
    });
    return { selectedBones: nextSelectedBones, selectedTransforms: nextSelectedTransforms };
  };

  // context menu에서 unselect all 클릭
  public clickUnselectAll = (): SelectedTracks => {
    return { selectedBones: [], selectedTransforms: [] };
  };
}

export default BoneTrackAllClick;
