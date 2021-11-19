import { ShootTrack } from 'types/common';
import { PropertyTrack } from 'types/TP/track';
import { Repository } from './index';

class PropertyTrackRepository implements Repository {
  // property track list 초기화
  initializeTrackList = (shootTracks: ShootTrack[]): PropertyTrack[] => {
    let trackNumber = 0;
    const propertyTrackList: PropertyTrack[] = shootTracks.map((track, index) => {
      trackNumber += 1;
      if (trackNumber % 10 === 4) trackNumber += 7; // 4 -> 11, 14 -> 21
      return {
        trackId: track.id,
        trackNumber,
        trackType: 'property',
        trackName: track.property, // 'mixamo:RightHand4' -> ['mixamo', 'RightHand4'] -> 'RightHand4'
        interpolationType: track.interpolationType,
        isPointedDownCaret: false,
        isSelected: false,
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
