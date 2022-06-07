import { ClickPropertyTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';
import { AllClick, SelectedTracks } from './index';

interface Params {
  state: TrackListState;
  payload: ClickPropertyTrackBody;
}

// property 트랙 all select/unselect
class PropertyTrackAllClick implements AllClick {
  private setPropertySiblings = (boneNumber: number): number[] => {
    const propertySiblings: number[] = [];
    for (let property = boneNumber + 1; property <= boneNumber + 3; property++) {
      propertySiblings.push(property);
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
    const propertySiblings = this.setPropertySiblings(boneNumber);
    const nextSelectedProperties = [...selectedProperties, ...propertySiblings];
    return { selectedBones, selectedProperties: nextSelectedProperties };
  };

  public clickUnselectAll = ({ state, payload }: Params): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    const boneNumber = getBoneTrackIndex(state.propertyTrackList[payload.trackNumber]);
    const propertySiblings = this.setPropertySiblings(boneNumber);
    const nextSelectedBones = this.filterSelectedTracks(selectedBones, [boneNumber]);
    const nextSelectedProperties = this.filterSelectedTracks(selectedProperties, propertySiblings);
    return { selectedBones: nextSelectedBones, selectedProperties: nextSelectedProperties };
  };
}

export default PropertyTrackAllClick;
