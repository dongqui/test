import { ClickBoneTrackBody } from 'actions/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';
import { LeftClick } from './index';

type SelectedTracks = SelectedBones & SelectedTransforms;

class BoneTrackLeftClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickBoneTrackBody }): SelectedTracks => {
    const selectedTransforms: number[] = [];
    const boneNumber = payload.trackNumber;
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedTransforms.push(transform);
    }
    return { selectedBones: [boneNumber], selectedTransforms };
  };
}

export default BoneTrackLeftClick;
