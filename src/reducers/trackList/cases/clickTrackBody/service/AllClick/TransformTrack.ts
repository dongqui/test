import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch, getBoneTrackIndex } from 'utils/TP';
import { AllClick, SelectedTracks } from './index';

interface Params {
  state: TrackListState;
  payload: ClickTransformTrackBody;
}

// transform 트랙 all select/unselect
class TransformTrackAllClick implements AllClick {
  private setTransformSiblings = (boneNumber: number): number[] => {
    const transformSiblings: number[] = [];
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      transformSiblings.push(transform);
    }
    return transformSiblings;
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
    const { selectedBones, selectedTransforms } = state;
    const boneNumber = getBoneTrackIndex(payload.trackNumber);
    const transformSiblings = this.setTransformSiblings(boneNumber);
    const nextSelectedTransforms = [...selectedTransforms, ...transformSiblings];
    return { selectedBones, selectedTransforms: nextSelectedTransforms };
  };

  public clickUnselectAll = ({ state, payload }: Params): SelectedTracks => {
    const { selectedBones, selectedTransforms } = state;
    const boneNumber = getBoneTrackIndex(payload.trackNumber);
    const transformSiblings = this.setTransformSiblings(boneNumber);
    const nextSelectedBones = this.filterSelectedTracks(selectedBones, [boneNumber]);
    const nextSelectedTransforms = this.filterSelectedTracks(selectedTransforms, transformSiblings);
    return { selectedBones: nextSelectedBones, selectedTransforms: nextSelectedTransforms };
  };
}

export default TransformTrackAllClick;
