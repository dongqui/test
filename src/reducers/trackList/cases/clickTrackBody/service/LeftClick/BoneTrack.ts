import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedProperties } from 'reducers/trackList/types';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';
import { LeftClick } from './index';

type SelectedTracks = SelectedBones & SelectedProperties;

class BoneTrackLeftClick implements LeftClick {
  public clickLeft = ({ payload, state }: { payload: ClickBoneTrackBody; state: TrackListState }): SelectedTracks => {
    const selectedProperties: number[] = [];
    const boneNumber = payload.trackNumber;
    const childTracks = findChildrenTracks(boneNumber, state.propertyTrackList);
    for (const child of childTracks) {
      selectedProperties.push(child.trackNumber);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };
}

export default BoneTrackLeftClick;
