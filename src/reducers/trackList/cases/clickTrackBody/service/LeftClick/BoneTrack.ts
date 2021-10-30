import { ClickBoneTrackBody } from 'actions/trackList';
import { SelectedBones, SelectedProperties } from 'reducers/trackList/types';
import { LeftClick } from './index';

type SelectedTracks = SelectedBones & SelectedProperties;

class BoneTrackLeftClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickBoneTrackBody }): SelectedTracks => {
    const selectedProperties: number[] = [];
    const boneNumber = payload.trackNumber;
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedProperties.push(transform);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };
}

export default BoneTrackLeftClick;
