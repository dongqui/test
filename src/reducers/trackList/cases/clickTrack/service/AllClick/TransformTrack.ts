import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { fnGetBinarySearch, fnGetBoneTrackIndex } from 'utils/TP/trackUtils';
import { AllClick } from './index';

interface Params {
  state: TrackListState;
  payload: ClickTransformTrackBody;
}

// transform 트랙 all select/unselect
class AllClickTransformTrack implements AllClick {
  private setSelectedTracks = (boneIndex: number[], selectedTransforms: number[]) => {
    return { selectedBones: boneIndex, selectedTransforms };
  };

  private selectBoneTransforms = (transformIndex: number) => {
    return this.setSelectedTracks([], [transformIndex]);
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

  public clickSelectAll = ({ state, payload }: Params) => {
    const { selectedBones, selectedTransforms } = state;
    const boneIndex = fnGetBoneTrackIndex(payload.transformIndex);
    const selectedTracks = this.selectBoneTransforms(boneIndex);
    const nextSelectedBones = [...selectedBones, ...selectedTracks.selectedBones];
    const nextSelectedTransforms = [...selectedTransforms, ...selectedTracks.selectedTransforms];
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };

  public clickUnselectAll = ({ state, payload }: Params) => {
    const { selectedBones, selectedTransforms } = state;
    const boneIndex = fnGetBoneTrackIndex(payload.transformIndex);
    const selectedTracks = this.selectBoneTransforms(boneIndex);
    const nextSelectedBones = this.filterIncludedIndex(selectedBones, selectedTracks.selectedBones);
    const nextSelectedTransforms = this.filterIncludedIndex(
      selectedTransforms,
      selectedTracks.selectedTransforms,
    );
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };
}

export default AllClickTransformTrack;
