import { PlaskLayer } from 'types/common';
import { TrackNumber } from 'types/TP';
import { LayerTrack } from 'types/TP/track';

import { Repository } from './index';

class LayerTrackRepository implements Repository {
  // layer track list 초기화
  initializeTrackList = (plaskLayers: PlaskLayer[]): LayerTrack[] => {
    const layerTrackList: LayerTrack[] = plaskLayers.map((layer, index) => ({
      trackId: layer.id,
      trackName: layer.name,
      trackType: 'layer',
      trackNumber: TrackNumber.LAYER,
      isMuted: false,
      isSelected: index === 0, // 첫번째 layer는 true로 설정
      isPointedDownCaret: false,
      parentTrackNumber: -1,
    }));
    return layerTrackList;
  };

  // 선택 된 layer track 초기화
  initializeSelectedTracks = (plaskLayers: PlaskLayer[]): string => {
    return plaskLayers[0].id;
  };
}

export default LayerTrackRepository;
