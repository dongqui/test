import { ClickTransformTrackBody } from 'actions/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';
import { LeftClick } from './index';

type SelectedTracks = SelectedBones & SelectedTransforms;

class TransformTrackLeftClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickTransformTrackBody }): SelectedTracks => {
    return { selectedBones: [], selectedTransforms: [payload.trackNumber] };
  };
}

export default TransformTrackLeftClick;
