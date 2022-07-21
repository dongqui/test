import { PlaskTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  // layer 키프레임 구하ㅣ
  private setLayerKeyframes = (plaskTracks: PlaskTrack[]) => {
    const layerFrames = new Set<number>();
    plaskTracks.forEach((plaskTrack) => {
      plaskTrack.transformKeys.forEach((transformKey) => layerFrames.add(transformKey.frame));
    });
    return [...layerFrames].sort((a, b) => a - b).map<Keyframe>((frame) => ({ isDeleted: false, isSelected: false, time: frame }));
  };

  initializeTimeEditorTrack = (plaskTracks: PlaskTrack[]): TimeEditorTrack | null => {
    if (plaskTracks.length) {
      const layerKeyframes = this.setLayerKeyframes(plaskTracks);
      const layerTimeEditorTrack: TimeEditorTrack = { trackNumber: -1, trackId: plaskTracks[0].layerId, trackType: 'layer', keyframes: layerKeyframes, parentTrackNumber: -1 };
      return layerTimeEditorTrack;
    }
    return null;
  };

  clearSelectedKeyframes = (): ClusteredKeyframe[] => {
    return [];
  };
}

export default LayerKeyframeRepository;
