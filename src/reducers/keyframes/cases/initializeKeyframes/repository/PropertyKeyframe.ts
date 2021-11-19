import { ShootTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  // property 트랙 리스트 초기화
  initializeTimeEditorTrack(shootTracks: ShootTrack[]): TimeEditorTrack[] {
    const propertyTimeEditorTrackList: TimeEditorTrack[] = [];
    let trackNumber = 0;
    shootTracks.forEach((shootTrack) => {
      trackNumber += 1;
      if (trackNumber % 10 === 4) trackNumber += 7; // 4 -> 11, 14 -> 21
      const keyframes: Keyframe[] = shootTrack.transformKeys.map((transformKey) => ({
        time: transformKey.frame,
        value: transformKey.value,
        isDeleted: false,
        isSelected: false,
      }));
      propertyTimeEditorTrackList.push({ trackNumber, trackId: shootTrack.id, trackType: 'property', keyframes });
    });
    return propertyTimeEditorTrackList;
  }

  // 선택 된 property keyframes 지우기
  clearSelectedKeyframes(): ClusteredKeyframe[] {
    return [];
  }
}

export default PropertyKeyframeRepository;
