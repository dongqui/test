import { TrackListState } from 'reducers/trackList';
import { AllClick } from './index';

class BoneTrackAllClick implements AllClick {
  private setSelectedTracks = (selectedBones: number[], selectedTransforms: number[]) => {
    return { selectedBones, selectedTransforms };
  };

  private selectBoneTransforms = (boneIndex: number) => {
    const selectedTransforms: number[] = [];
    for (let index = boneIndex + 1; index <= boneIndex + 9; index++) {
      selectedTransforms.push(index);
    }
    return this.setSelectedTracks([boneIndex], selectedTransforms);
  };

  // context menu에서 select all 클릭
  public clickSelectAll = ({ state }: { state: TrackListState }) => {
    const nextSelectedBones: number[] = [];
    const nextSelectedTransforms: number[] = [];
    state.boneTrackList.forEach(({ boneIndex }) => {
      const { selectedBones, selectedTransforms } = this.selectBoneTransforms(boneIndex);
      nextSelectedBones.push(...selectedBones);
      nextSelectedTransforms.push(...selectedTransforms);
    });
    return this.setSelectedTracks(nextSelectedBones, nextSelectedTransforms);
  };

  // context menu에서 unselect all 클릭
  public clickUnselectAll = () => {
    return this.setSelectedTracks([], []);
  };
}

export default BoneTrackAllClick;
