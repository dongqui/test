import { ClickCaretButton, ClickLayerCaretButton, ClickBoneCaretButton } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { layerKeyframeConfig, boneKeyframeConfig } from './config';

const clickCaretButton = (state: TrackListState, payload: ClickCaretButton) => {
  if (payload.trackType === 'layer') {
    return layerKeyframeConfig(state, payload as ClickLayerCaretButton);
  }
  if (payload.trackType === 'bone') {
    return boneKeyframeConfig(state, payload as ClickBoneCaretButton);
  }
  return state;
};

export default clickCaretButton;
