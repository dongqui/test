import { ClickBoneTrackBody } from 'actions/trackList';
import { LeftClick } from './index';

class BoneTrackLeftClick implements LeftClick {
  private setSelectedTracks = (boneIndex: number, selectedTransforms: number[]) => {
    return { selectedBones: [boneIndex], selectedTransforms };
  };

  public clickLeft = ({ payload }: { payload: ClickBoneTrackBody }) => {
    const selectedTransforms: number[] = [];
    const boneIndex = payload.boneIndex;
    for (let index = boneIndex + 1; index <= boneIndex + 3; index++) {
      selectedTransforms.push(index);
    }
    return this.setSelectedTracks(boneIndex, selectedTransforms);
  };
}

export default BoneTrackLeftClick;
