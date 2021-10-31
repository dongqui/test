import { ClickTransformTrackBody } from 'actions/trackList';
import { LeftClick } from './index';

class LeftClickTransformTrack implements LeftClick {
  private setSelectedTracks = (transformIndex: number) => {
    return { selectedBones: [], selectedTransforms: [transformIndex] };
  };

  public clickLeft = ({ payload }: { payload: ClickTransformTrackBody }) => {
    return this.setSelectedTracks(payload.transformIndex);
  };
}

export default LeftClickTransformTrack;
