import { PlaskTrack } from 'types/common';
import { BoneTrack } from 'types/TP/track';
import { Repository } from './index';

class BoneTrackRepository implements Repository {
  // targetId를 통해 bone name 구하기
  private setBoneName = (targetId: string) => {
    const splited = targetId.split('//');
    let boneName = splited[1];
    if (splited[2] === 'controller') boneName += '_controller';
    return boneName;
  };

  // bone track list 초기화
  initializeTrackList = (plaskTracks: PlaskTrack[], context: { trackUid: number }): BoneTrack[] => {
    const boneTrackList: BoneTrack[] = [];
    plaskTracks.forEach((plaskTrack) => {
      const boneName = this.setBoneName(plaskTrack.targetId);
      const index = boneTrackList.findIndex((boneTrack) => boneTrack.trackName === boneName);
      if (index === -1) {
        boneTrackList.push({
          trackId: plaskTrack.targetId,
          trackName: boneName,
          trackNumber: context.trackUid++,
          trackType: 'bone',
          isPointedDownCaret: false,
          isSelected: false,
        });
      }
    });
    return boneTrackList;
  };

  // 선택 된 bone track 초기화
  initializeSelectedTracks = (): number[] => {
    return [];
  };
}

export default BoneTrackRepository;
