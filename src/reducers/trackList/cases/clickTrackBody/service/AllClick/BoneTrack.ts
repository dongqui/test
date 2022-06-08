import { TrackListState } from 'reducers/trackList';
import { PropertyTrack } from 'types/TP/track';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';
import { AllClick, SelectedTracks } from './index';

class BoneTrackAllClick implements AllClick {
  private setSelectedTracks = (boneNumber: number, propertyTrackList: PropertyTrack[]): SelectedTracks => {
    const childTracks = findChildrenTracks(boneNumber, propertyTrackList);
    const selectedProperties: number[] = [];
    for (const child of childTracks) {
      selectedProperties.push(child.trackNumber);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };

  // context menu에서 select all 클릭
  public clickSelectAll = ({ state }: { state: TrackListState }): SelectedTracks => {
    const nextSelectedBones: number[] = [];
    const nextSelectedProperties: number[] = [];
    state.boneTrackList.forEach(({ trackNumber }) => {
      const { selectedBones, selectedProperties } = this.setSelectedTracks(trackNumber, state.propertyTrackList);
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
