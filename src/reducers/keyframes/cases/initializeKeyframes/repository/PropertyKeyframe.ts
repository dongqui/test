import { PlaskTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class PropertyKeyframeRepository implements Repository {
  // property 트랙 리스트 초기화
  initializeTimeEditorTrack(plaskTracks: PlaskTrack[], context: { trackUid: number }): TimeEditorTrack[] {
    const propertyTimeEditorTrackList: TimeEditorTrack[] = [];

    const indexedTrackMap: { [key: string]: PlaskTrack[] } = {};
    for (let i = 0; i < plaskTracks.length; i++) {
      const track = plaskTracks[i];
      if (!indexedTrackMap[track.targetId]) {
        indexedTrackMap[track.targetId] = [];
      }
      indexedTrackMap[track.targetId].push(track);
    }

    let parentTrackNumber = 0;
    for (const targetId of Object.keys(indexedTrackMap)) {
      for (const plaskTrack of indexedTrackMap[targetId]) {
        const keyframes: Keyframe[] = plaskTrack.transformKeys.map((transformKey) => ({
          time: transformKey.frame,
          value: transformKey.value,
          isDeleted: false,
          isSelected: false,
        }));
        propertyTimeEditorTrackList.push({ trackNumber: context.trackUid, trackId: plaskTrack.id, trackType: 'property', keyframes, parentTrackNumber });
        context.trackUid++;
      }
      parentTrackNumber++;
    }

    return propertyTimeEditorTrackList;
  }

  // 선택 된 property keyframes 지우기
  clearSelectedKeyframes(): ClusteredKeyframe[] {
    return [];
  }
}

export default PropertyKeyframeRepository;
