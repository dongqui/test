import { PlaskTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { Repository } from './index';

class BoneKeyframeRepository implements Repository {
  // property 별 frame 구하기
  private getPropertyFrames = (plaskTrack: PlaskTrack) => {
    const propertyFrames = plaskTrack.transformKeys.map((transformKey) => transformKey.frame);
    return propertyFrames;
  };

  // bone keyframe 구하기
  private getBoneKeyframes = (frames: number[]) => {
    const union = new Set<number>();
    frames.forEach((frame) => union.add(frame));

    return [...union]
      .sort((a, b) => a - b)
      .map<Keyframe>((frame) => ({ isDeleted: false, isSelected: false, time: frame }));
  };

  // bone 트랙 리스트 초기화
  initializeTimeEditorTrack = (plaskTracks: PlaskTrack[], context: { trackUid: number }): TimeEditorTrack[] => {
    const boneTimeEditorTrackList: TimeEditorTrack[] = [];

    const indexedTrackMap: { [key: string]: PlaskTrack[] } = {};
    for (let i = 0; i < plaskTracks.length; i++) {
      const track = plaskTracks[i];
      if (!indexedTrackMap[track.targetId]) {
        indexedTrackMap[track.targetId] = [];
      }
      indexedTrackMap[track.targetId].push(track);
    }

    for (const targetId of Object.keys(indexedTrackMap)) {
      let frames: number[] = [];
      for (const track of indexedTrackMap[targetId]) {
        frames = frames.concat(this.getPropertyFrames(track));
      }
      const boneKeyFrames = this.getBoneKeyframes(frames);
      boneTimeEditorTrackList.push({ trackId: targetId, trackType: 'bone', trackNumber: context.trackUid, keyframes: boneKeyFrames });
      context.trackUid++;
    }

    // for (let index = 0; index < plaskTracks.length; index += 3) {
    //   const positionFrames = this.getPropertyFrames(plaskTracks[index]);
    //   const rotationFrames = this.getPropertyFrames(plaskTracks[index + 1]);
    //   const scaleFrames = this.getPropertyFrames(plaskTracks[index + 2]);
    //   const boneKeyFrames = this.getBoneKeyframes(positionFrames, rotationFrames, scaleFrames);
    //   boneTimeEditorTrackList.push({ trackId: plaskTracks[index].targetId, trackType: 'bone', trackNumber: boneTrackNumber, keyframes: boneKeyFrames });
    //   boneTrackNumber += 10; // 0 -> 10 -> 20
    // }
    return boneTimeEditorTrackList;
  };

  // 선택 된 bone keyframes 지우기
  clearSelectedKeyframes(): ClusteredKeyframe[] {
    return [];
  }
}

export default BoneKeyframeRepository;
