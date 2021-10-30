import { ClickLayerTrackBody } from 'actions/trackList';
import { LeftClick } from './index';
import { SelectedLayer } from 'reducers/trackList/types';

class LayerTrackClick implements LeftClick {
  public clickLeft = ({ payload }: { payload: ClickLayerTrackBody }): SelectedLayer => {
    return { selectedLayer: payload.layerId };
  };
}

export default LayerTrackClick;
