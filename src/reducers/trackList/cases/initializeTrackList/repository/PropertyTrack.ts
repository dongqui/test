import { PlaskTrack } from 'types/common';
import { PropertyTrack } from 'types/TP/track';
import { Repository } from './index';

class PropertyTrackRepository implements Repository {
  // property track list 초기화
  initializeTrackList = (plaskTracks: PlaskTrack[], context: { trackUid: number }): PropertyTrack[] => {
    let parentTrackNumberMap: { [key: string]: number } = {};
    let currentParentTrackNumber = 0;
    const propertyTrackList: PropertyTrack[] = plaskTracks.map((track) => {
      if (parentTrackNumberMap[track.targetId] === undefined) {
        parentTrackNumberMap[track.targetId] = currentParentTrackNumber;
        currentParentTrackNumber++;
      }

      return {
        trackId: track.id,
        trackNumber: context.trackUid++,
        trackType: 'property',
        trackName: track.property === 'scaling' ? 'scale' : track.property, // scaling이면 scale로 변경
        interpolationType: track.interpolationType,
        isPointedDownCaret: false,
        isSelected: false,
        parentTrackNumber: parentTrackNumberMap[track.targetId],
      };
    });
    return propertyTrackList;
  };

  // 선택 된 property track 초기화
  initializeSelectedTracks = (): number[] => {
    return [];
  };
}

export default PropertyTrackRepository;
