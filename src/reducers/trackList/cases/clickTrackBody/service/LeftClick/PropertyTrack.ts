import { ClickPropertyTrackBody } from 'actions/trackList';
import { SelectedBones, SelectedProperties } from 'reducers/trackList/types';
import { LeftClick } from './index';

type SelectedTracks = SelectedBones & SelectedProperties;

class PropertyTrackLeftClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickPropertyTrackBody }): SelectedTracks => {
    return { selectedBones: [], selectedProperties: [payload.trackNumber] };
  };
}

export default PropertyTrackLeftClick;
