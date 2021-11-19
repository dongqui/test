import { ShootTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  // property 별 frame 구하기
  private getPropertyFrames = (shootTrack: ShootTrack) => {
    const propertyFrames = shootTrack.transformKeys.map((transformKey) => transformKey.frame);
    return propertyFrames;
  };

  // bone keyframe 구하기
  private getBoneKeyframes = (position: number[], rotation: number[], scale: number[]) => {
    const union = new Set<number>();
    position.forEach((frame) => union.add(frame));
    rotation.forEach((frame) => union.add(frame));
    scale.forEach((frame) => union.add(frame));
    return [...union]
      .sort((a, b) => a - b)
      .map<Keyframe>((frame) => ({ isDeleted: false, isSelected: false, time: frame }));
  };

  // bone 트랙 리스트 초기화
  initializeTimeEditorTrack = (shootTracks: ShootTrack[]): TimeEditorTrack[] => {
    const boneTimeEditorTrackList: TimeEditorTrack[] = [];
    let boneTrackNumber = 0;
    for (let index = 0; index < shootTracks.length; index += 3) {
      const positionFrames = this.getPropertyFrames(shootTracks[index]);
      const rotationFrames = this.getPropertyFrames(shootTracks[index + 1]);
      const scaleFrames = this.getPropertyFrames(shootTracks[index + 2]);
      const boneKeyFrames = this.getBoneKeyframes(positionFrames, rotationFrames, scaleFrames);
      boneTimeEditorTrackList.push({
        trackId: shootTracks[index].targetId,
        trackType: 'bone',
        trackNumber: boneTrackNumber,
        keyframes: boneKeyFrames,
      });
      boneTrackNumber += 10; // 0 -> 10 -> 20
    }
    return boneTimeEditorTrackList;
  };

  // 선택 된 bone keyframes 지우기
  clearSelectedKeyframes(): ClusteredKeyframe[] {
    return [];
  }
}

export default BoneKeyframeRepository;
