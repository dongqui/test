import { ClickLayerTrackBody } from 'actions/trackList';
import { LeftClick } from './index';

class LayerTrackClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickLayerTrackBody }) => {
    return { selectedLayer: payload.layerId };
  };
}

export default LayerTrackClick;
