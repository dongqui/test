import { ClickPropertyTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { PropertyTrack } from 'types/TP/track';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';
import { AllClick, SelectedTracks } from './index';

interface Params {
  state: TrackListState;
  payload: ClickPropertyTrackBody;
}

// property 트랙 all select/unselect
class PropertyTrackAllClick implements AllClick {
  private setPropertySiblings = (boneNumber: number, propertyTrackList: PropertyTrack[]): number[] => {
    const propertySiblings: number[] = [];
    const childTracks = findChildrenTracks(boneNumber, propertyTrackList);
    for (const child of childTracks) {
      propertySiblings.push(child.trackNumber);
    }
    return propertySiblings;
  };

  private filterSelectedTracks = (selectedTracks: number[], filterTarget: number[]) => {
    const nextSelectedTracks: number[] = [];
    selectedTracks.forEach((trackNumber) => {
      const trackIndex = getBinarySearch({ collection: filterTarget, index: trackNumber });
      if (trackIndex === -1) nextSelectedTracks.push(trackNumber);
    });
    return nextSelectedTracks;
  };

  public clickSelectAll = ({ state, payload }: Params): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    const boneNumber = getBoneTrackIndex(state.propertyTrackList[payload.trackNumber]);
    const propertySiblings = this.setPropertySiblings(boneNumber, state.propertyTrackList);
    const nextSelectedProperties = [...selectedProperties, ...propertySiblings];
    return { selectedBones, selectedProperties: nextSelectedProperties };
  };

  public clickUnselectAll = ({ state, payload }: Params): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    const boneNumber = getBoneTrackIndex(state.propertyTrackList[payload.trackNumber]);
    const propertySiblings = this.setPropertySiblings(boneNumber, state.propertyTrackList);
    const nextSelectedBones = this.filterSelectedTracks(selectedBones, [boneNumber]);
    const nextSelectedProperties = this.filterSelectedTracks(selectedProperties, propertySiblings);
    return { selectedBones: nextSelectedBones, selectedProperties: nextSelectedProperties };
  };
}

export default PropertyTrackAllClick;
