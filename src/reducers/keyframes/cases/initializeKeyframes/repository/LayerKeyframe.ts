import { ShootTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class LayerKeyframeRepository implements Repository {
  // layer 키프레임 구하ㅣ
  private setLayerKeyframes = (shootTracks: ShootTrack[]) => {
    const layerFrames = new Set<number>();
    shootTracks.forEach((shootTrack) => {
      shootTrack.transformKeys.forEach((transformKey) => layerFrames.add(transformKey.frame));
    });
    return [...layerFrames]
      .sort((a, b) => a - b)
      .map<Keyframe>((frame) => ({ isDeleted: false, isSelected: false, time: frame }));
  };

  initializeTimeEditorTrack = (shootTracks: ShootTrack[]): TimeEditorTrack | null => {
    if (shootTracks.length) {
      const layerKeyframes = this.setLayerKeyframes(shootTracks);
      const layerTimeEditorTrack: TimeEditorTrack = {
        trackNumber: -1,
        trackId: shootTracks[0].layerId,
        trackType: 'layer',
        keyframes: layerKeyframes,
      };
      return layerTimeEditorTrack;
    }
    return null;
  };

  clearSelectedKeyframes = (): ClusteredKeyframe[] => {
    return [];
  };
}

export default LayerKeyframeRepository;
